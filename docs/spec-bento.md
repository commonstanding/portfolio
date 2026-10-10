# Spec: Bento Grid System

**Status:** Approved (04 Oct 2026) — built against by ticket 04; verified and closed by ticket 06 (27/09/2026). Post-approval convergence tracked in `_tasks/` (`20261004-*`, `20261006-*`); the archived originals remain in `.scratch/spec-convergence/`.
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
3. Row count is declared **per canvas** (e.g. 6 rows for the media strip, 3 for the work grid). Rows are per-canvas; columns are global.
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
2. **Per-canvas override** *modifies* the default, never replaces the mechanism: a **fraction** (row = k × column width) or a **clamp** (min/max bounds on the square unit). Declared as an inline custom property on the canvas element. *First live use:* the media strip's `0.772` ratio (`spec-bento.md` §9.1), adopted from reference01 on 07/10/2026 — it is what buys the 2.59 : 1 letterbox band from a 6 × 3 visible rhythm. Before that every canvas used the square default.
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
- Example: the media strip's full-height mask is `c9-12 r1-6`.

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
- **Circle** — `border-radius: var(--bento-radius-max)`. Under the square unit a 1×1 cell is exactly square, so radius-max reads as a true circle. Under a fractional unit the same finish reads as a stadium; exact square geometry is only forced under the square unit. *Currently unexercised — see below.*

> **Circle finish status (05 Oct 2026):** available but unused. No canvas in
> `src/pages/index.astro` declares a `circle` cell, so the primitive's `circle` prop and
> this finish are live API with no call site. Kept deliberately: it is part of the Finish
> vocabulary, the round-trip test in §10 exercises it, and removing it would narrow the
> vocabulary for a gap that is one prop away from being useful. Dale's decision, 05/10 —
> ticket `20261004-005`. The historical circle cell (a 12 × 3 media-strip cell 1) was
> lost in a later composition pass; the row-height caveat above is the only live
> constraint on reusing it.

### 7.1 Flush-mode rules

Patterns opting into `flush` must (from `spec-scoped-gutter-tokens.md` §6):

1. Tiles keep their radius; concave notches between touching corners are intentional.
2. Hover/focus effects are inset (no outlines or external shadows — they bleed into neighbours).
3. Text tiles carry internal padding; they may not rely on the absent gutter.
4. Interactive tiles meet WCAG 2.2 target-spacing via internal padding or affordances.
5. Flush dissolves to a non-zero gutter at single-column (≤640px) — **`dense` (8px)**, not the 24px `separated` alias: zero-gap stacked tiles read as broken.

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

### 9.1 Media strip — 12 cols × 6 rows, unit ratio 0.772, flush, mask finish

```
┌───────────────┬───────────────┬───────────────┐
│      A        │               │               │
│  c1-4 r1-2    │      D        │       F       │
├───────────────┤  c5-8 r1-4    │  c9-12 r1-6   │
│      B        │               │               │
│  c1-4 r3-4    │               │               │
│               ├───────┬───────┤               │
├───────────────┤   E1  │   E2  │               │
│      C        │ c5-6  │ c7-8  │               │
│  c1-4 r5-6    │ r5-6  │ r5-6  │               │
└───────────────┴───────┴───────┴───────────────┘
```

| Cell | Notation | Shape | Finish | Notes |
|------|----------|-------|--------|-------|
| A | `c1-4 r1-2` | field | mask | r0: [1]; carries the alt |
| B | `c1-4 r3-4` | field | mask | all corners rounded |
| C | `c1-4 r5-6` | field | mask | r0: [3] |
| D | `c5-8 r1-4` | field | mask | r0: [3,4] — 2×3 visible units |
| E1 | `c5-6 r5-6` | block | mask | r0: [1,2] |
| E2 | `c7-8 r5-6` | block | mask | r0: [1,2] |
| F | `c9-12 r1-6` | field (full-height) | mask | r0: [3] |

Total cell area: 8+8+8+16+4+4+24 = **72 = 12 × 6** ✓

This is the reference01 hero geometry adopted on 07/10/2026 — reproduced in
`docs/analysis-reference01-hero.md` (cream-mask IoU 0.716, 19/19 notches). Three
things make it the spec's richest worked example:

1. **First live per-canvas ratio override.** The unit is sub-square
   (`--bento-unit-ratio: 0.772`), which buys the 2.59 : 1 letterbox band from a
   6 × 3 visible rhythm (§3.2).
2. **First live fractional-row substrate.** Cell D spans 2 columns × 3 rows of
   the visible rhythm = 1.5 units tall, so the canvas is declared **12 × 6**
   (not 6 × 3) and every cell uses integer tracks. No fractional coordinates
   (§2.1).
3. **Two compositional devices**, both pure vocabulary (no new terms):
   - *Pinched diagonal shell* — the canvas silhouette is square at **TL** (A
     r0 [1]) and **BR** (F r0 [3]), rounded at TR and BL. Two opposite square
     corners read as a wedge aimed down the top-right→bottom-left diagonal.
   - *Hidden seam* — D, E1 and E2 meet along the r4/r5 line with all four
     corners squared (D [3,4], E1/E2 [1,2]). In a flush mask, a boundary is
     only visible where a corner is rounded, so that seam shows **0 cream** and
     the middle column reads as one image that forks into two only at the
     baseline. Squared corners are how a tile declines to announce itself.

