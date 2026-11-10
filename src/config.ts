export const themes = {
  midnight: {
    label: 'Midnight',
    background: '#15191f',
    foreground: '#f5f7fa',
    muted: '#a8b2c1',
    line: '#303641',
  },
  light: {
    label: 'Porcelain',
    background: '#ffffff',
    foreground: '#1b2431',
    muted: '#596577',
    line: '#e5e9ef',
  },
  ocean: {
    label: 'Ocean',
    background: '#102c3b',
    foreground: '#edf9ff',
    muted: '#a2c4d4',
    line: '#2d4a59',
  },
  forest: {
    label: 'Forest',
    background: '#172b25',
    foreground: '#f0faf3',
    muted: '#afc5b7',
    line: '#365045',
  },
  plum: {
    label: 'Plum',
    background: '#2d2238',
    foreground: '#faf3ff',
    muted: '#c4b1d1',
    line: '#4d3b5b',
  },
} as const;
export type Config = {
  theme: keyof typeof themes;
  layout: 'landscape' | 'poster' | 'compact';
  accent: string;
  radius: number;
  description: boolean;
  price: boolean;
  reviews: boolean;
  genres: boolean;
  action: 'wishlist' | 'store';
  language: string;
  country: string;
  width: number;
  utm: string;
  artwork: number;
};
export const defaults: Config = {
  theme: 'midnight',
  layout: 'landscape',
  accent: '#a3e635',
  radius: 16,
  description: true,
  price: true,
  reviews: true,
  genres: true,
  action: 'wishlist',
  language: 'polish',
  country: 'PL',
  width: 640,
  utm: '',
  artwork: 0,
};
export function parseAppId(input: string) {
  const value = input.trim();
  if (/^[1-9]\d{0,9}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname === 'store.steampowered.com')
      return /^\/app\/([1-9]\d{0,9})(?:\/|$)/.exec(url.pathname)?.[1] ?? null;
  } catch {
    /* Input is not a URL. */
  }
  return null;
}
export function readConfig(params: URLSearchParams): Config {
  const result = { ...defaults };
  for (const key of ['description', 'price', 'reviews', 'genres'] as const)
    result[key] = params.get(key) !== '0';
  const theme = params.get('theme');
  if (theme && Object.hasOwn(themes, theme)) result.theme = theme as Config['theme'];
  const layout = params.get('layout');
  if (['landscape', 'poster', 'compact'].includes(layout ?? ''))
    result.layout = layout as Config['layout'];
  const accent = params.get('accent');
  if (accent && /^[0-9a-f]{6}$/i.test(accent)) result.accent = '#' + accent;
  for (const key of ['width', 'radius', 'artwork'] as const) {
    const value = params.get(key);
    if (value !== null && /^\d+$/.test(value))
      result[key] = Math.min(
        key === 'width' ? 1000 : key === 'radius' ? 24 : 5,
        Math.max(key === 'width' ? 280 : 0, Number(value)),
      );
  }
  if (params.get('action') === 'store') result.action = 'store';
  if (['polish', 'english', 'german', 'french', 'spanish'].includes(params.get('language') ?? ''))
    result.language = params.get('language')!;
  if (['PL', 'US', 'GB', 'DE', 'FR'].includes(params.get('country') ?? ''))
    result.country = params.get('country')!;
  result.utm = (params.get('utm') ?? '').slice(0, 100);
  if (result.layout === 'poster') result.width = Math.min(result.width, 380);
  return result;
}
export function widgetUrl(id: string, config: Config, origin: string) {
  const url = new URL('/embed/' + id, origin);
  for (const [key, value] of Object.entries(config))
    url.searchParams.set(
      key,
      typeof value === 'boolean' ? (value ? '1' : '0') : String(value).replace(/^#/, ''),
    );
  return url.href;
}
export function frameHeight(config: Config) {
  if (config.layout === 'compact') return 320;
  if (config.layout === 'poster') return Math.ceil(Math.min(config.width, 380) / 1.5) + 390;
  return Math.max(560, Math.ceil((config.width * 200) / 460) + 330);
}
export function foreground(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  // True black/white guarantee at least 4.58:1 for every sRGB accent.
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
}

/** Related layout constraints apply to controls and future presets alike. */
export function updateConfig<Key extends keyof Config>(
  config: Config,
  key: Key,
  value: Config[Key],
): Config {
  const next = { ...config, [key]: value };
  if (next.layout === 'poster') next.width = Math.min(next.width, 380);
  return next;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}

/** Pure HTML generation, independent of browser globals and clipboard access. */
export function createEmbedCode(source: string, config: Config, gameName = 'Gra Steam') {
  return [
    '<iframe',
    `  src="${escapeHtmlAttribute(source)}"`,
    `  title="${escapeHtmlAttribute(gameName)} — Steam"`,
    `  width="${config.width}" height="${frameHeight(config)}"`,
    '  style="border:0;max-width:100%;background:transparent"',
    '  loading="lazy" referrerpolicy="strict-origin-when-cross-origin"',
    '></iframe>',
  ].join('\n');
}
