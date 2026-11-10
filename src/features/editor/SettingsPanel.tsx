import { useRef, useState, type KeyboardEvent } from 'react';
import { RotateCcw, Settings2 } from 'lucide-react';
import type { Game } from '../../types/game';
import { AppearanceSettings } from './AppearanceSettings';
import { ContentSettings } from './ContentSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { GamePicker } from './GamePicker';
import type { SettingsProps } from './types';

const tabs = [
  { id: 'appearance', label: 'Wygląd' },
  { id: 'content', label: 'Treść' },
  { id: 'advanced', label: 'Ustawienia' },
] as const;
type Tab = (typeof tabs)[number]['id'];
type Props = SettingsProps & {
  id: string;
  game: Game | null;
  loading: boolean;
  onSelectGame: (id: string) => void;
  onReset: () => void;
};

export function SettingsPanel({ id, config, game, loading, update, onSelectGame, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('appearance');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  function navigateTabs(event: KeyboardEvent, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index + tabs.length - 1) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }
  return (
    <aside className="settings-panel" aria-label="Ustawienia widgetu">
      <div className="panel-heading">
        <Settings2 size={18} />
        <h2>Stwórz swój widget</h2>
        <button
          className="icon-button reset"
          title="Przywróć domyślny wygląd"
          aria-label="Przywróć domyślny wygląd"
          onClick={onReset}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <GamePicker initialId={id} loading={loading} onSelect={onSelectGame} />
      <div className="settings-tabs" role="tablist" aria-label="Opcje widgetu">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => navigateTabs(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tabs.map((item) => (
        <div
          key={item.id}
          className="settings-body"
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={tab !== item.id}
        >
          {item.id === 'appearance' && <AppearanceSettings config={config} update={update} />}
          {item.id === 'content' && <ContentSettings config={config} update={update} game={game} />}
          {item.id === 'advanced' && <AdvancedSettings config={config} update={update} />}
        </div>
      ))}
      <div className="settings-footer">
        <span className="live-dot" /> Zmiany widoczne od razu
      </div>
    </aside>
  );
}
