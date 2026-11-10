import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/services/steam.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { fetchGame } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);
const options = { language: 'polish', country: 'PL' };

test('client reports an HTML SPA fallback as a deployment problem', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response('<!doctype html><html></html>', { headers: { 'Content-Type': 'text/html' } }),
  );
  await assert.rejects(
    fetchGame('413150', options, new AbortController().signal),
    /Functions lub Workera/,
  );
});

test('client keeps API errors readable and rejects malformed JSON or unexpected data', async (context) => {
  for (const response of [
    new Response('<!doctype html>', { headers: { 'Content-Type': 'application/json' } }),
    Response.json({ wrong: 'response' }),
    Response.json(null),
  ]) {
    const mock = context.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(fetchGame('1', options, new AbortController().signal), /niepoprawne dane/);
    mock.mock.restore();
  }
  context.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Nie znaleziono gry.' }, { status: 404 }),
  );
  await assert.rejects(fetchGame('1', options, new AbortController().signal), /Nie znaleziono gry/);
});

test('client returns game JSON and sends the requested locale', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, '/api/games/413150?lang=polish&country=PL');
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ id: '413150', name: 'Stardew Valley' });
  });
  assert.equal(
    (await fetchGame('413150', options, new AbortController().signal)).name,
    'Stardew Valley',
  );
});
