import type { Config } from '../../config';

export type UpdateConfig = <Key extends keyof Config>(key: Key, value: Config[Key]) => void;
export type SettingsProps = { config: Config; update: UpdateConfig };
