import fs from "node:fs";

const META = "C:/Users/SAHARA/Downloads/nextcrm-app-main/flowlinecrm-app-main/.open-next/server-functions/default/handler.mjs.meta.json";

const meta = JSON.parse(fs.readFileSync(META, "utf-8"));
const inputs = Object.entries(meta.inputs).map(([p, d]) => ({ p, b: d.bytes || 0 }));

const app = inputs.filter(
  (x) => !x.p.includes(".pnpm/") && !x.p.includes("node_modules/") && !x.p.includes("prettier")
);
app.sort((a, b) => b.b - a.b);

const totalApp = app.reduce((s, e) => s + e.b, 0);
console.log(`App-code files: ${app.length}, total: ${(totalApp / 1048576).toFixed(2)} MiB`);
console.log("Top 30 app-code files:");
for (const i of app.slice(0, 30)) {
  const short = i.p.replace(/^\.open-next\/server-functions\/default\//, "").slice(-110);
  console.log(`  ${(i.b / 1048576).toFixed(2).padStart(7)} MiB  ${short}`);
}
