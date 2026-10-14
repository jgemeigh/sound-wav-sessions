const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}).listen(4187, '127.0.0.1');
