# Wayfinder Map: Bento Grid System — Spec, Primitive Refactor & Agent Ecosystem

**Label:** `wayfinder:map`
**Status:** Closed (27/09/2026 — ticket 06)
**Charted:** 2026-09-26

## Destination

The portfolio's three ad-hoc bento layouts (Benefits, Work, Media strip) are
replaced by **one shared Bento primitive** driven by **token primitives** and a
**written spec** with a standard nomenclature, all three sections standardised
against a **12-of-12 canvas** with the **row-unit sizing strategy**. The spec,
tokens, primitive, and refactor are shipped and verified in the browser, and an
agent/skill ecosystem (spec interpreter, bento builder, visual auditor, spec
curator) exists in `~/.agents/` (versioned to `~/ir5-os/agents/`) to support
building future bentos from the spec.

## Notes

- **Domain:** Astro 5 portfolio prototype (`touchpoints/portfolio`), scoped
  styles per page, design tokens in `src/styles/tokens.css`.
- **Skills every session should consult:** `astro-conventions`,
  `code-standards`, `frontend-design`, `grilling`, `domain-modeling`,
  `writing-for-agents` (for the agent/skill artefacts).
- **Agent home:** author in `~/.agents/` (runtime authority per
  ADR-2026-09-06), then `agents-sync.sh push` to `~/ir5-os/agents/`. Follow the
  agent-framework SPEC contracts (`~/ir5-os/agents/docs/agent-framework/SPEC.md`):
  judgement vs worker agents, skill families, verifiable gates, safety invariants.
- **Decisions already made (pre-map):**
  - Vocabulary adopted: Canvas / Unit / Cell / Shape / Finish (5 terms).
  - All three bentos standardise to **12-of-12** canvas; canvas model to be
    proposed by the agent and reviewed (ticket 01).
  - Sizing strategy converges to **row-unit** (all three sections).
  - Token placement: pros/cons to be presented, then decided (ticket 02).
  - Agent roles wanted: spec-interpreter, bento-builder, visual-auditor,
    spec-curator.
- **Verification:** every code ticket gates on `npx astro build` + browser
  screenshot of the affected section (localhost serve, not file://).
- **Safety invariants (from framework SPEC §2.6):** reviewer/auditor agents are
  read-only; builder agents never deploy; memory writes are append-and-review.

## Decisions so far

- [Vocabulary adopted (pre-map)](../../docs/spec-bento-nomenclature.md): five
  terms — Canvas, Unit, Cell, Shape, Finish — with `c<start>-<end> r<start>-<end>`
  cell notation and three sizing strategies (content / row-unit / canvas).
  *(Pre-map decision from the design conversation; the spec doc itself is
  ticket 03's deliverable.)*
- [01: Canvas model — flat 12-of-12](tickets/01-canvas-model-12-of-12.md):
  Option A flat canvas, canvas-coords-only notation, strict row alignment,
  per-canvas row unit with global square default (column-height = column-width)
  modified by clamp/fraction overrides (media strip ≈0.43× deliberate), circle
  finish forces square geometry, responsive = 12/6/4 across three breakpoints,
  data-driven cell schema, unit token global in tokens.css + inline override.

## Not yet specified

- **Prompt/instruction templates for the agent ecosystem** — RESOLVED (ticket 05,
  27/09/2026): invocation patterns, output shapes, and handoff rules live in
  `~/.agents/docs/bento-ecosystem-standards.md`; each agent's AGENTS.md carries
  its literal Output Format template.
- **CATALOG.md / squad registration** — RESOLVED (ticket 05): the four agents
  form their own `bento` squad (`~/.agents/squads/bento/SQUAD.md`) — a
  design-system concern with its own gates, not folded into `web-dev`.
  Registered in CATALOG.md (regenerated 27/09/2026).
- **Per-breakpoint cell maps** — the exact cell re-declarations for tablet
  (6 cols) and mobile (4 cols) per section. The breakpoint *structure* is
  decided (01); the maps themselves are spec content (03) and primitive
  behaviour (04).

## Out of scope

- **Migrating other pages** (about.astro) onto the primitive — this map covers
  the home page's three sections; other pages are a follow-up effort.
- **Changing the visual design** of the sections — the refactor must reproduce
  the current look (modulo the 12-of-12 standardisation), not redesign it.
- **Building new bento layouts** — the ecosystem is validated by reproducing
  the existing three, not by inventing new ones.
- **Modifying the agent-framework SPEC** — the bento ecosystem must conform to
  it as-is; amendments to the framework spec are a separate effort.
