import { createApiHandler } from './api.mjs';
import { createStaticHandler } from './static.mjs';

/** Dependencies are explicit so API behavior can be tested without Steam or Vite. */
export function createRequestHandler({ getGame, directory, middleware, checkRateLimit }) {
  const handleApi = createApiHandler({ getGame, checkRateLimit });
  const serveStatic = createStaticHandler(directory);

  return async function handleRequest(request, response) {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    let url;
    try {
      url = new URL(request.url ?? '/', 'http://localhost');
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }
    if (middleware) {
      middleware(request, response);
      return;
    }
    await serveStatic(request, response, url);
  };
}
