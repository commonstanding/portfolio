# Analysis: reference01 hero mosaic

**Subject:** `prototype/reference/reference01.png`, hero band (y 408–727)
**Diagram:** [`prototype/reference/reference01-hero-cells.png`](../prototype/reference/reference01-hero-cells.png)
**Date:** 07/10/2026
**Status:** Analysis complete. Adoption decision open — see §8.

This document reproduces the reference hero in bento vocabulary (§7). It is an
*observation* of a reference design, not a spec: `spec-bento.md` remains
authoritative and is not amended here.

---

## 1. Method

A closed loop between pixel measurement and visual reading, five passes:

1. **Isolate the band.** Row/column cream-fraction profiles place the mosaic
   content at x 186–1014, y 408–727. Across a window of x 100–1100 the cream
   fraction is 0.895 on rows above and below the band but only 0.065 on rows
   inside it — and that residual 0.065 is exactly the two 32–33 px page gutters
   at x 153–185 and x 1015–1046. Inside the content column itself the band is
   1.3 % cream. The boundary is hard and unambiguous.
2. **Derive the substrate.** Four seams are independent evidence — each is a
   directly observed boundary between two different tiles: y 514 and y 621
   across the left column (10.9 % and 11.0 % cream along the line), and x 463
   and x 739 across the top row (12.8 % and 13.4 %). Those fix **3 rows × 3
   column groups**. Against the canvas rect they are exact thirds: measured
   minus predicted is +0.7, −0.5, +0.3 px in x and −0.7, −0.3 px in y. The
   predicted third division at x 600 is then confirmed only where the model
   says a boundary exists — row 3, between E1 and E2 (8.3 %) — and is absent
   (0.0 %) at x 324 and x 877, which is what rules out a finer rhythm. Unit
   138.2 × 106.7 px.
3. **Detect corners, not lines.** In a flush mosaic over one shared image, a
   tile boundary is *only* visible where a corner is rounded: the cream shows
   through the concave notch between two touching arcs. So the primitive is a
   quadrant probe at each grid vertex, not a seam scan.
