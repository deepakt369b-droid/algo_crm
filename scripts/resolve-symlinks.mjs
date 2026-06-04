#!/usr/bin/env node
// Resolves all symlinks in .open-next by copying with dereference.
// Uses Node.js built-ins only - no external tools required.
import { cpSync, rmSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const openNextDir = resolve(process.cwd(), ".open-next");
const tempDir = openNextDir + "_tmp";

console.log(`Resolving symlinks in ${openNextDir}...`);
cpSync(openNextDir, tempDir, { recursive: true, dereference: true, errorOnExist: false });
rmSync(openNextDir, { recursive: true, force: true });
renameSync(tempDir, openNextDir);
console.log("Done resolving symlinks.");
