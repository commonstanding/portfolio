# Spec: Bento Grid System

**Status:** Approved (04 Oct 2026) — built against by ticket 04; verified and closed by ticket 06 (27/09/2026). Post-approval convergence tracked in `.scratch/spec-convergence/tickets/`.
**Depends on:** Scoped gutter tokens (`spec-scoped-gutter-tokens.md`), bento token primitives in `src/styles/tokens.css`
**Approved:** 04 Oct 2026 by Dale. The primitive (ticket 04) was built against this spec and browser-verified.

---

## 1. Vocabulary

Five terms. Each exists to kill a specific miscommunication.

| Term | Definition | Failure mode it kills |
|------|-----------|----------------------|
| **Canvas** | The full grid surface: a declared number of column tracks × row tracks, spanning the container. One coordinate system per canvas. | Column ambiguity — "3 col wide" *of what?* |
| **Unit** | The base cell size: **row height = column width × ratio** (ratio default 1 = square). A length, not a count. | Height-vs-rows ambiguity — "2 rows tall" ≠ "2 units tall" |
| **Cell** | One placed rectangle on the canvas, declared in canvas coordinates. Identity comes from its coordinates, never from DOM order. | Cell identity — "the third tile" breaks when tiles are added |
| **Shape** | A cell's span multiple of the Unit (see §6). | Unstated sizing intent — "make it bigger" |
| **Finish** | How a cell's surface is treated: crop / card / mask; density; radius overrides; circle. | Ad-hoc per-tile CSS that doesn't compose |

## 2. Canvas model

**Flat 12-of-12** (ticket 01, Option A):

1. Every bento canvas spans the full container and declares **12 column tracks** (`--bento-columns: 12`). No sub-canvases. One coordinate system.
2. Every cell is placed directly on the 12 columns. A section that visually "owns" fewer columns (e.g. the Work mosaic at c4-12) is still placed on the same substrate — its internal rhythm is expressed as cell spans, not a nested grid.
3. Row count is declared **per canvas** (e.g. 3 rows for the media strip, 3 for the work grid). Rows are per-canvas; columns are global.
4. **Strict row alignment:** one row rhythm per canvas. All cells in a row share the track. Independent rhythms = a second canvas, not a special case.

### 2.1 Fractional shapes

Fractions are resolved by the substrate, never written as fractional coordinates:

- **Column fractions** are integer track spans on the 12-col substrate. 12 divides by 2, 3, 4, 6, so the common design fractions land on whole tracks:

  | Fraction of canvas width | Track span |
  |---|---|
  | 1/12 | 1 |
  | 1/6 | 2 |
  | 1/4 | 3 |
  | 1/3 | 4 |
  | 1/2 | 6 |
  | 1 | 12 |

  A cell is never "c1.5-4". If a design needs finer than 1/12, refine the substrate (e.g. 24 tracks) — do not introduce fractional coordinates.

- **Row fractions** are expressed by refining the canvas's row count. Row height is a *length* (Unit), not a track count, so a half-height cell on a 3-unit-tall canvas is declared as a **6-row canvas** with the cell spanning 1 row (½ unit) and its neighbours spanning 2 rows (1 unit each). The Unit is unchanged; the rhythm is subdivided. (Analogy: a half-note is not a different note length — it is 2 beats on a finer grid.)

## 3. Row-unit strategy

All three sections converge on the row-unit strategy (ticket 01 Q2):

1. **Global default:** square — row height = column width (`--bento-unit-ratio: 1` in `tokens.css`).
2. **Per-canvas override** *modifies* the default, never replaces the mechanism: a **fraction** (row = k × column width) or a **clamp** (min/max bounds on the square unit). Declared as an inline custom property on the canvas element.
3. **CSS expression:** the canvas declares its geometry as an aspect-ratio so the 1fr rows resolve against a definite block size:

   ```css
   .bento {
     grid-template-columns: repeat(var(--bento-columns), 1fr);
     grid-template-rows: repeat(var(--bento-rows), 1fr);
     aspect-ratio: var(--bento-columns) / calc(var(--bento-rows) * var(--bento-unit-ratio));
   }
   ```

   **Do not** use `grid-auto-rows` with a percentage — the canvas block size is indefinite and rows collapse to zero.
4. **Cell-span accounting:** before choosing the row count, sum the cells' spans. Total cell area must equal `columns × rows` — a mismatch produces dead zones or zero-height cells (both observed in the prototype).

## 4. Cell notation

```
c<start>-<end> r<start>-<end>
```

- Inclusive ranges, canvas coordinates, 1-based.
- **Spans are derived, never stated.** `c1-3` means 3 tracks wide; there is no separate span field in the notation.
- Example: the media strip's full-height mask is `c10-12 r1-3`.

## 5. Cell schema

Cells are a **frontmatter data array** the primitive maps over — greppable, agent-friendly, and geometry changes are data edits:

