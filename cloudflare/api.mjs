import { ApiError } from '../server/errors.mjs';
import { createRateLimiter } from '../server/rate-limit.mjs';
import { createSteamService } from '../server/steam/service.mjs';

/** Web Request/Response adapter shared by Pages Functions and Workers. */
export function createCloudflareApi({
  getGame = createSteamService(),
  checkRateLimit = createRateLimiter(),
} = {}) {
  return async function handleApi(request) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });

    try {
      if (request.method !== 'GET') {
        headers.set('Allow', 'GET');
        throw new ApiError(405, 'Dozwolona metoda: GET.');
      }

      const url = new URL(request.url);
      const match = /^\/api\/games\/([^/]+)$/.exec(url.pathname);
      if (!match) throw new ApiError(404, 'Nie znaleziono endpointu.');

      // Cloudflare supplies this header; do not use client-provided forwarding chains.
      checkRateLimit(request.headers.get('CF-Connecting-IP') ?? 'local');
      const game = await getGame(
        match[1],
        url.searchParams.get('lang') ?? 'polish',
        url.searchParams.get('country') ?? 'PL',
      );

      headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      return new Response(JSON.stringify(game), { status: 200, headers });
    } catch (error) {
      const expected = error instanceof ApiError;
      if (expected && error.retryAfter) headers.set('Retry-After', String(error.retryAfter));
      return new Response(
        JSON.stringify({ error: expected ? error.message : 'Błąd serwera. Spróbuj ponownie.' }),
        { status: expected ? error.status : 500, headers },
      );
    }
  };
}

export const handleCloudflareApi = createCloudflareApi();
