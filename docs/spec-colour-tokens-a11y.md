# Spec: Colour Token Contract — WCAG 2.2 AA

**Status:** Approved (11 Oct 2026) — Dale: *"help me ensure that contrast and other
required A11y and WCAG 2.2 AA rules are applied at the token atom component level."*
**Scope:** `src/styles/tokens.css`, `src/components/ui/*`, `src/pages/index.astro`
**Verified by:** `npm test` (`tests/contrast.test.mjs`)

---

## 1. Problem

The build was faithful to the design reference, and the reference fails WCAG 2.2 AA.
Sampling `prototype/reference/reference01.png` gives cream `#f1e9d4` on orange `#de6538`
— **3.16:1**, under the 4.5:1 floor for body text (SC 1.4.3). The same defect ran
through the token layer, so every component consuming the brand surface inherited it.

Two further defects were structural rather than cosmetic:

- **Dark theme was invisible.** `--color-bg-inverse` stayed `ink-900` while
  `--color-text-on-inverse` was overridden to `ink-900` — **1.00:1**. Every inverse
  surface rendered as a solid block.
- **The `work` label heading was invisible.** The page-level
  `h1, h2, h3 { color: var(--color-text-heading) }` rule (specificity 0,0,1) outranks
  inheritance from `.work__label`, so the heading painted ink-900 on the ink-900 card —
  **1.00:1**.

## 2. Rule: decorative vs. text-bearing

The core of the contract. A token is only allowed to carry text or identify a control
if it clears the relevant threshold. Everything else is decorative and must not be used
for either.

| Token | Role | Threshold | Light | Dark |
|---|---|---|---|---|
| `--color-text-body` | body copy | 4.5:1 | 13.53 | 15.16 |
| `--color-text-heading` | headings | 4.5:1 | 15.16 | 16.56 |
| `--color-text-muted` | secondary copy | 4.5:1 | 9.94 | 13.60 |
| `--color-text-on-brand` | text on the brand surface | 4.5:1 | 5.16 | 5.16 |
| `--color-text-on-inverse` | text on the inverse surface | 4.5:1 | 15.16 | 15.16 |
| `--color-text-accent` | accent text | 4.5:1 | 4.73 | 7.18 |
| `--color-text-placeholder` | placeholder text | 4.5:1 | 5.18 | 12.13 |
| `--color-border-control` | control boundary | 3:1 | 3.84 | 3.85 |
| `--color-border-focus` | focus indicator | 3:1 | 4.73 | 7.18 |
| `--color-border-subtle` | **decorative only** | — | 1.31 | 1.53 |

Ratios are measured against `--color-bg-page` unless the token's role implies a
different surface (`on-brand` against `--color-bg-brand`, `on-inverse` against
`--color-bg-inverse`, `placeholder` and `border-control` against `--color-bg-surface`).
These are the exact pairs `npm test` asserts.

`--color-border-subtle` is a hairline for rules and dividers. It is exempt from
SC 1.4.11 because it identifies nothing. **Never use it as a control boundary** — that
is what `--color-border-control` exists for.

## 3. What changed

### 3.1 Orange ramp darkened

The lightest orange that clears 4.5:1 with cream text *is* the brand step, so the ramp
shifted down and hover now darkens rather than lightens.

| Token | Was | Now | Cream-50 contrast |
|---|---|---|---|
| `orange-300` | `#f08a5f` | `#f08a5f` | decorative |
| `orange-400` | `#ee7443` | `#d15828` | decorative |
| `orange-500` | `#e8622c` | `#ae4a21` | 5.16:1 |
| `orange-600` | `#c94e1f` | `#8b3b1a` | 7.17:1 |

`--color-bg-brand-hover` now points at `orange-600`. There is no headroom above the
brand step, so hover must move *down* the ramp. This is a deliberate, visible
interaction change.

### 3.2 New tokens

- `--global-color-ink-500` — control boundary (3.39:1 on cream-100)
- `--global-color-ink-600` — placeholder (4.57:1 on cream-100)
- `--color-border-control` — SC 1.4.11 boundary
- `--color-text-placeholder` — replaces `--color-text-muted` + `opacity: 0.7`
- `--color-bg-inverse-hover` — inverse hover, per theme

### 3.3 Dark theme

`--color-bg-inverse` now flips to `cream-100` so the inverse surface inverts with the
theme instead of collapsing to 1.00:1. `--color-text-accent` and `--color-border-focus`
lighten to `orange-300` (orange-500 is 4.73:1 on ink-900 — passing, but with no margin
for the small text it is used on).

## 4. Component rules

### 4.1 Headings inside coloured cards

The page-level `h1, h2, h3` rule beats inheritance. **Any heading inside a card whose
background is not the page background must re-assert its colour explicitly.**

```css
.work__label h2 {
  color: var(--color-text-on-inverse);
}
```

This is the fix for the reported `work` `.label` defect. Check every new coloured card
for the same pattern.

### 4.2 Focus indicators

Use `:focus-visible`, never `:focus` — a mouse click should not leave a ring. Keep a
real `outline` alongside any `box-shadow`, because `box-shadow` is dropped in
forced-colors mode.

```css
.input:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### 4.3 Target size (SC 2.5.8)

Interactive elements need 24×24 CSS px minimum. Inline links in prose are exempt, but
nav and footer links are not — give them `min-block-size: 1.5rem` and vertical padding.

### 4.4 Reduced motion (SC 2.3.3)

Every transition or animation needs a `prefers-reduced-motion: reduce` guard.

## 5. Verification

`npm test` parses `tokens.css`, resolves the semantic aliases to their `--global-*`
primitives, and asserts every pair above in both themes. It needs no dependencies —
Node's built-in test runner.

The test was confirmed to catch the original defects: reverting `orange-500` to
`#e8622c` fails 3 of 6 tests with the exact ratios that motivated the change.

For component-level checks (computed styles, focus rings, target sizes) use the browser
audit in `docs/` §6 — the token test cannot see specificity bugs like §4.1.

## 6. Known gaps

- **`GridOverlay.astro`** fails 20 contrast checks. It is temporary QA tooling, marked
  "Remove before production", and `aria-hidden="true"`. Excluded from scope; filter it
  out of audits with `el.closest('#grid-overlay, #grid-widget')`.
- **`src/styles/global.css` and `src/layouts/BaseLayout.astro`** are unused stubs
  containing only the literal text `npm create astro@latest`. Global element rules live
  in `index.astro`'s `<style>` block. Do not assume those files are live.
- **`about.astro`** is an empty stub.
- The darkened orange is a visible shift from the reference. The reference itself fails
  AA, so this was unavoidable — but it is a brand decision, not a technical one.