import { ApiError } from '../errors.mjs';
import { parseRequest } from './request.mjs';
import { normalizeGame } from './normalize.mjs';
export function createSteamService({
  fetcher = fetch,
  now = Date.now,
  ttl = 600_000,
  maxEntries = 500,
} = {}) {
  const cache = new Map();
  const pending = new Map();
  async function json(url) {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 429 ? 429 : 502,
        'Steam jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
      );
    return response.json();
  }
  async function load({ id, language, country }) {
    const reviewUrl = new URL('https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/');
    reviewUrl.searchParams.set(
      'input_json',
      JSON.stringify({
        appid: Number(id),
        languages: ['all'],
        review_type: 0,
        purchase_type: 1,
        num_per_page: 1,
      }),
    );
    const [details, reviews] = await Promise.all([
      json(
        `https://store.steampowered.com/api/appdetails?appids=${id}&l=${language}&cc=${country}`,
      ),
      json(reviewUrl.href).catch(() => null),
    ]);
    if (!details[id]?.success || !details[id]?.data?.name)
      throw new ApiError(
        404,
        'Nie znaleziono publicznej strony gry. Sprawdź App ID lub zmień region.',
      );
    return normalizeGame(id, details[id].data, reviews?.response?.query_summary);
  }
  return async function getGame(id, language, country) {
    const request = parseRequest(id, language, country);
    const key = JSON.stringify(request);
    const hit = cache.get(key);
    if (hit && hit.expires > now()) return hit.game;
    if (pending.has(key)) return pending.get(key);
    const promise = load(request)
      .then((game) => {
        if (cache.size >= maxEntries) cache.delete(cache.keys().next().value);
        cache.set(key, { game, expires: now() + ttl });
        return game;
      })
      .catch((error) => {
        if (error instanceof ApiError) throw error;
        throw new ApiError(502, 'Nie udało się pobrać danych ze Steam. Spróbuj ponownie.');
      })
      .finally(() => pending.delete(key));
    pending.set(key, promise);
    return promise;
  };
}
