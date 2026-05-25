# Drawing Critique — Flat 1, 20 Hornton Street

Reviewer pass dated 2026-05-25, against rendered PNGs in
`/home/user/grahame_planning/drawings/output/png/` and the parametric
source `/home/user/grahame_planning/drawings/dimensions.yaml`.

Classifications:
- **BLOCKER** = wrong geometry / wrong address / will get the application
  refused or returned. Must fix before submission.
- **IMPORTANT** = should fix before submission — incorrect dimension,
  inconsistency between sheets, missing required information.
- **COSMETIC** = polish for board presentation — overlaps, label clarity,
  formatting.

---

## Sheet-by-sheet findings

### Sheet 01 — Drawing Index / Cover

- **BLOCKER**: Client name shown as "G. Pearce" in the title block and again
  under "STATUS" in the right-hand box. Per Craig's correction #6 the client
  is **"Grahame McGirr"**. Wrong client name on a submitted planning pack is
  fatal.
- **IMPORTANT**: A north arrow is shown top-right of the cover sheet. Per
  Craig's correction #7, N arrows should be on plans only — this is a cover
  sheet (not a plan) and should not carry a north arrow.
- **IMPORTANT**: Sheet revision is shown as "A — 2026-05-25" but most title
  blocks elsewhere just say "A". The list of drawings references 05-A and
  05-B at "1:50" but Sheet 05 itself shows scale "1:50 @ A3" which is
  consistent — however the index row 05 is partially obscured by the
  overlapping status box (right side). Fix the box's horizontal placement so
  it does not overlap the 1:50 column.
- **COSMETIC**: The "STATUS / FOR PLANNING — DRAFT / Rev. A — 2026-05-25"
  panel sits over the scale column for rows 02-05, obscuring "1:50" for
  several drawings. Move the panel down (below the index table) or to the
  right margin.
- **COSMETIC**: The "REPLICABILITY" paragraph mentions
  `python3 drawings/src/render_all.py` — fine for an internal note but should
  be removed or moved to a separate technical-notes sheet before issue to
  RBKC.

### Sheet 02-A — Existing Rear Courtyard Plan

- **BLOCKER**: North arrow in the top-right shows **N pointing up**, but
  the rear wall (at the top of the drawing) faces **NE** per Craig's
  correction #5. The N arrow direction is wrong; it should be rotated
  ~45° clockwise (so that the top of the drawing = NE, and N points
  approximately to the upper-right corner of the sheet).
- **BLOCKER**: Client name "G. Pearce" in the title block — should be
  "Grahame McGirr".
- **IMPORTANT**: A second N indicator labelled "N ↑" floats next to the
  plan view itself (in addition to the title-block one). Two N arrows on
  one sheet is confusing. Pick one (the floating one near the plan is more
  useful) and remove the other.
- **IMPORTANT**: The lower-basement door bay annotation reads
  "Central door + 2 flanking sash windows (all under one flat arch)" —
  text correct per Craig's correction #1 — but the annotation is partially
  overlapped by the dimension "1850" below it and by the recess hatching.
  Move the label clear.
