import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone, LayoutTemplate } from 'lucide-react';
import { themes, type Config } from '../../config';
import type { GameResource } from '../../hooks/useGame';
import { GameState } from '../widget/GameState';
export function WidgetPreview({
  config,
  state,
  children,
}: {
  config: Config;
  state: GameResource;
  children: ReactNode;
}) {
  const [mobile, setMobile] = useState(false);
  const [surface, setSurface] = useState('light');
  return (
    <section className="preview-panel" aria-label="Podgląd widgetu">
      <div className="preview-toolbar">
        <div>
          <span className="live-dot" />
          <h2>Podgląd na żywo</h2>
        </div>
        <div className="preview-tools">
          <div className="segmented" aria-label="Rozmiar podglądu">
            <button
              aria-label="Podgląd na komputerze"
              aria-pressed={!mobile}
              onClick={() => setMobile(false)}
            >
              <Monitor size={16} />
            </button>
            <button
              aria-label="Podgląd na telefonie"
              aria-pressed={mobile}
              onClick={() => setMobile(true)}
            >
              <Smartphone size={16} />
            </button>
          </div>
          <span className="toolbar-divider" />
          <button
            className={`surface-button ${surface === 'dark' ? 'dark' : ''}`}
            aria-label="Zmień tło podglądu"
            title="Zmień tło podglądu"
            onClick={() => setSurface((v) => (v === 'light' ? 'dark' : 'light'))}
          />
        </div>
      </div>
      <div className={`preview-stage ${surface}`}>
        <div
          className="widget-wrap"
          style={{
            maxWidth: mobile
              ? 340
              : config.layout === 'poster'
                ? Math.min(config.width, 380)
                : config.width,
          }}
        >
          <GameState state={state} config={config} />
        </div>
        <div className="preview-caption">
          <LayoutTemplate size={14} />
          <span>
            {mobile ? 'Podgląd mobilny' : 'Responsywny iframe'}
            <span className="caption-dot">·</span>
            {themes[config.theme].label}
          </span>
        </div>
      </div>
      {children}
    </section>
  );
}
