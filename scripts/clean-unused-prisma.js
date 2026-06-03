const fs = require('fs');
const path = require('path');
function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!['node_modules', '.next', '.git', '__tests__'].includes(f)) walkDir(p, cb);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) cb(p);
  });
}
walkDir('.', p => {
  let text = fs.readFileSync(p, 'utf8');
  let changed = false;
  if (text.includes('@/lib/prisma')) {
    text = text.replace(/import\s+\{\s*(prismadb|prisma)\s*(?:as\s+prisma)?\s*\}\s+from\s+['"]@\/lib\/prisma['"];?\n?/g, '');
    changed = true;
  }
  if (text.includes('@prisma/adapter-pg')) {
    text = text.replace(/import\s+.*?\s+from\s+['"]@prisma\/adapter-pg['"];?\n?/g, '');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(p, text);
    console.log('Cleaned ' + p);
  }
});
