#!/usr/bin/env node
/**
 * Fix incomplete node_modules in OpenNext server-function directories.
 *
 * The OpenNext `copyTracedFiles` function (from @vercel/nft) copies only
 * individual traced files from each package, NOT the complete package
 * directory. This causes:
 *
 *  1. Packages with conditional exports (e.g. @swc/helpers CJS/ESM) to
 *     have their package.json but not the cjs/ directory.
 *  2. Packages whose transitive deps are hoisted (e.g. critters →
 *     css-select) to have their main file but not dependencies.
 *
 * When `patch-worker.mjs` switches the worker entry from `handler.mjs`
 * (fully bundled) to `index.mjs` (unbundled, references node_modules),
 * wrangler's esbuild step encounters these incomplete packages and fails
 * with "Could not resolve" errors.
 *
 * This script:
 *  1. Replaces every package directory inside each server function's
 *     node_modules folder with a complete copy from the project root.
 *  2. Then iterates to find and copy any MISSING transitive dependencies
 *     that are not yet present in the destination.
 *
 * Must run AFTER resolve-symlinks.mjs and BEFORE patch-worker.mjs.
 */

import {
  cpSync,
  existsSync,
  realpathSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { createRequire } from "node:module";

const PROJECT_ROOT = resolve(process.cwd());
const OPEN_NEXT_DIR = join(PROJECT_ROOT, ".open-next");
const SERVER_FUNCTIONS_DIR = join(OPEN_NEXT_DIR, "server-functions");
const PROJECT_NM = join(PROJECT_ROOT, "node_modules");

// ── Helpers ─────────────────────────────────────────────────────────

/** List all package directories (including scoped) inside a node_modules dir. */
function listPackageDirs(nmDir) {
  const dirs = [];
  if (!existsSync(nmDir)) return dirs;
  for (const entry of readdirSync(nmDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (entry.name.startsWith("@")) {
      const scopeDir = join(nmDir, entry.name);
      for (const se of readdirSync(scopeDir, { withFileTypes: true })) {
        if (se.isDirectory()) dirs.push(join(scopeDir, se.name));
      }
    } else {
      dirs.push(join(nmDir, entry.name));
    }
  }
  return dirs;
}

/** Get the relative package name from a full path inside node_modules. */
function pkgName(fullPath, nmDir) {
  return fullPath.substring(nmDir.length + 1);
}

/** Read a package.json safely, returning null on failure. */
function readPkgJson(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

/** Copy a complete package from project root to destination. */
function findPackageJson(startDir) {
  let current = startDir;
  while (current && current !== dirname(current)) {
    const candidate = join(current, "package.json");
    if (existsSync(candidate)) return candidate;
    current = dirname(current);
  }
  return null;
}

function resolvePkgSource(relName, fromDir = PROJECT_ROOT) {
  const direct = join(PROJECT_NM, relName);
  if (existsSync(direct)) return realpathSync(direct);

  const realFromDir = existsSync(fromDir) ? realpathSync(fromDir) : fromDir;
  const requireFrom = createRequire(join(realFromDir, "package.json"));
  try {
    return dirname(requireFrom.resolve(`${relName}/package.json`));
  } catch {
    // Some packages do not export package.json. Resolve the package entry
    // instead, then walk upward to the package root.
  }

  try {
    const entry = requireFrom.resolve(relName);
    const packageJson = findPackageJson(dirname(entry));
    return packageJson ? dirname(packageJson) : null;
  } catch {
    return null;
  }
}

/** Copy a complete package from its pnpm-resolved source to destination. */
function copyPkg(relName, destNm, fromDir = PROJECT_ROOT) {
  const src = resolvePkgSource(relName, fromDir);
  const dst = join(destNm, relName);
  if (!src || !existsSync(src)) return false;
  try {
    cpSync(src, dst, { recursive: true, force: true, dereference: true });
    return true;
  } catch (err) {
    console.error(`[fix-node-modules] Error copying ${relName}: ${err.message}`);
    return false;
  }
}

/** Get dependency names needed at runtime. */
function getDeps(pkgJson) {
  if (!pkgJson) return [];
  const all = {
    ...pkgJson.dependencies,
    ...pkgJson.optionalDependencies,
    ...pkgJson.peerDependencies,
  };
  return Object.keys(all);
}

function copyNextCompiledPackage(sourceName, aliasName, destNm) {
  const nextDir = resolvePkgSource("next");
  if (!nextDir) return false;

  const src = join(nextDir, "dist", "compiled", sourceName);
  const dst = join(destNm, aliasName);
  if (!existsSync(src)) return false;

  try {
    cpSync(src, dst, { recursive: true, force: true, dereference: true });
    return true;
  } catch (err) {
    console.error(`[fix-node-modules] Error copying ${aliasName}: ${err.message}`);
    return false;
  }
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
        // Sourcemaps are optional deployment artifacts. Ignore files that
        // disappear while walking copied package trees.
      }
    }
  }
  return removed;
}

