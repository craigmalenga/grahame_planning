# Text Legibility Review — Planning Pack
**Project:** Flat 1, 20 Hornton Street, London W8 4NR
**Reviewer:** Independent drawing-legibility audit
**Date:** 2026-05-25
**Source:** /home/user/grahame_planning/drawings/output/png/ (Sheets 01–12, Revision B)

Severity tags:
- **BLOCKER** — illegible / unreadable as drawn
- **IMPORTANT** — poor legibility, planning officer will struggle
- **COSMETIC** — could be tidier; reads but inelegant

---

## Sheet 01 — Cover / Drawing Index

1. **IMPORTANT — Title-block "STATUS" cell overflow (bottom strip of sheet).**
   The status legend `FOR PLANNING — DRAFT` (red, large) is drawn over the bottom edge of the page; "FOR PLANNING" text is partially clipped below the sheet border / repeats with grey overlay text underneath the title block. Two stacked status banners (one in the index table top-right, one running across the bottom of the title block) collide / read as a double image.
   *Fix:* show STATUS in one location only (use the title-block cell). Remove the floating coloured status banner overlay at the bottom of the sheet, or lift it ≥10 mm clear of the title-block strip.

2. **IMPORTANT — Index table "this sheet" value collides with header.**
   In the SCALE column the value `this sheet` sits directly under the column header `SCALE` with no row baseline gap — it reads as part of the header.
   *Fix:* add a 4 mm leading row above the data, or use small caps for the header to differentiate.

3. **COSMETIC — Body paragraphs ("REPLICABILITY…", "STATUS — FOR PLANNING…") are set at ~7 pt** in a generous block of white space mid-sheet. They could be 9–10 pt without crowding anything.
   *Fix:* increase body text to 9 pt; the index table can also step up to 9 pt.

4. **COSMETIC — Inline filenames in the REPLICABILITY paragraph** (`drawings/dimensions.yaml`, `python3 drawings/src/render_all.py`) are at body size; the path quotation marks are oversized open-curly-quotes (`'…`) on the left vs straight quotes elsewhere. Inconsistent typography.
   *Fix:* set code paths in a mono face and standardise quote style.

---

## Sheet 02-A — Existing Rear Courtyard Plan

5. **BLOCKER — Cluster of red/blue labels on the east wall (right-hand side of plan).**
   The annotations `Kitchen window above`, `(courtyard floor) ...`, `door to kitchen` and `(basement, retained)` are stacked on top of each other, overlapping the wall hatching, with crossed-out (strike-through) text fragments visible. Black-on-hatched-wall + colliding leaders = unreadable.
   *Fix:* move the entire stack to a clear-air region east of the wall envelope (≥250 mm clear); use leader lines back to anchor points; remove strike-through artefacts (looks like superseded text was left in). Use one colour per category (e.g. blue for retained, red for proposed).

6. **IMPORTANT — Centre-door / "flanking sash" callout below the plan.**
   The label `Central door + 2 flanking sash windows / sit under the flat arch` is set in tiny grey text directly on the wall hatching, overlapping the 3250 dimension witness line below it.
   *Fix:* relocate the note below the 3250 dimension string with a small leader to the door centreline.

7. **IMPORTANT — North-arrow duplication (upper-left of plan & upper-right of sheet).**
   A bold `N ↑` text label sits next to the plan AND a graphical north-arrow disc with "N" sits in the top-right corner of the sheet. Two north indicators is redundant and confusing (the orientations even appear to differ — the disc shows N rotated; the text shows N as straight up).
   *Fix:* keep the graphical north-arrow disc only; delete the `N ↑` text adjacent to the plan. Confirm the disc points to true plan north.

8. **COSMETIC — 510 / 460 / 600 / 510 cheek-recess dimensions** on the east wall sit on the hatching at small size.
   *Fix:* pull dimensions outside the wall on a witness line, or place on a white pill background.

---

## Sheet 02-B — Proposed Rear Courtyard Plan

9. **BLOCKER — "PROPOSED reclaimed cast-iron spiral staircase" label (lower courtyard) is drawn directly under / on top of the 720 / 1850 / 720 dimension chain.**
   The label collides with the dimension string baseline; the words `spiral staircase` overlap the upper edge of the dimension line. Compounded by faint tread numbers (1–14) at the staircase centre that compete for the same space.
   *Fix:* lift the label 250 mm clear of the dimension string; place above the staircase footprint with a leader to the central pole.

