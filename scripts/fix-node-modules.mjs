#!/usr/bin/env node
/**
 * Fix incomplete node_modules in OpenNext server-function directories.
 *
 * OpenNext traces individual files into .open-next/server-functions/*, but
 * Cloudflare Pages still runs an esbuild pass over each function. With pnpm,
 * traced package folders can be missing package-local dependencies or can
 * resolve the wrong hoisted version. This script rebuilds only the dependency
 * shape Wrangler needs:
 *
 *  1. Replace traced top-level package folders with complete package copies.
 *  2. Copy missing top-level runtime dependencies without overwriting versions.
 *  3. Hydrate package-local node_modules only for packages proven to need it.
 *  4. Add Next/React compiled aliases and a dev-only Turbopack HMR stub.
 *
 * Must run AFTER resolve-symlinks.mjs and BEFORE patch-worker.mjs.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  realpathSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";

const PROJECT_ROOT = resolve(process.cwd());
const OPEN_NEXT_DIR = join(PROJECT_ROOT, ".open-next");
const SERVER_FUNCTIONS_DIR = join(OPEN_NEXT_DIR, "server-functions");
const PROJECT_NM = join(PROJECT_ROOT, "node_modules");
const PNPM_STORE = join(PROJECT_NM, ".pnpm");

const sourceCache = new Map();

const LOCAL_HYDRATION_TARGETS = new Set([
  "chalk",
  "css-select",
  "dom-serializer",
  "domhandler",
  "domutils",
  "htmlparser2",
  "nth-check",
  "postcss",
  "postcss-media-query-parser",
]);

const REQUIRED_TOP_LEVEL_PACKAGES = [
  "chalk",
  "client-only",
  "css-select",
  "dom-serializer",
  "domhandler",
  "htmlparser2",
  "postcss-media-query-parser",
];

const REQUIRED_TOP_LEVEL_CONTEXTS = {
  "client-only": "styled-jsx",
};

const MAX_TOP_LEVEL_DEPS_PER_FUNCTION = 2000;
const MAX_LOCAL_DEPS_PER_PACKAGE = 180;

// -- Helpers ---------------------------------------------------------

function listPackageDirs(nmDir) {
  const dirs = [];
  if (!existsSync(nmDir)) return dirs;

  for (const entry of readdirSync(nmDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    if (entry.name.startsWith("@")) {
      const scopeDir = join(nmDir, entry.name);
      for (const scoped of readdirSync(scopeDir, { withFileTypes: true })) {
        if (scoped.isDirectory()) dirs.push(join(scopeDir, scoped.name));
      }
    } else {
      dirs.push(join(nmDir, entry.name));
    }
  }

  return dirs;
}

function pkgName(fullPath, nmDir) {
  return fullPath.substring(nmDir.length + 1).replaceAll("\\", "/");
}

function readPkgJson(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

function getRuntimeDeps(pkgJson) {
  if (!pkgJson) return [];
  return Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.optionalDependencies,
  });
}

function findPackageJson(startDir) {
  let current = startDir;
  while (current && current !== dirname(current)) {
    const candidate = join(current, "package.json");
    if (existsSync(candidate)) return candidate;
    current = dirname(current);
  }
  return null;
}

function packageRelNameFromJson(pkgJson, fallback) {
  return pkgJson?.name || fallback;
}

function resolvePkgSourceByVersion(relName, version) {
  if (!version || !existsSync(PNPM_STORE)) return null;

  const cacheKey = `${relName}@${version}`;
  if (sourceCache.has(cacheKey)) return sourceCache.get(cacheKey);

  for (const entry of readdirSync(PNPM_STORE, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const candidate = join(PNPM_STORE, entry.name, "node_modules", ...relName.split("/"));
    const pkgJson = readPkgJson(candidate);
    if (pkgJson?.name === relName && pkgJson.version === version) {
      const resolved = realpathSync(candidate);
      sourceCache.set(cacheKey, resolved);
      return resolved;
    }
  }

  sourceCache.set(cacheKey, null);
  return null;
}

function resolvePkgSource(relName, fromDir = PROJECT_ROOT, version = null) {
  const versioned = resolvePkgSourceByVersion(relName, version);
  if (versioned) return versioned;

  const fromPkgJson = findPackageJson(fromDir) || join(PROJECT_ROOT, "package.json");
  const requireFrom = createRequire(fromPkgJson);

  try {
    return dirname(requireFrom.resolve(`${relName}/package.json`));
  } catch {
    // Some packages do not export package.json. Resolve the entry point and
    // walk upward to the package root instead.
  }

  try {
    const entry = requireFrom.resolve(relName);
    const packageJson = findPackageJson(dirname(entry));
    return packageJson ? dirname(packageJson) : null;
  } catch {
    // Fall back to the root install for packages that are not in the source
    // package's local dependency graph.
  }

  const direct = join(PROJECT_NM, ...relName.split("/"));
  return existsSync(direct) ? realpathSync(direct) : null;
}

function copyPackageTree(src, dst) {
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, {
    recursive: true,
    force: true,
    dereference: true,
    filter: (sourcePath) => {
      const rel = relative(src, sourcePath).replaceAll("\\", "/");
      return rel === "" || !rel.split("/").includes("node_modules");
    },
  });
}

function copyPkgFromSource(relName, src, destNm) {
  const dst = join(destNm, ...relName.split("/"));
  if (!src || !existsSync(src)) return false;

  try {
    copyPackageTree(src, dst);
    return true;
  } catch (err) {
    console.error(`[fix-node-modules] Error copying ${relName}: ${err.message}`);
    return false;
  }
}

function copyPkg(relName, destNm, fromDir = PROJECT_ROOT, version = null) {
  const src = resolvePkgSource(relName, fromDir, version);
  return copyPkgFromSource(relName, src, destNm);
}

function hydrateTopLevelDeps(nmDir) {
  const queue = listPackageDirs(nmDir);
  const seen = new Set(queue.map((dir) => pkgName(dir, nmDir)));
  let copied = 0;

  for (let index = 0; index < queue.length; index++) {
    if (copied >= MAX_TOP_LEVEL_DEPS_PER_FUNCTION) break;

    const pkgDir = queue[index];
    const rel = pkgName(pkgDir, nmDir);
    const pkgJson = readPkgJson(pkgDir);
    if (!pkgJson) continue;

    const packageName = packageRelNameFromJson(pkgJson, rel);
    const sourceDir = resolvePkgSource(packageName, PROJECT_ROOT, pkgJson.version);
    if (!sourceDir) continue;

    const sourcePkgJson = readPkgJson(sourceDir) || pkgJson;
    for (const dep of getRuntimeDeps(sourcePkgJson)) {
      if (seen.has(dep)) continue;

      const depDst = join(nmDir, ...dep.split("/"));
      const depSrc = resolvePkgSource(dep, sourceDir);
      if (!depSrc) continue;

      if (existsSync(depDst)) {
        const depDstPkgJson = readPkgJson(depDst);
        const depSrcPkgJson = readPkgJson(depSrc);
        const canSafelyRefresh =
          !depDstPkgJson ||
          (depSrcPkgJson &&
            depDstPkgJson.name === depSrcPkgJson.name &&
            depDstPkgJson.version === depSrcPkgJson.version);

        if (canSafelyRefresh && copyPkgFromSource(dep, depSrc, nmDir)) {
          copied++;
        }

        seen.add(dep);
        queue.push(depDst);
        continue;
      }

      if (copyPkgFromSource(dep, depSrc, nmDir)) {
        copied++;
        seen.add(dep);
        queue.push(depDst);
      }
    }
  }

  if (copied >= MAX_TOP_LEVEL_DEPS_PER_FUNCTION) {
    console.warn(
      `[fix-node-modules] Hit top-level dependency cap for ${nmDir}; copied ${copied}.`
    );
  }

  return copied;
}

function copyRequiredTopLevelPackages(nmDir) {
  let copied = 0;
  for (const relName of REQUIRED_TOP_LEVEL_PACKAGES) {
    const contextPackage = REQUIRED_TOP_LEVEL_CONTEXTS[relName] || "critters";
    const contextSource = resolvePkgSource(contextPackage) || PROJECT_ROOT;
    if (copyPkg(relName, nmDir, contextSource)) {
      copied++;
    }
  }
  return copied;
}

function hydratePackageLocalDeps(pkgDir) {
  const rootPkgJson = readPkgJson(pkgDir);
  if (!rootPkgJson?.name) return 0;

  const rootSource = resolvePkgSource(rootPkgJson.name, PROJECT_ROOT, rootPkgJson.version);
  if (!rootSource) return 0;

  const queue = [{ destDir: pkgDir, sourceDir: rootSource }];
  const seen = new Set([realpathSync(pkgDir)]);
  let copied = 0;

  for (let index = 0; index < queue.length; index++) {
    if (copied >= MAX_LOCAL_DEPS_PER_PACKAGE) break;

    const { destDir, sourceDir } = queue[index];
    const sourcePkgJson = readPkgJson(sourceDir);
    if (!sourcePkgJson) continue;

    const nestedNm = join(destDir, "node_modules");
    mkdirSync(nestedNm, { recursive: true });

    for (const dep of getRuntimeDeps(sourcePkgJson)) {
      if (copied >= MAX_LOCAL_DEPS_PER_PACKAGE) break;

      const depSrc = resolvePkgSource(dep, sourceDir);
      if (!depSrc) continue;

      const depDst = join(nestedNm, ...dep.split("/"));
      if (!existsSync(depDst) && copyPkgFromSource(dep, depSrc, nestedNm)) {
        copied++;
      }

      if (existsSync(depDst)) {
        const depKey = resolve(depDst);
        if (!seen.has(depKey)) {
          seen.add(depKey);
          queue.push({ destDir: depDst, sourceDir: depSrc });
        }
      }
    }
  }

  if (copied >= MAX_LOCAL_DEPS_PER_PACKAGE) {
    console.warn(
      `[fix-node-modules] Hit package-local dependency cap for ${rootPkgJson.name}; copied ${copied}.`
    );
  }

  return copied;
}

function copyNextCompiledPackage(sourceName, aliasName, destNm) {
  const nextDir = resolvePkgSource("next");
  if (!nextDir) return false;

  const src = join(nextDir, "dist", "compiled", sourceName);
  const dst = join(destNm, ...aliasName.split("/"));
  if (!existsSync(src)) return false;

  try {
    copyPackageTree(src, dst);
    return true;
  } catch (err) {
    console.error(`[fix-node-modules] Error copying ${aliasName}: ${err.message}`);
    return false;
  }
}

function writeTurbopackHmrStub(destNm) {
  const runtimeRoot = join(destNm, "@vercel", "turbopack-ecmascript-runtime");
  const hmrDir = join(runtimeRoot, "browser", "dev", "hmr-client");

  mkdirSync(hmrDir, { recursive: true });
  writeFileSync(
    join(runtimeRoot, "package.json"),
    JSON.stringify(
      {
        name: "@vercel/turbopack-ecmascript-runtime",
        version: "0.0.0-cloudflare-stub",
        type: "module",
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  writeFileSync(join(hmrDir, "hmr-client.ts"), "export {};\n", "utf8");
}

function patchNextRequireHook(destNm) {
  const file = join(destNm, "next", "dist", "server", "require-hook.js");
  if (!existsSync(file)) return 0;

  const source = readFileSync(file, "utf8");
  if (source.includes("cloudflare-noop-require-hook")) return 0;

  writeFileSync(
    file,
    `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookPropertyMap = new Map();
const defaultOverrides = {};
function addHookAliases(aliases = []) {
  for (const [key, value] of aliases) {
    hookPropertyMap.set(key, value);
  }
}
exports.addHookAliases = addHookAliases;
exports.defaultOverrides = defaultOverrides;
exports.hookPropertyMap = hookPropertyMap;
// cloudflare-noop-require-hook
`,
    "utf8"
  );
  return 1;
}

function patchOpenNextRequireResolve(fnDir) {
  const file = join(fnDir, "index.mjs");
  if (!existsSync(file)) return 0;

  let source = readFileSync(file, "utf8");
  const patched = source
    .replaceAll('__require.resolve("./cache.cjs")', '"./cache.cjs"')
    .replaceAll('__require.resolve("./composable-cache.cjs")', '"./composable-cache.cjs"');

  if (patched === source) return 0;

  writeFileSync(file, patched, "utf8");
  return 1;
}

function patchNextBuildId(destNm, fnDir) {
  const file = join(destNm, "next", "dist", "server", "next-server.js");
  const buildIdFile = join(fnDir, ".next", "BUILD_ID");
  if (!existsSync(file) || !existsSync(buildIdFile)) return 0;

  const buildId = readFileSync(buildIdFile, "utf8").trim();
  let source = readFileSync(file, "utf8");
  if (source.includes("cloudflare-static-build-id")) return 0;

  const buildIdPattern = /getBuildId\(\) \{[\s\S]*?\n    getEnabledDirectories\(/;
  const fontManifestPattern =
    /getNextFontManifest\(\) \{[\s\S]*?\n    \/\/ Used in development only, overloaded in next-dev-server/;

  const buildIdReplacement = `getBuildId() {
        // cloudflare-static-build-id
        return ${JSON.stringify(buildId)};
    }
    getEnabledDirectories(`;

  const fontManifestReplacement = `getNextFontManifest() {
        return {};
    }
    // Used in development only, overloaded in next-dev-server`;

  if (!buildIdPattern.test(source)) return 0;

  source = source.replace(buildIdPattern, buildIdReplacement);
  if (fontManifestPattern.test(source)) {
    source = source.replace(fontManifestPattern, fontManifestReplacement);
  }

  writeFileSync(file, source, "utf8");
  return 1;
}

function removePackage(destNm, relName) {
  const target = join(destNm, ...relName.split("/"));
  if (!existsSync(target)) return 0;

  try {
    rmSync(target, { recursive: true, force: true });
    return 1;
  } catch (err) {
    console.error(`[fix-node-modules] Error removing ${relName}: ${err.message}`);
    return 0;
  }
}

function pruneNativePackages(destNm) {
  let removed = 0;
  removed += removePackage(destNm, "sharp");
  removed += removePackage(destNm, "canvas");
  removed += removePackage(destNm, "aws-crt");
  removed += removePackage(destNm, "@aws-sdk/signature-v4-crt");

  const imgScope = join(destNm, "@img");
  if (existsSync(imgScope)) {
    try {
      rmSync(imgScope, { recursive: true, force: true });
      removed++;
    } catch (err) {
      console.error(`[fix-node-modules] Error removing @img packages: ${err.message}`);
    }
  }

  return removed;
}

function removeSourceMaps(dir) {
  if (!existsSync(dir)) return 0;

  let removed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += removeSourceMaps(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".map")) {
      try {
        unlinkSync(fullPath);
        removed++;
      } catch {
        // Sourcemaps are optional deployment artifacts.
      }
    }
  }
  return removed;
}

// -- Main ------------------------------------------------------------

if (!existsSync(SERVER_FUNCTIONS_DIR)) {
  console.log("[fix-node-modules] No .open-next/server-functions found; skipping.");
  process.exit(0);
}

const fnDirs = readdirSync(SERVER_FUNCTIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

let replaced = 0;
let topLevelDeps = 0;
let localDeps = 0;
let aliased = 0;
let stubs = 0;
let pruned = 0;
let patchedRequireHooks = 0;
let patchedRequireResolve = 0;
let patchedBuildIds = 0;

for (const fnName of fnDirs) {
  const fnDir = join(SERVER_FUNCTIONS_DIR, fnName);
  const nmDir = join(SERVER_FUNCTIONS_DIR, fnName, "node_modules");
  if (!existsSync(nmDir)) continue;

  topLevelDeps += copyRequiredTopLevelPackages(nmDir);

  for (const pkgDir of listPackageDirs(nmDir)) {
    const rel = pkgName(pkgDir, nmDir);
    const pkgJson = readPkgJson(pkgDir);
    const packageName = packageRelNameFromJson(pkgJson, rel);
    if (copyPkg(packageName, nmDir, PROJECT_ROOT, pkgJson?.version)) {
      replaced++;
    }
  }

  for (const pkgDir of listPackageDirs(nmDir)) {
    const pkgJson = readPkgJson(pkgDir);
    const name = pkgJson?.name || pkgName(pkgDir, nmDir);
    if (LOCAL_HYDRATION_TARGETS.has(name)) {
      localDeps += hydratePackageLocalDeps(pkgDir);
    }
  }

  if (copyNextCompiledPackage("react-server-dom-webpack", "react-server-dom-webpack", nmDir)) {
    aliased++;
  }
  if (copyNextCompiledPackage("react-server-dom-turbopack", "react-server-dom-turbopack", nmDir)) {
    aliased++;
  }

  writeTurbopackHmrStub(nmDir);
  stubs++;
  patchedRequireHooks += patchNextRequireHook(nmDir);
  patchedRequireResolve += patchOpenNextRequireResolve(fnDir);
  patchedBuildIds += patchNextBuildId(nmDir, fnDir);
  pruned += pruneNativePackages(nmDir);
}

const removedMaps = removeSourceMaps(SERVER_FUNCTIONS_DIR);

if (aliased > 0) {
  console.log(`[fix-node-modules] Added ${aliased} Next compiled package aliases.`);
}
if (removedMaps > 0) {
  console.log(`[fix-node-modules] Removed ${removedMaps} sourcemap files from server functions.`);
}
if (patchedRequireHooks > 0) {
  console.log(`[fix-node-modules] Patched ${patchedRequireHooks} Next require hook files for Workers.`);
}
if (patchedRequireResolve > 0) {
  console.log(`[fix-node-modules] Patched ${patchedRequireResolve} OpenNext require.resolve call sites.`);
}
if (patchedBuildIds > 0) {
  console.log(`[fix-node-modules] Patched ${patchedBuildIds} Next build id readers for Workers.`);
}

console.log(
  `[fix-node-modules] Replaced ${replaced} packages, copied ${topLevelDeps} top-level deps, ` +
    `copied ${localDeps} package-local deps, pruned ${pruned} native packages, ` +
    `wrote ${stubs} HMR stubs across ${fnDirs.length} server functions.`
);
