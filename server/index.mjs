import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from './app.mjs';
import { createSteamService } from './steam/service.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dev = process.argv.includes('--dev');
const vite = dev
  ? await (await import('vite')).createServer({ root, server: { middlewareMode: true } })
  : null;
const server = createServer(
  createRequestHandler({
    getGame: createSteamService(),
    directory: resolve(root, 'dist'),
    middleware: vite?.middlewares,
  }),
);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
server.listen(port, host, () =>
  console.log(`Steam Game Widget: http://localhost:${server.address().port}`),
);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  // Stop accepting connections and let in-flight responses complete.
  const timeout = setTimeout(() => {
    server.closeAllConnections();
    process.exit(1);
  }, 10_000);
  timeout.unref();
  const closed = new Promise((resolveClose) => server.close(resolveClose));
  await Promise.all([closed, vite?.close()]);
  clearTimeout(timeout);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, shutdown);
