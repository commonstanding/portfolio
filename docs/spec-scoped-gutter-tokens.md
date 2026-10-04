# Spec: Scoped Gutter Tokens

**Status:** Draft
**Scope:** Grid system gutter density — tokens, components, overlay
**Supersedes:** Global-only `--global-grid-gutter` usage in layout components

---

## 1. Problem

The grid system currently has a single global gutter (`--global-grid-gutter: 1.5rem`) consumed by every grid. Reference designs (see `prototype/reference/reference01.png`) demonstrate that media mosaics read best with **zero gutters** — tiles touching, separated only by rounded corners — while card grids and text composites require visible separation.

A single global constant cannot express both. Forcing mosaic content through a 24px gap destroys the "single composition" effect; forcing cards to zero-gap destroys object separation.

## 2. Principle

**The gutter is a property of the content pattern, not of the page.**

The 12-column track structure is global and invariant. The gap between tracks is scoped per pattern, chosen from a fixed token set — never an arbitrary value.

## 3. Token layer

### 3.1 Global (raw) tokens — `tokens.css`

```css
:root {
  /* Gutter density scale — the only legal gutter values */
  --global-gutter-none: 0px;        /* flush: tiles touch */
  --global-gutter-tight: 0.5rem;    /*  8px — dense data (tables, chips) */
  --global-gutter-base: 1.5rem;     /* 24px — default page grid */
  --global-gutter-loose: 2.5rem;    /* 40px — airy editorial layouts */
}
```

Rules:

- `--global-grid-gutter` is **deprecated** as a direct consumer value. It remains defined as an alias of `--global-gutter-base` for one release, then removed.
- All four values are multiples of 4px and scale with the root font-size (rem-based).
- No component may reference a `--global-gutter-*` raw token directly (see §4).

### 3.2 Semantic (scoped) tokens — `tokens.css`

```css
:root {
  /* Default: every grid consumer inherits the base density */
  --grid-gutter: var(--global-gutter-base);

  /* Named densities for known content classes. Components map their
     internal grids to these, never to globals. Names are purpose-driven
     (what the tiles ARE to each other), not content-driven. */
  --grid-gutter-flush: var(--global-gutter-none);      /* one composition */
  --grid-gutter-separated: var(--global-gutter-base);  /* discrete objects */
  --grid-gutter-dense: var(--global-gutter-tight);     /* dense data */
}
```

Rules:

- Components consume **only** `--grid-gutter` (the resolved value) or a named density alias.
- A component that needs a non-default density sets `--grid-gutter` *locally* from a named alias — it never hardcodes a raw value:

```css
.media-grid {
  gap: var(--grid-gutter);              /* consume */
  &:where([data-density='flush']) {
    --grid-gutter: var(--grid-gutter-flush);  /* scope override */
  }
}
```

- This keeps the consumption site uniform (`gap: var(--grid-gutter)`) and makes density an overridable, cascade-friendly property — a parent section can re-scope density for everything inside it.

## 4. Component contract

### 4.1 Grid patterns accept a `density` API

Any pattern that lays out siblings in a grid/flex row exposes:

```
density?: 'separated' | 'flush' | 'dense'   // default: 'separated'
```

Implementation maps density → named alias:

| density      | alias                      | value |
|--------------|----------------------------|-------|
| `separated`  | `--grid-gutter-separated`  | 24px  |
| `flush`      | `--grid-gutter-flush`      | 0px   |
| `dense`      | `--grid-gutter-dense`      | 8px   |

The pattern sets `gap: var(--grid-gutter)` and nothing else changes — track structure, container, and alignment are untouched.

### 4.2 Prohibitions

- ❌ No component may write `gap: 0` or `gap: <literal>` directly.
- ❌ No component may consume `--global-gutter-*` raw tokens.
- ❌ Density must not be changed responsively by *re-declaring* gap values; it changes only via the token (see §5).

## 5. Responsive behaviour

Flush grids **must regain separation when tiles stack to a single column** — zero-gap stacked images read as broken. The density system handles this with a container-relative rule inside the pattern:

```css
.media-grid {
  gap: var(--grid-gutter);

  /* Single-column fallback: flush tiles need row separation again */
  @media (max-width: 640px) {
    &:where([data-density='flush']) {
      --grid-gutter: var(--global-gutter-tight);
    }
  }
}
```

(Exact breakpoint is per-pattern; the principle is: **flush is a multi-column affordance and dissolves to separated at one column.**)

## 6. Interaction rules for flush mode

Zero-gap layouts change several downstream behaviours. Patterns opting into `flush` must:

1. **Corner geometry** — tiles keep their radius; the concave notches between touching rounded corners are intentional. Tiles at the composition's outer edge should use a larger radius (or the container clips with its own radius) so the outer silhouette stays clean.
2. **Hover/focus effects must be inset** — scale/zoom *inside* the clipped tile (`overflow: hidden` on the tile). No outlines, no external shadows: they bleed into neighbours.
3. **Text tiles inside a flush composition** must carry internal padding (`--spacing-padding-md` minimum); they may not rely on the absent gutter for breathing room.
4. **Touch-target spacing** — interactive tiles in a flush composition must meet WCAG 2.2 target-spacing (24px) via internal padding or visible affordances, since external spacing is zero.

## 7. Overlay (design QA) impact

`GridOverlay.astro` measures real column rects, so gutter bars already reflect whatever gap a grid actually renders. Changes required:

- Gutter bars are drawn **per measured grid**, not from the global token — already true for the page grid; keep it true for any new pattern (measure, don't derive).
- The gutter label should display the *computed* gap value (e.g. `gutter: 0px`) so flush regions are self-explanatory in QA.
- Zero-width gaps produce no bars — correct behaviour; no special casing needed.

## 8. Migration plan

1. Add global density tokens; alias `--global-grid-gutter` → `--global-gutter-base`.
2. Update existing consumers (`index.astro` grids, `SearchBar` if applicable) to consume `--grid-gutter`.
3. Add `density` prop to the media/work grid patterns; set hero strip + work gallery to `mosaic`.
4. Delete `--global-grid-gutter` after no references remain.
5. Update `GridOverlay` label to show computed gap.

## 9. Acceptance criteria

- [ ] No component stylesheet contains a literal gap value or `--global-gutter-*` reference.
- [ ] Hero media strip and work gallery render with 0px gaps at desktop widths.
- [ ] Benefits grid renders with 24px gaps (unchanged).
- [ ] At ≤640px, mosaic grids regain ≥8px separation.
- [ ] Overlay gutter bars align pixel-exactly in both densities.
- [ ] Hover effects in mosaic grids do not visually bleed into adjacent tiles.
