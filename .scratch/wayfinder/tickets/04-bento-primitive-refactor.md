# 04: Build the Bento primitive + tokens and refactor all three sections

**Status:** Closed 27/09/2026
**Type:** `wayfinder:prototype`
**Blocks:** 06
**Blocked by:** 02, 03

## Question

Implement the shared Bento primitive and refactor Benefits, Work, and the
Media strip onto it, standardised to 12-of-12 with the row-unit strategy.

**Deliverables:**
1. Token primitives (per ticket 02's resolution) in the agreed location.
2. `src/components/Bento.astro` (or equivalent) — the canvas primitive:
   - Props: track configuration (from the canvas model), strategy (row-unit),
     density, and cell declarations.
   - Cells declare `c`/`r` ranges + shape + finish; spans are derived.
   - The mask finish (shared-image clip windows) must be supported as a cell
     finish, preserving the offset math (`--mask-cols/rows/x/y`).
3. Refactor the three sections onto the primitive, reproducing the current
   visual design (modulo 12-of-12 standardisation).
4. The circle cell from the conversation must survive the refactor (it's the
   proof case for the Finish vocabulary).

**Gates (Karpathy discipline, framework SPEC §2.4):**
- `npx astro build` passes; `astro check` clean.
- Browser screenshots of all three sections at desktop + mobile widths match
  the pre-refactor design (visual diff by eye against saved screenshots).
- The spec's worked examples (ticket 03) and the rendered output agree — the
  visual auditor agent (ticket 05) validates this once it exists.

**Prototype note:** this ticket is HITL — the primitive's API shape (props vs
children vs data-driven cells) should be prototyped cheaply first and reacted
to before the full refactor.

## Resolution

*(recorded on close)*
