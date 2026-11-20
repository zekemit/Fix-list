// Tiny static server with clean URLs, for local dev and tests. Usage: node scripts/serve.mjs <dir> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

export function serve(dir, port) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const candidates = [urlPath, urlPath + '.html', path.join(urlPath, 'index.html')];
    for (const c of candidates) {
      const file = path.join(root, c);
      if (!file.startsWith(root)) continue;
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'access-control-allow-origin': '*' });
        fs.createReadStream(file).pipe(res);
        return;
      }
    }
    const nf = path.join(root, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) {
  const [dir = 'dist', port = '4173'] = process.argv.slice(2);
  serve(dir, Number(port)).then(() => console.log(`serving ${dir} on http://127.0.0.1:${port}`));
}
