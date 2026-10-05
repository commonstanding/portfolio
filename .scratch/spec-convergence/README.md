# Spec Convergence — Bento, Gutter & Media-Strip Docs

> **ARCHIVED 05/10/2026.** This map is a decision record, not a live queue.
> Live tickets are in `_tasks/` (see [`ARCHIVED.md`](../ARCHIVED.md)).
> **CLOSED 06/10/2026** — all four tickets landed; see `_tasks/20261004-001` resolution.

**Status:** Closed (06/10/2026)
**Charted:** 2026-10-04
**Origin:** /orient session, 04 Oct 2026 — Dale approved `spec-bento.md` and asked to
"clean up and/or write tickets".

## Destination

The three specs in `docs/` describe the built system accurately, carry statuses that
reflect reality, and no ticket file contradicts another about what is open. The bento
agent ecosystem (`bento-interpreter` → `bento-builder` → `bento-auditor` →
`bento-curator`) can then be trusted to work from these documents without a human
re-deriving what changed.

## Tickets

| # | Ticket | Blocked by | Status |
|---|---|---|---|
| 01 | [Reconcile wayfinder ticket status with ticket 06](tickets/01-reconcile-wayfinder-ticket-status.md) | — | **done** 05/10 |
| 02 | [Sync spec §9 worked examples to built canvases](tickets/02-sync-spec-worked-examples.md) | — | ready |
| 03 | [Retire media-strip spec as superseded](tickets/03-retire-media-strip-spec.md) | 01, 02 | ready |
| 04 | [Circle finish proof case — decide or retire](tickets/04-circle-proof-case-decision.md) | — | **done** — kept prop, documented unused |

## Findings behind the tickets

All four came out of checking the specs against the code, not from re-reading the docs.
Each cites file:line evidence.

1. **Ticket status lies.** The map is Closed; tickets 02/03/04 still say `Open`. Their work
   is provably done.
2. **§9.1 is two composition generations stale.** Spec says 12 × 3 with 8 cells; code
   renders 12 × 4 with 7 cells. Ticket 06 fixed §9.2's arithmetic but never §9.1.
3. **A `Draft` spec ships already-built work.** `spec-media-strip-shared-image.md` proposed
   the 3-up strip and explicitly deferred the bento strip as "a separate iteration". That
   iteration is now `index.astro:157`.
4. **The circle proof case is uncovered.** Ticket 04 required it to survive the refactor
   and ticket 06 verified it rendered. Today no canvas declares a `circle` cell.

## Frontier

01, 02, and 04 can all start immediately — they touch disjoint files and none blocks
another. 03 needs 01 and 02 landed first so it can record the reconciled statuses rather
than repeat the work.

## Verification gate for the whole map

- `npx astro check` — 0 errors
- `npx astro build` — green
- `grep -c 'Status.*Open' .scratch/wayfinder/tickets/*.md` — 0
- `grep -rn 'Status:\*\* Draft' docs/` — 0 for shipped work
- bento-auditor run against all three canvases — no cited drift
- Every spec §9 area sum equals cols × rows, verified by recount