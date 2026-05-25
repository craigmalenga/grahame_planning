# Drawing Pack Accuracy Critique — Flat 1, 20 Hornton Street
Reviewer: independent drawing accuracy pass
Date: 2026-05-25
Pack reviewed: `/home/user/grahame_planning/drawings/output/png/` sheets 01–12
Authority documents: `read_me.,md` (client brief), `drawings/dimensions.yaml`

Format per finding: **Sheet — issue — what should be there — [BLOCKER / IMPORTANT / COSMETIC]**

---

## Sheet 01 — Cover / Index

- **Sheet description label "Side Wall Elevation (east)"** — the side wall is the EAST wall of the courtyard but it is *viewed* from inside the courtyard *looking east*. Title text in the index is technically the wall name + compass face. Since the rear wall faces NE per the orientation note, the "east"/"south" labelling used throughout the pack is the simplified cardinal model from dimensions.yaml, not the as-built NE-facing rear. Add a short note on Sheet 01 reconciling the two. **COSMETIC**.
- **No revision history / no scale bar block on cover** apart from per-sheet 1:50. **COSMETIC**.

## Sheet 02 — Rear Courtyard Plan (existing & proposed)

- **N-arrow inconsistency.** Two N arrows appear on each plan: a small compass rose top-right which IS rotated ~-45° (correct, per orientation_note), AND a large "N ↑" above the plan body which points straight up (wrong — implies page-up = north, contradicting the brief that says N should be rotated -45° because the rear wall faces NE). The two arrows directly contradict each other. **BLOCKER** (rule 6).
- **Staircase location label in proposed (02-B)** — staircase is shown centred 950/950 from rear & side walls (i.e. tight to the inside corner of the L). This is correct per the brief, but on plan the inside corner is drawn at the BOTTOM-RIGHT of the courtyard square. Reader has to mentally rotate to confirm; an inset arrow indicating "INSIDE CORNER OF L" would help. **COSMETIC**.
- **Downpipe(s) not marked on the existing plan.** The brief and dimensions.yaml record two existing downpipes (one on the side wall, one in the L-corner of the rear wall). Neither appears as an annotated symbol on the existing plan. **IMPORTANT**.
- **Proposed plan does not show the re-routed downpipe.** Dimensions.yaml proposes a new downpipe at 2950 mm from north corner (south end of side wall). Not drawn. **IMPORTANT**.
- **Bricked-up basement opening shown faintly on rear/lower-east wall in plan view** — the bricked-up opening is on the *side wall* lower-basement (north end), not the rear wall. Need to verify plan annotations match this. Labels in plan body are cramped and overlapping the kitchen-wall hatching, hard to read. **IMPORTANT** (legibility + locator).
- **Existing plan still shows "PROPOSED reclaimed cast-iron spiral staircase" text in 02-A.** Some annotation text bleeds onto the existing sheet (text at lower-left says "PROPOSED reclaimed... spiral staircase"). The existing sheet must NOT carry proposed-only annotations. **BLOCKER** (rule 5).

## Sheet 03 — Side Wall Elevation (existing 03-A, proposed 03-B)

- **Existing (03-A) — downpipe routing crosses the upper kitchen window.** The swan-neck originates at the top-right corner (hopper) and runs diagonally to a point above-between the two lower windows. As drawn, the diagonal clearly passes across / through the right edge of the upper kitchen window aperture. Per the client correction (rule 3) the swan-neck must NOT cross the kitchen window — it should drop from a high hopper above the kitchen window head, swan-neck *around* the south side of the kitchen window, then run vertical between the two lower windows. **BLOCKER** (rule 3).
- **Swan-neck angle.** Drawn at ~60–70° from vertical; brief specifies ~40°. Re-angle. **IMPORTANT**.
- **Title direction.** Sheet says "View FROM the courtyard looking EAST". Given the rear wall faces NE, the side wall faces NW into the courtyard, so a viewer in the courtyard looking AT this wall is looking ENE (≈ east, acceptable). Add (NE-quadrant) qualifier for honesty. **COSMETIC**.
- **Proposed (03-B) — spiral-staircase silhouette not tight to the right (south) end.** Per rule 4, the staircase silhouette on the proposed side-wall elevation must sit tight to the RIGHT (south end). As drawn, the silhouette is roughly centred (it sits over/around the bricked-up opening at left and reaches towards the kitchen window in the middle-right, but does not hug the south end). **BLOCKER** (rule 4).
- **Proposed (03-B) — new doorway clear width.** Drawn ~660 mm (matches existing glass gap), but dimensions.yaml says the proposed clear opening is 800 mm and the structural recess is 900 mm. Drawing should show the wider doorway, not the existing 660 mm slot. **IMPORTANT**.
- **No new downpipe shown on the proposed side wall.** The dimensions.yaml proposed downpipe is on this wall at 2950 mm from north corner. Should appear here. **IMPORTANT**.
- **No flat-arch / lintel detail shown over the new doorway** — brief calls for a red-brick flat arch / lintel to match the 1230 mm window below. **IMPORTANT**.

