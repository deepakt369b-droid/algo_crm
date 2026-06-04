#!/usr/bin/env node
// Resolves all symlinks in .open-next by replacing them with real files/dirs.
// Required because Cloudflare Pages cannot deploy symlinks.

import { readdirSync, lstatSync, readlinkSync, cpSync, unlinkSync, rmdirSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function resolveSymlinks(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = resolve(dir, entry);
    const stat = lstatSync(fullPath);

    if (stat.isSymbolicLink()) {
      const target = resolve(dirname(fullPath), readlinkSync(fullPath));
      try {
        const targetStat = lstatSync(target);
        // Remove the symlink
        if (targetStat.isDirectory()) {
          rmdirSync(fullPath);
          cpSync(target, fullPath, { recursive: true, dereference: true });
        } else {
          unlinkSync(fullPath);
          cpSync(target, fullPath, { dereference: true });
        }
      } catch (e) {
        console.warn(`Skipping unresolvable symlink: ${fullPath} -> ${target}: ${e.message}`);
      }
    } else if (stat.isDirectory()) {
      resolveSymlinks(fullPath);
    }
  }
}

const openNextDir = resolve(process.cwd(), ".open-next");
console.log(`Resolving symlinks in ${openNextDir}...`);
resolveSymlinks(openNextDir);
console.log("Done resolving symlinks.");
