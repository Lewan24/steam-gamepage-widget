import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSteamService, normalizeGame, parseRequest } from '../server/steam.mjs';
const data = {
  name: '<b>Test &amp; Game</b>',
  short_description: '<script>bad()</script>Hello',
  header_image: 'https://shared.fastly.steamstatic.com/header.jpg',
  screenshots: [{ path_full: 'javascript:alert(1)' }],
  is_free: false,
  price_overview: { final_formatted: '10 zł', initial_formatted: '20 zł', discount_percent: 50 },
  release_date: { coming_soon: false },
  genres: [{ description: 'Action' }],
};
test('validates IDs, languages and countries without permitting arbitrary URLs', () => {
  assert.deepEqual(parseRequest('413150'), { id: '413150', language: 'polish', country: 'PL' });
  for (const id of ['-1', '0', '../secret', 'https://evil.com', '12345678901'])
    assert.throws(() => parseRequest(id), { status: 400 });
  assert.throws(() => parseRequest('1', 'bad'), { status: 400 });
  assert.throws(() => parseRequest('1', 'english', 'XX'), { status: 400 });
});
test('normalizes actual content, prices and reviews; filters unsafe artwork', () => {
  const game = normalizeGame('1', data, { total_reviews: 200, total_positive: 170 });
  assert.equal(game.name, 'Test & Game');
  assert.equal(game.description, 'bad()Hello');
  assert.equal(game.reviews.positive, 85);
  assert.equal(game.price.discount, 50);
  assert.deepEqual(game.screenshots, []);
  assert.equal(
    normalizeGame('1', {
      ...data,
      header_image: 'https://steamstatic.com.evil.com/a',
      is_free: true,
    }).header,
    '',
  );
  assert.equal(normalizeGame('1', { ...data, is_free: true }).price.formatted, 'Free to play');
});
test('deduplicates concurrent requests and expires cache', async () => {
  let calls = 0;
  let time = 0;
  const service = createSteamService({
    now: () => time,
    ttl: 50,
    fetcher: async (url) => {
      calls++;
      if (!url.includes('appdetails')) {
        const request = JSON.parse(new URL(url).searchParams.get('input_json'));
        assert.equal(request.appid, 1);
        assert.deepEqual(request.languages, ['all']);
      }
      return {
        ok: true,
        json: async () =>
          url.includes('appdetails')
            ? { 1: { success: true, data } }
            : { response: { query_summary: { total_reviews: 10, total_positive: 9 } } },
      };
    },
  });
  const [a, b] = await Promise.all([service('1'), service('1')]);
  assert.deepEqual(a, b);
  assert.equal(calls, 2);
  assert.equal(a.reviews.positive, 90);
  await service('1');
  assert.equal(calls, 2);
  time = 51;
  await service('1');
  assert.equal(calls, 4);
  await service('1', 'english', 'US');
  assert.equal(calls, 6);
});
test('review outages do not hide a valid game', async () => {
  const service = createSteamService({
    fetcher: async (url) => {
      if (url.includes('GetAppReviews')) throw Error('timeout');
      return { ok: true, json: async () => ({ 1: { success: true, data } }) };
    },
  });
  assert.equal((await service('1')).reviews, null);
});
test('not-found and upstream failures are distinguished and failures are not cached', async () => {
  const missing = createSteamService({
    fetcher: async () => ({ ok: true, json: async () => ({ 1: { success: false } }) }),
  });
  await assert.rejects(missing('1'), { status: 404 });
  let calls = 0;
  const unavailable = createSteamService({
    fetcher: async () => {
      calls++;
      return { ok: false, status: 429 };
    },
  });
  await assert.rejects(unavailable('1'), { status: 429 });
  await assert.rejects(unavailable('1'), { status: 429 });
  assert.equal(calls, 4);
});