*The 12 × 4 / area-48 mega-column packing this section previously documented was
superseded by the reference01 geometry above (adoption decision `20261007-001`,
option A). The circle finish remains available-but-unused (§7).*

### 9.2 Work gallery — 12 cols × 3 rows, square unit, flush

Label card `c1-3 r1-3` (card finish); mosaic `c4-12` (8 crop cells — 9 cells on the
canvas, as implemented in `src/pages/index.astro` after the ticket 06 round-trip test):

| Cell | Notation | Shape | Finish |
|------|----------|-------|--------|
| label | `c1-3 r1-3` | field | card (inverse surface) |
| 1 | `c4-5 r1-1` | wide | crop |
| 2 | `c6-6 r1-2` | tall | crop |
| 3 | `c4-5 r2-2` | wide | crop |
| 4 | `c7-12 r1-1` | bar | crop |
| 5 | `c7-9 r2-2` | bar | crop |
| 6 | `c10-12 r2-3` | field | crop |
| 7 | `c4-6 r3-3` | bar | crop |
| 8 | `c7-9 r3-3` | bar | crop |

Total cell area: 9+2+2+2+6+3+6+3+3 = 36 = 12 × 3 ✓

*This section's arithmetic was wrong twice over: the itemisation counted cells 5 and 8 as
area 1 (`unit`) when `c7-9 r2-2` and `c7-9 r3-3` are 3 tracks × 1 row = 3 each, and it
then asserted `32 = 12 × 3` — which cannot hold. The earlier 7-cell variant (label, block
`c4-6 r1-2`, bar `c7-12 r1-1`, and four smaller cells) remains a valid alternative
packing; its recorded "32" total was part of the same miscount and should not be trusted.*

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
| Mobile ≤640px | 4 | single-column flow; flush dissolves to `dense` (8px); mask cells revert to independent crops |

The breakpoint *structure* is fixed here; the per-section maps are cell-data content (ticket 04).

**Implementation status (06/10/2026):** desktop (12) and mobile (4, with flush dissolve +
mask reversion) are built and browser-verified. **The tablet row is not implemented** —
no 641–1023px rule exists and no per-breakpoint cell maps are declared in the cell data;
canvases render their 12-col declaration through that range. The mobile rule carries the
single-column flow, so nothing breaks at tablet; it is simply not re-tuned. Tracked as
open ticket `20261006-002` (tablet 6-col cell maps) rather than silently assumed.

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

Verified 06/10/2026 (tickets `20261004-003`, `20261006-001`), computed-style measurement
at 1280 / 1024 / 390px against the live page. Media-strip criteria re-verified 07/10/2026
after the reference01 adoption (`20261007-001`); the ratio, tiling and alt figures below
are from that re-measurement. Re-measured 10/10/2026 at 1440 / 1280 / 1024 / 390px for the
benefits canvas (which now has per-viewport figures) and for the card-content box-model fix.

- [x] Every bento canvas declares 12 columns and a row count; no nested grids.
- [x] Row height = column width × declared ratio, verified by measurement at two viewport
      widths — holds for the image canvases (media strip: 99.4px col → 76.8px row at
      1280px, ratio 0.772; 79.0px col → 61.0px row at 1024px; work gallery is square,
      row = col). **Accepted divergence:** the
      benefits canvas's rows stretch beyond the square unit because card content has an
      intrinsic minimum height; the aspect-ratio is a floor, not a cap. Measured per
      viewport (10/10/2026): 162px row / 324px canvas (ratio 1.44) at 1440px, 162 / 324
      (1.63) at 1280px, 184.5 / 369 (2.34) at 1024px. Image canvases are unit-governed;
      content canvases are content-governed.
- [x] Card content fits its cell, measured after the 2026-10-10 box-model fix: work-gallery
      label 237/237 (was 309 → +72px overflow), benefits intro 369/369, benefit cards
      184.5/184.5. No child overflows its slot at 1440 / 1280 / 1024px.
- [x] Total cell area equals columns × rows for every canvas (no dead zones, no
      zero-height cells) — exhaustive tiling check: 72/72, 36/36, 24/24 covered, zero
      overlaps.
- [x] No component stylesheet contains a literal gap value or raw `--global-gutter-*`
      reference (widget-chrome `0.3em` exempted — gutter spec §4.2 ruling).
- [x] Fractional shapes are expressed as integer track spans / refined row counts — no
      fractional coordinates anywhere.
- [x] Mask offset math derives from declared track counts; no hardcoded 9/7/3 literals in
      the formula (`maskVars()`).
- [x] Exactly one accessible image per mask composition — measured: 7 imgs, 1 alt, 6
      `aria-hidden`.
