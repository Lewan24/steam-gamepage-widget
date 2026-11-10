import { ApiError } from './errors.mjs';

/** Fixed-window limit; behind a reverse proxy, enforce client limits there too. */
export function createRateLimiter({
  limit = 120,
  windowMs = 60_000,
  maxEntries = 10_000,
  now = Date.now,
} = {}) {
  const visitors = new Map();
  let nextCleanup = 0;

  return function checkRateLimit(address) {
    const time = now();
    if (time >= nextCleanup) {
      for (const [key, visitor] of visitors) {
        if (visitor.until <= time) visitors.delete(key);
      }
      nextCleanup = time + windowMs;
    }
    let visitor = visitors.get(address);
    if (!visitor || visitor.until <= time) {
      visitor = { count: 0, until: time + windowMs };
      if (visitors.size >= maxEntries) visitors.delete(visitors.keys().next().value);
      visitors.set(address, visitor);
    }
    visitor.count++;
    if (visitor.count > limit) {
      const error = new ApiError(429, 'Zbyt wiele zapytań. Odczekaj chwilę.');
      error.retryAfter = Math.max(1, Math.ceil((visitor.until - time) / 1000));
      throw error;
    }
  };
}