## Sheet 04 — Rear Wall Elevation (existing 04-A, proposed 04-B)

- **Annotation note 3 reads "1850 mm recess containing 2 timber leaves".** This is the OLD double-door description that the client explicitly corrected. The correct description is "single central door (820 mm) + 2 flanking sash windows (≈465 mm each) with raised brick sills, all under one red-brick flat arch" — i.e. rule 1. The graphic itself appears to show door + two flanking windows, but the note still says "2 timber leaves". Fix the note. **BLOCKER** (rule 1, the annotation will be read by planning officers).
- **Notes 4 says "Sill at 3800 mm above courtyard slab (= 80 cm above interior GF FFL)".** 3800 − 80 = 3720, which is the kitchen sill figure, not the rear sill (3800 above slab vs. 800 above interior gives slab-to-FFL = 3000, consistent). Confusing wording; tidy. **COSMETIC**.
- **Sash window dimension shown 2100 × 2200**, but adjacent note 4 still says "2100 mm wide × 2400 mm tall". Drawing and note contradict each other. dimensions.yaml has 2100 × 2200 (Rev B correction). Fix the note. **IMPORTANT**.
- **No downpipe on the rear elevation (good — rule 2 satisfied).** Confirmed absent. ✓
- **Raised brick sills under the two flanking sash windows not clearly differentiated** — the existing condition shows them, but the hatching/sill projection is small and reads as a single horizontal band, not as raised brick. **IMPORTANT** (rule 1, sill convention).
- **Brick-arch hatching above the lower recess** — a flat-arch keystone/voussoir pattern is conventional. The drawing shows a plain rectangle band labelled "flat arch". Add voussoir lines. **COSMETIC**.
- **Proposed (04-B) — spiral staircase silhouette tight to the LEFT (correct per rule 4).** ✓
- **Proposed (04-B) — staircase silhouette overlaps the upper sash window.** Silhouette extends from courtyard slab up to ~3000 mm (matches landing). It correctly does NOT extend above the upper window head, but the silhouette text annotation overlaps the sash glazing. **COSMETIC** (legibility).
- **No annotation marking "previously blocked-up rear window/opening reinstated"** — there is no blocked-up opening on the rear wall (it is on the side wall), so this note doesn't belong here, but the brief lists it explicitly. Confirm it's on Sheet 03 not 04. **COSMETIC**.

## Sheet 05 — Courtyard Section A–A (existing 05-A, proposed 05-B)

- **Datum: Ground floor FFL labelled +2820.** Dimensions.yaml Rev B explicitly corrects slab-to-FFL to 3000 mm (not 2820). The 2820 figure was the basement ceiling height. The drawing is using the pre-Rev-B (wrong) datum. **BLOCKER** (affects every height dimension downstream).
- **Basement floor labelled −2760.** Implied FFL-to-basement = 2820 − (−2760) = 5580 from basement floor to GF FFL? No, slab is 0, basement is at -2760, GF FFL is at +2820, so basement-to-GF FFL = 5580 mm. Inconsistent with the YAML which puts basement at -3000 + 2820 = different reference. Re-derive all section datums. **BLOCKER**.
- **Section note 5: "Spiral staircase: 14 treads × 201 mm rise = 2814 mm total".** YAML says 15 treads × 200 mm = 3000 mm. Tread count and rise per tread are both wrong on the drawing. **BLOCKER** (rule for staircase compliance).
- **Existing section (05-A) correctly shows no staircase.** ✓ (rule 5).
- **No view-direction label or section-cut indication on sheet 02 plans tying back to A–A.** Add an A–A cut line on Sheet 02 plans. **IMPORTANT**.
- **Rear-boundary wall (3500 mm) drawn at the wrong height** — looks roughly 3.5 m which matches, but no dim ladder. Add. **COSMETIC**.

## Sheet 06 — Spiral Staircase Detail

