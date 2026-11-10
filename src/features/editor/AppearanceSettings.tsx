import type { SettingsProps } from './types';
import { Check, Sparkles } from 'lucide-react';
import { foreground, themes, type Config } from '../../config';

export function AppearanceSettings({ config, update }: SettingsProps) {
  return (
    <>
      <fieldset>
        <legend>Układ widgetu</legend>
        <div className="layout-options">
          {(
            [
              ['landscape', 'Klasyczny'],
              ['poster', 'Plakat'],
              ['compact', 'Kompakt'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              className={config.layout === value ? 'layout-option selected' : 'layout-option'}
              aria-pressed={config.layout === value}
              onClick={() => update('layout', value)}
            >
              <span className={`layout-sketch ${value}`}>
                <i />
                <b />
                <b />
              </span>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Motyw</legend>
        <div className="theme-options">
          {Object.entries(themes).map(([value, theme]) => (
            <button
              key={value}
              aria-pressed={config.theme === value}
              className={config.theme === value ? 'theme-option selected' : 'theme-option'}
              onClick={() => update('theme', value as Config['theme'])}
            >
              <span
                className="theme-swatch"
                style={{ background: theme.background, color: theme.foreground }}
              >
                {config.theme === value && <Check size={15} />}
              </span>
              {theme.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Kolor przycisku</legend>
        <div className="accent-options">
          {['#a3e635', '#66c0f4', '#c4b5fd', '#fda4af', '#fb923c'].map((color) => (
            <button
              key={color}
              className="accent-swatch"
              aria-label={`Kolor ${color}`}
              aria-pressed={config.accent === color}
              style={{ background: color, color: foreground(color) }}
              onClick={() => update('accent', color)}
            >
              {config.accent === color && <Check size={17} />}
            </button>
          ))}
          <label className="custom-color" title="Własny kolor">
            <Sparkles size={17} />
            <input
              type="color"
              aria-label="Własny kolor przycisku"
              value={config.accent}
              onChange={(e) => update('accent', e.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <div className="slider-label">
        <label htmlFor="radius">Zaokrąglenie rogów</label>
        <output htmlFor="radius">{config.radius} px</output>
      </div>
      <input
        id="radius"
        type="range"
        min="0"
        max="24"
        step="2"
        value={config.radius}
        onChange={(e) => update('radius', +e.target.value)}
      />
    </>
  );
}
