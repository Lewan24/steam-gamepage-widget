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
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Nie udało się pobrać gry.');
  return body as Game;
}
