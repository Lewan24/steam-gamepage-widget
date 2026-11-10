import { ApiError } from './errors.mjs';
import { createRateLimiter } from './rate-limit.mjs';

export function createApiHandler({ getGame, checkRateLimit = createRateLimiter() }) {
  return async function handleApi(request, response, url) {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        throw new ApiError(405, 'Dozwolona metoda: GET.');
      }
      const match = /^\/api\/games\/([^/]+)$/.exec(url.pathname);
      if (!match) throw new ApiError(404, 'Nie znaleziono endpointu.');

      checkRateLimit(request.socket.remoteAddress ?? 'local');
      const game = await getGame(
        match[1],
        url.searchParams.get('lang') ?? 'polish',
        url.searchParams.get('country') ?? 'PL',
      );
      response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      response.end(JSON.stringify(game));
    } catch (error) {
      const expected = error instanceof ApiError;
      response.statusCode = expected ? error.status : 500;
      response.setHeader('Cache-Control', 'no-store');
      if (error.retryAfter) response.setHeader('Retry-After', String(error.retryAfter));
      response.end(
        JSON.stringify({ error: expected ? error.message : 'Błąd serwera. Spróbuj ponownie.' }),
      );
    }
  };
}
