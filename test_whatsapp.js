const http = require('http');

http.get('http://localhost:3000/en/admin/whatsapp', (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