- [x] Flush compositions dissolve to `dense` (8px) at ≤640px — was BROKEN (inline gutter beat
      the media rule; card slots overflowed the mobile substrate). Fixed 06/10/2026 via
      `data-density` + `:where()` and slot placement override; ticket `20261006-001`.
- [x] `npx astro build` passes; rendered sections match the worked examples (§9) — DOM
      placements extracted from `dist/index.html` match §9.1/§9.2/§9.3 cell for cell.

## 13. Amendment log

Dated amendments with one-line rationale. Consult before curating so amendments stay
consistent. The `bento-spec` skill (`~/.agents/skills/bento-spec/SKILL.md`) carries a copy
of the worked examples and invariants; it is amended in step with this spec — this spec
wins on divergence.

| Date | Section | Amendment | Rationale |
|---|---|---|---|
| 04/10/2026 | header | Status `Draft for review` → `Approved`; pre-approval gate removed | Dale approved; ticket 04 had already built against it and ticket 06 verified. |
| 05/10/2026 | §7 | Circle finish marked **available-but-unused** | No canvas declares a `circle` cell after the media-strip re-pack; Dale ruled the prop stays (ticket `20261004-005`). |
| 06/10/2026 | §9.1 | Rewritten: 12×3 / 8 cells / area 27 → **12×4 / 7 cells / area 48** | The mega-column re-pack in `src/pages/index.astro` superseded the original packing; the spec was two composition generations behind (ticket `20261004-003`). |
| 06/10/2026 | §9.2 | Arithmetic corrected: `…+1+6+3+1 = 32 = 12×3` → `…+3+6+3+3 = 36 = 12×3` | Cells 5 and 8 are 3 tracks × 1 row = area 3 each, itemised as 1; and 32 ≠ 36, so the assertion could not hold. Shape names corrected (unit→bar, block→field). |
| 06/10/2026 | §10 | Tablet row annotated **not implemented** | No 641–1023px rule exists; canvases scale their 12-col declaration through the band. Functional, not re-tuned. Tracked as `20261006-002`. |
| 06/10/2026 | §7, §10, §12 | "dissolves to **separated**" → "dissolves to **`dense` (8px)**" | `separated` is overloaded — the 24px alias name and a loose adjective. Implementation dissolves to `--grid-gutter-dense` (8px), matching the gutter spec §5 example. Same correction in `spec-scoped-gutter-tokens.md` and `spec-media-strip-shared-image.md`. |
| 06/10/2026 | §12 | All nine criteria ticked with measured evidence | Computed-style + pixel measurement at 1280/1440/1920/2560px; exhaustive tiling check (48/48, 36/36, 24/24, zero overlaps). Benefits row-stretch recorded as an accepted divergence (content-governed). |
| 06/10/2026 | header | Convergence pointer `.scratch/…` → `_tasks/` | Tickets migrated to the Tasks & Wayfinder Standard home; `.scratch/` retained as the archived decision record. |
| 06/10/2026 | skill | Worked examples + invariants 7–8 synced | Skill carried the stale 12×3 media strip and an incoherent work-gallery sum (`9+6+1+3+3+1 = 23`, then `23+9 = 32 = 12×3`). |
| 07/10/2026 | §9.1 | Rewritten: 12×4 / square / area 48 → **12×6 / ratio 0.772 / area 72** | reference01 hero geometry adopted (`20261007-001` option A). First live per-canvas ratio override and fractional-row substrate; documents the pinched-shell and hidden-seam devices. Reproduced in `docs/analysis-reference01-hero.md` (IoU 0.716). |
| 07/10/2026 | §2.1, §4 | Media-strip row/notation examples repointed to 12×6 | Cross-references cited the old 6×3-era figures ("3 rows for the media strip", "full-height mask is `c10-12 r1-3`"); now 6 rows and `c9-12 r1-6`. |
| 07/10/2026 | §12 | Measured evidence updated | Ratio check now cites 99.4→76.8px (0.772) at 1280px and 79.0→61.0px at 1024px; tiling check 48/48 → **72/72**. Re-measured live, not asserted. |
| 07/10/2026 | skill | Media-strip worked example synced to 12×6 | Skill must track the spec (§13); carried the superseded 12×4 packing. |
| 10/10/2026 | §3.2, §9.1, §12 | Media-strip unit squared then **reverted to 0.772 same day** | Dale first asked for row height = column width, then rolled it back within the session. The squaring commit (`90a1e31`) was reverted; the reference01 sub-square unit stands. Net effect on §9.1 and §12: none. Re-measurement at 1440/1280/1024/390px was kept — it added per-viewport benefits figures and showed the old "324px vs 198.8px at 1280px" evidence matched at 1280px only, never verified per viewport. |
| 10/10/2026 | §7 | Card content fits its slot (`box-sizing: border-box`) | No global box-sizing rule, so `block-size: 100%` set the content box and the card's own padding was added on top — the work-gallery label rendered 309px inside a 237px canvas (+72px). Measured after: label 237/237, intro 158/158, cards 79/79. **Kept** (independent of the unit revert). |

**Open questions parked for Dale:** none outstanding. `20261006-002` (tablet cell maps)
awaits design sign-off on the three per-section 6-track maps.
