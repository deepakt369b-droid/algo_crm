#!/usr/bin/env node
// Resolves all symlinks in .open-next by copying with dereference.
// Skips dangling symlinks (targets that don't exist).
import { cpSync, rmSync, renameSync, readdirSync, lstatSync, mkdirSync, copyFileSync, readlinkSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

function copyDereferenced(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    const stat = lstatSync(srcPath);
    if (stat.isSymbolicLink()) {
      // Resolve the final real target, skipping dangling symlinks
      try {
        const target = resolve(dirname(srcPath), readlinkSync(srcPath));
        const realStat = lstatSync(target);
        if (realStat.isDirectory()) {
          copyDereferenced(target, dstPath);
        } else {
          copyFileSync(target, dstPath);
        }
      } catch {
        // Dangling symlink - skip silently
      }
    } else if (stat.isDirectory()) {
      copyDereferenced(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

const openNextDir = resolve(process.cwd(), ".open-next");
const tempDir = openNextDir + "_tmp";

console.log(`Resolving symlinks in ${openNextDir}...`);
copyDereferenced(openNextDir, tempDir);
rmSync(openNextDir, { recursive: true, force: true });
renameSync(tempDir, openNextDir);
console.log("Done resolving symlinks.");