- **Schedule row reads "Treads / pads: 16 (14 risers × 200 mm) +1 landing pad" then "Rise per tread 200 mm" then "Total rise 3000 mm".** 14 × 200 = 2800, not 3000. dimensions.yaml says 15 risers × 200 mm = 3000 mm exactly. The schedule arithmetic is internally inconsistent. **BLOCKER**.
- **Plan view shows 15 tread sectors numbered 1–15.** Plan-view tread count (15) doesn't match schedule's "14 risers". Either schedule or plan is wrong; YAML supports 15. **BLOCKER**.
- **Rotation per tread 24°.** 15 × 24 = 360°. So the user enters and exits on the same compass bearing. dimensions.yaml says this is intentional — but the kitchen doorway is on the side wall (EAST face of the courtyard), and the entry is from the courtyard slab (SOUTH face). For entry south and exit east the user must rotate 90° (or 270°) over 15 treads = 6° or 18° per tread, not 24°. The 24° figure makes the user step out facing the same way they entered. **IMPORTANT** (geometry mismatch with brief — staircase ergonomics).
- **Elevation (developed) ribbon-strip stair drawing** — fine for illustration, but the central pole height (3300) extends above final landing — handrail post — should be annotated as such. **COSMETIC**.
- **No base-plate or fixing detail dimensions** — base-plate bolt pattern, plate size, etc. Brief asks for "bottom fixing/base plate/foundation principle". **IMPORTANT**.

## Sheet 07 — Internal Opening (existing 07-A, proposed 07-B)

- **Existing (07-A) — opening shown 1120 × 2100, ok, matches Grahame's measurement.** ✓
- **Plan view (right of sheet) shows the rear reception as the same depth as the front lounge.** Per the YAML, the rear reception is 350 mm wider than the front lounge (3000 vs 2650 mm). The plan should reflect this offset. As drawn the two rooms read as a simple symmetric pair. **IMPORTANT**.
- **Proposed (07-B) — clear opening 1350 × 2950 mm with nibs 700 / 600.** Matches YAML. ✓
- **Beam zone (orange) shown above the opening, ~250 mm deep.** Good convention. ✓
- **No dashed "existing opening line" within the proposed elevation.** Brief asks for existing line shown dashed inside the proposed enlarged opening so the change is legible. **IMPORTANT**.
- **No skirting / cornice / chimney-breast context shown** — brief explicitly asks for these. **COSMETIC**.

## Sheet 08 — Kitchen + Shower Room Plan (existing 08-A, proposed 08-B)

- **Notes list (both sheets) reads "Shower tray 1000 mm, WC zone 600 mm, Basin zone 500 mm, Laundry 600 mm".** dimensions.yaml Rev B has shower 900, WC 500, basin 400, laundry 400. Notes still use the OLD Rev A values that summed to 2700 + 100 = 2800 mm (which did NOT fit the 2500 mm available run, hence the Rev B re-tune). The notes here would put the layout 300 mm over the available width. **BLOCKER** (the planning officer reading the notes will see infeasible arithmetic).
- **Proposed plan label box reads "SHOWER 1000×900"** — should be 900 mm wide per Rev B (the tray was reduced to fit 2500 mm). **IMPORTANT**.
- **Labels in proposed plan overlap each other** — "Pocket/sliding door", "Kitchen residual fridge layout", "SHOWER 1000×900", "WC", "BASIN", "LAUNDRY" all crammed into the same rectangle, several overlap and become unreadable. **IMPORTANT** (legibility).
- **No pocket door swing/slide indication** — convention requires a pocket-door symbol (arrow + dashed pocket cavity). **COSMETIC**.
- **N arrow on this sheet is "N ↑" page-up.** Per orientation_note the N must be rotated ~-45°. **BLOCKER** (rule 6).
- **Existing sheet (08-A) carries the same proposed-shower notes.** Should describe ONLY the existing condition. **IMPORTANT** (rule 5 spirit).
- **No external rear-door shown on kitchen plans** — there is an existing rear external door 1000 mm wide per YAML (rear of kitchen). Faintly visible but unannotated. **IMPORTANT**.

## Sheet 09 — Site & Street Context Plan

- **No. 20 highlighted in the street strip.** ✓
- **N arrow shown as "N ↑" page-up next to the street strip; compass rose top-right is rotated.** Same contradiction as Sheet 02. **IMPORTANT** (rule 6).
- **Hornton Street labelled but no relationship to Holland Park or Kensington High St.** **COSMETIC**.
- **Sentence "A street ELEVATION drawing showing No. 20 in the row does NOT exist…"** is a useful note explaining the substitute. ✓
- **Footprint zoom (top-left) shows basement dashed and GF solid** — but the dashed footprint is taller (longer) than the solid one, which is correct (basement extends under the pavement vaults). Good. ✓ The orientation arrow on this small inset is missing. **COSMETIC**.

## Sheet 10 — 3D Axonometric, Rear Courtyard

