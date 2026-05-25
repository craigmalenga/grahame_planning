# Layout / Scale / Whitespace Critique — Planning Application Pack

Flat 1, 20 Hornton Street, London W8 4NR — A3 landscape sheets, reviewed from rendered PNGs at `/home/user/grahame_planning/drawings/output/png/`.

Scope: page layout, scale, margins, whitespace and title-block conflicts ONLY. Drawing content correctness is out of scope.

Tags: **BLOCKER** (must fix before issue), **IMPORTANT** (should fix), **COSMETIC** (nice to have).

---

## Sheet 01 — Cover / Drawing Index (`01_cover_index.png`)

- **BLOCKER — Status box collides with the Scale column of the index table.** The amber "STATUS / FOR PLANNING — DRAFT" box is positioned over the right-hand portion of the index, partially obscuring the scale values (`1:50`, `1:50`, …). The first row entry "this sheet" appears inside the status box, suggesting the box has been dropped onto the scale column rather than into a reserved zone. Move the status box up into the empty band between the project title and the index header (currently ~40% of the page height is unused vertical whitespace there), or shift it to the bottom-left below the REPLICABILITY block.
- **IMPORTANT — Title block is being trimmed at the bottom edge.** The "UNITS / STATUS" row of the title block is clipped against the black bottom border (text "FOR PLANNING" partially overprinted by the border bar). Raise the title block ~6 mm or shrink the bottom-margin band.
- **IMPORTANT — Cover sheet drawing area is empty.** A cover sheet on an A3 landscape is acceptable as text-only, but the whitespace above the index (rows ~70–130) and the right-hand third of the page are wholly empty. Either add a small key plan / locator thumbnail to the right of the project title, or rebalance the index to span more vertical space.
- **COSMETIC — Index column widths are unbalanced.** TITLE column is wide but most titles are short; SCALE column is narrow and the rightmost edge of the scale values almost touches the status box. Re-balance: TITLE 55%, SCALE 15%, leave a 30% reserve column for the status box.
- **COSMETIC — Body text "DRAWING INDEX (this sheet)" duplicates the SCALE column entry "this sheet"** — the latter is actually a misplaced value. Remove it from the scale column.
- **COSMETIC — Rev/date stamp ("Rev. A — 2026-05-25") sits inside the status box** which works, but the font is noticeably smaller than the row text; bump from ~6pt to ~8pt.

## Sheet 02-A — Existing Rear Courtyard Plan (`02_courtyard_plan_existing.png`)

- **IMPORTANT — Drawing dwarfed by whitespace.** The plan footprint (3250 × 2950 mm) at 1:50 occupies roughly the centre-left third of the sheet; ~45% of the sheet area to the left of the drawing and below it is empty. At 1:25 the plan would still fit (it would be ~130 × 118 mm on paper) and would double the legibility of the L-shape recess detail. **Recommend rescaling to 1:25.**
- **IMPORTANT — Dimension text is overprinted on itself in the recess zone.** The "510 / 600 / 510" stack at the top of the kitchen-side recess collides with the small "260 / 1230 / 170" stack just below it; the labels run into the hatch. At 1:25 the labels would have room to separate.
- **IMPORTANT — "Kitchen window above / GROUND FLOOR …" callout overruns the drawing edge** and the text is illegible in the rendered PNG (overlaps with the right-hand brick cheek). Move the callout into the empty whitespace to the right of the plan and add a leader line.
- **COSMETIC — North arrow is placed top-centre, scale bar bottom-left, title block bottom-right** — consistent and fine; keep this pattern.
- **COSMETIC — Top and left margins of the drawing zone are ~3× the right and bottom margins.** Re-centre the plan within its drawing zone (excluding the notes panel and title block).

## Sheet 02-B — Proposed Rear Courtyard Plan (`02_courtyard_plan_proposed.png`)

- **BLOCKER — "PROPOSED reclaimed cast-iron spiral staircase" callout collides with the south dimension line.** The callout sits in front of the "3250" overall-width dimension and its leader, making both unreadable. Move callout up into the empty band immediately above the plan, or shift it to the right margin with a longer leader.
- **IMPORTANT — Same scale problem as 02-A.** The staircase circle (Ø1750 envelope) is only 35 mm across at 1:50 — tread numbers 1–14 are crammed and overlap. Rescale to 1:25 (envelope becomes 70 mm; tread numbers legible) or add a 1:20 enlarged inset.
- **IMPORTANT — "950" / "950" radius dimensions inside the staircase circle overprint the tread fan.** Move them to outside the envelope with leaders.
- **COSMETIC — Notes panel content is identical to 02-A but the panel is in the same location; consider a single shared notes panel and use 02-B only for proposed-specific notes.**