10. **BLOCKER — Same east-wall cluster as 02-A persists** (kitchen window above / courtyard floors / basement, retained). Black on hatch, strike-through text still visible.
    *Fix:* as per finding 5.

11. **IMPORTANT — Tread numbers 1–14 inside the spiral footprint** are set at ~5 pt grey and become illegible against the grey tread fill, especially in the four treads nearest the centre pole where they touch the pole disc.
    *Fix:* either use white text on the dark wedges, black text on the light wedges (consistent contrast), or remove numbers and label only treads 1, 7 and 14.

12. **IMPORTANT — North-arrow duplication** (same as 02-A finding 7). Delete the `N ↑` text adjacent to the plan.

13. **COSMETIC — `950` dimensions** (centre-pole-to-wall) inside the spiral wedges are smaller than the surrounding tread numbers — they read as if they belong to a tread rather than the radius.
    *Fix:* place radius dimensions outside the staircase circle on a leader.

---

## Sheet 03-A — Existing Side Wall Elevation

14. **BLOCKER — "Existing rear reception structural recess / 900 mm glass gap 660" label** sits inside the brown/red upper window opening; brown text on brown brick fill is barely readable; portion of label runs over the window mullions.
    *Fix:* move callout to clear air on the right of the elevation with a leader to the recess; switch to black text on a small white box.

15. **BLOCKER — "Existing bricked-up opening" label** (lower-left of elevation) is set ON the brick-hatch fill of the bricked-up opening itself. Dark red text on the same brick pattern — illegible.
    *Fix:* move label to the white margin outside the wall, with a horizontal leader to the opening.

16. **IMPORTANT — Header viewing-direction line** `N (view) viewed FROM the courtyard, looking E at the kitchen-side wall) S →` is set as a single overlong run, with `(view)` and the closing parenthesis text touching the leader arrows on each side; reads as broken sentence.
    *Fix:* split into two lines: line 1 = view title; line 2 = `Viewed FROM the courtyard, looking E at the kitchen-side wall`. Place arrows on their own row.

17. **IMPORTANT — Right-side notes column** runs to 17 lines at ~7 pt while there is ~50 mm of empty white space to its right. Text could be 9 pt.
    *Fix:* increase notes to 9 pt; widen column to use the available space.

18. **IMPORTANT — Lower-left "courtyard slab" datum text** is partly clipped by the chain-dim leader at FFL.
    *Fix:* move datum label below the witness line; anchor with a tick.

19. **COSMETIC — `existing C.I. downpipe / hopper top right / 90° elbow next to top pier between sash windows`** text is squeezed between the elevation edge and the sheet margin and wraps awkwardly.
    *Fix:* reflow to two short lines or move to notes panel as a numbered item.

---

## Sheet 03-B — Proposed Side Wall Elevation

20. **BLOCKER — Red callout box "PROPOSED: Kitchen window converted to glazed doorway (top of staircase)"** is placed ON the top of the elevation, partially obscuring the window itself. Red type on the existing brick render = poor contrast, and the box overlaps the level-line dimension text behind it.
    *Fix:* keep the callout box, but lift it into the white margin above the elevation; draw a leader to the relevant window. Background of box should be solid white, not transparent.

21. **BLOCKER — Mid-elevation pink/red note `Doorway to be reinstated as new design + brickup-up at +1320` (approximate text — partially obscured)** is overlaid on the new doorway frame; the staircase helix curve also runs through the same text region. Triple collision: text + door frame + helix line.
    *Fix:* split into two labels: one for the reinstated brick-up (anchor to brickwork) and one for the new doorway (anchor to opening); both placed outside the staircase swept area.

22. **BLOCKER — "Existing bricked-up opening" label still on the brick-hatch** (same as 03-A finding 15). Not corrected on revision B.

23. **IMPORTANT — Lower right `Existing basement sash` labels** appear as small grey text sitting over the dark basement window leading; very low contrast.
    *Fix:* move label below the sash with a leader; or use white-out background pill.

24. **IMPORTANT — Header viewing-direction string** — same overlong run as 03-A finding 16.

