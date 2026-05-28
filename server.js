const fs = require('fs');
const http = require('http');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 5180);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8'
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
  if (url.pathname === '/favicon.ico') {
    response.writeHead(204);
    response.end();
    return;
  }
  const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.normalize(path.join(root, relative));

  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(file, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const ext = path.extname(file);
    const cacheControl = /[\\/]assets[\\/]|[\\/]vendor[\\/]/.test(file)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';

    response.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': cacheControl
    });
    fs.createReadStream(file).pipe(response);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Spine scene site: http://127.0.0.1:${port}/`);
});
