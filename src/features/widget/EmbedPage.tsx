import { readConfig } from '../../config';
import { useGame } from '../../hooks/useGame';
import { GameState } from './GameState';

export function EmbedPage({ id, params }: { id: string; params: URLSearchParams }) {
  const config = readConfig(params);
  const state = useGame(id, config);
  return (
    <main className="embed-container">
      <GameState state={state} config={config} />
    </main>
  );
}