25. **COSMETIC — `cf line +2900`, `cf line +2900 (white line)`, `~2900`** datum annotations on the left chain are stacked and the parenthetical `(white line)` runs into the chain dimension `400`.
    *Fix:* abbreviate to `+2900 WL` with the legend in the notes.

---

## Sheet 04-A — Existing Rear Wall Elevation

26. **IMPORTANT — `Existing rear-reception multi-pane sash / 2100 × 2200`** label sits inside the white window leading; the label crosses two mullion lines and the text breaks visually.
    *Fix:* move label outside the window with a leader to one corner.

27. **IMPORTANT — Lower-window `Central / door / 850`** stack is squeezed onto the door leaf and runs over the leaves' vertical centre-line. The `850` could be a doorway dimension or door-leaf width — ambiguous because it sits on the join.
    *Fix:* split into two labels (`Central door`, separate `850 mm leaf` dimension) and pull both into the side margin.

28. **IMPORTANT — Left-side level chain** `GF floor +2820 / +800 / +2900 (white line)` annotations are crammed together; `+2820` and `+2900` are within 6 mm of each other and partially overlap.
    *Fix:* push the white-line datum tag onto the opposite side of the witness line, or stagger.

29. **IMPORTANT — `white painted brick cheek / 720 mm` labels (both jambs of lower door)** are repeated on left and right with their dimension `720` sandwiched between them and the chain dimension below; trio collides.
    *Fix:* dimension once, label once; identify symmetrical condition with a note `(both cheeks similar)`.

30. **COSMETIC — `Red flat-brick arches over openings (existing)`** note in the right-hand notes panel could carry a leader-out to the actual brick arch shown on the elevation to make it obvious which feature is being described.

31. **IMPORTANT — Header viewing-direction string** `← E (viewed FROM the courtyard, looking SOUTH at the rear-reception wall) W →` is over-long; the arrows touch the brackets.
    *Fix:* split.

---

## Sheet 04-B — Proposed Rear Wall Elevation

32. **BLOCKER — Top-left red box "PROPOSED spiral staircase shown superimposed (semi-transparent) — this is the silhouette that visually obscures part of the rear wall when viewed square-on"** sits over the upper window. Red on existing yellow-stock brick fill at small size = hard to read; box also overlaps the 2100 head dimension.
    *Fix:* move the explanatory box into the white margin top-right; keep only a small red-italic figure tag near the silhouette.

33. **BLOCKER — Mid-elevation orange/red callout "1 relocate / [m staircase]" (text appears clipped)** sits inside the staircase swept area, against the dark spiral and against the door leaf behind. Three-layer overlap.
    *Fix:* relocate to margin with leader; the underlying text appears clipped — verify the YAML source string fits the box width.

34. **IMPORTANT — `Existing rear-reception multi-pane sash / 2100 × 2200`** label is still inside the window leading and now also overlaid by the spiral silhouette.
    *Fix:* move to margin (per 04-A finding 26); the spiral silhouette compounds the legibility problem.

35. **IMPORTANT — Lower door `Central / door / 850`** stack same issue as 04-A finding 27, now further crowded by the spiral lower coil.

36. **COSMETIC — Right-side notes** number 7 items at ~7 pt with plenty of margin to the right.
    *Fix:* upsize to 9 pt.

---

## Sheet 05-A — Existing Courtyard Section A-A

37. **IMPORTANT — `Lower basement double doors (visible in section)`** label inside the basement bay is a small grey run set on the cream fill; the parenthesis breaks across two lines mid-word.
    *Fix:* widen the text box or shorten to `Basement double doors (in section)`.

38. **COSMETIC — `Existing courtyard / (no staircase)`** label centred in the open courtyard volume is correctly placed but very small relative to the white space.
    *Fix:* upsize 2 pt.

39. **COSMETIC — Notes panel** runs to 8 numbered items at ~7 pt — could be 9 pt.

40. No north-arrow / no duplicate-N issue here (section sheets correctly omit north arrow).

---

## Sheet 05-B — Proposed Courtyard Section A-A

41. **BLOCKER — Blue callout "New doorway in side wall (behind, dashed) kitchen window converted to glazed timber door"** is set on top of the rear-reception fill AND overlaps the helix curve and the kitchen-ceiling level line `+5270`. Blue text crossing three different layers.
    *Fix:* float the box clear of the helix in the open courtyard volume; underlay solid white; leader to the dashed doorway only.