## Sheet 03-A — Existing Side Wall Elevation (`03_side_wall_elevation_existing.png`)

- **IMPORTANT — Drawing is a tall narrow strip occupying only ~18% of the sheet width.** The wall is 3000 mm long × 6250 mm tall; at 1:50 this is 60 × 125 mm on paper, leaving a vast empty central band. Rotate the title "view from the courtyard…" out of the drawing zone or, better, **rescale to 1:25** (drawing becomes 120 × 250 mm — still fits A3 landscape comfortably and uses ~45% of the area).
- **IMPORTANT — View-direction label "(view ⟶ FROM the courtyard, looking E at the kitchen-side wall) ⟶" is mid-page floating** with no anchor to the drawing. Move tight to the drawing top with a single arrow, or to the notes panel as item 1.
- **COSMETIC — Dimension stack on the left (3250 / 1600 / 900 / 6250 overall) is fine but the dimension witness lines extend further left than the scale bar** — tidy alignment.
- **COSMETIC — "Existing C.I. downpipe / copper top right / 24° lean…" annotation text is too small to read in the rendered PNG.** Bump the annotation font from ~6pt to ~8pt.

## Sheet 03-B — Proposed Side Wall Elevation (`03_side_wall_elevation_proposed.png`)

- **BLOCKER — "PROPOSED: Kitchen window converted to glazed doorway (top of staircase)" callout box overlaps the elevation upper window.** It is placed directly on top of the existing-window glazing. Push the callout right by ~40 mm into the central whitespace with a clean leader.
- **BLOCKER — Spiral-staircase superimposition annotations are unreadable** — multiple lines of red text ("staircase shown semi-transparent — silhouette as square-on") sit on top of the staircase silhouette and on top of the brick cheek text. The lower-left red "1 m/scale in staircase" label overprints the brick course. Relocate all proposed (red) annotations to the right margin with leaders.
- **IMPORTANT — Same scale issue as 03-A.** Rescale to 1:25.

## Sheet 04-A — Existing Rear Wall Elevation (`04_rear_wall_elevation_existing.png`)

- **IMPORTANT — Drawing is again a narrow strip (3250 × 7300 mm at 1:50 ≈ 65 × 146 mm).** Approximately 50% of the sheet is whitespace. Rescale to **1:25 or 1:20** — a 1:20 drawing would be 162 × 365 mm which still fits.
- **IMPORTANT — "Existing rear reception multi-pane sash 2100 × 2200" callout sits inside the window pane** — the text overprints the muntins/glazing-bar lines and is hard to read. Move out of the drawing.
- **COSMETIC — "← E / W →" compass markers are duplicated and slightly misaligned vertically.** Combine into a single banner.

## Sheet 04-B — Proposed Rear Wall Elevation (`04_rear_wall_elevation_proposed.png`)

- **BLOCKER — Two red callout boxes ("PROPOSED spiral staircase shown superimposed…" and "1 reticulate / m staircase") stack vertically in the upper-left and both overrun the elevation outline.** The upper box clips the top of the upper sash window; the lower box overprints the central doorway head. Move the upper callout into the left whitespace; move the lower one to the right margin.
- **IMPORTANT — Scale 1:50 is too small for this view.** Rescale to 1:25 minimum.
- **IMPORTANT — Title cell "PROPOSED REAR WALL ELEVATION — south wall of courtyard" overruns the DRAWING TITLE row.** The text touches the right border of the title cell. Either wrap at "ELEVATION" (so "south wall of courtyard" is on line 2) or shorten to "PROPOSED REAR WALL ELEVATION (south)".

## Sheet 05-A — Existing Courtyard Section A-A (`05_courtyard_section_existing.png`)

- **IMPORTANT — Drawing uses left half of sheet only.** The section + boundary wall is wide but the empty zone left of the boundary wall is ~25% of the page and contains only the label "Existing courtyard (no staircase)". Either centre the drawing within its zone or shift everything right and widen the notes panel.
- **IMPORTANT — No section cut symbol or A-A marker visible on the section drawing itself** (only in the title). Add the A-A directional indicator on at least one plan and reference it here.
- **COSMETIC — "Lower basement double doors invisible in section" callout floats with no leader.**
- **COSMETIC — Scale bar position at bottom-left is fine but the bar itself is short relative to the drawing scale; extend to show 0–5 m.**

## Sheet 05-B — Proposed Courtyard Section A-A (`05_courtyard_section_proposed.png`)

- **BLOCKER — "New doorway in side wall (behind, dashed); kitchen window converted to glazed timber door" callout overprints the spiral staircase profile in the section.** Move to the right whitespace with leader.
- **IMPORTANT — Dimension witness lines on the left ("3000 staircase / 3000 slab / total / basement floor") overlap each other.** Re-tier them: outermost = overall, middle = floor-to-floor, inner = component.
- **IMPORTANT — Section heading "SECTION A-A — through centre of spiral staircase, looking WEST" placed above drawing is good** — keep this pattern; apply to 05-A which currently lacks it.

