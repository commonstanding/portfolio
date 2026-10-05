# Plan: adopt `.scratch/`, migrate tickets to `_tasks/`, archive scratch

**Status:** COMPLETE (05 Oct 2026) · **Author:** /orient session
**Decision it implements:** Dale — *"commit `.scratch/`, migrate the tickets to `_tasks/`
and TASKS.md, and write a plan to capture/adopt/migrate all content in scratch and
archive scratch."*

## Why this plan exists

`.scratch/` holds ~4,700 words of decision history across 12 markdown files: a closed
wayfinder map with six tickets (six of which carry `## Resolution` records), plus a new
spec-convergence map with four tickets. It is the only record of how the bento system was
built and what was decided. Today it is untracked and unreviewable.

Three conventions are in tension:

| Convention | Source | Says |
|---|---|---|
| Wayfinder `to-tickets` skill | `~/.agents/skills/to-tickets/SKILL.md` | tickets live in `.scratch/<feature-slug>/issues/<NN>-<slug>.md` |
| Tasks & Wayfinder Standard | `~/.agents/core/standards/tasks-and-wayfinder-standard.md` | tickets live in `_tasks/YYYYMMDD-NNN-slug.md`, YAML frontmatter, `blocked-by` |
| Repo topology | `~/10-COMMON-STANDING/AGENTS.md` | every shipable touchpoint is a standalone repo |

`canopy` follows the Standard (`_tasks/20260427-001-adaptive-home-referrer-reshuffle.md`
with `id/type/status/phase/created/parent/linked-prd` frontmatter). The bento tickets use
the skill's `NN-slug` shape and no frontmatter. Dale's decision resolves this in favour of
`_tasks/` as the live home, with `.scratch/` kept in-repo as the historical record.

## Principle

**Nothing is deleted. `.scratch/` stays tracked and readable; it stops being a second
live queue.** The migration is a copy, not a move — the archive is a marker, not a purge.
Rationale: six resolutions are the audit trail for a system that shipped; a later reader
must be able to see *why* §9.1 and §9.2 disagree.

## Step 1 — `git init` + first commit (DONE, 04 Oct 2026)

- `git init` with branch `main`. `.gitignore` written: `node_modules`, `dist`, `.astro`,
  `.DS_Store`.
- **`.scratch/` is NOT ignored** — deliberate, per Dale's decision. Verified:
  `git check-ignore .scratch/wayfinder/MAP.md` → not ignored.
- Secret sweep before staging: no `.env*` files, no key/token/password matches in `src/`,
  `public/`, `astro.config.mjs`, `package.json`. `public/` is a single `favicon.svg`.
- 13 paths will be committed (`.gitignore`, `.scratch/`, `README.md`, `TASKS.md`, `_tasks`,
  `astro.config.mjs`, `docs/`, `package*.json`, `prototype/`, `public/`, `src/`,
  `tsconfig.json`).
- **Commit is the first human-pushable unit.** I do not push — deploy/push stays human
  per `AGENTS.md`.

## Step 2 — Adopt the Standard's frontmatter for `_tasks/` ✅ DONE 05 Oct

`_tasks/` is currently an empty tracked-ish directory. Migrate both ticket sets into it
using the Standard's shape, `YYYYMMDD-NNN`:

**From wayfinder (dated to the map, 2026-09-26 charted / 2026-09-27 closed):**

| New file | From | Status to record | blocked-by |
|---|---|---|---|
| `_tasks/20260926-001-map-bento-grid-system.md` | `wayfinder/MAP.md` | `closed` (27/09/2026) | — |
| `_tasks/20260927-002-canvas-model-12-of-12.md` | `wayfinder/tickets/01-*` | `closed` | — |
| `_tasks/20260927-003-token-primitives.md` | `wayfinder/tickets/02-*` | `closed` | 002 |
| `_tasks/20260927-004-write-bento-spec.md` | `wayfinder/tickets/03-*` | `closed` | 002, 003 |
| `_tasks/20260927-005-bento-primitive-refactor.md` | `wayfinder/tickets/04-*` | `closed` | 003, 004 |
| `_tasks/20260927-006-bento-agent-ecosystem.md` | `wayfinder/tickets/05-*` | `closed` | 004 |
| `_tasks/20260927-007-verification-and-close.md` | `wayfinder/tickets/06-*` | `closed` | 005, 006 |

**From spec-convergence (new, dated 2026-10-04):**

| New file | From | Status | blocked-by |
|---|---|---|---|
| `_tasks/20261004-001-spec-convergence-map.md` | `spec-convergence/README.md` | `open` | — |
| `_tasks/20261004-002-reconcile-wayfinder-status.md` | `spec-convergence/tickets/01-*` | `ready-for-agent` | — |
| `_tasks/20261004-003-sync-spec-worked-examples.md` | `spec-convergence/tickets/02-*` | `ready-for-agent` | — |
| `_tasks/20261004-004-retire-media-strip-spec.md` | `spec-convergence/tickets/03-*` | `ready-for-agent` | 002, 003 |
| `_tasks/20261004-005-circle-proof-case-decision.md` | `spec-convergence/tickets/04-*` | `ready-for-agent` | — |

