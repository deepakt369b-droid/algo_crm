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

let modified = 0;

walkDir('.', function(filePath) {
  if (filePath.includes('prisma-types.ts') || filePath.includes('db.ts')) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('db.') && !content.includes('db\\.')) return;

  const originalContent = content;

  // Replace db.X.Y
  content = content.replace(/db\.([a-zA-Z0-9_]+)\.(create|update|delete|findMany|findFirst|findUnique|count|deleteMany|updateMany|upsert)/g, (match, model, method) => {
    let mappedMethod = method;
    if (method === 'create') mappedMethod = 'insert';
    if (method === 'deleteMany') mappedMethod = 'delete';
    if (method === 'updateMany') mappedMethod = 'update';
    return `supabaseAdmin.from("${model}").${mappedMethod}`;
  });

  if (content !== originalContent) {
    if (!content.includes('supabaseAdmin')) {
      content = `import { supabaseAdmin } from "@/lib/supabase-admin";\n` + content;
    }
    fs.writeFileSync(filePath, content);
    modified++;
  }
});

console.log(`Modified ${modified} files.`);