// ── Main ────────────────────────────────────────────────────────────

if (!existsSync(SERVER_FUNCTIONS_DIR)) {
  console.log("[fix-node-modules] No .open-next/server-functions found — skipping.");
  process.exit(0);
}

const fnDirs = readdirSync(SERVER_FUNCTIONS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let replaced = 0;

// Phase 1: Replace incomplete packages with complete copies
for (const fnName of fnDirs) {
  const nmDir = join(SERVER_FUNCTIONS_DIR, fnName, "node_modules");
  for (const pkgDir of listPackageDirs(nmDir)) {
    const rel = pkgName(pkgDir, nmDir);
    if (copyPkg(rel, nmDir)) replaced++;
  }
}

// Phase 2: Iteratively find and copy MISSING transitive dependencies.
// We iterate because a newly-copied package may itself have deps that
// are also missing. We cap iterations to avoid infinite loops.
const MAX_ITERATIONS = 25;
for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
  let added = 0;
  for (const fnName of fnDirs) {
    const nmDir = join(SERVER_FUNCTIONS_DIR, fnName, "node_modules");
    if (!existsSync(nmDir)) continue;

    for (const pkgDir of listPackageDirs(nmDir)) {
      const rel = pkgName(pkgDir, nmDir);
      const pkgJson = readPkgJson(pkgDir);
      if (!pkgJson) continue;

      for (const dep of getDeps(pkgJson)) {
        const depDir = join(nmDir, dep);
        if (existsSync(depDir)) continue; // already present

        const sourceDir = resolvePkgSource(rel, PROJECT_ROOT);
        if (copyPkg(dep, nmDir, sourceDir ?? PROJECT_ROOT)) {
          added++;
          replaced++;
        }
      }
    }
  }
  if (added === 0) break; // no more missing deps
  console.log(`[fix-node-modules] Iteration ${iter + 1}: copied ${added} missing transitive deps.`);
}

// Next ships these React server-dom packages under next/dist/compiled, but
// some server runtime files still require them by their package names.
// Provide package aliases inside every split function so Wrangler's esbuild
// pass can resolve the imports.
let aliased = 0;
for (const fnName of fnDirs) {
  const nmDir = join(SERVER_FUNCTIONS_DIR, fnName, "node_modules");
  if (!existsSync(nmDir)) continue;

  if (copyNextCompiledPackage("react-server-dom-webpack", "react-server-dom-webpack", nmDir)) {
    aliased++;
  }
  if (copyNextCompiledPackage("react-server-dom-turbopack", "react-server-dom-turbopack", nmDir)) {
    aliased++;
  }
}

if (aliased > 0) {
  console.log(`[fix-node-modules] Added ${aliased} Next compiled package aliases.`);
}

const removedMaps = removeSourceMaps(SERVER_FUNCTIONS_DIR);
if (removedMaps > 0) {
  console.log(`[fix-node-modules] Removed ${removedMaps} sourcemap files from server functions.`);
}

console.log(
  `[fix-node-modules] Replaced ${replaced} packages across ${fnDirs.length} server functions.`
);
