# 03: Retire spec-media-strip-shared-image.md as superseded by the bento canvas

**Status:** ready-for-agent
**Type:** `wayfinder:task`
**Blocks:** None
**Blocked by:** 01, 02

## Question

`docs/spec-media-strip-shared-image.md` proposes a hero strip built from *"one image + N
clip windows"* at **3 tiles**. Its own §7 Out of scope says:

> **The bento layout itself** — this spec ships the 3-up strip; the multi-row bento
> evolution is the designed destination (§2.1) but is a separate iteration. The only
> requirement here is that nothing built now forecloses it.

That condition is met and the destination has arrived. `index.astro:157-166` renders the
hero as a `<Bento rows={4} density="flush" image={MEDIA_STRIP_SRC}>` with 7 mask cells —
one shared image, N clip windows, which is precisely this spec's §3 technique, promoted
onto the shared primitive.

So this file is a `Status: Draft` spec for a thing that has shipped in a different shape.
Left alone it misleads: someone reading `docs/` would reasonably think the 3-up strip is
still to be built. Its acceptance criteria are also unverifiable as written (*"Three
tiles render with identical shapes to today"* — "today" no longer exists).

**What to build:** the file records its own supersession and stops presenting as live work.

## Acceptance criteria

- [ ] `docs/spec-media-strip-shared-image.md` carries a banner at the top, in the style
      `docs/business/naming-checks-2026-07-25.md` already uses for a closed file: what it
      was, what superseded it, and the date.
- [ ] Status reads `Superseded` (not `Draft`) with a pointer to `docs/spec-bento.md` §9.1
      and the `Bento` `mask` finish.
- [ ] The banner states which of its acceptance criteria are carried forward into
      `spec-bento.md` §12 and which are dropped with the 3-up shape (notably *"Three tiles
      render with identical shapes to today"* — "today" referred to a layout now replaced).
- [ ] Its §7 Out of scope line about "the bento layout itself … is a separate iteration"
      is annotated as **fulfilled**, since the multi-row bento strip now exists.
- [ ] `docs/spec-scoped-gutter-tokens.md` status is reconciled in the same pass — see the
      second half of this ticket below.
- [ ] No file in `docs/` still reads `Status: Draft` for work that has shipped.

## Second half: gutter spec

`docs/spec-scoped-gutter-tokens.md` is also `Status: Draft`, but its work is **largely
done** — §3.1 global tokens, §3.2 scoped aliases (`--grid-gutter-flush` /
`-separated` / `-dense`) and the `density` prop all exist in `tokens.css:109-172` and
`Bento.astro:37-61`.

Its **§8 migration plan step 4 is not done**: *"Delete `--global-grid-gutter` after no
references remain."* One reference remains, at `GridOverlay.astro:131`
(`gap: var(--global-grid-gutter)`), and `tokens.css:117-118` still carries it as a
deprecated alias. The overlay is arguably the last legitimate consumer — §7 says gutter
bars must be *measured, not derived* — so this is a judgement call, not a blind delete.

Note also `GridOverlay.astro:409` has a literal `gap: 0.3em`, which §4.2 prohibits
(*"No component may write `gap: 0` or `gap: <literal>` directly"*). It is inside the dev
inspector widget chrome rather than a grid, so it may be a legitimate exception — record
the ruling either way.

- [ ] `docs/spec-scoped-gutter-tokens.md` status reflects reality: done with a residual
      follow-up, not `Draft`.
- [ ] A decision is recorded on `GridOverlay.astro:131` — keep the alias (with a comment
      explaining why the overlay measures rather than consumes) or migrate it. Whatever
      the call, §8 step 4 and §9 checkbox 1 stop being open contradictions.
- [ ] A ruling is recorded on `GridOverlay.astro:409`'s literal `0.3em` — either exempted
      in §4.2 as "widget chrome, not a grid" or converted to a spacing token.
- [ ] `spec-bento.md` §12 checkbox *"No component stylesheet contains a literal gap value
      or raw `--global-gutter-*` reference"* can then legitimately be ticked.

## Gate

`npx astro check` and `npx astro build` stay green — this ticket is docs plus, at most,
two token-reference edits. No visual change to any rendered section.