const fs = require('fs');
const path = require('path');
function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!['node_modules', '.next', '.git', '__tests__'].includes(f)) walkDir(p, cb);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      cb(p);
    }
  });
}
let imports = new Set();
walkDir('.', p => {
  const text = fs.readFileSync(p, 'utf8');
  const matches = text.match(/import\s+\{([^}]+)\}\s+from\s+['"]@prisma\/client['"]/g);
  if (matches) {
    matches.forEach(m => {
      const inner = m.match(/\{([^}]+)\}/)[1];
      inner.split(',').forEach(i => imports.add(i.trim()));
    });
  }
});
console.log(Array.from(imports).filter(Boolean).sort());
