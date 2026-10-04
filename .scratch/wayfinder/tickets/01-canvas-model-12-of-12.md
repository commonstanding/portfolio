# 01: Canvas model — how 12-of-12 standardises the three sections

**Status:** Closed 2026-09-27
**Type:** `wayfinder:grilling`
**Blocks:** 02, 03, 04

## Question

The three sections currently use three different canvas models:

- **Benefits:** a 12-col page grid split into two regions (intro c1-6, cards c7-12), with a nested 2-col card grid inside the second region.
- **Work:** a 12-col page grid split into label (c1-3) + mosaic (c4-12), where the mosaic is a *nested* 3-col grid with its own implicit rows.
- **Media strip:** a standalone 9-col × 7-row grid that ignores the page grid entirely.

Standardising everything to **12-of-12** means every bento canvas spans the
full container and every cell is placed on the 12-col substrate. But there are
at least three ways to model that, and they have different consequences:

**Option A — flat 12-col canvas, no nesting.** Every cell is placed directly
on the 12 columns. The Work mosaic's "3 internal tracks" become 3 of the 12
columns; the media strip's 9 columns become 9 of the 12. Rows stay per-canvas.
Pro: one substrate, simplest mental model, cells are always "n of 12".
Con: the media strip's 9 equal columns don't divide 12 evenly into the same
visual rhythm (9 ≠ 3×4); some sections may need sub-grids anyway for their
internal row structure.

**Option B — 12-col canvas with declared sub-canvases.** A bento may declare a
sub-canvas (e.g. the Work mosaic is a sub-canvas spanning c4-12 with 3
internal tracks). Sub-canvases are explicit, named, and still anchored to the
12-col substrate. Pro: preserves the current visual proportions exactly;
matches how the sections actually compose. Con: two levels of coordinate
systems — the ambiguity that caused our earlier miscommunication could return
unless the notation distinguishes "canvas coords" from "sub-canvas coords".

**Option C — 12-col canvas, cells may span fractional tracks via a unit
system.** Define the Unit as 1/12 of the canvas width; cells declare spans in
units (so the media strip's columns are 4/3 units — rejected as non-integer)
… this only works if the unit is redefined per canvas, which reintroduces the
problem. Likely a dead end, listed for completeness.

**The decision:** which model becomes the spec's Canvas definition? The answer
must (a) keep the current three sections' visual proportions reproducible,
(b) make "3 col wide" unambiguous (which coordinate system?), and (c) define
how rows relate — shared row-unit across the whole canvas, or per-region?

## Resolution

**Model: Option A — flat 12-col canvas.** One coordinate system; every cell
placed directly on the 12 columns; no sub-canvases. Decisions:

1. **Flat canvas (Q1):** Option A. The Work mosaic's 3 tracks become 3 of 12;
   the media strip's 9 columns become 9 of 12 (columns ~33% wider than today —
   accepted). Sub-canvases may be added later if a design needs them, but the
   spec bakes in a single coordinate system.
2. **Row unit (Q2):** per-canvas unit with a **global square default** —
   column-height = column-width (square cells). Overrides *modify* the default,
   never replace it: a **clamp** (min/max bounds on the square unit) or a
   **fraction** (a multiple of the column width). The default is global; the
   override is declared per canvas.
3. **Media strip (Q2b):** keeps its current proportions via a **fractional
   override** (row ≈ 0.43× column width), recorded in the spec as a deliberate
   design decision, not an accident.
4. **Circle finish (Q2c):** the circle finish **always forces square geometry**
   (aspect-ratio 1/1, radius max) regardless of the canvas's unit — it may
   overflow its row under a fractional-unit canvas.
5. **Benefits (Q3):** flattened — the 4 cards become 3-col cells on the
   12-col canvas (c7-9 / c10-12, two rows). No nested grid. Proof case that
   the flat model reproduces every existing section.
6. **Row alignment (Q4):** strict — one row rhythm per canvas; all cells in a
   row share the track. Independent rhythms = a second canvas, not a special
   case. The Work label spanning 2 rows is expressible (c1-3 r1-2).
7. **Mask math (Q5):** parameterised — the mask finish derives offsets from
   the canvas's declared track counts (`--bento-columns`, row count). No
   hardcoded 9/7 anywhere; the formula is stated once in the spec.
8. **Notation (Q6):** canvas coordinates only (`c<start>-<end> r<start>-<end>`,
   inclusive). No prefixed dual coordinate systems.
9. **Responsive (Q7):** three breakpoints — desktop 12 cols, tablet 6 cols,
   mobile 4 cols — with per-breakpoint cell maps.
10. **Cell schema (Q8):** data-driven — cells are a frontmatter array
    (`{c, r, shape, finish, ...}`) the primitive maps over (the media-strip
    pattern). Greppable and agent-friendly.
11. **Unit token (Q9):** global default in `tokens.css` (square, derived from
    column width), per-canvas override via inline custom property on the
    canvas element. Full token naming lands in ticket 02.
