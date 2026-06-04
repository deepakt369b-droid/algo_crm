import fs from "node:fs";

const META = "C:/Users/SAHARA/Downloads/nextcrm-app-main/flowlinecrm-app-main/.open-next/server-functions/default/handler.mjs.meta.json";
const OUT_JSON = "C:/Users/SAHARA/Downloads/nextcrm-app-main/flowlinecrm-app-main/scripts/bundle-report.json";

const meta = JSON.parse(fs.readFileSync(META, "utf-8"));

const entries = Object.entries(meta.inputs).map(([path, data]) => ({
  path,
  bytes: data.bytes ?? 0,
}));

entries.sort((a, b) => b.bytes - a.bytes);

const total = entries.reduce((s, e) => s + e.bytes, 0);

const grouped = new Map();
for (const e of entries) {
  const m1 = e.path.match(/\.pnpm\/((?:@[^/]+\+[^/]+|[^@\/][^/]*)(?:@[^/]+)?(?:_[^/]+)?)\/node_modules\//);
  let pkg = m1 ? m1[1].split("@")[0] : null;
  if (!pkg) {
    const m2 = e.path.match(/node_modules\/((?:@[^/]+\/[^/]+|[^/]+))/);
    pkg = m2 ? m2[1] : "(app code)";
  }
  grouped.set(pkg, (grouped.get(pkg) ?? 0) + e.bytes);
}

const sortedGroups = [...grouped.entries()].sort((a, b) => b[1] - a[1]);

const report = {
  totalBytes: total,
  totalMiB: +(total / 1024 / 1024).toFixed(2),
  fileCount: entries.length,
  topInputs: entries.slice(0, 50).map((e) => ({
    path: e.path,
    miB: +(e.bytes / 1024 / 1024).toFixed(2),
  })),
  topPackages: sortedGroups.slice(0, 40).map(([pkg, bytes]) => ({
    pkg,
    miB: +(bytes / 1024 / 1024).toFixed(2),
  })),
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

console.log(`Total: ${report.totalMiB} MiB across ${report.fileCount} files`);
console.log(`Full report: ${OUT_JSON}`);
console.log(`\nTop 12 packages:`);
for (const { pkg, miB } of report.topPackages.slice(0, 12)) {
  console.log(`  ${String(miB).padStart(7)} MiB  ${pkg}`);
}
