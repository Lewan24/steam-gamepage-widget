import { Image, LoaderCircle, RotateCcw } from 'lucide-react';
import type { Config } from '../../config';
import type { GameResource } from '../../hooks/useGame';
import { GameWidget } from './GameWidget';

export function GameState({ state, config }: { state: GameResource; config: Config }) {
  if (state.loading)
    return (
      <div className="widget-placeholder" role="status">
        <LoaderCircle className="spin" size={26} />
        <strong>Pobieramy grę ze Steam…</strong>
        <span>Grafiki, opis i aktualne informacje.</span>
      </div>
    );
  if (state.error || !state.game)
    return (
      <div className="widget-placeholder error" role="alert">
        <Image size={28} />
        <strong>Nie udało się wczytać gry</strong>
        <span>{state.error}</span>
        <button onClick={state.retry} className="button secondary">
          <RotateCcw size={15} /> Spróbuj ponownie
        </button>
      </div>
    );
  return <GameWidget game={state.game} config={config} />;
}