## Sheet 06 — Spiral Staircase Detail 1:20 (`06_staircase_detail.png`)

- **GOOD — Best-laid sheet in the pack.** Plan + developed elevation pair uses the upper half well; schedule + installation notes fit cleanly in the lower-right; title block does not conflict with anything.
- **COSMETIC — Schedule table header "16 (14 risers × 200 mm + 1 landing pad) — 1750 ÷ envelope dia" overruns the value column.** Wrap at the en-dash.
- **COSMETIC — Vertical dimension "900 handrail / 3000 stair rise / 14 × 201" left of the elevation has witness-line overlap with the riser ticks.** Move stack 10 mm further left.
- **COSMETIC — "Treads side-projected from centre pole" subtitle is small; raise to match "ELEVATION (developed)" header weight.**

## Sheet 07-A — Existing Internal Opening (`07_internal_opening_existing.png`)

- **IMPORTANT — Two small drawings (elevation 1:50 and plan 1:75) are widely separated** with ~40% of the sheet width between them as empty whitespace. Either push them together (elevation on left, plan immediately to its right) and widen the notes panel to fill the gap; or set both at 1:25 to genuinely fill the available area.
- **IMPORTANT — Mixed scales on one sheet (1:50 + 1:75) is permitted but the scale bar at the bottom only shows 1:50.** Add a second scale bar for the 1:75 plan, or harmonise both views to a single scale.
- **COSMETIC — "FRONT LOUNGE side (viewer's side) / (reception is behind)" is wrapped awkwardly and overprints the elevation edge.** Move clear of the wall outline.

## Sheet 07-B — Proposed Internal Opening (`07_internal_opening_proposed.png`)

- **BLOCKER — Red "PROPOSED enlarged opening clear 1350 × 2950 (subject to structural engineer)" annotation overprints the opening outline** and the small dimension stack "700 / 1350 / 600" below. Move into the right whitespace.
- **BLOCKER — Steel-beam annotation in the plan view ("600 / 1350 / 700" with vertical text) is overprinted by the dashed beam line.** Place dimensions outside the room outline.
- **IMPORTANT — Same scale / whitespace observation as 07-A.**

## Sheet 08-A — Existing Kitchen Plan (`08_kitchen_bathroom_existing.png`)

- **BLOCKER — Drawing is tiny.** Kitchen 2400 × 2900 mm at 1:50 is 48 × 58 mm on paper — about 4% of the available drawing area. The room labels ("EXISTING KITCHEN 2400 × 2900 ceiling 2450") barely fit inside the room outline. **Rescale to 1:25 (96 × 116 mm — 14% of area) or 1:20 (120 × 145 mm — 22% of area).** 1:20 strongly recommended for plumbing layout sheets.
- **IMPORTANT — Vertical dimension "2400 / COURTYARD (to west)" on the left is overprinted on itself** — the witness lines bunch because the drawing is too small for two-tier dimensioning.
- **COSMETIC — North arrow is centred above the drawing but the drawing is in the lower-left quadrant; the arrow floats high.** Drop the arrow to within ~20 mm of the drawing.

## Sheet 08-B — Proposed Kitchen + Shower Plan (`08_kitchen_bathroom_proposed.png`)

- **BLOCKER — Scale is unworkable for the proposed layout.** At 1:50 the shower (1000 × 900), WC zone, basin and laundry are each ~20 mm boxes; the labels SHOWER / WC / BASIN / LAUNDRY overprint each other and the partition lines. **Rescale to 1:20 minimum, 1:10 ideal.** This is the single worst legibility issue in the pack.
- **BLOCKER — "Pocket / sliding door" callout in the top-left corner is unreadable** — text overprinted by the kitchen wall and by the red "New door" annotation.
- **IMPORTANT — Red callouts for new door / partition overprint each other.**

## Sheet 09 — Site & Street-Context Plan (`09_site_plan.png`)

- **IMPORTANT — Two scales on one sheet (1:200 zoom, 1:500 terrace) — only the 1:500 scale bar is shown.** Add a 1:200 scale bar to the upper-left zoom view.
- **IMPORTANT — Upper-left zoom diagram is very narrow and tall; ~60% of the upper-half whitespace is empty.** Either rotate the No.20 footprint to landscape and enlarge, or move the notes panel up to fill the upper-right and bring the terrace plan up.
- **COSMETIC — Notes block sits in the upper-right but the lower-right is empty until the title block.** Move notes lower-right; put a key (subject / consented precedent / conservation area boundary) in the upper-right instead.
- **COSMETIC — "↖ Horriton Place / Central Library" annotation under the terrace is barely visible (small grey italic).** Bump weight.

