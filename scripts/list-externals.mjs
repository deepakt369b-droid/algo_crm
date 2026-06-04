import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/SAHARA/Downloads/nextcrm-app-main/flowlinecrm-app-main/.open-next/server-functions/default/node_modules";

const pkgs = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && e.name === "package.json") pkgs.push(p);
  }
}
try { walk(ROOT); } catch (e) { console.log("No node_modules dir or empty"); process.exit(0); }

console.log(`Found ${pkgs.length} package.json files in bundled node_modules:\n`);
for (const p of pkgs) {
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(p, "utf-8")); } catch { continue; }
  const exps = JSON.stringify(pkg.exports || {});
  const hasWorkerd = exps.includes("workerd");
  const rel = path.relative(ROOT, p);
  console.log(`${hasWorkerd ? "[W]" : "   "} ${pkg.name}@${pkg.version}  ${rel.split(path.sep).slice(0, 3).join("/")}`);
}
