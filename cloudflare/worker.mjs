import { handleCloudflareApi } from './api.mjs';

export function createWorker(handleApi = handleCloudflareApi) {
  return {
    async fetch(request, env) {
      const { pathname } = new URL(request.url);
      // API errors must remain JSON; never send these requests to the SPA fallback.
      if (pathname === '/api' || pathname.startsWith('/api/')) return handleApi(request);
      return env.ASSETS.fetch(request);
    },
  };
}

export default createWorker();
