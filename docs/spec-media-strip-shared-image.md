# Spec: Media Strip — Single-Image Multi-Mask Composition

> **SUPERSEDED 06/10/2026** (ticket `20261004-004`). This spec shipped, then was replaced
> by its own §2.1 destination: the hero strip is now a `mask`-finish **Bento canvas**
> (12 × 4, 7 clip windows, one shared image) — see `docs/spec-bento.md` §9.1 and
> `src/pages/index.astro`. The architecture this spec demanded proved out: tiles are
> cell data, offset math derives from grid coordinates, one accessible image per
> composition. What changed is that the 3-up "starting point" became the 7-cell bento
> arrangement, so the implementation details below (§3.2 DOM, §3.3 mechanics, §8
> criteria) describe markup that no longer exists.
>
> **Carried forward into `spec-bento.md` §12:** one accessible image per mask
> composition; flush dissolves to separated at ≤640px; no hardcoded offset literals;
> data-driven cell geometry (adding a mask = data edit).
>
> **Dropped with the 3-up shape:** "three tiles with identical shapes to today" (today
> was the standalone 9-col grid, then the 3-up strip — both gone); the per-tile
> `--tile-index` mechanic (replaced by `maskVars()` from declared tracks, spec §8);
> §6's overlay impact (GridOverlay now measures real rects — see the gutter spec).
>
> **§7's own exit condition is fulfilled:** *"the multi-row bento evolution is the
> designed destination (§2.1) but is a separate iteration"* — that iteration shipped
> 27/09/2026 (wayfinder map) and was verified 06/10/2026.

**Status:** Superseded — kept as the design rationale for the mask finish
**Scope:** `section.media-strip` (hero media strip) in `src/pages/index.astro`
**Depends on:** Scoped gutter tokens (`docs/spec-scoped-gutter-tokens.md`) — strip is `flush` density

---

## 1. Problem

The hero media strip currently renders **three separate `<img>` elements** side by side (flush, rounded corners). The reference design (`prototype/reference/reference01.png`) shows the same three-mask shape, but the visual reads as **one continuous photograph flowing across all three tiles** — a single landscape image clipped by three rounded-rect masks, not three cropped photos.

Three separate images produce three unrelated crops with three different colour stories. The composition effect — one image, fragmented into a strip — is lost.

## 2. Goal

Keep the **exact three mask shapes** the strip renders today (three equal-width rounded-rect tiles, flush, full strip height), but fill all three with **one shared landscape image**, so the photograph appears to continue seamlessly across the masks.

## 2.1 Direction: one image, MANY masks (bento evolution)

Three masks are the **starting point, not the end state**. The composition is designed to generalize:

- **More masks will be added** — the flush grid will grow to multiple rows in a **bento-style** arrangement (mixed tile sizes spanning rows/columns), still flush, still one shared image.
- **Mask shapes may change** — rounded rects today; the technique must not assume rectangles of equal size. Shapes may vary per tile (different radii, spans, aspect ratios) as the design iterates.

Therefore the architecture is **one image + N clip windows**, where N and the window geometry are data, not markup. The implementation below hardcodes 3 for now (test-and-iterate phase), but every mechanic — the offset math, the tile abstraction, the accessibility model — must be written so that going from 3 to N tiles (and from uniform rects to a bento layout) is a **data change, not a structural rewrite**:

