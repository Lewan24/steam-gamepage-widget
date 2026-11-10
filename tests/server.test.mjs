import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { once } from 'node:events';
import { createRequestHandler } from '../server/app.mjs';
import { createRateLimiter } from '../server/rate-limit.mjs';
import { ApiError } from '../server/errors.mjs';

test('rate limits reset by window and remain independent per address', () => {
  let time = 0;
  const check = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
  check('first'); check('first');
  assert.throws(() => check('first'), { status: 429, retryAfter: 1 });
  assert.doesNotThrow(() => check('second'));
  time = 1000;
  assert.doesNotThrow(() => check('first'));
});

test('HTTP handler preserves API, iframe routes, static assets and error contracts', async () => {
  const testRoot = resolve(tmpdir());
  const directory = await mkdtemp(join(testRoot, 'steam-widget-test-'));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'index.html'), '<!doctype html><title>Widget</title>');
  await writeFile(join(directory, 'assets', 'app.js'), 'console.log("widget")');
  const calls = [];
  const handler = createRequestHandler({
    directory,
    getGame: async (...args) => {
      calls.push(args);
      if (args[0] === 'missing') throw new ApiError(404, 'Nie znaleziono gry.');
      if (args[0] === 'broken') throw new Error('Private upstream error');
      return { id: args[0], name: 'Test Game' };
    },
  });
  const server = createServer(handler);
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;

    const game = await fetch(`${base}/api/games/413150?lang=english&country=US`);
    assert.equal(game.status, 200);
    assert.equal((await game.json()).name, 'Test Game');
    assert.deepEqual(calls[0], ['413150', 'english', 'US']);
    assert.equal(game.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(game.headers.get('cache-control').includes('max-age=300'));

    const missing = await fetch(`${base}/api/games/missing`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('cache-control'), 'no-store');
    assert.equal((await missing.json()).error, 'Nie znaleziono gry.');

    const broken = await fetch(`${base}/api/games/broken`);
    assert.equal(broken.status, 500);
    assert.ok(!(await broken.text()).includes('Private upstream error'));

    const method = await fetch(`${base}/api/games/1`, { method: 'POST' });
    assert.equal(method.status, 405);
    assert.equal(method.headers.get('allow'), 'GET');
    assert.equal((await fetch(`${base}/api/unknown`)).status, 404);

    const embed = await fetch(`${base}/embed/413150?theme=light`);
    assert.equal(embed.status, 200);
    assert.ok((await embed.text()).includes('<title>Widget</title>'));
    assert.equal(embed.headers.get('x-frame-options'), null);
    const head = await fetch(`${base}/`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');

    const asset = await fetch(`${base}/assets/app.js`);
    assert.equal(asset.status, 200);
    assert.ok(asset.headers.get('content-type').includes('javascript'));
    assert.ok(asset.headers.get('cache-control').includes('immutable'));
    assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404);
    assert.equal((await fetch(`${base}/bad%ZZ`)).status, 400);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    assert.equal(dirname(directory), testRoot);
    assert.ok(basename(directory).startsWith('steam-widget-test-'));
    await rm(directory, { recursive: true, force: true });
  }
});
