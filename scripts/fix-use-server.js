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
let changed = 0;
walkDir('.', p => {
  let text = fs.readFileSync(p, 'utf8');
  if (text.includes('"use server"') || text.includes("'use server'")) {
    const lines = text.split('\n');
    let serverLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === '"use server";' || trimmed === "'use server';") {
        serverLineIdx = i;
        break;
      }
    }
    
    if (serverLineIdx > 0) {
      // It's not the first line (excluding empty lines or comments, but strict nextjs requires it at top)
      // Actually, imports must be AFTER "use server". So let's just move it to index 0.
      const newLines = [...lines];
      const serverLine = newLines.splice(serverLineIdx, 1)[0];
      newLines.unshift(serverLine);
      fs.writeFileSync(p, newLines.join('\n'));
      console.log('Fixed use server in ' + p);
      changed++;
    }
  }
});
console.log('Fixed ' + changed + ' files');
