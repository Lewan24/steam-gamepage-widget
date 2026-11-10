import { useEffect, useState } from 'react';
import {
  defaults,
  parseAppId,
  readConfig,
  updateConfig,
  widgetUrl,
  type Config,
} from '../../config';
import { useGame } from '../../hooks/useGame';
import type { UpdateConfig } from './types';

/** Shareable state only; preview and clipboard state stay in their panels. */
export function useWidgetEditor(params: URLSearchParams) {
  const [id, setId] = useState(() => parseAppId(params.get('id') ?? '') ?? '413150');
  const [config, setConfig] = useState<Config>(() => readConfig(params));
  const state = useGame(id, config);
  const source = widgetUrl(id, config, window.location.origin);
  useEffect(() => {
    const search = new URL(source).searchParams;
    search.set('id', id);
    window.history.replaceState(null, '', `/?${search}`);
  }, [id, source]);
  const update: UpdateConfig = (key, value) =>
    setConfig((current) => updateConfig(current, key, value));
  function selectGame(nextId: string) {
    update('artwork', 0);
    if (nextId === id) state.retry();
    else setId(nextId);
  }
  return { id, config, state, source, update, selectGame, reset: () => setConfig({ ...defaults }) };
}