Each new file gets YAML frontmatter matching `canopy`'s existing shape plus the Standard's
`blocked-by`:

```yaml
---
id: 20261004-003
type: wayfinder:task
status: ready-for-agent
created: 2026-10-04
parent: TASKS.md
source: .scratch/spec-convergence/tickets/02-sync-spec-worked-examples.md
blocked-by: []
---
```

- [ ] All 12 files created with frontmatter; bodies copied verbatim from `.scratch/`.
- [ ] `source:` field preserves the `.scratch/` provenance on every migrated file.
- [ ] Blocking edges match the `.scratch/` `Blocked by` lines exactly.

## Step 3 — Map to TASKS.md ✅ DONE 05 Oct

The four new spec-convergence tickets need entries in `TASKS.md` §9 (added this session)
so they are visible from the portfolio-level queue, not just the repo. Existing §9 already
lists them as prose bullets; replace the prose with a one-line-per-ticket entry carrying
the `20261004-NNN` ID and `_tasks/` path. The seven closed wayfinder items are `closed` and
do **not** need open TASKS.md entries — they stay recorded in the `_tasks/` files and the
archived map.

- [ ] §9 open bullets carry `20261004-00N` IDs and link to `_tasks/` files.
- [ ] The wayfinder closure is recorded once in §9 as a single closed line, not seven.

## Step 4 — Fix dangling references surfaced during migration ✅ DONE 05 Oct

Two broken links found while inventorying `.scratch/`:

1. `wayfinder/MAP.md:44` links `../../docs/spec-bento-nomenclature.md` — **file does not
   exist** (docs/ holds only the three live specs). The vocabulary it describes now lives
   inside `spec-bento.md` §1.
2. The `spec-bento.md` ticket refs (ticket 01/03/04/06) resolve to `.scratch/wayfinder/`
   today; after archiving they must resolve to `_tasks/20260927-00N-*`.

- [ ] MAP's nomenclature link points at `spec-bento.md` §1 or is marked superseded.
- [ ] Spec ticket refs re-pointed to `_tasks/` IDs (or the spec keeps `.scratch/` refs,
      which is also valid since `.scratch/` stays tracked — pick one, be consistent).

## Step 5 — Archive scratch ✅ DONE 05 Oct (non-destructive)

`.scratch/` is **kept in git** (Dale's decision) and marked archived in place, so the
history is versioned and searchable but does not read as a live queue:

- Add `.scratch/ARCHIVED.md` (or a header banner in each map) stating: the maps are
  closed/historical; the live queue is `_tasks/` + `TASKS.md`; the maps are retained
  deliberately as decision records.
- Do **not** delete or move the `.scratch/` tree — it is the resolution audit trail.
- Optionally mirror to `_archive/` per the structure-fixer convention; if done, it is a
  *copy* with `_tasks/` remaining canonical. (Not required — keeping one copy avoids a
  second source of truth.)

## Frontier

Steps 1 (done) → 2 → 3 → 4 → 5 are sequential within this plan. In terms of ready work
*across* the repo: `_tasks/20261004-002`, `-003`, and `-005` are `ready-for-agent` the
moment step 2 lands and do not depend on this plan's later steps.

## Verification gate

- [ ] `git log` shows the initial commit; `.scratch/` present in the tree.
- [ ] `grep -r 'Status.*Open' _tasks/` returns 0 for the closed wayfinder set.
- [ ] `ls _tasks/ | wc -l` → 12 files.
- [ ] TASKS.md §9 links resolve to existing `_tasks/` files.
- [ ] No `.md` in the tree links to a non-existent path (the MAP nomenclature link is the
      known one; re-sweep after step 4).
- [ ] `npx astro check` and `npx astro build` remain green (doc-only changes; nothing in
      this plan touches `src/`).

## Out of scope

- Pushing to GitHub (human step; remote not yet created).
- Creating the remote repo under `Duds`/`commonstanding` org per the repo-topology rule.
- The three "needs you" decisions themselves (domain registration, `_tasks/` retention —
  now resolved in this plan — and the circle proof case).
## Completion record (05 Oct 2026)

All five steps landed. Two things differed from the plan as written:

1. **`_tasks` is a symlink** to `10-COMMON-STANDING/_tasks/`, not a project-local
   directory. Correct per the Standard — the files were written through the symlink, so
   the live store is populated. Unchanged.
2. **Two extra defects found and fixed.** The three stale tickets (02/03/04) had empty
   `*(recorded on close)*` placeholders rather than resolutions, so each received a real
   evidence-cited record. And flattening the ticket tree broke sibling links in the
   migrated copies, plus a pre-existing dangling ref to `docs/spec-bento-nomenclature.md`
   — all repointed. A link sweep across all 12 migrated files now returns clean.

`_tasks/` holds 12 files. `TASKS.md` §9 carries `20261004-NNN` IDs. `.scratch/` retains
all 13 files plus `ARCHIVED.md`, with banners on both maps. Build unaffected — doc-only
changes throughout.