```ts
interface BentoCell {
  c: [number, number];        // inclusive column range
  r: [number, number];        // inclusive row range
  shape?: 'unit' | 'wide' | 'tall' | 'block' | 'bar' | 'field';
  finish?: 'crop' | 'card' | 'mask';
  density?: 'flush' | 'separated' | 'dense';
  r0?: number[];              // corners set to radius 0 (1=TL 2=TR 3=BR 4=BL)
  circle?: boolean;           // circle finish
  alt?: string;               // mask cells: exactly one carries the alt
}
```

## 6. Shape vocabulary

Defined as span multiples of the Unit (row height = column width × ratio):

| Shape | Columns | Rows (units) |
|-------|---------|--------------|
| `unit` | 1 unit | 1 |
| `wide` | 2 units | 1 |
| `tall` | 1 unit | 2 |
| `block` | 2 units | 2 |
| `bar` | 3+ units | 1 |
| `field` | 3+ units | 2+ |

Shapes are *descriptions* of the span pattern; the coordinates are authoritative.

## 7. Finish vocabulary

- **crop** — image fills the cell, `object-fit: cover`, inset hover only (scale inside `overflow: hidden`).
- **card** — solid surface, internal padding (`--spacing-padding-md` minimum), content-driven.
- **mask** — a window onto one shared image (see §8). A mask finish is only valid on a canvas that declares a canvas-level `image` prop; without it there is nothing to window onto.

**Finish words in requests are validated against the canvas's finish context.** A plain-English word like "mask" is ambiguous: it may mean the mask *finish* (§8, requires the shared canvas image) or just a generic window-like tile. When a request uses a finish word, the interpreter resolves it against the target canvas — if the canvas has no `image` prop, "mask" cannot mean the mask finish and must be clarified (e.g. re-asked as "a window-like crop cell?") rather than silently downgraded.
- **Density** — `flush` (0px, one composition) / `separated` (24px, discrete objects) / `dense` (8px). Consumed via `--grid-gutter` from the scoped gutter tokens; never a literal gap value.
- **Radius overrides** — per-corner via `r0` (corners collapse to 0); default `--bento-radius-cell`.
- **Circle** — `border-radius: var(--bento-radius-max)`. Under the square unit a 1×1 cell is exactly square, so radius-max reads as a true circle. Under a fractional unit the same finish reads as a stadium; exact square geometry is only forced under the square unit.

### 7.1 Flush-mode rules

Patterns opting into `flush` must (from `spec-scoped-gutter-tokens.md` §6):

1. Tiles keep their radius; concave notches between touching corners are intentional.
2. Hover/focus effects are inset (no outlines or external shadows — they bleed into neighbours).
3. Text tiles carry internal padding; they may not rely on the absent gutter.
4. Interactive tiles meet WCAG 2.2 target-spacing via internal padding or affordances.
5. Flush dissolves to separated at single-column (≤640px): zero-gap stacked tiles read as broken.

## 8. Mask finish (shared-image clip windows)

One image, N windows. The image is sized to the **whole canvas**; each mask cell exposes the region behind it.

**Offset math (parameterised — no hardcoded track counts):** for a canvas of `C` columns × `R` rows, a mask cell at `c<cs>-<ce> r<rs>-<re>`:

```
maskCols = ce - cs + 1        maskRows = re - rs + 1
maskX    = cs - 1             maskY    = rs - 1

img width  = (C / maskCols) × 100%   (of the cell)
img height = (R / maskRows) × 100%
left = -(maskX / maskCols) × 100%
top  = -(maskY / maskRows) × 100%
```

All windows stay in register because every cell renders the same canvas-sized image. The formula is stated once, here; the primitive derives `--mask-cols/rows/x/y` from the cell's coordinates.

**Accessibility:** exactly one mask cell's `<img>` carries the `alt`; all others are `aria-hidden="true"` (windows onto the same picture, not separate content).

