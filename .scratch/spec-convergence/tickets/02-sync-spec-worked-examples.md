# 02: Sync spec §9 worked examples to the built canvases (media strip + work gallery)

**Status:** ready-for-agent
**Type:** `wayfinder:task`
**Blocks:** 03
**Blocked by:** None (can start immediately)

## Question

Ticket 06's resolution noted that *"One defect found was in the **spec**, not the code:
§9.2's area arithmetic was wrong"*, and the curator fixed §9.2. But §9.1 was never
re-synced, and the code has since moved on again. Two of the three worked examples now
disagree with what actually renders.

Measured against `src/pages/index.astro` (04 Oct 2026):

| Canvas | Spec §9 says | Code declares | Code area sum |
|---|---|---|---|
| Media strip | **12 × 3**, 8 cells, `27 = 12 × 3` | `rows={4}`, **7 cells** | `1+3+12+4+8+8+12 = 48 = 12 × 4` ✓ |
| Work gallery | label + **8** crop cells, `32 = 12 × 3` ✓ (curator-fixed) | label + **9** crop cells | `9+2+2+2+6+1+6+3+1 = 36 = 12 × 3` ✓ |
| Benefits | `24 = 12 × 2` ✓ | matches | `24` ✓ |

The media strip drifted furthest: the §9.1 diagram, the 8-cell table, and the `27 = 12 × 3`
arithmetic are all superseded by the 7-cell 12 × 4 packing now in the code (which carries
its own comment block at `index.astro:36-43` explaining the mega-column logic).

Note the work-gallery row is subtle: the *code comment* at `index.astro:84` still carries
the curator's corrected `= 32` figure while the code sums to `36`. One of the two is wrong
and the spec/code disagree about which.

**What to build:** §9.1 and §9.2 of `docs/spec-bento.md` describe the canvases that
actually render, with correct diagrams, tables, and arithmetic.

## Acceptance criteria

- [ ] §9.1 documents the **12 cols × 4 rows, 7-cell** media strip: a redrawn ASCII diagram,
      a cell table in the existing notation/shape/finish/notes columns, and the area sum
      `1+3+12+4+8+8+12 = 48 = 12 × 4` marked ✓.
- [ ] §9.2 documents the **label + 9 crop cell** work gallery with its own diagram, table,
      and area sum `9+2+2+2+6+1+6+3+1 = 36 = 12 × 3` marked ✓. The earlier 7-cell
      packing stays recorded as a noted alternative, as ticket 06 did for the 7-cell case.
- [ ] The stale `= 32` figure in the `workCells` comment (`src/pages/index.astro:84`) is
      corrected to `= 36` to match the code.
- [ ] The §9.1 heading no longer says *"12 cols × 3 rows"*.
- [ ] `index.astro:157` comment no longer says *"12×3"* — it already says `rows={4}`, so
      the comment contradicts itself; align it to `12 × 4`.
- [ ] Every canvas's stated area sum equals cols × rows, verified by recount, and matches
      the `## 12. Acceptance criteria` item *"Total cell area equals columns × rows"*.
- [ ] Run the bento-auditor agent against all three sections; it reports PASS with no
      cited drift.

## Guardrail

Do **not** change `rows` or any cell coordinate in `src/pages/index.astro`. The rendering
is correct and browser-verified; only the *documents* are behind. This is a spec-side fix.
If the auditor finds genuine code drift, split that into a separate ticket rather than
widening this one.