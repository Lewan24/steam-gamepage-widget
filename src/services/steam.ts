import type { Config } from '../config';
import type { Game } from '../types/game';

type GameRequest = Pick<Config, 'language' | 'country'>;

export async function fetchGame(
  id: string,
  options: GameRequest,
  signal: AbortSignal,
): Promise<Game> {
  const query = new URLSearchParams({ lang: options.language, country: options.country });
  const response = await fetch(`/api/games/${encodeURIComponent(id)}?${query}`, { signal });

  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new Error(
      'Serwer API zwrócił stronę zamiast danych gry. Sprawdź wdrożenie Functions lub Workera na Cloudflare.',
    );
  }

  let body;
  try {
    body = await response.json();
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new Error('Serwer API zwrócił niepoprawne dane. Spróbuj ponownie za chwilę.');
  }
  if (!response.ok) {
    throw new Error(typeof body?.error === 'string' ? body.error : 'Nie udało się pobrać gry.');
  }
  if (
    !body ||
    typeof body !== 'object' ||
    typeof body.id !== 'string' ||
    typeof body.name !== 'string'
  ) {
    throw new Error('Serwer API zwrócił niepoprawne dane gry. Sprawdź konfigurację wdrożenia.');
  }
  return body as Game;
}
