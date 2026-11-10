import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { createCloudflareApi } from '../cloudflare/api.mjs';
import { createWorker } from '../cloudflare/worker.mjs';
import { onRequest } from '../functions/api/[[path]].js';
import { ApiError } from '../server/errors.mjs';
import { createRateLimiter } from '../server/rate-limit.mjs';
import { createSteamService } from '../server/steam/service.mjs';

const base = 'https://widget.example';

test('Cloudflare API serves JSON and passes game ID, language and country to the shared service', async () => {
  const calls = [];
  const handler = createCloudflareApi({
    getGame: async (...args) => {
      calls.push(args);
      return { id: args[0], name: 'Test Game' };
    },
  });
  const response = await handler(new Request(`${base}/api/games/413150?lang=english&country=US`));
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type').includes('application/json'));
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(response.headers.get('cache-control').includes('s-maxage=600'));
  assert.deepEqual(await response.json(), { id: '413150', name: 'Test Game' });
  assert.deepEqual(calls, [['413150', 'english', 'US']]);
});

test('unknown API paths, invalid IDs, methods and Steam errors stay JSON', async () => {
  const handler = createCloudflareApi({
    getGame: createSteamService({
      fetcher: async () => {
        throw new Error('Private error');
      },
    }),
  });
  for (const [path, method, status] of [
    ['/api/unknown', 'GET', 404],
    ['/api', 'GET', 404],
    ['/api/games/invalid', 'GET', 400],
    ['/api/games/1', 'POST', 405],
    ['/api/games/1', 'GET', 502],
  ]) {
    const response = await handler(new Request(base + path, { method }));
    assert.equal(response.status, status, path);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    if (status === 405) assert.equal(response.headers.get('allow'), 'GET');
    const body = await response.json();
    assert.equal(typeof body.error, 'string');
    assert.ok(!body.error.includes('Private error'));
  }
  const missing = createCloudflareApi({
    getGame: async () => {
      throw new ApiError(404, 'Brak gry.');
    },
  });
  assert.equal((await missing(new Request(`${base}/api/games/1`))).status, 404);
});

test('Cloudflare adapter handles unexpected failures and rate limits without HTML', async () => {
  const broken = createCloudflareApi({
    getGame: async () => {
      throw Error('Private details');
    },
  });
  const failed = await broken(new Request(`${base}/api/games/1`));
  assert.equal(failed.status, 500);
  assert.ok(!(await failed.text()).includes('Private details'));

  const limited = createCloudflareApi({
    getGame: async () => ({ id: '1', name: 'Game' }),
    checkRateLimit: createRateLimiter({ limit: 1 }),
  });
  const request = new Request(`${base}/api/games/1`, {
    headers: { 'CF-Connecting-IP': '192.0.2.1' },
  });
  assert.equal((await limited(request)).status, 200);
  const response = await limited(request);
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) > 0);
  assert.equal(typeof (await response.json()).error, 'string');
});

test('Worker routes every /api request to JSON and serves editor/embed routes as assets', async () => {
  const apiCalls = [];
  const assetCalls = [];
  const worker = createWorker(async (request) => {
    apiCalls.push(request.url);
    return Response.json({ error: 'API' }, { status: 404 });
  });
  const env = {
    ASSETS: {
      fetch: async (request) => {
        assetCalls.push(request.url);
        return new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } });
      },
    },
  };
  for (const path of ['/api', '/api/games/1', '/api/unknown']) {
    const response = await worker.fetch(new Request(base + path), env);
    assert.equal(response.status, 404);
    assert.ok(response.headers.get('content-type').includes('application/json'));
  }
  for (const path of ['/', '/embed/1', '/assets/app.js']) {
    assert.equal((await worker.fetch(new Request(base + path), env)).status, 200);
  }
  assert.equal(apiCalls.length, 3);
  assert.equal(assetCalls.length, 3);
});

test('Pages function catches API routes and deployment config excludes SPA fallback for API', async () => {
  const response = await onRequest({ request: new Request(`${base}/api/unknown`) });
  assert.equal(response.status, 404);
  assert.equal(typeof (await response.json()).error, 'string');
  const routes = JSON.parse(
    await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'),
  );
  assert.deepEqual(routes.include, ['/api', '/api/*']);
  const parsed = ts.parseConfigFileTextToJson(
    'wrangler.worker.jsonc',
    await readFile(new URL('../wrangler.worker.jsonc', import.meta.url), 'utf8'),
  );
  assert.equal(parsed.error, undefined);
  const worker = parsed.config;
  assert.deepEqual(worker.assets.run_worker_first, ['/api', '/api/*']);
  assert.equal(worker.assets.not_found_handling, 'single-page-application');
});
