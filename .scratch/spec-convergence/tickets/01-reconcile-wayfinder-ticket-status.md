# 01: Reconcile wayfinder ticket status with ticket 06's closure record

**Status:** ready-for-agent
**Type:** `wayfinder:task`
**Blocks:** 03
**Blocked by:** None (can start immediately)

## Question

The wayfinder map is `Status: Closed (27/09/2026 — ticket 06)`, and ticket 06's
resolution says in as many words: *"**Map closed.** No open tickets remain"*. Yet
tickets **02, 03, and 04** still carry `**Status:** Open`. Their work is demonstrably
done — 03 wrote the spec (three files exist in `docs/`), 02 landed the tokens
(`--global-gutter-*` and `--grid-gutter-*` are in `tokens.css:109-172`), and 04 built
the primitive (`src/components/Bento.astro` exists and all three sections are refactored
onto it).

The stale `Open` markers are why `docs/spec-bento.md` still reads *"Gates: Dale
approves this spec before the primitive (ticket 04) is built against it"* — a gate
describing work ticket 06 already verified. They also mean the next reader cannot tell
which bento tickets are live.

**What to build:** every ticket file's status agrees with ticket 06's resolution, and
the spec's stale gate language describes the post-approval state.

## Acceptance criteria

- [ ] Tickets 02, 03, and 04 in `.scratch/wayfinder/tickets/` read `Status: Closed`
      (with date + pointer to ticket 06's resolution), matching 01, 05, and 06.
- [ ] Each of 02/03/04 has a `## Resolution` section recorded, per the pattern ticket 04
      already reserves with `*(recorded on close)*`.
- [ ] `docs/spec-bento.md` no longer says *"Gates: Dale approves this spec before the
      primitive (ticket 04) is built against it."* It records that the spec was
      approved (04 Oct 2026) and that ticket 04 built against it.
- [ ] The seven ticket references in `docs/spec-bento.md` (lines 3, 5, 23, 51, 184, 218,
      226) all resolve to a ticket that exists. They do today — the files are in
      `.scratch/wayfinder/tickets/`, not `_tasks/` — but confirm no spec text points at
      the emptied `_tasks/` directory.
- [ ] `grep -c 'Status.*Open' .scratch/wayfinder/tickets/*.md` returns 0 across all files.

## Note

Do **not** delete `_tasks/`. It is an empty tracked directory; removing it is a separate
call once you decide the wayfinder tickets are the single home for bento tracking.