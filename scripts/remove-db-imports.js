const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git' && f !== '__tests__') {
        walkDir(dirPath, callback);
      }
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      callback(path.join(dir, f));
    }
  });
}

walkDir('.', function(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('import { db } from "@/lib/db"')) {
    content = content.replace(/import { db } from "@\/lib\/db";?\n?/g, '');
    fs.writeFileSync(filePath, content);
  }
});