4. **Fit radius by template.** Each of the 28 tile corners was tested against a
   synthetic notch (`r × r` box minus a quarter disc) swept over r = 10…39 and
   scored by IoU. The nine square corners score IoU 0.00 at every radius —
   there is no cream in their quadrant box at all, so that classification is
   unambiguous. The nineteen rounded corners each have a notch present, with
   best-fit radii clustered in 26–28 px; a handful read lower on IoU because a
   neighbouring rounded corner shares the same vertex and partly occludes the
   notch (E1's BL is the weakest). The global fit (§1 step 5) peaks at radius
   27–28. So the radius is ~27 px everywhere, with per-corner confidence
   highest where a notch stands alone.
5. **Validate the whole model.** The seven cells plus their `r0` lists were
   rendered as a predicted cream mask and compared to the actual one:
   **IoU 0.716, 83 % of observed cream explained, 19/19 predicted notches
   present, zero predicted-not-actual corners.** The 592 px residual is two
   photo-tone highlight blobs (361 px) plus 231 px of template under-fill —
   110 px where two rounded corners (A.BR, B.TR) share vertex (c2,r1) and their
   notches merge into an hourglass, and 121 px of sub-60 px antialiasing
   fragments. None of it lies along a missed tile boundary. See §6.

Two independent readings (quadrant-area classification and template fit) agree
on all 28 corners. Interior-vertex consistency — a notch exists iff at least
one adjacent corner is rounded — holds at **10/10** vertices.

## 2. Canvas

| Property | Value | Evidence |
|---|---|---|
| Content rect | x 186–1014 (829 px), y 408–727 (320 px) | cream-fraction profile, hard edges |
| Visible rhythm | 6 columns × 3 rows | seams at exact thirds, ±0.7 px |
| Declared substrate | **12 × 6** | the 2 × 3 tile forces a refinement (§3) |
| Unit ratio | **0.772** (row height = column width × 0.772) | 106.7 / 138.2 |
| Canvas aspect | 2.591 | 829 / 320 = 12 / (6 × 0.772) |
| Density | **flush** (0 px) | no cream along any boundary except at corners |
| Finish | **mask**, one shared image | seam continuity, §5 |
| Radius | **27 px** ≈ 3.3 % of canvas width | template fit, §1 |

**Why 12 × 6 and not 6 × 3.** One tile spans 2 columns × 3 rows. On a 3-row
substrate that is a 1.5-unit height — a fractional row, which `spec-bento.md`
§2.1 resolves by refining the row count. Doubling both axes gives 12 × 6, where
every cell span is an integer track count. The unit is unchanged (0.772); only
the rhythm is subdivided. This is also the form the built site needs, since
`--bento-columns` is 12.

## 3. Cells

Notation is on the 12 × 6 substrate. `r0` corners are numbered 1 = TL, 2 = TR,
3 = BR, 4 = BL.

| Cell | Notation | Shape | Finish | r0 | Area |
|---|---|---|---|---|---|
| A | `c1-4 r1-2` | field | mask | `[1]` | 8 |
| B | `c1-4 r3-4` | field | mask | `[ ]` | 8 |
| C | `c1-4 r5-6` | field | mask | `[3]` | 8 |
| D | `c5-8 r1-4` | field | mask | `[3, 4]` | 16 |
| E1 | `c5-6 r5-6` | block | mask | `[1, 2]` | 4 |
| E2 | `c7-8 r5-6` | block | mask | `[1, 2]` | 4 |
| F | `c9-12 r1-6` | field | mask | `[3]` | 24 |

**Area accounting:** 8 + 8 + 8 + 16 + 4 + 4 + 24 = **72 = 12 × 6** ✓
**Overlaps:** none — the seven rectangles tile the canvas exactly (verified by
coverage matrix, all 72 tracks visited once).
**Mask alt:** one shared image; cell A carries the `alt`.

In the 6 × 3 visible rhythm the same cells read `c1-2 r1`, `c1-2 r2`,
`c1-2 r3`, `c3-4 r1-2`, `c3 r3`, `c4 r3`, `c5-6 r1-3` — useful for checking
against the image, not for declaration.

## 4. Corner arrangement

The arrangement is the interesting part. Three deliberate devices:

**4.1 A pinched diagonal shell.** The canvas silhouette is square at **TL**
(cell A corner 1) and **BR** (cell F corner 3), rounded at TR and BL. Measured
by edge extension — how far cream runs along the canvas edge inward from each
corner: TL 0 px, BR 0 px, TR 21 px, BL 24 px. A rectangle with two opposite
square corners reads as a wedge aimed down the top-right-to-bottom-left
diagonal — the composition points rather than sits.

**4.2 A hidden seam.** D, E1 and E2 meet with *all four* corners squared
(D `[3,4]`, E1 `[1,2]`, E2 `[1,2]`). Nothing is visible along that boundary:
the horizontal probe at r1/r2 across columns 5–8 returns **0 cream pixels**,
and the vertical probe at c3 row 2 likewise returns 0. So D + E1 + E2 read as
one uninterrupted 4 × 6 column of image, split only where the eye chooses to
look. The blocks are structural, not visual.

**4.3 Split only at the bottom.** E1 and E2 share that invisible top edge but
separate visibly at the bottom — E1/E2 corners 3 and 4 are both rounded, so
notches appear at (c3, r3) and (c4, r3). The middle column therefore reads as
one tall form that forks into two near the baseline.

The left column (A, B, C) is the mirror of this: every boundary is visible
(A `[1]` only, B none, C `[3]` only), so it reads as three stacked bars, while
the middle reads as one column and the right as one slab.

**Full corner table** (R = rounded ≈27 px, S = square, measured at tolerance 8/10/12/14 — all three agree):

| Cell | TL | TR | BR | BL |
|---|---|---|---|---|
| A | **S** | R 28 | R 26 | R 28 |
| B | R 27 | R 27 | R 26 | R 27 |
| C | R 28 | R 28 | **S** | R 28 |
| D | R 25 | R 27 | **S** | **S** |
| E1 | **S** | **S** | R 27 | R 21–26 |
| E2 | **S** | **S** | R 27 | R 26 |
| F | R 26 | R 27 | **S** | R 26 |

Nine square corners, nineteen rounded. Every rounded corner produces a notch
that was found; no notch was found that the model does not predict.

## 5. Mask vs crop — the deciding evidence

The seam-continuity test compares the tone step *across* each tile boundary
against the distribution of 1 px steps *inside* the image (the control,
p50 = 0.0, p90 = 4.7 mean-abs-RGB).

| Boundary | Median step | Verdict |
|---|---|---|
| A \| B (h r1, cols 1–2) | 0.0 | continuous |
| B \| C (h r2, cols 1–2) | 0.0 | continuous |
| A \| D (v c2, row 1) | 81.0* | subject edge |
| B \| D (v c2, row 2) | 3.0 | continuous |
| C \| E1 (v c2, row 3) | 1.0 | continuous |
| E1 \| E2 (v c3, row 3) | 0.0 | continuous |
| D \| F (v c4, row 1) | 0.0 | continuous |
| E2 \| F (v c4, row 3) | 0.0 | continuous |

\* The high value at c2/row 1 is not a seam. A raw scan shows a ~10 px dark
stripe (luminance 12–30) that drifts from x 448 at y 422 to x 477 at y 662 and
runs the full height of the band — a dark subject edge in the photograph, not
a boundary between two images. Where the stripe is absent (rows 2 and 3) the
same boundary measures 1–3, indistinguishable from the control.

Every boundary is continuous with the control ⇒ **one shared image, mask
finish** (§7 invariant 3). The nine square corners are what makes this legible:
squared corners are only needed where a tile must *not* announce itself.

## 6. Exclusions and false positives

- **Full-bleed side panels.** Content continues past the content column to both
  page edges (x 0–152 and 1047–1199), separated by 32 px cream gutters. These
  are warm, low-contrast, and run the *full page height* (y 1–2674) — a
  background plate, not part of the hero canvas. Excluded.
- **Photo-tone blobs.** The band contains 3 519 cream pixels in 13 components of
  ≥ 60 px. Eleven hug a grid vertex within 5–14 px — those are the notches the
  model predicts. Two do not: 248 px centred at (600,552) and 113 px at
  (732,538), which sit **37 px and 30 px** from the nearest vertex. A flush
  mosaic with radius 27 cannot place cream that far from a corner — the notch
  lives inside the 27 × 27 box at the vertex — so these are bright warm
  highlights in the photograph, not gutters. They are also compact (aspect 1.38
  and 1.06) rather than elongated along the seam as a real gutter would be, and
  leaf-shaped with soft JPEG edges.
  Note what is *not* the test: both blobs lie on a vertical seam line (0–7 px
  in x), so seam proximity proves nothing — colour alone would have passed them
  as cream. Colour uniformity is a weak corroborator only: page cream deviates
  from the nominal cream by 0.67 mean-abs, genuine notch interiors by
  1.7–2.5, these blobs by 2.9–3.8. The tolerance band clips the spread, so the
  gap is real but small. **Vertex distance is the decisive argument.**
  Residual accounting: of the 592 px the model leaves unexplained, 361 px are
  these two blobs. The remaining 231 px is template under-fill — 110 px at
  (466,537), where two rounded corners (A.BR, B.TR) share vertex (c2,r1) and
  their notches merge into an hourglass the single-corner template does not
  model, plus 121 px spread over 98 sub-60 px antialiasing fragments along the
  arc edges. No unexplained cream lies anywhere that would indicate a missed
  tile boundary.
- **No text overlay** in the canvas. At luminance > 200 the band yields 45
  components, of which 12 are glyph-sized (5–60 px), and no more than **3** of
  those share a 20 px row band. A caption is a run of glyphs on one baseline —
  10–20 components at a single y. The distribution is that of scattered photo
  highlights, not type.
- **E2 is image, not an ink card.** Its interior reads (13,10,3) with σ ≈ 2,
  which is flat enough to look like a solid surface — but the blue/red channel
  ratio is 0.25, whereas the site's ink-900 is 0.81. It is a near-black *photo*
  shadow that happens to be smooth. Its luminance floor matches adjacent dark
  photo blocks (33 % of photo blocks are flatter). Classified `mask`.

## 7. Reproduction in bento vocabulary

Request form, per `spec-bento.md` §11 grammar (canvas → cells → density → content):

```
Canvas 12 cols × 6 rows, unit ratio 0.772, radius 27px (3.3% of canvas width)
  c1-4  r1-2   field  mask   r0:[1]        alt: <shared image description>
  c1-4  r3-4   field  mask
  c1-4  r5-6   field  mask   r0:[3]
  c5-8  r1-4   field  mask   r0:[3,4]
  c5-6  r5-6   block  mask   r0:[1,2]
  c7-8  r5-6   block  mask   r0:[1,2]
  c9-12 r1-6   field  mask   r0:[3]
Density flush
Content one shared image across all seven cells (mask)
```

Mask offset math, from invariant 5 with C = 12, R = 6:

| Cell | maskCols × maskRows | maskX, maskY | img width × height | offset left, top |
|---|---|---|---|---|
| A | 4 × 2 | 0, 0 | 300 % × 300 % | 0 %, 0 % |
| B | 4 × 2 | 0, 2 | 300 % × 300 % | 0 %, −100 % |
| C | 4 × 2 | 0, 4 | 300 % × 300 % | 0 %, −200 % |
| D | 4 × 4 | 4, 0 | 300 % × 150 % | −100 %, 0 % |
| E1 | 2 × 2 | 4, 4 | 600 % × 300 % | −200 %, −200 % |
| E2 | 2 × 2 | 6, 4 | 600 % × 300 % | −300 %, −200 % |
| F | 4 × 6 | 8, 0 | 300 % × 100 % | −200 %, 0 % |

Radius as a token: 27 px on an 829 px canvas is 3.26 % of width. The site's
`--radius-media` is `1.5rem` = 24 px at a 16 px root (25.5 px at the 17 px
≥640px root). At the reference's own canvas width the two are within ~2 px, so
`--radius-media` reproduces this composition without a new token.

## 8. How this differs from the built hero

| | Built (`spec-bento.md` §9.1) | reference01 hero |
|---|---|---|
| Substrate | 12 × 4 | 12 × 6 |
| Unit ratio | 1 (square) | 0.772 (sub-square) |
| Cells | 7 | 7 |
| Area | 48 | 72 |
| Column rhythm | 1 + 4 + 4 + 3 | 4 + 4 + 4 (three equal thirds) |
| Density | flush | flush |
| Finish | mask, one image | mask, one image |
| Canvas silhouette | rounded TR/BL only | **square TL and BR** — pinched diagonal |
| Square-corner count | 12 of 28 | 9 of 28 |

Two things the reference does that the built hero does not:

1. **A fractional unit.** The built canvases all use ratio 1. The reference's
   0.772 is a deliberate per-canvas override (`spec-bento.md` §3.2), and it is
   what buys the 2.59:1 letterbox band from a 6 × 3 rhythm.
2. **A hidden seam.** D/E1/E2 use squared corners to fuse three cells into one
   visual column. The built hero squares corners only to close the shell. This
   is a new compositional device, not a new vocabulary term.

**Open decision (Dale):** adopt the reference composition as the hero, keep the
built 12 × 4, or lift only the pinched-diagonal shell onto the current hero?
Tracked as `_tasks/20261007-001`. Nothing in `spec-bento.md` needs to change to
express this layout — the vocabulary already covers it, which is the point.