42. **BLOCKER — Lower-left annotation `950 mm staircase centre (?) / wall`** is partially obscured by the cross-section of the courtyard wall (dark brick fill). Reads as `…aircase centre t …wall`.
    *Fix:* reposition outside the wall section; use a leader.

43. **IMPORTANT — `kitchen ceiling +5270` and other right-hand datum tags** sit adjacent to the courtyard slab `+0` and basement floor `-2760` markers with inconsistent leader-tick alignment — three tags appear at slightly different x-positions creating a ragged column.
    *Fix:* align all datum tags to a single right-hand justification line; tick marks on a consistent witness line.

44. **IMPORTANT — Section title** `SECTION A-A — through centre of spiral staircase, looking WEST` is at proper size, but the direction tags `N (rear boundary) →` and `(← dwelling) S` are tiny and oddly placed.
    *Fix:* enlarge and align with section title.

45. **COSMETIC — Notes panel** text size — same as 05-A finding 39.

---

## Sheet 06 — Spiral Staircase Detail (Plan & Elevation)

46. **BLOCKER — SCHEDULE block** — the first row `Treads / pads: 16 (14 risers + 1 top platform / 1750 envelope dia.` has a stray `1750 envelope` token that visually collides with the next row `Rise per tread: 200 mm (208–210 verified)`. Two values stacked on one baseline.
    *Fix:* break onto its own row or align in a two-column key/value grid.

47. **IMPORTANT — Tread numbers inside the plan circle** are placed at the outer edge of each wedge; numbers 1 and 2 (at the bottom) overlap the GF FFL leader arrow exiting the plan.
    *Fix:* move tread numbers to mid-wedge radius; clear the leader path.

48. **IMPORTANT — Left-side handrail dimensions** `900 handrail`, `3000 stair rise`, `(14 × 211)`, `3000 floor-to-floor` are stacked vertically with inconsistent leader-tick alignment; `(14 × 211)` runs into `3000 stair rise`.
    *Fix:* re-stack with 6 mm minimum vertical spacing; use a tabular leader format.

49. **COSMETIC — "ELEVATION (developed)" and "PLAN (top-down footprint)"** subheaders use the same weight as the body — could be set bolder/larger so they read as figure titles.

50. **COSMETIC — INSTALLATION and SCHEDULE headers** could be inverted (white on black) for clearer panelling.

---

## Sheet 07-A — Existing Internal Opening

51. **IMPORTANT — `FRONT LOUNGE side (viewer's side)` / `(rear reception is behind)`** stacked label has the parenthetical wrapped twice and partially overlapping the wall hatching at top-left.
    *Fix:* one line for the side identifier, one line for the parenthetical, both clear of the wall.

52. **IMPORTANT — `EXISTING opening ~1120 × 2100`** label is set centred inside the dashed opening, which works, but the tilde `~` glyph is rendered as a high-positioned hyphen and reads as `-1120` (negative).
    *Fix:* use `c. 1120` or `±1120` or a properly-rendered tilde.

53. **COSMETIC — `2650 (overall wall width)`** and `10100 (both rooms)` dimensions are correctly placed; no issue.

---

## Sheet 07-B — Proposed Internal Opening

54. **BLOCKER — Top of opening: red hatched beam-zone label** `SHWE…` (text appears clipped to `SHWE` or similar) sits in the red beam hatch — red-on-red. Looks like the intended text is "STEEL BEAM (size by structural engineer)" but only part renders.
    *Fix:* set label outside the red zone with a leader; verify YAML source string is not truncated.

55. **IMPORTANT — `PROPOSED enlarged opening / clear 1350 × 2950 / (subject to structural engineer)`** is set inside the cream opening fill and the text upper line touches the underside of the red beam hatch.
    *Fix:* add 4 mm vertical padding between text and beam zone; or move label to side margin.

56. **IMPORTANT — Plan view (right half of sheet)** has the `600 / 1350 / 700` dimension chain inside the wall thickness, with the `1350` numeral sitting on top of the centreline. The chain reads as if it belongs to the rear-reception room rather than the opening.
    *Fix:* move chain below the opening with a witness line dropping from each side of the opening.

