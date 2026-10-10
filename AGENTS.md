---
status: active
type: code
---

# portfolio

## Purpose

Astro 5 site for Dale Rogers / Common Standing. Per `TASKS.md`, this repo
carries the founder-hub funnel rebuild (decided 25/07/2026) and the bento
design-system specs; sibling repos `canopy` and `dalerogers.com.au` hold the
prior portfolio surface and the Folio design system. Online-identity
consolidation backlog: `TASKS.md`; business context:
`docs/business/business-brief.md`. Remote: `commonstanding/portfolio`.

## Stack

- Astro 5, TypeScript, content collections (`src/content.config.ts` —
  taxonomy not yet populated).
- Bento grid system: see `docs/spec-bento.md` and the `bento-spec` skill;
  `src/components/Bento.astro` is the primitive.
- Design specs and analysis reference docs live in `docs/`.

## Commands

```bash
npm install
npm run dev        # astro dev
npm run build      # astro build
npm run preview
```

## Conventions

- Bento cell notation and canvas rules follow the `bento-spec` skill; the
  project spec (`docs/spec-bento.md`) wins over the skill's stable core.
- Copy and positioning text: the `dale-style-guide` skill; canonical one-liner
  and bios are tracked in `TASKS.md`.
- Dates in prose DD/MM/YYYY; filenames `YYYY-MM-DD`.

## Session management

- **Start:** run the `orient` skill — reads `TASKS.md` and triages work.
- **End:** run the `handoff` skill — compacts context for the next session.