**Hover:** per-mask zoom (`scale(1.03)` on that cell's img) — transform-based, no layout shift, seams stay aligned.

**Responsive:** at single-column the offset math breaks (all masks would show the same region), so masks revert to independent full-bleed crops (spec §3.5 of `spec-media-strip-shared-image.md`).

## 9. Worked examples

### 9.1 Media strip — 12 cols × 3 rows, square unit, flush, mask finish

```
┌────┬────────┬──────────┬───────────┬───────────┐
│ c1 │ c2-5   │  c6-9    │  c10-12   │           │
│ r1 │ r1-2   │  r1-2    │  r1-3     │           │
├────┼────────┼──────────┤ (full-    │           │
│ c1 │ c2-5   │  c6-9    │  height)  │           │
│r2-3│ r3     │  r3      │           │           │
└────┴────────┴──────────┴───────────┴───────────┘
```

| Cell | Notation | Shape | Finish | Notes |
|------|----------|-------|--------|-------|
| 1 | `c1-1 r1-1` | unit | mask, circle | carries the alt |
| 2 | `c1-1 r2-3` | tall | mask | r0: [3] |
| 3 | `c2-5 r1-2` | block | mask | r0: [4] |
| 4 | `c2-5 r3-3` | bar | mask | r0: [1,2] |
| 5 | `c6-9 r1-1` | bar | mask | |
| 6 | `c6-6 r2-3` | tall | mask | r0: [1,2] |
| 7 | `c7-9 r2-3` | block | mask | r0: [1] |
| 8 | `c10-12 r1-3` | field | mask | r0: [3] |

Total cell area: 1+2+4+2+3+2+4+9 = 27 = 12 × 3 ✓

### 9.2 Work gallery — 12 cols × 3 rows, square unit, flush

Label card `c1-3 r1-3` (card finish); mosaic `c4-12` (9 cells, as implemented in `src/pages/index.astro` after the ticket 06 round-trip test):

| Cell | Notation | Shape | Finish |
|------|----------|-------|--------|
| label | `c1-3 r1-3` | field | card (inverse surface) |
| 1 | `c4-5 r1-1` | wide | crop |
| 2 | `c6-6 r1-2` | tall | crop |
| 3 | `c4-5 r2-2` | wide | crop |
| 4 | `c7-12 r1-1` | bar | crop |
| 5 | `c7-9 r2-2` | unit | crop |
| 6 | `c10-12 r2-3` | block | crop |
| 7 | `c4-6 r3-3` | bar | crop |
| 8 | `c7-9 r3-3` | unit | crop |

Total cell area: 9+2+2+2+6+1+6+3+1 = 32 = 12 × 3 ✓ (label + 8 crop cells; the earlier 7-cell variant — label, block `c4-6 r1-2`, bar `c7-12 r1-1`, unit, block, bar, unit — also totalled 32 and remains a valid alternative packing.)

### 9.3 Benefits — 12 cols × 2 rows, square unit, flush

Intro card `c1-6 r1-2`; four cards as 3-col cells:

| Cell | Notation | Shape | Finish |
|------|----------|-------|--------|
| intro | `c1-6 r1-2` | field | card (muted surface) |
| 1 | `c7-9 r1-1` | block* | card (brand surface) |
| 2 | `c10-12 r1-1` | block* | card |
| 3 | `c7-9 r2-2` | block* | card |
| 4 | `c10-12 r2-2` | block* | card |

*3 tracks wide × 1 unit tall — a "wide" in track terms; the shape name is descriptive, coordinates are authoritative.

Total cell area: 12 + 3×4 = 24 = 12 × 2 ✓

## 10. Responsive rules

Three breakpoints (ticket 01 Q7), with per-breakpoint cell maps declared in the cell data:

| Breakpoint | Columns | Behaviour |
|-----------|---------|-----------|
| Desktop ≥1024px | 12 | as declared |
| Tablet 641–1023px | 6 | cells re-declare on 6 tracks |
| Mobile ≤640px | 4 | single-column flow; flush dissolves to separated; mask cells revert to independent crops |

The breakpoint *structure* is fixed here; the per-section maps are cell-data content (ticket 04).

## 11. How to request a bento

A request states, in order:

1. **Canvas:** row count + unit override (default: square).
2. **Cells:** one line each — `c<start>-<end> r<start>-<end>` + shape + finish + any overrides.
3. **Density:** flush / separated / dense (default: separated for cards, flush for mosaics).
4. **Content:** per-cell content or a single shared image (mask).

**Worked request** (the circle-cell case from the design conversation):

> "Add a bento under the hero: 3 rows, square unit, flush. One shared image. A circle cell top-left, a tall mask next to it, a 2×2 block, a wide bar under the block, and a full-height mask on the right."

**Validated response:**

```
canvas: 12 × 3, unit ratio 1, flush
cells:
  c1-1 r1-1    unit   mask circle   (alt)
  c1-1 r2-3    tall   mask
  c2-5 r1-2    block  mask
  c2-5 r3-3    bar    mask
  c6-9 r1-3    field  mask
```

Validation gates: total cell area = columns × rows; no overlapping cells; exactly one alt among mask cells; density from the token set only.

## 12. Acceptance criteria

- [ ] Every bento canvas declares 12 columns and a row count; no nested grids.
- [ ] Row height = column width × declared ratio, verified by measurement at two viewport widths.
- [ ] Total cell area equals columns × rows for every canvas (no dead zones, no zero-height cells).
- [ ] No component stylesheet contains a literal gap value or raw `--global-gutter-*` reference.
- [ ] Fractional shapes are expressed as integer track spans / refined row counts — no fractional coordinates anywhere.
- [ ] Mask offset math derives from declared track counts; no hardcoded 9/7/3 literals in the formula.
- [ ] Exactly one accessible image per mask composition.
- [ ] Flush compositions dissolve to separated at ≤640px.
- [ ] `npx astro build` passes; rendered sections match the worked examples (§9) by screenshot.