- Tiles are generated from an array (`tiles = [{ index, span?, radius? }, …]`) in the component frontmatter — adding a mask means adding an entry, not copying markup.
- The offset math derives from each tile's **position in the grid** (column start / span), not from a hardcoded `--tile-index: n` literal. For the current 3-up single row, position = index; for bento, position = the tile's grid placement.
- The shared image is sized to the **whole composition** (the grid's bounding box), and each window exposes the region of the image that falls behind it. In bento form this means the image is sized to the full bento area and each tile's offset is computed from its own grid coordinates — the same principle as today's thirds, generalized.

The 3-up strip is the first iteration of this system; the bento layout is its intended destination. Nothing in this spec should be built in a way that forecloses that path.

## 3. Approach: one image + N clip windows

### 3.1 Chosen technique

A single image spans the whole composition; each **mask tile** is a window onto it.

Two viable implementations were considered:

| Option | Mechanism | Verdict |
|--------|-----------|---------|
| **A. One img + N clip windows** | One shared image; N tile elements, each clipping its window via `overflow: hidden` + border-radius, with the image offset per tile's grid position | ✅ Chosen — real DOM per tile, works everywhere, no SVG maintenance, generalizes to N tiles and bento geometry |
| B. SVG `<clipPath>` + `<image>` | One SVG with N clip paths referencing one image | Rejected — harder to keep responsive; aspect-ratio handling is brittle; per-tile DOM (for hover, a11y) is awkward |

**Option A detail (current 3-up iteration):** the strip is a 3-column grid (unchanged). Each grid cell contains a tile `<div>` with `overflow: hidden` and the tile's border-radius. Inside each tile, the *same* image is rendered at **full strip width** but offset horizontally by `-100%`, `-200%` of tile width respectively — so tile 1 shows the left third of the photo, tile 2 the middle third, tile 3 the right third. The rounded corners of each tile act as the clipping mask.

**Bento generalization (future iteration):** when the grid becomes multi-row bento, tiles are placed with `grid-column`/`grid-row` spans. The shared image is then sized to the **bento container's bounding box** (not 3× tile width), and each tile's image offset is computed from the tile's own grid origin: `offset = -(tile.x / bentoWidth) * 100%` horizontally and analogously vertically. Because every tile renders the same full-container-sized image, all windows stay in register — the photograph continues seamlessly across any number of masks of any shape. The offset computation should live in one place (component frontmatter or a CSS custom property per tile) so shape/geometry changes are data edits.

### 3.2 DOM structure (current 3-up iteration)

```html
<section class="media-strip" aria-label="Featured imagery">
  <!-- One image, three windows. Each tile shows its third of the photo. -->
  <div class="media-strip__tile" style="--tile-index: 0">
    <img src="…" alt="…" />
  </div>
  <div class="media-strip__tile" style="--tile-index: 1">
    <img src="…" alt="…" aria-hidden="true" />
  </div>
  <div class="media-strip__tile" style="--tile-index: 2">
    <img src="…" alt="…" aria-hidden="true" />
  </div>
</section>
```

Rules:

- Exactly **one** accessible image: tile 0's `<img>` carries the `alt`; tiles 1–2 mark theirs `aria-hidden="true"` (they are windows onto the same picture, not separate content).
- The image source is defined **once** per tile (three `<img>` tags, same `src`) — this is deliberate: it avoids `background-image` (no alt support) and keeps the composition resilient without JS. A `<picture>`/`srcset` variant may be added later; the offset math must use percentages so it survives responsive resizing.
- **Bento-ready:** tiles are generated from a data array in the component frontmatter (see §2.1), so adding masks or changing geometry means editing data, not duplicating markup. The `--tile-index` custom property is the current 3-up simplification; the bento evolution replaces it with per-tile grid coordinates.

### 3.3 CSS mechanics

```css
.media-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--grid-gutter-media); /* flush — masks touch */
  block-size: clamp(14rem, 30vw, 24rem);
}

.media-strip__tile {
  position: relative;
  overflow: hidden;              /* the clip: tile radius + bounds */
  border-radius: var(--radius-media);
}

.media-strip__tile img {
  position: absolute;
  inset-block: 0;
  /* Width = 3 tiles + 2 zero gutters = full strip width.
     Each tile shifts left by its index × 100% of TILE width. */
  inline-size: calc(100% * 3);   /* relative to tile → 3 tiles wide */
  max-inline-size: none;
  inline-size-start: 0;
  left: calc(var(--tile-index) * -100%);
  block-size: 100%;
  object-fit: cover;
  object-position: center;
}
```

Key mechanics:

- `inline-size: calc(100% * 3)` — the image is 3× its tile wide, so the three tiles together expose the full image width.
- `left: calc(var(--tile-index) * -100%)` — tile *n* shows the *n*th third. Percentages resolve against the **tile** width (the positioned ancestor), so the math is resolution-independent.
- `object-fit: cover` + `block-size: 100%` — the image fills the strip height; horizontal crop is governed by the window, vertical by cover.
- `overflow: hidden` + `border-radius` on the tile = the clipping mask. The mask shapes are **identical to today's** (same grid, same radius, same flush gaps).

### 3.4 Hover behaviour (mosaic rule, spec §6.2)

Hover effects must remain **inset**. With a shared image, a per-tile zoom would break continuity (each window would zoom its third independently — actually acceptable visually, but the seams would misalign). Decision:

- **Hover zooms the whole composition**: on tile hover, scale the image inside *that* tile only (`transform: scale(1.03)` on that tile's img). Because each tile owns its own `<img>`, per-tile zoom keeps the mask intact and the effect contained. Seams between tiles stay aligned because the scale is transform-based (no layout shift).
- Alternative considered (zoom the shared image across all tiles) rejected: requires cross-tile coordination for a subtle effect, and per-tile zoom matches the existing work-gallery behaviour.

### 3.5 Responsive behaviour

- **≥641px**: three windows, as specified. The image's aspect ratio should be ≥ 3:1 so each third still reads as a landscape crop; Unsplash URL params (`w=1600&fit=crop`) supply a wide source.
- **≤640px** (mosaic dissolution, per scoped-gutter spec §5): the strip stacks to one column. With one tile per row, the "thirds" offset math breaks (each tile would show the same left third). At this breakpoint the tiles **revert to independent crops**: each tile's img resets to `position: static; inline-size: 100%; left: 0` and the strip regains `--global-gutter-tight` separation (existing rule). Optionally each tile could show a different `object-position` to fake variety — out of scope for this spec; the reset is the requirement.

## 4. Accessibility

- One image, one `alt` (tile 0). Tiles 1–2: `aria-hidden="true"` on their `<img>`.
- The strip keeps `aria-label="Featured imagery"` on the section.
- No interactive elements inside the strip → no WCAG target-spacing concerns.

## 5. Performance

- Three `<img>` tags with the same `src` = **one network fetch** (browser cache); decode cost ×3 is negligible for static tiles.
- `loading="eager"` retained (above the fold).
- Add `fetchpriority="high"` on tile 0's image (LCP candidate); omit on tiles 1–2.

## 6. Overlay (design QA) impact

- The overlay's column/gutter bars are unaffected: the strip is still a 3-column flush grid; the overlay measures the *tiles*, which are now `<div>`s instead of `<img>`s — no selector changes needed (overlay measures `.grid-overlay__col`, not page content).
- Hover-inspect will now report `div.media-strip__tile` boxes instead of `img` — expected and more useful (the tile *is* the mask).

## 7. Out of scope

- Cross-fade / parallax / scroll-linked movement of the shared image.
- Different images per tile (that's the current behaviour, preserved at ≤640px).
- Work gallery (`section.work`) — its tiles remain independent images; only the hero strip becomes a shared-image composition.
- **The bento layout itself** — this spec ships the 3-up strip; the multi-row bento evolution is the designed destination (§2.1) but is a separate iteration. The only requirement here is that nothing built now forecloses it.

## 8. Acceptance criteria

- [ ] Three tiles render with identical shapes to today (equal width, flush, `--radius-media` corners).
- [ ] A single landscape image is visible across all three tiles with no visible seam at tile boundaries (continuous tone across the boundary).
- [ ] Exactly one accessible name for the composition (tile 0's `alt`).
- [ ] Hover on any tile scales that tile's image inside its mask; no layout shift; no bleed into neighbours.
- [ ] At ≤640px, tiles revert to independent full-bleed crops with tight separation.
- [ ] Overlay hover-inspect reports `div.media-strip__tile` boxes.
- [ ] **Bento-ready:** tiles are generated from a data array; adding a fourth mask (or changing a tile's geometry) requires a data edit only — no new markup patterns, no change to the offset-math approach.

*Disposition (06/10/2026): boxes above are not open work. Criteria 2–5 and 7 were
verified at ship time (27/09/2026 wayfinder ticket 06) and re-verified against the bento
canvas on 06/10/2026: one `alt` across the composition, per-cell hover scale inside
`overflow: hidden`, flush→separated at ≤640px, mask cells from the `cells` array with
offsets derived from declared tracks (`maskVars()`). Criteria 1 and 6 are dead with the
3-up markup they describe.*