- **COSMETIC**: The right-hand side wall has very tight label stack
  ("510 / 600 / 490 / 1230 / 170") plus the proposed-window callout text
  ("Kitchen window above; bricked-up window below; existing glass window
  below; (basement, retain)") all overlapping each other. The notes panel
  bleeds into the same area. Increase margin between the plan and the
  notes panel.
- **COSMETIC**: The cardinal labels around the plan boundary (the
  hatching to north / west) could use small N / S / E / W cardinal letters
  on the four edges to make the orientation unambiguous to a planning
  officer who is reading at 1:50 on paper.

### Sheet 02-B — Proposed Rear Courtyard Plan

- **BLOCKER**: Same wrong N-arrow direction as 02-A — needs rotation to
  show NE-facing rear wall.
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: The spiral-staircase plan is shown nicely tucked into the
  inside corner of the L (top-right of the slab), centred 950 mm from each
  wall — but the two "950" leader-line dimensions both run roughly through
  the staircase tread numbers, making the inner treads hard to count. Move
  the dimension extension lines outside the staircase footprint.
- **IMPORTANT**: The new proposed downpipe (rationalised position) is
  noted in the YAML (`proposed.downpipe.new_position_from_north_corner_mm:
  2950`) but does not appear to be drawn or labelled on this proposed
  plan. Add a small circle / "new DP" callout at the south-east corner of
  the side wall.
- **COSMETIC**: Stair tread numbers 1-14 are very small at the rendered
  size; consider showing only every 3rd or 4th tread number, or using a
  larger font for the tread labels.

### Sheet 03-A — Existing Side Wall Elevation (kitchen side, east wall)

- **BLOCKER**: The existing downpipe is drawn as a **single short straight
  vertical segment with a short kink at the top**. Per Craig's correction
  #3 the actual existing pipe routes:
  1. Vertical down from a hopper at parapet level on the **right-hand
     (north / inside-corner) end** of the wall,
  2. down to about the bottom of the upper kitchen window,
  3. then sloped at ~40° leftward,
  4. to between the bricked-up window and the glass basement window,
  5. then vertical down to the courtyard slab.
  Currently the drawing does not show this multi-bend route — it has to,
  to justify the proposed simplification.
- **BLOCKER**: This elevation is the only place the **left-corner rear-wall
  downpipe** would also appear in profile (because the rear-wall left
  downpipe is at the inside corner of the L, viewed obliquely from this
  side). Per Craig's correction #2, the LEFT rear-wall downpipe **should
  only be shown on the side-wall elevation** (not on the rear-wall elev) —
  but it does not appear here at all. Add it, in profile / partial.
- **IMPORTANT**: N arrow in title-block corner. Per Craig's correction #7,
  N arrows are for plans only — remove from this elevation.
- **IMPORTANT**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: The dimensions stack on the left side ("3270", "white-line
  / to FFL", "6070 (overall)", "1600", "900", "courtyard slab") all sit on
  top of each other with text crossing leader lines. Extend the dimension
  ladder further left so the labels have room.
- **IMPORTANT**: The "+2820" head-of-upper-kitchen-window callout and
  "Existing cast-iron downpipe" label overlap with the pipe symbol itself.
- **COSMETIC**: The hatching at the top "Existing cast-iron downpipe"
  rectangle looks like a solid block — could be drawn as a circular pipe
  in plan-on-section.
- **COSMETIC**: The view-direction note "Viewed FROM the courtyard, looking
  EAST at the kitchen-side wall" runs into the dimensioning. Move it
  clear.

### Sheet 03-B — Proposed Side Wall Elevation

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on an elevation — remove (correction #7).
- **IMPORTANT**: The proposed (rationalised) downpipe is shown as a single
  vertical run on the right edge — good. But the label "Downpipe
  RATIONALISED rerouted clear of new doorway & staircase" is squeezed into
  the kitchen-window-doorway frame area, overlapping with the
  PROPOSED-doorway red callout box. Move the downpipe label to the right
  margin.
- **IMPORTANT**: The proposed kitchen-window-to-doorway extension is shown
  but the dimension `_drop_amount_mm: 720` (i.e. how far the sill drops)
  is not annotated on the drawing. Add a vertical dimension between the
  old sill line (dashed) and the new threshold.
- **IMPORTANT**: The lower bricked-up opening is annotated "Existing
  bricked-up opening" in the EXISTING (03-A) sheet but on the PROPOSED
  (03-B) sheet the same area is shown as the reinstated sash window —
  there is no dashed indication of the as-existing condition on the
  proposed sheet, which is standard practice for "existing dashed / new
  solid" planning convention.
- **COSMETIC**: The red PROPOSED callout box ("Kitchen window converted to
  glazed doorway (top of staircase)") is large and overlaps the
  yellow-stock brick fill. Make it smaller / move to the margin.

### Sheet 04-A — Existing Rear Wall Elevation

- **BLOCKER**: The lower-basement opening composition is shown
  approximately correctly (central door + 2 side glazed panels under one
  flat arch) — **but the two flanking sash windows are drawn with their
  glazing extending all the way down to the slab/threshold, with no
  raised brick sills**. Per Craig's correction #1 the side windows have
  **raised brick sills**
  (`rear_wall.lower_basement.side_window_raised_sill_height_mm: 600`),
  so a 600 mm brick panel should be drawn below each side window. This
  is critical — the photo (`shared image (14).jpg`) clearly shows the
  raised brick sills.
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on an elevation — remove (correction #7).
- **IMPORTANT**: Per Craig's correction #2, the rear elevation should
  show only ONE downpipe (the right-hand one). The current drawing
  appears to show no downpipe in the existing rear elevation at all —
  but the YAML defines `downpipe_rear_wall_right` at 2900 mm from the
  east corner. Add it to the rear elevation (right of door bay).
- **IMPORTANT**: The "E ←" "→ W" cardinal arrows above the wall would be
  correct for a south-facing wall but per Craig's correction #5 the
  rear wall faces NE, so the wall axis runs NW-SE. The left/right labels
  should read "← NW / SE →" (or similar) to match the corrected
  orientation. Same fix needed on 04-B.
- **IMPORTANT**: The recess-internal dimensions (25 + 450 + 25 + 900 + 25
  + 450 + 25 = 1900 mm) total **50 mm more** than the recess width
  (1850 mm) — the YAML flags this as `_status_arithmetic` to be
  re-measured. The discrepancy needs resolving before submission, or a
  "DIMENSIONS SUBJECT TO SITE RE-MEASURE" note added to the drawing.
- **IMPORTANT**: "Central door 900 / side window 450 / 450" labels inside
  the 1850 mm recess are extremely cramped at 1:50.
- **COSMETIC**: The "2400 / 900 / 2900" left-side dimension stack
  overlaps; same fix as Sheet 03-A.
- **COSMETIC**: The "Existing rear reception multi-pane sash 2100 ×
  2400" label inside the upper sash bleeds into the glazing-bar grid.
  Move outside the window.

### Sheet 04-B — Proposed Rear Wall Elevation

- **BLOCKER**: The spiral-staircase silhouette is drawn on the **RIGHT**
  side of the door bay. Per Craig's correction #4 it must be **tight to
  the LEFT** (inside corner of the L = east end = viewer's left when
  looking south at the rear wall). This is the most visible single
  mistake in the pack.
- **BLOCKER**: Per Craig's correction #4 the silhouette should also
  **extend higher** — currently it stops at roughly the head of the
  basement door bay. The central pole is 3300 mm (above slab) and the
  envelope reaches ~2814 mm + landing — so the silhouette should rise
  past the upper-sash sill (3800 mm above slab) before it ends, to make
  the over-courtyard presence legible.
- **BLOCKER**: Side-window raised brick sills not shown — same as 04-A.
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on an elevation — remove.
- **IMPORTANT**: The single retained right-hand downpipe should be
  annotated as "EXISTING RETAINED" so it's clear no change is proposed.
- **IMPORTANT**: The red "PROPOSED spiral staircase shown superimposed
  (semi-transparent) — this is the silhouette that visually obscures
  part of the rear wall when viewed squarely" callout is far too large,
  sits across the upper sash, and contains a typo / awkward phrasing.
  Reduce to ~3 lines and move to the right of the wall.
- **COSMETIC**: The "1 reveal (in staircase)" tag at the bottom-left is
  cryptic.

### Sheet 05-A — Existing Courtyard Section A-A

- **BLOCKER**: The "EXISTING" section drawing **shows the spiral
  staircase already in place**. The staircase is part of the proposal,
  not the existing condition. Either remove the staircase from 05-A, or
  re-title the sheet — but the planning convention is that EXISTING
  shows as-found, PROPOSED shows the intervention. As drawn, this is
  misleading and will be queried by RBKC.
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on a section — remove (sections, like
  elevations, are not plans).
- **IMPORTANT**: The "2814 staircase total rise" dimension on the far
  left is labelled even though staircase shouldn't be in the existing —
  remove with the staircase.
- **IMPORTANT**: The "+5270 / +6100 / +2820 / -2760" datum stack on the
  right edge is correct numerically but the small "ceiling +5270"
  ("kitchen ceiling" presumably) is at the same level as "reception
  ceiling +6100" in the same vertical strip — labels overlap.
- **COSMETIC**: The lower-basement door section is drawn as a single
  rectangle and labelled "Lower basement double doors visible in
  section". With the per-Craig-correction #1 (single door + 2 side
  windows), this caption needs updating too. The section probably cuts
  through the central door so it's fine in principle, but the caption
  should say "central door" not "double doors".

### Sheet 05-B — Proposed Courtyard Section A-A

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on a section — remove.
- **IMPORTANT**: This sheet now correctly shows the new doorway through
  the side wall (dashed, behind the section plane). Good. But because
  05-A already showed the staircase, there is **no visual difference**
  between the existing and proposed sections at a glance — just a
  dashed door outline added at the top of the staircase. Make the
  difference much more obvious: either remove the staircase from 05-A
  entirely, or add solid highlight (heavy line / colour) to the
  proposed-only elements on 05-B.
- **IMPORTANT**: The "5270" datum line label is positioned awkwardly;
  it's the kitchen-ceiling level on the right but the leader is hard to
  follow.
- **COSMETIC**: Title bar reads "PROPOSED COURTYARD SECTION A-A
  (showing spiral staircase)" — parenthetical is redundant if 05-A also
  shows the staircase. Reword to make the change obvious, e.g.
  "PROPOSED COURTYARD SECTION A-A — new doorway through side wall".

### Sheet 06 — Spiral Staircase Detail

- **BLOCKER**: N arrow on a detail sheet — remove (correction #7).
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: `rotation_per_tread_deg: 25.7` × 14 treads = 359.8° —
  i.e. essentially a **full 360° revolution** over the rise. That means
  the top landing tread arrives at the **same compass bearing as the
  first tread**. For the user this means: enter from one direction at
  the bottom and exit in the **same direction** at the top — which is
  fine **only** if the bottom-tread entry direction has been chosen to
  match the top-exit direction (into the kitchen). Currently
  `start_angle_deg: 270` ("first tread faces south-into-the-courtyard")
  — meaning the user steps onto tread 1 from the south. After 14 ×
  25.7° = ~360° they exit at the same angle (south) at the top — which
  means the kitchen door must be on the **south** side of the staircase
  centre. But per the YAML and the plan, the kitchen door (new doorway
  in the side wall) is on the **east** side of the staircase centre
  (the side wall is east). 360° rotation does not land the user
  pointing east. **This is a geometric error in the staircase setting
  out** — either reduce to ~13 treads (× 25.7° = 334°), increase the
  rotation per tread (e.g. 26.8°), or adjust the start angle. Worth a
  re-check with the staircase setting-out diagram.
- **IMPORTANT**: The plan view shows treads numbered 1-14 but the inner
  treads near the central pole are visually overlapping at this scale.
- **IMPORTANT**: The "Installation Notes" block runs off the bottom of
  the page — text is cut at "fit a small landing fix off-piece if pole
  varies by ~±25 mm" before the title block.
- **COSMETIC**: The "developed elevation" caption is fine but the
  treads-as-bars representation can be misread as a ladder. Add a
  faint helix line linking tread heels for clarity (already there but
  faint).

### Sheet 07-A — Existing Internal Opening (Front Lounge / Rear Reception)

- **BLOCKER**: N arrow on an elevation/plan sheet for an internal
  opening — the N arrow is misleading here because the wall in question
  runs across the building, not parallel to a cardinal direction shown.
  Either remove or clarify.
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: The plan (right side) shows "Front Lounge (ceiling
  3.28 m)" on the LEFT half and "Rear Reception (ceiling 3.28 m) (= 35
  cm wider)" on the RIGHT half. "Wider" should be qualified ("rear
  reception wider in plan by ~35 cm in the perpendicular direction")
  because as drawn both rooms look the same width on the plan. The
  overall "10100 (both rooms)" dimension is also unsourced — neither
  room's individual front-to-back length is stated.
- **IMPORTANT**: The dashed "EXISTING opening ~1120 × 2100" annotation
  inside the wall is fine but the existing opening height is flagged
  TBC in the YAML — should say "(TBC site re-measure)" on the drawing.
- **COSMETIC**: The "(viewer's side) / Rear reception is behind" note
  at top-right is helpful — good practice.

### Sheet 07-B — Proposed Internal Opening

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow — remove.
- **IMPORTANT**: The proposed clear opening reads 2400 mm, with retained
  nibs 700 mm (left) and 600 mm (right). 700 + 2400 + 600 = **3700 mm**,
  but the overall wall length is shown as **4340 mm**. There is **640
  mm of wall length unaccounted for**. Either the wall is shorter than
  4340 (subtract external-wall thicknesses) or the clear opening is
  larger than 2400. This same arithmetic problem is flagged in the YAML
  (`_clear_width_calculation`: "if wall is 4340 - external_walls (~700)
  = ~3640, then clear = ~2340 mm"). The drawing needs to reconcile —
  either reduce overall wall length to ~3640 or increase clear opening
  to ~3040. As drawn, the dimensions don't add up.
- **IMPORTANT**: The beam/lintel zone is hatched orange on the elevation
  ("proposed lintel" presumably). Annotate as "Steel beam — size by
  structural engineer" so the structural condition is unambiguous.
- **COSMETIC**: Dimension labels on the small plan (right) are very
  small — 600 / 700 / 2400 in tiny font with 100-mm wall thickness
  barely visible.

### Sheet 08-A — Existing Kitchen Plan

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: N arrow direction same problem as 02 — should reflect
  NE-facing rear wall (i.e. rotated 45°). Same fix needed across all
  plan sheets.
- **IMPORTANT**: The label "Existing rear door" on the kitchen's far
  side points to a small object — but no dimensions describe the door
  width or position. Per YAML `kitchen.rear_door_to_external_width_mm:
  1000`. Add the dimension.
- **IMPORTANT**: "Existing kitchen window (to west)" annotation on the
  left side runs into the "2400" overall width dimension.
- **COSMETIC**: Only the kitchen is shown — for planning context, even
  a faint outline of the adjacent rear-reception wall / corridor would
  help orient the reader.

### Sheet 08-B — Proposed Kitchen + Compact Shower Room Plan

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow direction wrong (same as 02 / 08-A).
- **BLOCKER (arithmetic)**: The proposed shower-room zone widths sum to
  **2700 mm** (1000 shower + 600 WC + 500 basin + 600 laundry), with a
  100 mm partition between kitchen and shower-room = 2800 mm total.
  Available length is **2500 mm**
  (`proposed_shower_room.available_length_mm: 2500`). The proposed
  layout **does not fit** by 300 mm. Either reduce one zone (e.g.
  basin → 400) or stack functions, or revise available length figure.
  Currently the plan rectangle is drawn squished and is geometrically
  impossible.
- **IMPORTANT**: The "PocketDoor / sliding door" label is heavily
  abbreviated and runs into the kitchen rectangle.
- **IMPORTANT**: "New doorway to staircase below" tag (red text on left
  side) overlaps the courtyard hatching label.
- **COSMETIC**: The four shower-room zones are labelled
  SHOWER / WC / BASIN / LAUNDRY but the fonts are different sizes and
  the LAUNDRY box is missing its "W/D" stack annotation.

### Sheet 09 — Site & Street-Context Plan

- **IMPORTANT**: N arrow direction is "N up" but per Craig the rear
  wall faces NE — meaning Hornton Street runs roughly NW-SE. The
  street-context plan currently shows Hornton Street horizontal
  (east-west). Either:
  - Re-draw the terrace at 45° on the sheet, or
  - Rotate the N arrow 45° (anti-clockwise from current "N up") so
    that the street axis is consistent with NE-facing rears.
  Without this fix, the site plan disagrees with the elevation
  orientation.
- **IMPORTANT**: Client "G. Pearce" — should be "Grahame McGirr".
- **IMPORTANT**: The zoom plan at top-left ("No. 20 footprint —
  basement dashed, GF solid 1:200") is unlabelled with cardinal
  directions. Add N arrow / cardinals.
- **COSMETIC**: A street-elevation drawing of the terrace would
  strengthen the conservation-area submission. The note acknowledges
  this is missing and substitutes a schematic plan-view. Consider
  commissioning a quick line elevation from photos.
- **COSMETIC**: Heritage / conservation-area status both shown as "TBC"
  in the notes — these should be confirmed before issue (a five-minute
  RBKC list check).

### Sheet 10 — 3D Axonometric (rear courtyard with staircase)

- **BLOCKER**: Viewing notes say "Looking SOUTH-EAST into courtyard".
  Per Craig's correction #5 the rear wall faces NE, so when standing in
  the courtyard looking at the rear wall, you are looking **SW**, not
  SE. The viewing-note compass description is wrong. Fix to "Looking
  SOUTH-WEST" (or equivalently, "the rear wall here faces NE").
- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on a 3D axo — remove (correction #7).
- **IMPORTANT**: The rear-wall lower opening in the 3D view does NOT
  show the corrected composition (central door + 2 raised-sill sash
  windows). It shows a single doorway recess only. Update to match
  Craig's correction #1.
- **IMPORTANT**: The spiral staircase in the 3D view is shown on the
  east (inside-corner) side — good — but the new kitchen-window-to-door
  conversion on the side wall is barely visible because the side wall
  is shown as fully glazed without distinguishing existing window vs
  new doorway.
- **COSMETIC**: The transparency of the front (cutaway) wall makes it
  hard to read the elevation behind. Consider a true ghost-line
  treatment.

### Sheet 11 — 3D Axonometric (compact shower room)

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on a 3D — remove.
- **IMPORTANT**: Same arithmetic problem as 08-B — the room appears
  longer than the 2500 mm available length to accommodate all the
  fittings. Re-check axo against the corrected room length.
- **IMPORTANT**: The basin is shown stacked on a pedestal with the
  washer-dryer **next to** it (not stacked). YAML says
  `laundry_zone_width_mm: 600` and `stacked washer/dryer 600 × 600`. The
  3D should show stacked W/D, not floor-only.
- **COSMETIC**: Shower door labelled as the Merlyn Black 940 × 2000 —
  note in YAML says this is "for separate upstairs scheme — not part of
  this application." Remove that callout from this sheet to avoid
  confusing the planner.

### Sheet 12 — 3D Axonometric (internal opening, reception rooms)

- **BLOCKER**: Client "G. Pearce" — should be "Grahame McGirr".
- **BLOCKER**: N arrow on a 3D — remove.
- **IMPORTANT**: The opening dimensions in the notes are "Clear width
  2400 / Clear height 2950 / Nib L 700 / Nib R 600 / Beam zone ~250
  deep". Same arithmetic problem as 07-B — 700 + 2400 + 600 = 3700,
  not 4340. Reconcile.
- **COSMETIC**: Padstones shown as small grey blocks at the beam ends —
  good. Could be more clearly labelled.

---

## Cross-sheet consistency checks

1. **Client name** is "G. Pearce" on **every** title block (sheets
   01-12). Per correction #6 must be globally replaced with "Grahame
   McGirr". This is a one-line fix in `dimensions.yaml`
   (`project.client`) and is BLOCKER.

2. **North arrow** appears on every sheet — but per correction #7 should
   appear on PLANS ONLY (02-A, 02-B, 08-A, 08-B, 09). Remove from
   elevations (03, 04), sections (05), detail (06), internal-elevation
   sheets (07) and 3Ds (10, 11, 12).

3. **North arrow direction** on the remaining (plan) sheets must be
   rotated ~45° to reflect the NE-facing rear wall (correction #5).

4. **Rear-wall lower-basement composition** (single central door + 2
   sash windows with raised brick sills under one flat arch — correction
   #1): the YAML is correctly updated, but in the rendered drawings the
   raised brick sills are **not visibly drawn** under the side
   windows on either 04-A or 04-B. The 3D (sheet 10) shows only a
   single door, not the door+windows composition.

5. **Downpipe count on rear-wall elevation** (correction #2): should be
   ONE (the right-side existing one). Currently 04-A shows none and
   04-B shows none visible. Add the right-side downpipe to both, and
   ensure the LEFT corner downpipe is **only** on the side-wall
   elevation 03-A.

6. **Existing downpipe route on side wall** (correction #3): currently
   drawn as a near-straight vertical. Must be drawn as
   vertical-down → 40° slope leftward → vertical-down to slab, with at
   least two visible bends. Otherwise the "RATIONALISED" claim in the
   proposed sheet has no visible before-state to compare against.

7. **Spiral staircase silhouette on rear-wall proposed elevation**
   (correction #4): currently on the right; must be on the LEFT (inside
   corner of L). And must extend higher in the silhouette.

8. **Internal-opening wall arithmetic** (sheets 07-A / 07-B / 12):
   nib-L (700) + clear (2400) + nib-R (600) = 3700 mm, but the wall is
   labelled 4340 mm. 640 mm unaccounted for. Same dimensions appear on
   three sheets — fix in YAML so all three resync.

9. **Shower-room arithmetic** (sheets 08-B / 11): zones sum to 2700+
   100 partition = 2800 mm, but available length is 2500 mm. 300 mm
   over.

10. **"EXISTING" sheets 05-A** shows the spiral staircase — should not.
    Existing must be as-found.

11. **Address consistency**: title blocks all say "Flat 1, 20 Hornton
    Street, London W8 4NR" — correct. Other PDFs in the source folder
    refer to "24 Hornton Street" and "30 Hornton Street" but those are
    correctly identified as precedents only.

12. **Datum / level conventions**: Section 05 uses "+0 courtyard slab,
    +2820 GF FFL, +5270 kitchen ceiling, +6100 reception ceiling,
    -2760 basement FFL" — but Sheet 03 uses "white-line / to FFL"
    captions and a separate "1300" dimension whose origin is unclear.
    Standardise on a single datum convention across sheets.

13. **N-arrow + scale-bar pairing**: best practice is to show the scale
    bar AND the N arrow together at the same corner of the plan, but
    currently the scale bar is bottom-left and the N arrow is
    top-right. Move them together for clarity (plans only — see #2).

14. **Drawing-number convention**: the index uses "02-A / 02-B" etc.
    The individual sheet title blocks just show "02-A" or "02-B" —
    consistent — but the index row shows them as one cell. Acceptable;
    consider listing one per row for clarity.

---

## High-level / architectural sanity checks

- The spiral-staircase 360° rotation over 14 treads needs setting-out
  reconciliation with the new doorway position (see Sheet 06 note).
- The proposed shower-room layout does not fit the stated available
  length (see Sheet 08-B / 11).
- Nib + clear + nib internal-opening arithmetic does not match wall
  length (see Sheets 07 / 12).
- No demolition / construction notes on the side-wall elevation for the
  brick reinstatement and the cut-down sill. RBKC will expect a clear
  description of structural / heritage interventions.
- No drainage strategy shown — the existing downpipe currently
  discharges to a gully position flagged TBC in the YAML; the proposed
  re-routed downpipe needs a connection back to the same gully (or a
  new one). Show on the proposed plan.
- No fire-escape / means-of-escape commentary — for a basement
  conversion this may attract Building Control attention even if not
  strictly planning.
- The 3D axos (sheets 10-12) carry no scale notation ("N/S" in the
  index) but planning officers like at least an indicative scale ratio
  or a dimension line — add a key dimension to each.
