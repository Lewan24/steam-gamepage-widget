import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/config.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const {
  parseAppId,
  readConfig,
  defaults,
  foreground,
  frameHeight,
  widgetUrl,
  updateConfig,
  createEmbedCode,
} = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
test('accepts IDs and official store URLs, rejects unrelated domains', () => {
  assert.equal(parseAppId(' 413150 '), '413150');
  assert.equal(parseAppId('https://store.steampowered.com/app/413150/Stardew_Valley/'), '413150');
  for (const value of [
    'https://evil.com/app/123/',
    'https://store.steampowered.com.evil.com/app/123/',
    '-1',
    '0',
    'abc',
  ])
    assert.equal(parseAppId(value), null);
});
test('untrusted URL configuration is constrained and survives embed serialization', () => {
  const config = readConfig(
    new URLSearchParams(
      'theme=evil&accent=javascript:alert&width=99999&radius=999&language=bad&description=0',
    ),
  );
  assert.equal(config.theme, defaults.theme);
  assert.equal(config.accent, defaults.accent);
  assert.equal(config.width, 1000);
  assert.equal(config.radius, 24);
  assert.equal(config.language, 'polish');
  assert.equal(config.description, false);
  const actual = {
    ...defaults,
    layout: 'poster',
    width: 350,
    utm: 'a & b',
    price: false,
    artwork: 2,
  };
  const url = new URL(widgetUrl('413150', actual, 'https://widgets.example'));
  assert.equal(url.pathname, '/embed/413150');
  assert.deepEqual(readConfig(url.searchParams), actual);
});
function luminance(hex) {
  const c = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
test('CTA foreground meets WCAG AA including middle gray and custom colors', () => {
  for (const color of [
    '#777777',
    '#a3e635',
    '#ffffff',
    '#000000',
    '#245ce8',
    '#ff0000',
    '#aa5599',
  ]) {
    const a = luminance(color),
      b = luminance(foreground(color));
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, color);
  }
});
test('embed height accounts for artwork width and preview matches constrained poster', () => {
  for (const width of [280, 640, 1000]) {
    const config = { ...defaults, width };
    assert.ok(frameHeight(config) >= (width * 200) / 460 + 329);
    const poster = readConfig(new URLSearchParams(`layout=poster&width=${width}`));
    assert.ok(poster.width <= 380);
    assert.ok(frameHeight(poster) >= poster.width / 1.5 + 389);
  }
});

test('layout changes constrain width without mutating previous configuration', () => {
  const original = { ...defaults, width: 900 };
  const poster = updateConfig(original, 'layout', 'poster');
  assert.equal(poster.width, 380);
  assert.equal(original.width, 900);
  assert.equal(updateConfig(poster, 'width', 1000).width, 380);
  assert.equal(readConfig(new URLSearchParams('theme=__proto__')).theme, defaults.theme);
  assert.equal(readConfig(new URLSearchParams('theme=toString')).theme, defaults.theme);
});
test('iframe generation preserves game names and safely escapes attribute values', () => {
  const code = createEmbedCode(
    'https://widgets.example/embed/1?a=1&b=2',
    defaults,
    'Game "A" <B> & friends',
  );
  assert.ok(code.includes('a=1&amp;b=2'));
  assert.ok(code.includes('Game &quot;A&quot; &lt;B&gt; &amp; friends'));
  assert.ok(code.includes('height="' + frameHeight(defaults) + '"'));
  assert.ok(!code.includes('<B>'));
});
