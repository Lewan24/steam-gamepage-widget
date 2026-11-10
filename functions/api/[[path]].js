import { handleCloudflareApi } from '../../cloudflare/api.mjs';

// The catch-all also returns JSON for unknown /api routes instead of index.html.
export function onRequest({ request }) {
  return handleCloudflareApi(request);
}
