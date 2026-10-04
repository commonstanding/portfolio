# 02: Token primitives — naming, placement, and the row-unit token

**Status:** Open
**Type:** `wayfinder:grilling`
**Blocks:** 04
**Blocked by:** 01

## Question

The Bento primitive needs token primitives so that canvases, units, gutters,
and radii are declared once and consumed everywhere. Two sub-decisions:

**A. Placement — extend `tokens.css` vs a new `bento.css` vs split.**

| Option | Pros | Cons |
|---|---|---|
| Extend `tokens.css` | One token file; bento tokens sit beside the global tokens they derive from (`--global-grid-columns`, `--grid-gutter-*`); no new import | `tokens.css` grows; mixes *design* tokens (colour, type) with *structural* tokens (track counts, unit sizes) |
| New `src/styles/bento.css` | Structural tokens isolated; the primitive owns its tokens; tokens.css stays design-only | Two files to consult; risk of divergence between global and bento tokens; import order matters |
| Split (design tokens in tokens.css, structural in component) | Each layer owns its concern | Scoped component styles can't be overridden from the page; hardest to theme |

**B. Naming — the token vocabulary itself.** A draft, following the existing
`--global-*` / `--grid-*` / `--radius-*` conventions in `tokens.css`:

```
--bento-columns: 12;                       /* canvas track count */
--bento-unit-row: clamp(...);              /* row-unit height (the strategy token) */
--bento-gutter-flush: 0;                   /* density: flush */
--bento-gutter-separated: var(--grid-gutter);
--bento-gutter-dense: var(--global-gutter-tight);
--bento-radius-cell: var(--radius-media);
--bento-radius-max: 9999px;                /* circle finish */
```

Open questions for the interview:
1. Which placement option, given the pros/cons above?
2. Does the row-unit token need responsive variants (e.g. a smaller unit at
   mobile), or does the canvas collapse differently (fog item on the map)?
3. Should density (flush/separated/dense) be a token *value* or a token
   *selection* (i.e. `--bento-gutter: var(--bento-gutter-flush)` scoped per
   section, as `.benefits` does today)?
4. Are there tokens the primitive needs that don't exist yet (e.g. a
   `--bento-label-bg` for the Work label card, or is that a *cell* concern
   not a canvas concern)?

## Resolution

*(recorded on close)*
