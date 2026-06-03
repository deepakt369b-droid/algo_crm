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

walkDir('.', p => {
  let text = fs.readFileSync(p, 'utf8');
  let changed = false;

  if (text.includes('@prisma/client')) {
    text = text.replace(/from\s+['"]@prisma\/client['"]/g, 'from "@/lib/prisma-types"');
    text = text.replace(/import\s+\{\s*Decimal\s*\}\s+from\s+['"]@prisma\/client\/runtime\/client['"];?/g, 'import Decimal from "decimal.js";');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, text);
    console.log("Updated", p);
  }
});
