// WCAG 2.2 AA contrast regression test for the token layer.
//
// Parses src/styles/tokens.css, resolves the semantic aliases down to the
// --global-* primitives, and asserts every text-bearing pair clears its
// threshold. Runs on `node --test` — no dependencies.
//
// Thresholds (WCAG 2.2):
//   SC 1.4.3  normal text  4.5:1
//   SC 1.4.3  large text   3:1   (>=24px, or >=18.66px at weight >=700)
//   SC 1.4.11 UI boundary  3:1

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = join(here, '..', 'src', 'styles', 'tokens.css');

// ---------------------------------------------------------------- parsing

/** Extract `--name: value;` declarations from a CSS block. */
function parseBlock(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const out = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

/** Follow `var(--x)` chains until a literal value is reached. */
function resolve(tokens, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular token reference: ${name}`);
  seen.add(name);
  const raw = tokens[name];
  if (raw === undefined) throw new Error(`undefined token: ${name}`);
  const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  return ref ? resolve(tokens, ref[1], seen) : raw;
}

// ---------------------------------------------------------------- colour

function toRgb(value) {
  const hex = value.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error(`unsupported colour: ${value}`);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = ({ r, g, b }) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------- fixtures

const css = readFileSync(TOKENS_PATH, 'utf8');
const themes = {
  light: parseBlock(css, ':root'),
  dark: parseBlock(css, "[data-theme='dark']"),
};

// The dark block only overrides a subset; anything it omits falls back to
// the :root value, exactly as the cascade does in the browser.
for (const [name, tokens] of Object.entries(themes)) {
  themes[name] = { ...themes.light, ...tokens };
}

/**
 * Pairs that must clear a threshold. `fg` is drawn on `bg`.
 * `min` is the required ratio.
 */
const TEXT_PAIRS = [
  // Body and heading text on the page and on raised surfaces.
  { fg: '--color-text-body', bg: '--color-bg-page', min: 4.5 },
  { fg: '--color-text-body', bg: '--color-bg-surface', min: 4.5 },
  { fg: '--color-text-heading', bg: '--color-bg-page', min: 4.5 },
  { fg: '--color-text-heading', bg: '--color-bg-surface', min: 4.5 },
  { fg: '--color-text-heading', bg: '--color-bg-muted', min: 4.5 },
  { fg: '--color-text-muted', bg: '--color-bg-page', min: 4.5 },
  { fg: '--color-text-muted', bg: '--color-bg-surface', min: 4.5 },
  { fg: '--color-text-muted', bg: '--color-bg-muted', min: 4.5 },

  // Brand surface — the reference's cream-on-orange failed here.
  { fg: '--color-text-on-brand', bg: '--color-bg-brand', min: 4.5 },
  { fg: '--color-text-on-brand', bg: '--color-bg-brand-hover', min: 4.5 },

  // Inverse surface, including the dark-theme flip.
  { fg: '--color-text-on-inverse', bg: '--color-bg-inverse', min: 4.5 },
  { fg: '--color-text-on-inverse', bg: '--color-bg-inverse-hover', min: 4.5 },

  // Accent text and form affordances.
  { fg: '--color-text-accent', bg: '--color-bg-page', min: 4.5 },
  { fg: '--color-text-accent', bg: '--color-bg-surface', min: 4.5 },
  { fg: '--color-text-placeholder', bg: '--color-bg-surface', min: 4.5 },
];

/** SC 1.4.11 — boundaries that identify a control. */
const UI_PAIRS = [
  { fg: '--color-border-control', bg: '--color-bg-surface', min: 3 },
  { fg: '--color-border-focus', bg: '--color-bg-page', min: 3 },
  { fg: '--color-border-focus', bg: '--color-bg-surface', min: 3 },
];

// ---------------------------------------------------------------- tests

for (const [themeName, tokens] of Object.entries(themes)) {
  test(`${themeName}: text pairs meet SC 1.4.3`, () => {
    const failures = [];
    for (const { fg, bg, min } of TEXT_PAIRS) {
      const ratio = contrast(toRgb(resolve(tokens, fg)), toRgb(resolve(tokens, bg)));
      if (ratio < min) {
        failures.push(`${fg} on ${bg} = ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
      }
    }
    assert.deepEqual(failures, [], `contrast failures in ${themeName} theme`);
  });

  test(`${themeName}: control boundaries meet SC 1.4.11`, () => {
    const failures = [];
    for (const { fg, bg, min } of UI_PAIRS) {
      const ratio = contrast(toRgb(resolve(tokens, fg)), toRgb(resolve(tokens, bg)));
      if (ratio < min) {
        failures.push(`${fg} on ${bg} = ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
      }
    }
    assert.deepEqual(failures, [], `boundary failures in ${themeName} theme`);
  });
}

test('inverse surface is not self-referential', () => {
  // Regression: --color-bg-inverse once stayed ink-900 in dark mode while
  // --color-text-on-inverse was overridden to ink-900 — 1.00:1, invisible.
  for (const [themeName, tokens] of Object.entries(themes)) {
    const ratio = contrast(
      toRgb(resolve(tokens, '--color-text-on-inverse')),
      toRgb(resolve(tokens, '--color-bg-inverse')),
    );
    assert.ok(ratio > 1.5, `${themeName}: inverse text and background are the same colour`);
  }
});

test('every semantic colour token resolves to a literal', () => {
  for (const [themeName, tokens] of Object.entries(themes)) {
    for (const name of Object.keys(tokens)) {
      if (!name.startsWith('--color-')) continue;
      assert.doesNotThrow(
        () => toRgb(resolve(tokens, name)),
        `${themeName}: ${name} does not resolve to a colour`,
      );
    }
  }
});