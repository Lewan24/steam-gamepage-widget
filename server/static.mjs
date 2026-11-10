import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

export function createStaticHandler(directory) {
  const root = resolve(directory);
  return async function serveStatic(request, response, url) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }

    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    try {
      let file = path;
      try {
        if (!(await stat(file)).isFile()) file = resolve(root, 'index.html');
      } catch {
        // Only application routes get the SPA fallback; missing assets remain 404s.
        if (extname(pathname)) {
          response.writeHead(404);
          response.end();
          return;
        }
        file = resolve(root, 'index.html');
      }
      const body = await readFile(file);
      response.setHeader('Content-Type', contentTypes[extname(file)] ?? 'application/octet-stream');
      response.setHeader(
        'Cache-Control',
        file.includes(sep + 'assets' + sep) ? 'public, max-age=31536000, immutable' : 'no-cache',
      );
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(500);
      response.end('Uruchom npm run build przed npm start.');
    }
  };
}