- **Staircase appears tiny / under-scaled relative to the courtyard.** YAML envelope diameter 1750 mm in a 3250 × 2950 courtyard; on-screen the spiral occupies <15% of the courtyard floor area, suggesting it's been scaled down. **IMPORTANT**.
- **No rear-wall door bay clearly visible** — the door + 2 flanking sashes composition (rule 1) cannot be discerned in the 3D view. The rear wall appears as a blank dark panel. Render needs the door + windows visible. **BLOCKER** (rule 1 must be visible somewhere if this is the marketing 3D).
- **No upper-window detail (large rear-reception sash 2100 × 2200) visible.** **IMPORTANT**.
- **View direction labelled "Looking SOUTH-EAST into courtyard"** — given rear wall faces NE, looking south-east would view the rear and side wall together. Acceptable. ✓
- **No N-arrow on the axonometric** — convention varies; for an axo a small "N" indicator is helpful. **COSMETIC**.
- **Staircase rendered as horizontal black bars** — readable but cartoonish; should be Victorian cast iron with central pole, treads tapered to the pole, handrail balustrade. **COSMETIC**.

## Sheet 11 — 3D Axonometric, Compact Shower Room

- **Notes mention "Shower 1000 × 900 with full-height black hinged glazed panel (Merlyn Ionic Essence Black 940 × 2000)".** Per dimensions.yaml, the Merlyn Ionic Essence Black 940 × 2000 is for a SEPARATE upstairs scheme — NOT this application. Referencing it on this sheet is misleading. **BLOCKER** (could confuse planning).
- **Notes say "Stacked washer/dryer 600 × 600".** Rev B explicitly removed stacking — laundry zone is 400 mm wide, single front-loader. Stacked doesn't fit. **BLOCKER**.
- **No dimensions shown on the axo.** Brief says "shower-room with all dimensions". **IMPORTANT**.
- **No pocket-door indication** — only a blank shower-screen panel is shown. **IMPORTANT**.
- **Basin shown as a solid white block, not recognisable as a wall-hung basin.** **COSMETIC**.

## Sheet 12 — 3D Axonometric, Internal Opening

- **Opening shown 1350 × 2950 with retained nibs (orange beam zone).** Matches YAML. ✓
- **Width difference between rooms (rear ~350 mm wider) not represented** — the two rooms read symmetric in the axo. **COSMETIC**.
- **Cornice / skirting / chimney breast not modelled** — brief asks. **COSMETIC**.

---

## Cross-cutting accuracy issues (affect multiple sheets)

1. **Stair-rise arithmetic disagrees across pack** — Sheets 05 and 06 quote "14 treads × 201 mm = 2814 mm" while the YAML and plan view quote 15 × 200 = 3000 mm. The slab-to-FFL is 3000 mm per Rev B. **BLOCKER**.
2. **Slab-to-GF-FFL datum** — Sheet 05 shows +2820, YAML Rev B says +3000. Every height dimension on Sheet 05 must be regenerated. **BLOCKER**.
3. **Rear-wall lower-bay description** — Sheet 04 notes still describe "2 timber leaves" instead of "single central door + 2 flanking sashes under one flat arch" (rule 1). **BLOCKER**.
4. **N-arrow rotation** — Sheets 02, 08 and 09 show two contradictory N arrows (page-up "N ↑" and rotated compass rose). Choose the rotated one only (rule 6). **BLOCKER**.
5. **Shower-room note arithmetic** — Sheet 08 notes use old Rev A widths (1000+600+500+600 = 2700+partitions) that don't fit the 2500 mm wall run. Rev B (900+500+400+400 + 3×100 = 2500) is the correct fit. **BLOCKER**.
6. **Side-wall swan-neck crossing kitchen window** — Sheet 03-A. **BLOCKER** (rule 3).
7. **Proposed side-wall staircase silhouette not tight to south end** — Sheet 03-B (rule 4). **BLOCKER**.
8. **Proposed-staircase annotation bleeding onto existing plan** — Sheet 02-A (rule 5). **BLOCKER**.
9. **Merlyn upstairs shower door referenced on the Flat 1 shower-room 3D** — Sheet 11. Wrong scope. **BLOCKER**.
10. **Stacked washer/dryer in shower room** — Sheet 11. Rev B removed this. **BLOCKER**.
11. **No re-routed downpipe shown on the proposed side wall** — Sheets 03-B and 02-B. **IMPORTANT**.
12. **Sash window head height inconsistency** — Sheet 04 shows 2200 mm tall (correct) but the note still says 2400 mm. **IMPORTANT**.
13. **Stair rotation per tread (24°) gives 360° revolution, so user exits facing the same direction as entry** — but kitchen doorway is 90° from courtyard slab entry. Geometry doesn't match the architectural intent. **IMPORTANT**.
14. **Width difference between front lounge and rear reception (350 mm)** not represented on internal-opening plan view (Sheet 07-A/B) or 3D axo (Sheet 12). **IMPORTANT**.
15. **Architectural conventions on Sheet 04**: voussoir hatching on the flat arch, clearer raised brick sills under the two flanking sashes, sill projection profile. **IMPORTANT** (sash window glazing-bar style appears OK).

---
