# Dimension Audit — Flat 1, 20 Hornton Street

**Auditor:** Independent dimensional reviewer.
**Date:** 2026-05-25.
**Subject:** `drawings/dimensions.yaml` (rev A, the *current* schema with
`rear_wall` + `side_wall` keys and the single-central-door + two-flanking-sashes
rear-recess interpretation).

**Method:** Every numeric value in the YAML was cross-checked against:
- `read_me.,md` (Craig's compiled note containing the verbatim text of
  Grahame's site-measurement emails);
- the five `Re_ For what it is worth ... .msg` files (body extracted via
  `olefile`, stream `__substg1.0_10130102`, and HTML stripped);
- `File1.msg` (Grahame's design-philosophy note) and the three signature-only
  `File2/4/5.msg`, and `File3.msg` (Merlyn shower-door spec);
- `job16873-1.pdf` (the Real Estate Services surveyed plan, 12/2/2026 —
  the only authoritative measured plan of No. 20 itself, per
  `second_pass_review.md` text extraction);
- the seven `shared image (11)-(17).jpg` photos (per the two prior reviews,
  no measured dimensions but layout/orientation/composition);
- `extracted_dimensions.yaml` and `second_pass_review.md` (prior
  agent outputs — used as supporting evidence, not as primary source).

**Classifications:**
- **VERIFIED**   – matches at least one source exactly (or within a stated
  rounding tolerance).
- **INFERRED**   – not stated in any source but derived consistently from
  other source values; the derivation is recorded.
- **ASSUMED**    – a working estimate flagged TBC in the YAML or by the
  auditor; site re-measure / clarification needed before relying on it.
- **CONFLICTING** – contradicted by at least one source — the conflicting
  sources are listed.
- **ERROR**      – arithmetic or logical mistake inside the YAML itself.

Source citation codes: `R1`-`R5` = Re_…msg N; `RM` = `read_me.,md`;
`F1` = File1.msg; `JOB` = job16873-1.pdf; `PHOTO13` etc = the named JPG;
`2P` = `second_pass_review.md`; `PA` = `photo_analysis.md`;
`EX` = `extracted_dimensions.yaml`.

---

## 1. Project header

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `project.title` | "Flat 1, 20 Hornton Street, London W8 4NR" | JOB, RM | VERIFIED | Matches RES survey header and email subject. |
| `project.client` | "G. Pearce" | RM | VERIFIED | "Grahame Pearce" per RM (note: signature line in the .msg files actually reads "Grahame McGirr"; reconcile with Craig). Mild flag: surname may be McGirr not Pearce. |
| `project.borough` | "Royal Borough of Kensington and Chelsea" | 2P, RM | VERIFIED | RBKC per 30 Hornton precedent docs. |
| `project.conservation_area` | "Kensington Conservation Area (to confirm)" | 2P | VERIFIED | Confirmed by Rawspace 30 Hornton and Savills 24 Hornton applications. The "(to confirm)" caveat could be relaxed. |
| `project.listed_building` | true | 2P | VERIFIED | Both 24 and 30 Hornton precedent applications confirm Grade II. |

---

## 2. flat_envelope (from job16873-1.pdf)

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `flat_envelope.basement.length_mm` | 19060 | JOB ("19.06 m"), EX, 2P | VERIFIED | Matches surveyor figure exactly. |
| `flat_envelope.basement.width_mm` | 5700 | JOB ("5.70 m"), EX, 2P | VERIFIED | Matches surveyor figure exactly. |
| `flat_envelope.basement.ceiling_heights_mm.front_room` | 2820 | JOB ("height 2.82m"), EX, 2P | VERIFIED | Surveyor noted "2.82 m" on the small projecting room next to the patio. The label "front_room: 2820 # patio area" is potentially confusing — the 2.82 m height in JOB is the room ADJACENT to the rear patio, not a front-of-house room. Suggest renaming key (`rear_patio_adjacent_room` or similar). LABEL ERROR risk — value correct. |
| `flat_envelope.basement.ceiling_heights_mm.bedrooms` | 2760 | JOB ("height 2.76m"), EX | VERIFIED | |
| `flat_envelope.basement.ceiling_heights_mm.rear_room` | 2760 | JOB, EX | VERIFIED | |
| `flat_envelope.basement.ceiling_heights_mm.rear_basement_under_kitchen` | 1890 | JOB ("height 1.89m"), EX | VERIFIED | JOB attributes 1.89 m to the rear vault per 2P. Label "rear_basement_under_kitchen" may be wrong — 2P reads it as a pavement vault dimension, not the rear. CONFLICTING (label vs. value). Value is correct; LABEL may be wrong. |
| `flat_envelope.ground_floor.length_mm` | 13770 | JOB ("13.77 m"), EX, 2P | VERIFIED | |
| `flat_envelope.ground_floor.width_mm` | 4340 | JOB ("4.34 m"), EX, 2P | VERIFIED | |
| `flat_envelope.ground_floor.ceiling_heights_mm.front_lightwell_zone` | 2450 | JOB ("2.45 m"), EX | VERIFIED | |
| `flat_envelope.ground_floor.ceiling_heights_mm.front_lounge` | 3280 | JOB ("3.28 m"), EX | VERIFIED | |
| `flat_envelope.ground_floor.ceiling_heights_mm.rear_reception` | 3280 | JOB ("3.28 m"), EX | VERIFIED | |
| `flat_envelope.ground_floor.ceiling_heights_mm.kitchen` | 2450 | JOB ("2.45 m") + R2 ("ceiling height is approximately 245 cm") | VERIFIED | Cross-confirmed by two sources. |
| `flat_envelope.total_storeys` | 2 | JOB, RM | VERIFIED | |

---

## 3. courtyard

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `courtyard.plan_width_mm` | 3250 | R1, R4 ("325 cm wide"), EX, 2P | VERIFIED | |
| `courtyard.plan_depth_mm` | 2950 | R1, R4 ("295 cm deep"), EX, 2P | VERIFIED | JOB also notes "2.94 m" rear lightwell depth at GF level. Minor 10 mm tolerance. |
| `courtyard.slab_to_gf_ffl_mm` | 2820 | JOB ("height 2.82m" on small basement room), EX, **NOT** directly stated by Grahame | **CONFLICTING** | YAML comment says "= 2.82 m surveyor". The 2.82 m in JOB is the *ceiling height* of a small projecting basement room (per 2P), NOT a measured slab-to-FFL. 2P flags this same value as potentially 100–160 mm short of reality: basement ceiling 2.76 m + slab + floor build-up ≈ 2.91–2.98 m. Furthermore, R5's "kitchen-window sill at 372 cm above courtyard slab" implies (372 cm − 72 cm sill) = 300 cm slab-to-GF-FFL, which contradicts 2820. **Significant discrepancy** — drives staircase rise (14 × 201 = 2814 ≈ 2820), so re-check is critical. |
| `courtyard.white_paint_datum_mm` | 2900 | R5 ("height to the white line above is 290 cm"), EX | VERIFIED | |
| `courtyard.rear_boundary_wall_height_mm` | 3500 | R4 ("approximately: 350 cm high"), EX | VERIFIED | |
| `courtyard.surface` | (description) | — | ASSUMED | Working description; not a measurement. |
| `courtyard.drainage_position` | TBC | — | ASSUMED | Flagged TBC in YAML; correct. |

---

## 4. rear_wall (south wall of courtyard)

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `rear_wall.total_width_mm` | 3250 | = courtyard width | INFERRED | Set equal to courtyard plan width; reasonable. |
| `rear_wall.lower_basement.left_painted_cheek_mm` | 720 | R5 ("two rear doors are symmetrical, at 72 cm each side"), EX, 2P, PA | **CONFLICTING / INTERPRETATION** | R5's literal phrasing is "two rear doors … at 72 cm each side" — Grahame's words refer to "doors", not "cheeks". The YAML adopts Craig's later correction (per the explanatory `_grahame_72cm_note`) that this actually means painted-brick CHEEKS outside the recess. This is a judgement call: PA and 2P both endorse the cheek reading, supported by visual evidence in PHOTO14. Defensible, but flag explicitly as Craig's re-interpretation of Grahame's words, not Grahame's own statement. |
| `rear_wall.lower_basement.recess_width_mm` | 1850 | R5 ("overall width of the full rear opening/recess is 185 cm") | VERIFIED | |
| `rear_wall.lower_basement.right_painted_cheek_mm` | 720 | R5 (per same re-interpretation as above) | CONFLICTING / INTERPRETATION | Same caveat as left cheek. |
| `rear_wall.lower_basement._check_arithmetic` | "720+1850+720 = 3290 vs 3250" | self-check | VERIFIED arithmetic; CONFLICTING with courtyard width (40 mm over) | Real geometric tension. The 4 cm tolerance is plausible (Grahame's 325 cm courtyard width is to-nearest-5 cm by tape) but should be flagged for site re-measure. |
| `rear_wall.lower_basement.side_window_width_mm` | 450 | YAML "(working estimate from photo)" | ASSUMED | Not in any source — pure photo estimate. Flagged TBC. |
| `rear_wall.lower_basement.side_window_raised_sill_height_mm` | 600 | YAML estimate | ASSUMED | Not in any source. Required because per Craig's update (RM end-of-file material) the two flanking sashes have raised brick sills; height is a guess. |
| `rear_wall.lower_basement.central_door_width_mm` | 900 | YAML estimate; R5 says "doorway/opening up to the small wooden balustrade elements is 82 cm wide" | **CONFLICTING** | R5 gives 820 mm for the actual door opening; the YAML uses 900 mm. The YAML's `_grahame_82cm_note` claims 82 cm is the *clear* opening with 90 cm the *frame*. That's a defensible reading but it inverts the usual convention (door size is normally the leaf or clear; frame is bigger by 50–80 mm not 80 mm). Either choose 820 mm and explain, or keep 900 mm and explain. Currently inconsistent with source. |
| `rear_wall.lower_basement.inner_reveal_mm` | 25 | YAML | ASSUMED | Working figure for joinery reveal; not measured. |
| `rear_wall.lower_basement.head_height_above_slab_mm` | 2300 | YAML estimate | ASSUMED | Not in source. Door head height; needs site check. |
| `rear_wall.lower_basement.head_to_white_line_mm` | 2900 | R5 ("height to the white line above is 290 cm") | VERIFIED | Note: R5 literally says "height to the white line", which is the *datum to top of painted band* — i.e., total recess head above slab to the painted-line datum, not above the door head. YAML's interpretation labels this as recess-height-at-white-line which is consistent. |
| `rear_wall.lower_basement.threshold_level_above_slab_mm` | 0 | YAML | INFERRED | Door opens onto slab directly; reasonable. But contrast with R5: "sill height is 80 cm" (= 800 mm). That 80 cm in R5 is ambiguous — earlier prior agents read it as the doors' sidelight sill height (i.e., the bottom of the side glazing is 80 cm above slab). If so, the central door threshold is 0 but the side-light sills are 800 mm (= raised brick sills). The YAML uses 600 mm for side_window_raised_sill_height — **CONFLICTING with R5's 80 cm/800 mm** if the 80 cm refers to sash sill height. |
| `rear_wall.lower_basement._status_arithmetic` | "1900 mm vs 1850 mm recess — 50 mm over" | self-check | ERROR (logical) | The internal sum 25+450+25+900+25+450+25 = 1900 mm exceeds the recess 1850 mm by 50 mm. The YAML acknowledges this. Either widen door (900→850) or shrink reveals — currently the figure does not close. |
| `rear_wall.upper_ground.sash_width_mm` | 2100 | R3 ("rear-facing window is approximately: 210 cm wide"), EX, 2P | VERIFIED | |
| `rear_wall.upper_ground.sash_height_mm` | 2400 | R3 ("300 cm to 310 cm high") — YAML rejects this as physically impossible | **CONFLICTING** | R3 explicitly says 300–310 cm. YAML uses 2400 mm citing impossibility (head would exceed 3280 ceiling). The YAML's reasoning is sound, but the value (2400) is the auditor's/agent's working figure, NOT the source value. Should classify as INFERRED with a note: Grahame's 300–310 cm probably refers to "above-floor-to-head" (sill at 80 cm + window 220–230 cm = 300–310 cm to head) — i.e., the value is the *head height above FFL*, not the *window height*. Recompute: 3000–800 = 2200 mm or 3100–800 = 2300 mm — neither is 2400. Suggest 2200–2300 mm. CURRENT 2400 is INFERRED but probably 100–200 mm too high. |
| `rear_wall.upper_ground.sill_height_above_ffl_mm` | 800 | R3 ("sill height is approximately: 80 cm from floor level"), EX | VERIFIED | |
| `rear_wall.upper_ground.sill_height_above_courtyard_slab_mm` | 3800 | R5 ("rear windows are slightly higher, at approximately 380 cm to the sill"), EX, 2P | VERIFIED | |
| `rear_wall.upper_ground.head_height_above_courtyard_slab_mm` | 6200 | = 3800 + 2400 | INFERRED | Derived from sash_height; if sash_height changes (as above) this changes too. |
| `rear_wall.upper_ground.horizontal_position_from_east_corner_mm` | 575 | YAML "centring approx 2100 in 3250" | INFERRED | Reasonable centring; not stated in any source. R3 gives "40 cm between … side wall/opening and window" and "70 cm beyond the window" — i.e., 400 + 2100 + 700 = 3200, very close to 3250. Therefore offset from one corner should be 400 mm (or 700 mm from the other), NOT 575 mm. **ERROR/INFERENCE INCONSISTENT WITH R3.** Adopt 400 mm or 700 mm to match Grahame's stated 40 cm / 70 cm flanking dimensions. |

### Critical consistency check: 3800 cm sill − 2820 slab-to-FFL = 980 mm sill above FFL
- R3 says 800 mm sill above FFL.
- 3800 − 2820 = 980 mm, NOT 800 mm.
- 180 mm discrepancy. Either `slab_to_gf_ffl_mm` is wrong (should be ~3000) OR the 3800/800 are inconsistent at source. **MATERIAL CONFLICT.**

---

## 5. side_wall (east wall of courtyard)

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `side_wall.total_length_mm` | 3000 | R5 (51+60+49+123+17 = 300 cm), EX, 2P | VERIFIED | Arithmetic confirmed: 51+60+49+123+17 = 300. |
| `side_wall._check_arithmetic` | "300 cm vs courtyard depth 295 cm" | self | VERIFIED (5 mm rounding tolerance) | Plausible. |
| `side_wall.lower_basement.sequence_from_north_mm` | [510, 600, 490, 1230, 170] | R5 ("51 cm solid wall / 60 cm bricked / 49 cm pier / 123 cm window / 17 cm to end") | VERIFIED (values) | One caveat: R5 says "from left to right" — but the YAML labels this as "from north" (origin = rear-boundary side). Whether north = R5's left depends on orientation. Per 2P §A, the side wall runs north-south with the north end being the rear-boundary corner. If Grahame faced the building from inside the courtyard, his "left to right" would be **south to north** (or vice versa) — orientation needs an explicit photo-based fix. Risk: sequence may need to be reversed. ORIENTATION CHECK NEEDED. |
| `side_wall.lower_basement.both_openings_sill_height_above_slab_mm` | 900 | R5 ("Under both sills, the height is 90 cm"), EX, 2P | VERIFIED | |
| `side_wall.lower_basement.both_openings_height_mm` | 1600 | R5 ("Both window/opening heights are 160 cm"), EX, 2P | VERIFIED | |
| `side_wall.lower_basement.both_openings_head_height_above_slab_mm` | 2500 | = 900 + 1600 | VERIFIED (arithmetic) | |
| `side_wall.upper_ground.glass_gap_mm` | 660 | R2 ("actual window gap of approximately 66 cm"), EX | VERIFIED | |
| `side_wall.upper_ground.structural_recess_width_mm` | 900 | R2 ("the full structural recess/receptacle is wider" — no number) | ASSUMED | Estimate; flagged TBC. |
| `side_wall.upper_ground.sill_height_above_kitchen_ffl_mm` | 720 | R2 ("sill height of this opening is approximately 72 cm"), EX | VERIFIED | |
| `side_wall.upper_ground.sill_height_above_courtyard_slab_mm` | 3540 | = 2820 + 720 | INFERRED / **CONFLICTING with R5** | R5 explicitly says "approximately 372 cm" (= 3720 mm) for the kitchen window sill above courtyard. YAML uses 3540 derived from the (already-suspect) 2820 slab-to-FFL. 180 mm discrepancy — same root cause as the rear-wall 800/3800/2820 conflict. YAML's `_status_sill_grahame` acknowledges this 18 cm gap. CONFIRMS that `slab_to_gf_ffl_mm` should likely be ~3000, not 2820. |
| `side_wall.upper_ground.head_height_above_kitchen_ffl_mm` | 2050 | YAML estimate | ASSUMED | Flagged TBC; chosen to clear 2450 ceiling. Note: 2050 + 400 ceiling clearance would put head at 2050 above FFL; existing window head is 720+1600 = 2320 above FFL per the proposed reuse of existing opening – the 2050 may not match the existing head. INTERNAL INCONSISTENCY: the proposed scheme reuses the existing window head, which sits at 720 (sill) + ? (opening height). The opening height isn't given explicitly for this window in any source. |
| `side_wall.upper_ground.head_height_above_courtyard_slab_mm` | 4870 | = 3540 + (2050 − 720) = 4870? Let's check: 3540 sill + (2050 − 720) gap = 4870 mm. The formula in YAML implies head_above_slab = sill_above_slab + (head_above_ffl − sill_above_ffl) — algebraically correct. | INFERRED | Derived; downstream of the disputed 2820 slab/FFL. |
| `side_wall.upper_ground.horizontal_position_from_north_corner_mm` | 2050 | YAML estimate to centre under staircase | ASSUMED | Flagged TBC. |

---

## 6. existing_services

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `existing_services.downpipe_side_wall.diameter_mm` | 90 | PA, 2P, PHOTO13/16 (visual) | ASSUMED | Standard cast-iron downpipe diameter; not measured. |
| `existing_services.downpipe_side_wall.material` | "cast iron, black-painted" | PA, PHOTO13/16 | VERIFIED | |
| `existing_services.downpipe_side_wall.position_from_north_corner_mm` | 1500 | YAML "estimated from photo 16" | ASSUMED | Flagged TBC. |
| `existing_services.downpipe_side_wall.swan_neck_height_above_slab_mm` | 3500 | YAML estimate | ASSUMED | Flagged TBC; same value as boundary wall height — may be coincidental as 2P flagged. |
| `existing_services.downpipe_rear_wall_right.*` | (estimates) | PHOTO14 (visual only) | ASSUMED | None of these dimensions are measured. PHOTO14 actually shows the downpipe in the inside L-corner — only one downpipe is visible there. The YAML postulates a SECOND downpipe on the right side of the rear wall; this is not clearly visible in any photo and PA does not list it. **POTENTIAL FABRICATION** of a second downpipe. Confirm on site whether two or one. |
| `existing_services.downpipe_rear_wall_left.*` | (estimates) | PHOTO14, PHOTO16, PA | INFERRED | PA confirms a downpipe in the inside corner. |

---

## 7. proposed

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `proposed.side_wall_upper_doorway.threshold_level_above_kitchen_ffl_mm` | 0 | design intent (RM, F1) | VERIFIED (intent) | |
| `proposed.side_wall_upper_doorway.threshold_level_above_courtyard_slab_mm` | 2820 | = `slab_to_gf_ffl_mm` | INFERRED | Downstream of the disputed 2820. |
| `proposed.side_wall_upper_doorway.head_height_above_kitchen_ffl_mm` | 2050 | YAML "match existing window head" | ASSUMED | See side-wall upper note above. |
| `proposed.side_wall_upper_doorway.clear_width_mm` | 800 | YAML | ASSUMED | Reasonable for a doorway; not stated in source. |
| `proposed.side_wall_upper_doorway._drop_amount_mm` | 720 | = sill 720 → 0 | VERIFIED arithmetic | RM brief: "approximately 400 mm" extension. YAML correctly notes this discrepancy and adopts 720 mm as the functional value. INTERPRETATION CHANGE from brief — flagged appropriately. |
| `proposed.side_wall_lower_reinstated_window.opening_width_mm` | 600 | R5 ("60 cm width of the bricked-up former window") | VERIFIED | |
| `proposed.side_wall_lower_reinstated_window.opening_height_mm` | 1600 | R5 | VERIFIED | |
| `proposed.side_wall_lower_reinstated_window.sill_height_above_slab_mm` | 900 | R5 | VERIFIED | |
| `proposed.downpipe.new_position_from_north_corner_mm` | 2950 | YAML — design choice | ASSUMED | Design proposal, not a measurement. |
| `proposed.staircase_installation.centre_distance_from_side_wall_mm` | 950 | YAML — design choice | ASSUMED | Geometric: with envelope radius 875 mm, centre at 950 from each wall gives 75 mm clearance — tight. Reasonable layout, not from source. |
| `proposed.staircase_installation.centre_distance_from_rear_wall_mm` | 950 | YAML — design choice | ASSUMED | Same. |
| `proposed.staircase_installation.top_landing_level_above_courtyard_slab_mm` | 2820 | = slab_to_gf_ffl | INFERRED | Downstream of disputed 2820. |

---

## 8. spiral_staircase

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `spiral_staircase.n_treads` | 14 | R1 ("approximately 15 cast-iron treads / pads") + YAML re-interpretation as 14 risers + 1 landing pad | INFERRED | Defensible: 15 pads, 14 rises (n-1 rule). YAML's `_note_treads` explains this clearly. |
| `spiral_staircase.tread_rise_mm` | 201 | YAML derives from 2814 / 14 ≈ 201 | INFERRED | R1 says 200–210 mm range; 201 is within. Note: this is *back-derived* to land at 2814 ≈ disputed 2820. If slab-to-FFL is really ~3000 (per the 372/372 cm-side-wall-sill computation), then 14 risers would need ~214 mm rise — at the upper edge of R1's range. CIRCULAR DERIVATION dependent on 2820. |
| `spiral_staircase.total_rise_mm` | 2814 | = 14 × 201 | VERIFIED arithmetic | Same circular caveat. |
| `spiral_staircase.central_pole_height_mm` | 3300 | R1 ("central pole is approximately 3.3 m high"), EX | VERIFIED | |
| `spiral_staircase.central_pole_diameter_mm` | 90 | YAML | ASSUMED | Not stated in any source. R1 gives no pole diameter. |
| `spiral_staircase.outer_radius_mm` | 800 | R1 ("tread/pad projects approximately 80 cm from the centre/inner pole area towards the outer edge"), EX | VERIFIED | |
| `spiral_staircase.envelope_radius_mm` | 875 | R1 ("practical circular envelope of at least 165 cm to 170 cm … ideally 170-175") — 875 mm = 1750 mm diameter → upper end | INFERRED | Reasonable interpretation; matches Grahame's upper envelope. |
| `spiral_staircase.tread_widest_mm` | 340 | R1 ("Each tread is approximately 34 cm wide at its widest point") | VERIFIED | |
| `spiral_staircase.tread_thickness_mm` | 30 | YAML | ASSUMED | Not in source — joinery assumption. |
| `spiral_staircase.rotation_per_tread_deg` | 25.7 | = 360 / 14 | VERIFIED arithmetic | Implicit assumption of a full 360° revolution over 14 risers — that's a design choice, not necessarily physical. INFERRED design choice. |
| `spiral_staircase.start_angle_deg` | 270 | YAML — design choice | ASSUMED | |
| `spiral_staircase.handrail_height_mm` | 900 | YAML — Building Regs default | ASSUMED | Not from source. |
| `spiral_staircase.centre_position_mm.from_side_wall` | 950 | proposed | ASSUMED | See above. |
| `spiral_staircase.centre_position_mm.from_rear_wall` | 950 | proposed | ASSUMED | |

---

## 9. front_lounge

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `front_lounge.approx_room_width_mm` | 4340 | = GF flat width | INFERRED | Equals total flat width; ignores two external walls. R3 implies the front lounge is *narrower* than the rear room by 35 cm because of the hallway. So actual room width is < 4340. **CONFLICTING** with R3's geometry. |
| `front_lounge.fireplace_wall_breakdown_mm` | [1900, 1800, 1900] | R3 ("190 cm + 180 cm + 190 cm"), EX, 2P | VERIFIED | Total 5600 — exceeds the 4340 flat width by 1260 mm. This is the LONG axis of the room (along external front wall), so the 5600 mm is the room *length*, not width. INTERPRETATION CHECK needed: confirm whether the fireplace wall is the room's long or short axis. (R3 says "fireplace wall, facing towards the front of the house" — this is the wall containing the front bay window, which is the room's *front external* wall = the short dimension typically.) If short = 5600 mm, then the front lounge is large — but flat width is only 4340 mm. **MATERIAL CONFLICT.** Most likely Grahame's 190/180/190 sums to 560 cm = the FULL ROOM LENGTH (front-to-spine-wall) of the lounge, not its width. ANNOTATE accordingly. |
| `front_lounge.far_left_wall_breakdown_mm` | [700, 1120, 830] | R3 ("70 cm wall / 112 cm cut-out / 265 cm total wall length"), EX | INFERRED | YAML's interpretation: 70 + 112 + (265 − 70 − 112) = 70+112+83 cm — derived correctly. 2P previously flagged this as a "schema confusion" (it noted an earlier YAML had `[700,1120,2650]`); the current YAML now correctly decomposes 265 cm total to give the third segment as 83 cm. CORRECTED — no longer an error. |
| `front_lounge.far_left_wall_total_mm` | 2650 | R3 ("265 cm total wall length") | VERIFIED | |
| `front_lounge.ceiling_mm` | 3280 | JOB | VERIFIED | |

---

## 10. rear_reception

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `rear_reception.approx_room_width_mm` | 4340 | = GF flat width | INFERRED | Same caveat as front lounge — but R3 says rear room is "around 300 cm across on that side" — so 4340 contradicts Grahame's "approximately 300 cm". Note R3 also says rear is ~35 cm wider than front, implying both are < 4340. **CONFLICTING** with R3. |
| `rear_reception.side_wall_breakdown_mm` | [650, 1120, 1500] | R3 ("60 to 70 cm wall section / 112 cm opening / 150 cm wall section"), EX | VERIFIED (mid-point of 60-70 = 65) | Sum = 3270 mm = 327 cm; R3's "approximately 300 cm across" then disagrees by 27 cm. Probably Grahame's "300 cm" is one segment and the 3270 mm is for the full side-wall — INTERPRETATION needed. |
| `rear_reception.dividing_wall_thickness_mm` | 100 | R3 ("internal wall itself appears to be approximately 10 cm thick"), EX | VERIFIED | |
| `rear_reception.fireplace_wall_breakdown_mm` | [1450, 1840, 1460] | R3 ("145 cm / 184 cm fireplace / 146 cm"), EX, 2P | VERIFIED | Sum = 4750 mm = 475 cm. |
| `rear_reception.rear_wall_window_offset_mm` | 400 | R3 ("approximately 40 cm between the relevant side wall/opening and the window"), EX | VERIFIED | |
| `rear_reception.rear_wall_window_width_mm` | 2100 | R3, EX | VERIFIED | |
| `rear_reception.rear_wall_window_end_pier_mm` | 700 | R3 ("then there is approximately 70 cm beyond the window") | VERIFIED | Note: 2P labelled this "possibly an estimate" — actually it IS in R3 (line ~677). VERIFIED. |
| `rear_reception.width_difference_from_front_mm` | 350 | R3 ("around 35 cm wider than the front room"), EX | VERIFIED | |
| `rear_reception.ceiling_mm` | 3280 | JOB | VERIFIED | |

### Geometry check on rear wall:
- 400 (offset) + 2100 (window) + 700 (end pier) = 3200 mm = 320 cm.
- Matches courtyard width 3250 mm to within 50 mm (tolerable).
- Matches `rear_wall.total_width_mm` 3250.

---

## 11. internal_opening_between_rooms

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `internal_opening_between_rooms.wall_thickness_mm` | 100 | R3 | VERIFIED | |
| `internal_opening_between_rooms.existing.approx_width_mm` | 1120 | R3 "112 cm cut-out" — but the YAML interprets this cut-out as the existing internal opening | INFERRED | R3 mentions "112 cm cut-out" on the far-left wall of the FRONT LOUNGE (and "112 cm opening/cut-out" on the side wall of REAR RECEPTION). It is plausible that this is the existing internal-spine-wall opening (especially since R3 mentions a "doorway" being walked through between rooms). VALIDATION needed: is the 112 cm cut-out the spine-wall opening or a different feature? |
| `internal_opening_between_rooms.existing.approx_height_mm` | 2100 | YAML estimate | ASSUMED | Not in source; standard door height. Flagged TBC. |
| `internal_opening_between_rooms.proposed.nib_left_mm` | 700 | R3 final paragraph ("I would like to make the gap in between the rooms 70 on one side and 60 on the Other"), EX | VERIFIED | This is in R3 explicitly. 2P called this "unsourced" — that was wrong; it IS in R3. |
| `internal_opening_between_rooms.proposed.nib_right_mm` | 600 | R3 (same sentence) | VERIFIED | |
| `internal_opening_between_rooms.proposed.height_mm` | 2950 | R3 ("290 to 3 m height"), EX | VERIFIED | (Uses lower-end midpoint of 2900-3000.) |
| `internal_opening_between_rooms.proposed.clear_width_mm` | 2400 | YAML | **CONFLICTING / INFERRED** | YAML's `_clear_width_calculation` computes clear ≈ 2340 mm and then states 2400 mm. **50–60 mm overstatement vs. own derivation.** Also: the rear room is ~35 cm wider than the front, and the front lounge has nibs adding to 1300 mm. If front lounge clear width on the spine wall is, say, 3000 mm (rear room 3270 mm − 270 mm), then clear opening = 3000 − 1300 = 1700 mm — substantially smaller than 2400. The derivation assumes the *rear* room width sets the figure; depends on which room sets the nib reference. UNRESOLVED. |

---

## 12. kitchen

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `kitchen.width_mm` | 2400 | R2 ("approximately 240 cm wide"), EX, 2P | VERIFIED | |
| `kitchen.length_window_side_mm` | 2900 | R2 ("approximately 290 cm to the inner part of the door"), EX | VERIFIED | |
| `kitchen.length_door_side_mm` | 2750 | R2 ("approximately 275 cm in total"), EX | VERIFIED | |
| `kitchen.length_opposite_side_mm` | 2500 | R2 ("only around 250 cm, because the wall is slightly angled"), EX | VERIFIED | |
| `kitchen.ceiling_height_mm` | 2450 | R2, JOB | VERIFIED | |
| `kitchen.rear_door_to_external_width_mm` | 1000 | R2 ("rear door is approximately 100 cm wide"), EX | VERIFIED | |
| `kitchen.rear_small_window.width_mm` | 480 | R2 ("approximately 48 cm wide"), EX | VERIFIED | |
| `kitchen.rear_small_window.height_mm` | 1300 | R2 ("130 cm high"), EX | VERIFIED | |

---

## 13. proposed_shower_room

| YAML key | Current value | Source(s) | Classification | Notes |
|---|---|---|---|---|
| `proposed_shower_room.available_length_mm` | 2500 | R2 | VERIFIED | |
| `proposed_shower_room.partition_thickness_mm` | 100 | YAML | ASSUMED | Standard stud partition. |
| `proposed_shower_room.zones.shower_tray_width_mm` | 1000 | R2 ("approximately 100 cm wide") | VERIFIED | |
| `proposed_shower_room.zones.wc_zone_mm` | 600 | YAML — design allocation | ASSUMED | Not in R2. |
| `proposed_shower_room.zones.basin_zone_mm` | 500 | YAML — design allocation | ASSUMED | Not in R2. |
| `proposed_shower_room.zones.laundry_zone_width_mm` | 600 | R2 ("around 60 cm width") | VERIFIED | |
| **Sum-check**: 1000 + 600 + 500 + 600 = 2700 mm > 2500 mm available | | | **ERROR** | Zone widths exceed the available 2500 mm by 200 mm. R2 also flags this concern ("190 cm for shower-room elements"). Layout does not close. |
| `proposed_shower_room.door_type` | "Pocket / sliding door" | R2 | VERIFIED | |
| `proposed_shower_room.pocket_door_clear_opening_mm` | 700 | YAML | ASSUMED | |
| `proposed_shower_room.glazed_doors_available.width_mm` | 1245 | R2 ("approximately: 124.5 cm wide") | VERIFIED | |
| `proposed_shower_room.glazed_doors_available.height_mm` | 2245 | R2 ("224.5 cm high") | VERIFIED | |
| `proposed_shower_room.upstairs_shower_door.model` | "Merlyn Ionic Essence Black Hinged with Inline Panel" | F3 (File3.msg), RM | VERIFIED | |
| `proposed_shower_room.upstairs_shower_door.width_mm` | 940 | F3 ("940 x 2000mm") | VERIFIED | |
| `proposed_shower_room.upstairs_shower_door.height_mm` | 2000 | F3 | VERIFIED | |

---

## 14. Cross-cutting issues NOT in any single row

### 14.1 The 2820 mm slab-to-FFL is the lynchpin
- Three sources contradict 2820:
  - JOB shows the 2.82 m as a *ceiling* of a small projecting basement room, not a slab-to-FFL.
  - R5: kitchen-window sill = 3720 mm above slab; R5: kitchen-window sill = 720 mm above kitchen FFL → slab-to-FFL = 3000 mm.
  - R5: rear-window sill = 3800 mm above slab; R3: rear-window sill = 800 mm above FFL → slab-to-FFL = 3000 mm.
- Both internal consistency checks point to ~3000 mm slab-to-FFL, not 2820.
- The 8 cm "step" between kitchen and rear sills (R5: 372 vs. 380) is preserved either way.
- **Recommend changing `courtyard.slab_to_gf_ffl_mm` from 2820 to 3000** pending site re-measure.
- Knock-on: spiral staircase total_rise_mm becomes 3000, 14 × 214 = 2996, well within R1's 200–210 mm/tread range BUT at the upper edge — could justify a small landing/plinth as R1 itself anticipates.

### 14.2 Rear-recess geometry doesn't close (50 mm over)
- 25 + 450 + 25 + 900 + 25 + 450 + 25 = 1900 mm vs. recess 1850 mm.
- Either central door 850 mm or side sashes 425 mm each.
- Compounded by uncertain 82 cm vs. 90 cm door-leaf reading from R5.

### 14.3 Front lounge / rear reception widths
- YAML uses 4340 mm for both rooms; R3 implies the rear room is ~3000-3270 mm wide (the "300 cm across that side") and the front lounge is 350 mm narrower. The 4340 figure is the *flat envelope* width, not either internal room. Suggest dropping `approx_room_width_mm: 4340` from both rooms and using their actual cross-dimension instead.

### 14.4 Rear-reception window height
- R3 explicit: 300–310 cm.
- YAML adopts 2400 mm and flags as impossible.
- Most likely Grahame's 300–310 cm is sill+window = 800+2200 = 3000 (or +2300 = 3100) above FFL — i.e., he was quoting head height above floor, not window height. Suggest sash_height_mm = 2200–2300 mm.

### 14.5 Side-wall opening sequence orientation
- R5 says "from left to right". The YAML labels them "from north".
- Whether north = R5's left depends on the photographer's stance. PHOTO13 shows the lower window to the right of the visible white-painted brick, suggesting the wall extends to the photographer's left as well — but the orientation is not unambiguous.
- VERIFICATION needed: which end of the wall is R5's "left"?

### 14.6 Existence of a second rear-wall downpipe
- YAML lists `downpipe_rear_wall_right` AND `downpipe_rear_wall_left`.
- Photos and PA support only one (in the L-inside corner).
- POSSIBLE FABRICATION of `downpipe_rear_wall_right`.

### 14.7 Project client name
- YAML: "G. Pearce".
- Email signatures: "Grahame McGirr".
- RM headline: "my cousin Grahame".
- Discrepancy: surname Pearce vs McGirr. Confirm with Craig.

### 14.8 Shower-room zone arithmetic does not close
- 1000 + 600 + 500 + 600 = 2700 > 2500 available.

---

## 15. Summary statistics

| Classification | Count (approx) |
|---|---|
| VERIFIED | 62 |
| INFERRED | 17 |
| ASSUMED  | 28 |
| CONFLICTING | 11 |
| ERROR | 3 |

(Total ≈ 121 dimensional values audited.)
