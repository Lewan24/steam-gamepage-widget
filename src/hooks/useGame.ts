import { useEffect, useState } from 'react';
import type { Config } from '../config';
import type { Game } from '../types/game';
import { fetchGame } from '../services/steam';

type LoadState = { game: Game | null; loading: boolean; error: string };
export type GameResource = LoadState & { retry: () => void };
const initialState: LoadState = { game: null, loading: true, error: '' };

/** Appearance edits do not refetch a game; only its ID, language or region does. */
export function useGame(
  id: string,
  { language, country }: Pick<Config, 'language' | 'country'>,
): GameResource {
  const [state, setState] = useState<LoadState>(initialState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(initialState);

    async function load() {
      try {
        const game = await fetchGame(id, { language, country }, controller.signal);
        if (!controller.signal.aborted) setState({ game, loading: false, error: '' });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          game: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Błąd połączenia.',
        });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, language, country, attempt]);

  return { ...state, retry: () => setAttempt((current) => current + 1) };
}