57. **COSMETIC — `FRONT LOUNGE (ceiling 3.28 m)` and `REAR RECEPTION (ceiling 3.28 m) [+35 cm wider]`** room labels are fine but the `[+35 cm wider]` cue is in the rear-reception cell — needs a comparative note showing the lounge ceiling as the reference.

---

## Sheet 08-A — Existing Kitchen Plan

58. **IMPORTANT — Left-side label `COURTYARD (to west) / 2400 (to wall)`** is set vertically and runs into the 2400 dimension witness line; the parenthetical `(to wall)` wraps and overlaps `COURTYARD`.
    *Fix:* keep horizontal note in the courtyard region or unstack.

59. **IMPORTANT — `EXISTING KITCHEN (2400 × 2900) / ceiling 2450`** centred label is correct but small relative to the 80 mm of clear kitchen-floor area available.
    *Fix:* upsize 2 pt.

60. **IMPORTANT — `Existing rear door`** tag (right side) is at small size and sits partially on the dark wall fill — black on dark grey.
    *Fix:* move into the courtyard / corridor side with a leader; white-out background.

61. **IMPORTANT — North-arrow duplication** — graphical N disc top-right AND `N ↑` text near the plan. Same as 02-A finding 7.

---

## Sheet 08-B — Proposed Kitchen + Compact Shower-Room

62. **BLOCKER — Stacked labels inside the shower-room cells**: `KITCHEN (residual)` / `retain hot/cold-fridge layout)` / fixture tags `SHOWER 1000×900`, `WC`, `BASIN`, `LAUNDRY (W/D)` etc. are jammed into 8 mm-tall cells. Several labels overlap their cell boundaries and the WC/BASIN labels run on top of the partition lines.
    *Fix:* increase cell heights, or move fixture labels outside with leaders. Use a key-numbered approach (1=Shower, 2=WC, 3=Basin, 4=Laundry).

63. **BLOCKER — Red `New door / to stair` callout** on the west wall is set on the dark wall fill in a small red font — red on near-black, illegible.
    *Fix:* use white text on a red pill, or move outside the wall with a leader.

64. **IMPORTANT — `Pocket / sliding door`** annotation at top of the bathroom is squeezed between the wall and the kitchen run; the slash breaks across two lines.
    *Fix:* widen text box; or use just `Pocket door (sliding)`.

65. **IMPORTANT — Same left-side `COURTYARD (to west) / 2400 (to wall)`** issue as 08-A finding 58, now compounded by the new red door call-out next to it.

66. **IMPORTANT — North-arrow duplication** (per 08-A finding 61).

---

## Sheet 09 — Site & Street-Context Plan

67. **IMPORTANT — `SUBJECT — Flat 1 / basement + ground floor`** red text above No. 20 in the terrace strip — the second line `basement + ground floor` partially overlaps the dashed red box outline of the subject property; reads as if the dashes are striking through the text.
    *Fix:* lift the label 4 mm clear of the dashed outline; centre.

68. **IMPORTANT — `Hornton Place / Central Library`** annotation under the terrace strip is at very small size and sits just under the kerb hatch — could be missed entirely.
    *Fix:* upsize 2 pt; bold the place names.

69. **IMPORTANT — North-arrow duplication** — graphical N disc top-right AND a small `N / ↑` text in the middle-right of the sheet next to the terrace strip. Two N indicators.
    *Fix:* delete the text N; keep only the graphical disc.

70. **COSMETIC — Scale bar (bottom-left)** has a tiny illegible label below it (looks like a scale fraction).
    *Fix:* upsize scale-bar caption to match other sheets.

71. **COSMETIC — Top zoom panel** `ZOOM — No. 20 footprint (basement dashed, GF solid)  1:200` could carry an arrow/key linking the small panel to its location in the terrace strip below.

---

## Sheet 10 — 3D Axonometric (Rear Courtyard with Staircase)

72. **IMPORTANT — Title-block bottom status strip** `FOR PLANNING` runs across the bottom of the title block but is partially clipped by the sheet edge / appears as `FUK PLANNING` style with an overlay artefact (same defect as Sheet 01).
    *Fix:* same as Sheet 01 finding 1.

73. **COSMETIC — VIEWING NOTES + PALETTE side panel** is well organised; text is ~7 pt while ~30 mm of margin is unused below.
    *Fix:* upsize to 9 pt.

