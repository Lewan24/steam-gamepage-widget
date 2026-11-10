import type { SettingsProps } from './types';

export function AdvancedSettings({ config, update }: SettingsProps) {
  return (
    <>
      <label className="field-label" htmlFor="language">
        Język danych Steam
      </label>
      <select
        id="language"
        value={config.language}
        onChange={(e) => update('language', e.target.value)}
      >
        {[
          ['polish', 'Polski'],
          ['english', 'English'],
          ['german', 'Deutsch'],
          ['french', 'Français'],
          ['spanish', 'Español'],
        ].map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <label className="field-label" htmlFor="country">
        Region cen
      </label>
      <select
        id="country"
        value={config.country}
        onChange={(e) => update('country', e.target.value)}
      >
        {[
          ['PL', 'Polska · PLN'],
          ['US', 'USA · USD'],
          ['GB', 'Wielka Brytania · GBP'],
          ['DE', 'Niemcy · EUR'],
          ['FR', 'Francja · EUR'],
        ].map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <div className="slider-label">
        <label htmlFor="width">Szerokość osadzenia</label>
        <output htmlFor="width">{config.width} px</output>
      </div>
      <input
        id="width"
        type="range"
        min="280"
        max={config.layout === 'poster' ? 380 : 1000}
        step="10"
        value={config.width}
        onChange={(e) => update('width', +e.target.value)}
      />
      <label className="field-label" htmlFor="utm">
        Źródło UTM <span>opcjonalnie</span>
      </label>
      <input
        id="utm"
        value={config.utm}
        maxLength={100}
        placeholder="np. moj-blog"
        onChange={(e) => update('utm', e.target.value)}
      />
      <p className="help">Źródło będzie dodawane do linków prowadzących do sklepu Steam.</p>
    </>
  );
}
