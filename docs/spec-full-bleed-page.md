# Spec: Full-Bleed Page — Retiring the Sheet-on-Backdrop Model

**Status:** Approved (06 Oct 2026) — Dale: *"I don't want the black backdrop, the
sheet-on-backdrop model. I just want a full page of the cream colour."*
**Scope:** Page canvas — `body`/`.sheet` in `src/pages/index.astro`, layout tokens in
`src/styles/tokens.css`, QA overlay margin layer
**Supersedes:** The sheet-on-backdrop model adopted 24 Sep 2026 from the reference study
(`prototype/reference/`)

---

## 1. Problem

Since 24 Sep 2026 the page renders as a rounded cream **sheet** (max 84rem / 1344px,
radius `--global-radius-xl`) floating on a near-black **backdrop** (`--color-bg-backdrop`
= ink-900), revealed as a gap of `clamp(0.75rem, 2.5vw, 2rem)` around the sheet's edges
and at the sides beyond ~1376px viewport width.

The model came from the reference sites, but it works against this brand:

1. **The backdrop reads as a bug, not a feature.** It has produced two live
   misreadings: the "black background" question (06 Oct) and — combined with the card-slot
   overflow defect (`20261006-001`) — a "hero cells overlap" report. A design element
   whose first job is explaining itself has already failed twice.
2. **It contradicts the positioning.** Common Standing is warm paper, near-black ink,
   hairline rules — *"nothing decorates; everything structures"* (`DESIGN.md` §1). A
   floating card with a reveal gap is decoration; it frames the page as an object rather
   than a document.
3. **It costs layout budget for nothing.** The sheet is 144px wider than the container,
   so the backdrop gap is pure chrome; on wide screens the content column never grows to
   match it.

## 2. Goal

One cream field, edge to edge. The page canvas becomes the paper itself:

- `body` paints `--color-bg-page` (cream-100) — full viewport, no reveal gap, no
  rounding.
- Content stays centred in the existing `.container` (75rem / 1200px max, fluid
  `clamp(1rem, 3vw, 2rem)` padding). The container is the *only* centring mechanism.
- The `[data-theme='dark']` hook keeps working: it flips `--color-bg-page`, so the
  full-bleed model is theme-agnostic.

## 3. What is removed

| Token / rule | Disposition |
|---|---|
| `--global-sheet-max` (84rem) | **Deleted.** No consumer. |
| `--global-sheet-gap` (clamp) | **Deleted.** The reveal gap it defined no longer exists; outer spacing is the container's job. |
| `--color-bg-backdrop` (ink-900) | **Deleted** (gutter-spec precedent: delete once no references remain). History preserves it; a future modal scrim can define its own value with a real use case. |
| `--radius-sheet` | **Deleted.** Nothing rounds the page edge any more. |
| `.sheet` wrapper `<div>` + rule | **Deleted** from `index.astro` markup and styles. |

## 4. What is untouched

- `.container` — max-width, centring, and fluid padding unchanged. The sheet was wider
  than the container, so removing it changes nothing for content: the container's own
  padding was already the sheet's internal gutter (per the old CSS comment).
- `GridOverlay` layer "m" (margin guides) — measures `--global-container-max` +
  `--global-container-pad`; conceptually still correct (it marks the space outside the
  content column, which is now cream instead of black).
- Section rhythm (`--global-section-gap`), bento canvases, gutter density system —
  orthogonal to the page canvas.
- The `[data-theme='dark']` block — flips `--color-bg-page`/`surface`/`muted`; no
  backdrop reference inside. (The hook remains inert — nothing sets `data-theme`.)

## 5. Mechanism (after)

```css
body {
  margin: 0;
  background-color: var(--color-bg-page); /* full-bleed cream */
}
/* .container unchanged: max-width 75rem, margin-inline auto, fluid padding */
```

Markup: `body > GridOverlay, header, main, footer` — no wrapper.

## 6. Acceptance criteria — verified 06/10/2026

Measured on the live page (dev server) at 1280, 1440, 1920, and 2560px; pixel scan of a
2560×1440 viewport screenshot.

- [x] No black bands anywhere: `body` computed background = `rgb(242, 237, 225)`
      (cream-100 `#f2ede1`) at all four tested widths; four-corner + edge pixel scan of the
      2560px screenshot found zero dark pixels in the left/top/right 6px frames and none
      along the bottom except footer text glyphs crossing the scan line (170px-wide
      centred band — type, not a backdrop).
- [x] Content column unchanged: `.container` measured 1422px wide, `max-width: 1350px`,
      `padding-inline: 36px` — byte-identical to the pre-refactor capture.
- [x] `--global-sheet-max`, `--global-sheet-gap`, `--color-bg-backdrop`, `--radius-sheet`
      have zero live references in `src/` (only dated tombstone comments in `tokens.css`);
      `.sheet` gone from markup and CSS.
- [x] GridOverlay layers unaffected — they measure container tokens, which are untouched.
- [x] Dark-theme hook verified working through the new model: setting
      `data-theme="dark"` flips `body` to ink `rgb(26,24,21)`, removing it returns cream
      (the hook flips `--color-bg-page`, which is now the body's own paint).
- [x] `npx astro check` 0 errors / 3 pre-existing hints; `npx astro build` green, 2 pages.
- [x] `grep -rn -i "sheet\|backdrop" src/` returns only the tombstone comments.

## 7. Out of scope

- Re-deciding the container width — 75rem stays; widening the content column is a
  separate typographic decision.
- The inert `[data-theme='dark']` hook — kept as-is; wiring a theme toggle is not part
  of this change.
- `about.astro` — currently an empty shell; when built it adopts the same body rule.