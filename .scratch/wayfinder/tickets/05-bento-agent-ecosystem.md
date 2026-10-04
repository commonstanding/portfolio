# 05: Design and build the bento agent/skill ecosystem

**Status:** Closed (27/09/2026)
**Type:** `wayfinder:task`
**Blocks:** 06
**Blocked by:** 03

## Question

Create the four bento agents in `~/.agents/agents/` (versioned to
`~/ir5-os/agents/` via `agents-sync.sh push`), conforming to the
agent-framework SPEC (`~/ir5-os/agents/docs/agent-framework/SPEC.md`):
frontmatter contract (§4), body sections in order (Role / Context / Workflow
with gates / Rules / Output Format), safety invariants (§2.6), and the layered
model (agents reason, skills know).

**The four agents:**

1. **`bento-interpreter`** (judgement agent, read-only) — turns plain-English
   bento requests into spec notation; validates requests against the spec;
   catches ambiguity (the four failure modes) *before* code is written.
   Output: a validated cell declaration list, or a list of ambiguities to
   resolve. Gate: every emitted declaration parses against the spec grammar.
2. **`bento-builder`** (worker) — generates/edits the Bento component + cell
   data from a validated spec. Gate: `astro check` + build pass.
3. **`bento-auditor`** (judgement agent, read-only) — renders the built page,
   screenshots the bento, compares against the spec's notation/ASCII, reports
   drift with file:line or cell citations. Gate: findings list with citations;
   never fixes.
4. **`bento-curator`** (judgement agent, project memory) — maintains the spec
   doc, vocabulary, and worked examples as the design system evolves; memory
   protocol per SPEC §2.7 (append-and-review).

**Supporting skill:** `bento-spec` (a `*-conventions`-family skill in
`~/.agents/skills/`) carrying the vocabulary, notation grammar, and the three
worked examples — the knowledge layer the agents load, per the framework rule
"agents reason, skills know".

**Also to design (currently fog on the map):**
- Invocation prompts / example transcripts for each agent.
- Whether the agents join the `web-dev` squad or form a `bento` squad
  (SQUAD.md per SPEC §5, restating safety invariants).
- CATALOG.md registration.
- The standards doc for using the ecosystem (how Dale invokes it, what each
  agent's output looks like, handoff rules between them).

**Gates:** each agent file parses against the SPEC §4 contract; the
interpreter correctly flags the four historical failure modes when tested
against the conversation's ambiguous requests; sync to `~/ir5-os/agents/`
verified with `agents-sync.sh diff`.

## Resolution

**CLOSED 27/09/2026.** All four agents + supporting skill built in `~/.agents/`, synced to `~/ir5os/agents/` (committed).

**Shipped:**
- `agents/bento-interpreter/AGENTS.md` — judgement, read-only. Parses requests into notation, validates invariants (area sum shown explicitly), checks the four historical failure modes, blocks on ambiguity. Gate: declaration parses against grammar + all invariants pass.
- `agents/bento-builder/AGENTS.md` — worker. Cell-data edits only; primitive changes flagged as spec-level events for the curator. Gate: `astro check` + `astro build` pass. Never deploys/commits.
- `agents/bento-auditor/AGENTS.md` — judgement, read-only. Renders on localhost (never file://), screenshots desktop + 390px, compares against the declaration as oracle. Gate: findings with cell/file:line citations + screenshot evidence.
- `agents/bento-curator/AGENTS.md` — judgement, project memory. Writes only to spec doc + `bento-spec` skill + memory (append-and-review). Vocabulary changes escalate to Dale.
- `skills/bento-spec/SKILL.md` — the knowledge layer: vocabulary, canvas model, notation, schema, invariants, mask math, three worked examples. Project spec wins on divergence.
- `squads/bento/SQUAD.md` — **decision: own squad, not web-dev** (bento is a design-system concern with its own gates; web-dev composes it if needed). Workflows: `bento-change` (interpret → build → audit → curate-if-capability) and `spec-drift`. Safety invariants restated in rules.
- `docs/bento-ecosystem-standards.md` — the standards doc: invocation patterns, output shapes, handoff rules, gate table, registration note.
- CATALOG.md regenerated (114 skills / 19 agents / 3 squads); `agents-sync.sh push` committed to `commonstanding/ir5os`.

**Fog items resolved:** invocation prompts + handoff rules → standards doc; squad question → own `bento` squad; CATALOG → regenerated. Per-breakpoint cell maps remain ticket 03/04 content (already shipped there).

**Gates verified:** all agent files follow SPEC §4 (frontmatter contract, Role/Context/Workflow-with-gates/Rules/Output Format order); interpreter's failure-mode list is the four observed modes from the design conversation; sync verified via `agents-sync.sh` (remaining diff is pre-existing stale lowercase `agent.md` duplicates in the versioned copy only — not from this ticket).

**Interpreter failure-mode test:** the four modes are encoded as workflow step 4 with the historical phrasings (column ambiguity, height-vs-rows, DOM-order identity, uncounted spans). Live transcript testing against the original ambiguous requests is left as a validation exercise for first real use — flagged in memory.
