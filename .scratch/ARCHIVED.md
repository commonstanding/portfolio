# `.scratch/` — ARCHIVED

**Archived:** 05 Oct 2026
**Reason:** these maps and tickets were migrated to the live queue. They are kept in git
deliberately, as decision history — not as a second source of work.

## Where the work went

| Was | Now |
|---|---|
| `.scratch/wayfinder/MAP.md` + `tickets/01-06` | `10-COMMON_STANDING/_tasks/20260926-001-*` and `20260927-002` … `-007` |
| `.scratch/spec-convergence/README.md` + `tickets/01-04` | `_tasks/20261004-001-*` and `20261004-002` … `-005` |
| `PLAN-scratch-migration.md` (this migration) | completed — kept here as the record of the move |

**The live queue is `_tasks/` + `TASKS.md` §9.** Every migrated file carries a `source:`
field pointing back to its `.scratch/` original and a `blocked-by:` list of `_tasks/` IDs.

## Why keep these at all

Six wayfinder tickets carry `## Resolution` records — evidence that the bento primitive,
its tokens, and the spec were actually built, and in what order. Ticket `20260927-007`
(ticket 06) is the end-to-end verification that closed the map. Without those, a later
reader sees a spec whose §9 examples disagree with its own code and has no way to learn
why the drift happened.

That is precisely the situation the drift tickets (`20261004-003`, `-004`) are fixing, so
the record has value precisely now.

## Reading a migrated ticket

The `**Status:**` line was removed from the bodies of all twelve files — YAML frontmatter
`status:` is canonical. Bodies are otherwise verbatim.

Statuses as migrated:

| ID | status |
|---|---|
| `20260926-001` … `20260927-007` | `closed` (wayfinder, closed 27/09/2026) |
| `20261004-001` | `open` (spec-convergence map) |
| `20261004-002` | `done` |
| `20261004-003`, `-004`, `-005` | `ready-for-agent` |

## Convention note

Three systems briefly disagreed about where tickets live. Resolved in favour of the
documented standard:

- **Tasks & Wayfinder Standard** (`~/.agents/core/standards/tasks-and-wayfinder-standard.md`) — `_tasks/YYYYMMDD-NNN-slug.md`, YAML frontmatter, `blocked-by`. **This wins**, and `canopy` already follows it.
- **`to-tickets` skill** (`~/.agents/skills/to-tickets/SKILL.md`) — `.scratch/<feature>/issues/<NN>-<slug>.md`. Followed by the wayfinder work; superseded here.
- **Repo topology** (`~/10-COMMON-STANDING/AGENTS.md`) — every shipable touchpoint is a standalone repo. Satisfied 04 Oct (`git init`, commit `da704b1`); a remote under the `commonstanding` org is still outstanding and is a human step.

Note `_tasks` in this repo is a **symlink** to `10-COMMON-STANDING/_tasks/`, the
portfolio-level detail store the Standard specifies — not a project-local directory.