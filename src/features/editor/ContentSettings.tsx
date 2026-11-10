import type { SettingsProps } from './types';
import { type Config } from '../../config';
import type { Game } from '../../types/game';
import { Toggle } from '../../components/Toggle';

export function ContentSettings({ config, update, game }: SettingsProps & { game: Game | null }) {
  return (
    <>
      <fieldset>
        <legend>Widoczne elementy</legend>
        {(
          [
            ['description', 'Opis gry'],
            ['genres', 'Gatunki'],
            ['reviews', 'Oceny graczy'],
            ['price', 'Cena i promocja'],
          ] as const
        ).map(([key, label]) => (
          <Toggle
            key={key}
            label={label}
            checked={config[key]}
            onChange={() => update(key, !config[key])}
          />
        ))}
      </fieldset>
      <label className="field-label" htmlFor="action">
        Główny przycisk
      </label>
      <select
        id="action"
        value={config.action}
        onChange={(e) => update('action', e.target.value as Config['action'])}
      >
        <option value="wishlist">Dodaj do listy życzeń</option>
        <option value="store">Zobacz na Steam</option>
      </select>
      <p className="help">
        Przycisk otwiera stronę gry. Dodanie do listy życzeń wymaga konta na Steam.
      </p>
      <label className="field-label" htmlFor="artwork">
        Grafika
      </label>
      <select
        id="artwork"
        value={config.artwork}
        onChange={(e) => update('artwork', +e.target.value)}
      >
        <option value="0">Oficjalna grafika gry</option>
        {game?.screenshots.map((_, index) => (
          <option key={index} value={index + 1}>
            Zrzut ekranu {index + 1}
          </option>
        ))}
      </select>
      <p className="help">Kompakt pokazuje tytuł, oceny, cenę i przycisk.</p>
    </>
  );
}
