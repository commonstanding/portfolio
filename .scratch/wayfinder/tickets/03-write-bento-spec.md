# 03: Write the Bento spec document

**Status:** Closed 27/09/2026
**Type:** `wayfinder:task`
**Blocks:** 05, 06
**Blocked by:** 01, 02

## Question

Write `docs/spec-bento.md` — the canonical spec that the primitive implements
and the agent ecosystem enforces. It must contain:

1. **The vocabulary** (Canvas, Unit, Cell, Shape, Finish) with precise
   definitions and the failure modes each term kills (the four
   miscommunications from the design conversation: column ambiguity,
   height-vs-rows ambiguity, cell identity, unstated sizing intent).
2. **The canvas model** from ticket 01's resolution — 12-of-12 standardisation,
   how sub-canvases work (if Option B), coordinate system rules.
3. **The row-unit strategy** from the pre-map decision — how all three sections
   converge onto it, what the unit token is, how cells declare spans.
4. **Cell notation** — `c<start>-<end> r<start>-<end>` (inclusive ranges), with
   the rule that spans are derived, never stated.
5. **Shape vocabulary** — unit / wide / tall / block / bar / field, defined as
   span multiples of the Unit.
6. **Finish vocabulary** — crop / card / mask; flush / separated / dense;
   per-corner radius overrides; the circle finish (radius max + square).
7. **Worked examples** — all three existing sections re-expressed in the
   notation (the ASCII diagrams from the conversation, formalised), serving as
   the reference implementations.
8. **Responsive rules** — how the canvas collapses (resolved from the fog item
   once 01/02 land).
9. **A "how to request a bento" section** — the grammar a human (or agent)
   uses to specify a new bento unambiguously, with a worked request/response
   example (the circle-cell request from the conversation, rewritten).

**Gate:** the spec is reviewable prose; Dale approves it before the primitive
(ticket 04) is built against it.

## Resolution

*(recorded on close)*
