const fs = require('fs');
for (const file of ['scripts/migrate-prisma.js', 'scripts/migrate-complex.js', 'scripts/migrate-complex-v2.js']) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.startsWith('"')) {
       try {
          content = JSON.parse(content.trim());
          fs.writeFileSync(file, content);
          console.log('Fixed', file);
       } catch(e) {
          console.error('Failed', file, e.message);
       }
    }
  }
}
