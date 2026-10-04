# 04: Re-cover the circle finish proof case, or retire it from the spec

**Status:** ready-for-agent
**Type:** `wayfinder:task`
**Blocks:** None
**Blocked by:** None (can start immediately)

## Question

Ticket 04's acceptance criteria are explicit:

> 4. The circle cell from the conversation must survive the refactor (it's the proof case
>    for the Finish vocabulary).

Ticket 06's resolution claims it did:

> Browser-verified all three sections at desktop (1280px) and mobile (390px): … **circle
> cell renders as a true circle**.

Both statements were true when written. Neither is true now. As of 04 Oct 2026:

- `grep -c circle src/pages/index.astro` → **0**. No canvas declares a `circle` cell.
- Spec §9.1 lists cell 1 as `mask, circle`, but the code declares
  `{ c: [1,1], r: [1,1], finish: 'mask', r0: [3,4] }` — no `circle: true`.

The primitive still *supports* the finish (`Bento.astro:22-23, 95, 168-169`), so the code
capability is intact; what is gone is any canvas that exercises it. The media strip's
cell 1 is the natural home — it is a single square unit at the canvas origin, exactly the
geometry §7's circle finish needs (*"radius max. True circle under the square unit"*).

This is a genuine open question, not a defect: the circle may have been dropped
deliberately in a later composition pass, or lost by accident when §9.1 was re-packed to
the 12 × 4 layout. Nothing in the repo records which.

**What to build:** a recorded decision on the circle proof case, and whichever of the two
outcomes that decision implies.

## Acceptance criteria

- [ ] The decision is recorded in this ticket file as a `## Resolution` — one of:
      **(a)** restore the circle to the media strip's cell 1 and re-sync spec §9.1, or
      **(b)** drop the circle finish from the spec's vocabulary and acceptance criteria as
      unsupported-in-practice.
- [ ] If **(a)**: `index.astro:45` gains `circle: true`; spec §9.1's cell-1 row again
      reads `mask, circle`; browser verification at 1280px and 390px shows a true circle
      with no layout shift; area sum is unaffected (`1` cell unit either way).
- [ ] If **(b)**: spec §7 and §12 no longer claim circle coverage; `Bento.astro`'s
      `circle` prop is either kept and documented as available-but-unused, or removed with
      its `.bento__cell--circle` rule. If removed, `astro check` stays green.
- [ ] Ticket 06's resolution is **not** rewritten. It is a historical record of what was
      true on 27/09/2026. Annotate it with a forward pointer to this ticket instead, so the
      audit trail shows the drift rather than erasing it.
- [ ] Whichever branch is taken, spec §12 checkbox *"Rendered sections match the worked
      examples (§9) by screenshot"* is honest about which examples exist.

## Why this is a separate ticket

It is a **judgement call, not a defect**, and the two branches land very differently — one
is a one-line code change plus a spec sync, the other removes a documented Finish from the
vocabulary. Under the bento ecosystem's own handoff rules (*"Vocabulary (Canvas/Unit/Cell/
Shape/Finish) changes are Dale's call — agents escalate, never rename"*), the branch is
yours. That is why this ticket blocks nothing and can be decided whenever.

Ticket 02 and 03 both proceed without it; neither depends on how the circle question
lands.