74. **COSMETIC — Bullet hyphens** `• Yellow stock brick — retained` use an em-dash that is rendered short; on some lines the dash and the next word touch.
    *Fix:* ensure consistent en-dash with hair space.

---

## Sheet 11 — 3D Axonometric (Compact Shower-Room)

75. **IMPORTANT — Title-block status strip** same clipping defect as Sheets 01 and 10.

76. **COSMETIC — FITTINGS / ACCESS / FINISHES** notes panel ~7 pt body; could be 9 pt — plenty of right-side margin.

77. No annotations on the 3D model itself, so no in-image legibility issues (but consider tagging the four fixtures with key letters or numbers for cross-reference to Sheet 08-B).

---

## Sheet 12 — 3D Axonometric (Internal Opening)

78. **IMPORTANT — Title-block status strip** same clipping defect.

79. **COSMETIC — OPENING / MAKING GOOD** notes panel — same 7 pt issue.

80. No in-image legibility issues.

---

## Cross-sheet / pack-wide observations

A. **Title-block "FOR PLANNING" status strip clipping** appears on Sheets 01, 10, 11, 12 (every sheet whose title block bottom row carries the red status text). The text appears to be rendered slightly below the title-block frame so the cap-line of the letters is clipped by the title-block border and overlays the sheet bottom-edge line. **BLOCKER for the pack as a whole** — every sheet has it.
*Fix:* nudge status text up by 2 mm in the template; or enlarge the status cell vertically.

B. **North-arrow duplication** appears on every plan sheet that has a graphical N (Sheets 02-A, 02-B, 08-A, 08-B, 09). The text `N ↑` next to the drawing region is redundant. **IMPORTANT pack-wide.**
*Fix:* template change — remove the text N; keep graphical disc only.

C. **Notes columns set at ~7 pt** on Sheets 02-A/B, 03-A/B, 04-A/B, 05-A/B, 06, 08-A/B, 09, 10, 11, 12 — i.e. the entire pack. There is substantial unused white space to the right of every notes column. **COSMETIC pack-wide.**
*Fix:* template change — bump body text to 9 pt; allow notes column to widen 10–15 mm.

D. **"Bricked-up opening" labels and other red/blue annotations laid on hatching** (Sheets 03-A, 03-B) — the rendering pipeline appears to anchor these labels at the centroid of the feature, which lands them on the hatch. **BLOCKER for those two sheets.**
*Fix:* in `dimensions.yaml`, add explicit label offsets / leader anchors for callouts.

---

# 200-word summary — Ten worst legibility issues

The pack has a consistent, systematic problem: callout labels are anchored on top of hatched walls, dark fills, dimension chains, or other text — yielding ten genuine blockers:

1. **Sheet 03-A & 03-B** — `Existing bricked-up opening` label set ON the brick hatching: red text on red brick, unreadable.
2. **Sheet 02-A & 02-B** — East-wall annotation cluster (kitchen window above / courtyard floors / basement retained) is stacked on the wall hatching with strike-through artefacts from superseded text.
3. **Sheet 02-B** — `PROPOSED reclaimed cast-iron spiral staircase` label collides with the 720/1850/720 dimension string and the tread-number wedges.
4. **Sheet 03-B** — Red callout box `PROPOSED: Kitchen window converted to glazed doorway` overlays the window itself with transparent background.
5. **Sheet 03-B** — Mid-elevation pink note overlaid by both the doorway frame and the spiral helix curve (triple collision).
6. **Sheet 04-B** — Top-left red explanatory box about the staircase silhouette sits on the brick fill and over the 2100 head dimension.
7. **Sheet 04-B** — Mid-elevation orange callout sits inside the spiral sweep, against dark spiral and door leaf (clipped text).
8. **Sheet 05-B** — Blue `New doorway` callout crosses the helix curve and the +5270 ceiling level line.
9. **Sheet 07-B** — Red beam-zone label clipped to a partial word and rendered red-on-red.
10. **Sheet 08-B** — Shower-room fixture labels (`SHOWER`, `WC`, `BASIN`, `LAUNDRY`) jammed into 8 mm cells with red `New door / to stair` callout sitting on the dark wall fill.

Pack-wide: title-block `FOR PLANNING` status text is clipped on every sheet (BLOCKER); every plan has duplicate N indicators (IMPORTANT); notes columns are uniformly under-sized at ~7 pt (COSMETIC).