## Sheet 10 — 3D Axonometric: Rear Courtyard (`10_courtyard_3d.png`)

- **IMPORTANT — Title block bottom row clipped by black border bar** (same as Sheet 01) — text "FOR PLANNING" overprinted. Raise title block ~6 mm.
- **IMPORTANC — Axonometric occupies left ~55% of the sheet; viewing notes + palette panel occupy right ~25%; gap between them is generous.** Acceptable but the axo could be enlarged 20% without colliding with the notes.
- **COSMETIC — "Image is rendered from 'dimensions.yaml'; adjust YAML → regenerate." is process documentation, not a drawing note** — move to the cover sheet replicability section.

## Sheet 11 — 3D Axonometric: Shower-Room (`11_bathroom_3d.png`)

- **IMPORTANT — Same title-block-clipping issue as 01 and 10.** Raise title block.
- **COSMETIC — Axonometric is well-sized and centred; notes panel is balanced.** This sheet's whitespace is reasonable.
- **COSMETIC — "FITTINGS (left → right)" — the arrow uses a right arrow but the items are listed top-to-bottom in the bullet list. Use "FITTINGS (top → bottom)" or rearrange to horizontal.**

## Sheet 12 — 3D Axonometric: Internal Opening (`12_opening_3d.png`)

- **IMPORTANT — Same title-block-clipping issue.**
- **IMPORTANT — Axonometric is small relative to the sheet (~40% of width).** Enlarge by 25–30%; there is empty whitespace on all four sides.
- **COSMETIC — "Beam zone (orange): ~250 mm deep (final size by engineer)" — good caveat; keep.**

---

## Cross-sheet observations

1. **Title block is clipped on at least 4 sheets (01, 10, 11, 12)** — a single template fix would resolve all of them. Likely the title block's bottom edge is positioned at exactly the sheet border, with no margin allowance for the printer's edge bar.
2. **1:50 is the default scale on 8 of 12 drawn sheets but is too coarse for the actual subjects** (a 3 m wall = 60 mm; a 2.4 m room = 48 mm). Pack-wide rescale recommendation:
   - Sheets 02, 03, 04, 05 → 1:25
   - Sheet 08 → 1:20 (plumbing detail) or 1:10
   - Sheet 07 → 1:25, with both views at the same scale
3. **Red (proposed) annotation callouts consistently overprint drawing geometry** on 02-B, 03-B, 04-B, 05-B, 07-B, 08-B. A standard practice of placing all proposed annotations in the right-hand notes column with leader lines into the drawing would solve this.
4. **Margins are inconsistent:** outer sheet border is generous (~15 mm) but the drawing-zone interior margins vary wildly between sheets — the drawing floats wherever it happens to land in the rendered viewport. Define a fixed drawing-zone rectangle (e.g. x: 15–290 mm, y: 15–195 mm, leaving x: 295–405 mm for notes and y: 200–290 mm for title block) and centre every drawing within that rectangle.
5. **Scale bars** are present on all drawn sheets but only show the primary scale. On sheets with mixed scales (07, 09) add per-view scale bars adjacent to each view.

---

## 200-word executive summary — 10 worst layout / scale issues

1. **Sheet 08-B (Proposed kitchen + shower) is unreadable at 1:50.** Shower, WC, basin and laundry zones are each ~20 mm boxes with overprinting labels. Rescale to 1:20 or 1:10 — this is the worst legibility failure in the pack.
2. **Sheet 02-B — "PROPOSED reclaimed spiral staircase" callout sits on top of the 3250 mm dimension** and its leader, obscuring both. Move callout out of the dim-line zone.
3. **Sheet 01 — Status box is dropped over the Scale column of the index table**, partially hiding scale values. Move the status box into the empty band above the index.
4. **Sheets 01, 10, 11, 12 — title-block bottom row is clipped by the sheet border** ("FOR PLANNING" overprinted). Template-level fix: raise title block ~6 mm.
5. **Sheets 02, 03, 04 use 1:50 for small subjects**; drawings occupy only ~15–20% of the available sheet area. Rescale to 1:25 pack-wide.
6. **Sheet 04-B — two red callout boxes overrun the elevation outline** and clip windows. Move to right margin with leaders.
7. **Sheet 03-B — proposed-staircase red annotations are unreadable** (stacked text over the silhouette).
8. **Sheet 07-A/B — elevation and plan placed far apart with empty middle**; mixed 1:50 + 1:75 with single scale bar.
9. **Sheet 05-B — dimension witness lines overlap each other** on the left tier; re-tier them.
10. **Sheet 09 — 1:200 zoom lacks its own scale bar** and floats narrow against generous whitespace.
