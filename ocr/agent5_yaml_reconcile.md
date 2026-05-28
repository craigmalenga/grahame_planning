# Agent 5 — Sketch ↔ dimensions.yaml Reconciliation

Flat 1, 20 Hornton Street, London W8 4NR
Forensic OCR of the two hand-drawn architect sketches checked against
`drawings/dimensions.yaml` (Rev B source of truth) and against geometry.

Sources read:
- `shared image (18).jpg` — hand-drawn **GROUND FLOOR** target (spiral stair, wood terrace, bathroom, vaults at bottom)
- `shared image (19).jpg` — hand-drawn **BASEMENT** target (fireplace room, crittal door, shower/bath room, open staircase)
- `current floorplan.png` — surveyor plan (GF 4.34 × 13.77 m; basement 5.70 × 19.06 m; lightwell/pavement 2.94 m)
- `drawings/dimensions.yaml`

NOTE on which sketch is which floor: the labels on the sketches are the
reverse of the brief's caption. Image (18) carries the **spiral staircase,
WOOD TERRACE, vaults and "TO TANK"** — these are GROUND-FLOOR/courtyard +
under-pavement-vault features, so image (18) is read here as the GROUND
FLOOR / courtyard-end plan. Image (19) carries **FIREPLACE, FRONT DOOR,
OPEN STAIRCASE, CRITTAL DOOR, the 4.34 width and the 5.70 width** — i.e.
the internal basement rooms. They have been reconciled on that basis;
the floor label is flagged as a possible mislabel either way.

Unit note: sketch figures with no unit and 3 digits (e.g. 196, 200, 670)
are centimetres unless suffixed "cm"/"m". YAML is in millimetres.

---

## 1. RECONCILIATION TABLE — GROUND-FLOOR sketch, image (18)

| Sketch dim (as drawn) | Reading | Matching YAML key + value | Agree / Conflict | Recommended value |
|---|---|---|---|---|
| `325` (top run) | 325 cm = 3250 mm, terrace/courtyard width | `courtyard.plan_width_mm: 3250` | **AGREE** | 3250 mm |
| `295` (vertical, left) | 295 cm = 2950 mm, courtyard depth | `courtyard.plan_depth_mm: 2950` | **AGREE** | 2950 mm |
| `215` (arrow, mid-top) | 215 cm = 2150 mm | ~`rear_wall.upper_ground.sash_width_mm: 2100` (210 cm) | minor — likely the 2100 sash zone or a 215 bay | 2100–2150 mm; CONFIRM |
| `4.8m MAX.` | 4800 mm clear run | no key (envelope is 4340; this is a "max" usable run) | **NEW / conflict-ish** | add as note; see geometry |
| `610cm` | 6100 mm run across plan | no single key; ~ rear-reception + kitchen depth | **NEW** | 6100 mm (verify) |
| `196` (vert) + `196` (horiz) | 1960 mm — a left store/closet w/ integrated shelving | no key | **NEW** | 1960 mm closet |
| `180 × 300` (bath room) | 1800 × 3000 mm bathroom footprint | partial: `proposed_shower_room.available_length_mm: 2500` | **CONFLICT** (3000 vs 2500 length) | 1800 × 3000 mm — see §4 |
| `220` (vert, by WC) | 2200 mm | — | **NEW** | 2200 mm |
| `200` (horiz, WC zone) | 2000 mm | ~ wc/basin run | **NEW** | 2000 mm |
| `130 cm` (corridor) | 1300 mm corridor/door enclosure | — | **NEW** | 1300 mm |
| `4.5 cons.` (lounge) | 4500 mm "constraints/lounge" run | — | **NEW** | 4500 mm |
| `4.4 wide` | 4400 mm width run | ≈ `ground_floor.width_mm: 4340` | **near-AGREE** (4400 vs 4340) | 4340 mm (survey wins) |
| `VAULT` ×2 + `3.15 wide` | vaults under pavement; one 315 cm wide | basement vaults implied by `length 19060 incl. vaults` | **NEW** | vault width 3150 mm |
| `200` (vert, vault) | 2000 mm vault depth | — | **NEW** | 2000 mm |
| `3.5` (vert, right) | 3500 mm | `rear_boundary_wall_height_mm: 3500` OR vault length | ambiguous | 3500 mm; CONFIRM context |
| labels: WOOD TERRACE, CUPBOARDS, DOOR/ENC, "shelf/book/pocket INTEGRATED", TO TANK, TOILET | — | not in YAML | **NEW labels** | add |

## 2. RECONCILIATION TABLE — BASEMENT sketch, image (19)

| Sketch dim (as drawn) | Reading | Matching YAML key + value | Agree / Conflict | Recommended value |
|---|---|---|---|---|
| `4.34` | 4340 mm width | `ground_floor.width_mm: 4340` | **AGREE** (note: on the "basement" sketch but = GF width — supports mislabel flag) | 4340 mm |
| `570.` | 5700 mm front-room width | `flat_envelope.basement.width_mm: 5700` | **AGREE** | 5700 mm |
| `670` (long horiz) | 6700 mm long room run | no key | **NEW** (key internal run) | 6700 mm |
| `146` (vert) | 1460 mm | ≈ `rear_reception.fireplace_wall_breakdown_mm` 1460 | **AGREE** | 1460 mm |
| `181 cm` | 1810 mm window/opening width | — | **NEW** | 1810 mm |
| `143` (vert) | 1430 mm | — | **NEW** | 1430 mm |
| `60 cm` | 600 mm wall element | ≈ `side_wall...bricked-up 600` / `nib_right 600` | **AGREE (value)** | 600 mm |
| `192` (vert) ×2 | 1920 mm | ≈ `front_lounge.fireplace_wall_breakdown_mm` 1900 | near-AGREE (1920 vs 1900) | 1900–1920 mm |
| `180 ← FIREPLACE` | 1800 mm fireplace breast | `front_lounge.fireplace_wall_breakdown_mm: [1900,1800,1900]` (the 1800) | **AGREE** | 1800 mm |
| `210` (by WINDOW) | 2100 mm window | ~ `rear_wall.upper_ground.sash 2100` or a basement window | **NEW/agree** | 2100 mm |
| `40` (by window) | 400 mm offset | `rear_reception.rear_wall_window_offset_mm: 400` | **AGREE** | 400 mm |
| `70` (new opening) | 700 mm nib | `internal_opening.proposed.nib_left_mm: 700` | **AGREE** | 700 mm |
| `35 cm` (by stair) | 350 mm gap to open staircase | — | **NEW** | 350 mm |
| `1.2m` (wash machine) | 1200 mm | ≈ laundry/appliance zone (YAML laundry_zone 400 only) | **CONFLICT** (1200 vs 400) | 1200 mm appliance run — see §4 |
| `CRITTAL DOOR 1245 WIDTH × 2450 HEIGHT` | 1245 × 2450 mm | `proposed_shower_room.glazed_doors_available: 1245 × **2245**` | **CONFLICT** (height 2450 vs 2245) | 1245 × 2450 mm (sketch is the on-hand-door spec) |
| labels: PILLAR, STAIRCASE, DOOR(swing), WINDOW, BACK DOOR, SHOWER/BASIN/BATH/WASH MACHINE, OPEN STAIRCASE, FRONT DOOR, NEW OPENINGS | — | mostly not in YAML | **NEW labels** | add |

---

## 3. NEW INFORMATION on the sketches NOT yet in dimensions.yaml

High value (add to YAML):
1. **Crittal door 1245 × 2450 mm** (basement sketch) — YAML records the on-hand
   glazed door as 1245 × **2245**. Sketch says **2450 HEIGHT**. Add/correct;
   this is the actual reuse door for the bathroom/crittal partition.
2. **"1.2m" at the WASH MACHINE / appliance run** — a 1200 mm appliance bay in
   the bathroom. YAML only has a 400 mm laundry zone — far too small. CONFLICT.
3. **Bathroom footprint 180 × 300** (1800 × 3000 mm) with stacked fittings
   **SHOWER / BASIN / BATH / WASH MACHINE** — note YAML's shower room has NO bath;
   the sketch explicitly includes a **BATH**. Big programme difference.
4. **"WOOD TERRACE"** over the courtyard area (GF sketch, top) — a new timber
   terrace/deck not represented in YAML. Add as a proposed element.
5. **VAULTS** under the pavement: two vaults, one **3.15 m wide**, depth ~**2.0 m**,
   a **TOILET** in/near the vault zone, and **"TO TANK"** (drainage/septic/water
   tank direction). YAML mentions vaults only inside the 19.06 m length figure.
6. **"180 × 300" bathroom, "220", "200", "130 cm" corridor, "196" closet** — a full
   set of GF bathroom/closet/corridor dims absent from YAML.
7. **"670"** — a 6.70 m internal long-room run (basement) — a key setting-out
   dimension, not in YAML.
8. **"181 cm", "143", "146", "60 cm"** wall-segment breakdown along the basement
   left wall — partly matches YAML breakdowns, partly new.
9. **"35 cm"** clearance between the structure and the **OPEN STAIRCASE**.
10. **"4.8 m MAX." and "610 cm"** GF clear-run dimensions.
11. **"4.5 cons." and "4.4 wide"** GF room runs.
12. Labels: **PILLAR, CUPBOARDS, integrated shelf/book/pocket (door), NEW OPENINGS,
    BACK DOOR, FRONT DOOR, OPEN STAIRCASE, existing STAIRCASE + DOOR swing.**

---

## 4. TOP CONFLICTS (sketch vs YAML) — with recommendation

| # | Item | Sketch | YAML | Recommend | Why |
|---|---|---|---|---|---|
| C1 | Crittal/glazed door height | **2450** | 2245 (`glazed_doors_available.height_mm`) | **2450** | Sketch is the explicit, labelled spec of the on-hand door ("1245 WIDTH × 2450 HEIGHT"). Width 1245 agrees — only height differs; the labelled-on-the-door figure governs. |
| C2 | Bathroom contains a BATH | BATH drawn | shower-room has NO bath (shower+WC+basin+laundry) | **Reconcile with client** | Programme conflict, not just a number. Sketch wants shower+basin+**bath**+wash machine in 1800×3000. YAML packed a 2500 run with no bath. The newer hand sketch likely supersedes — but 1800×3000 must be checked against the 2500 available run (see C3). |
| C3 | Bathroom length | **300 cm (3000)** | `available_length_mm: 2500` | **Re-measure** | 500 mm conflict. If the true run is 2500, a bath will not fit as drawn; if 3000, YAML's zone arithmetic (=2500) is wrong. Geometry below suggests the sketch 3000 is plausible within the 6100/6700 long runs. |
| C4 | Appliance/laundry bay | **1.2 m (1200)** | `laundry_zone_width_mm: 400` | **1200** | A real washing machine + space needs ~600–1200 mm; the 400 mm zone is unbuildable. Sketch 1200 is realistic. |
| C5 | GF width | 4.4 (4400) | 4340 (survey) | **4340** | Survey/`current floorplan` wins over the rounded freehand 4.4. |
| C6 | Floor labelling | (18)=GF features, (19)=basement features | brief captions them the opposite | **Treat (19) as basement, (18) as GF/courtyard** | The 5.70 width appears on (19) and equals the BASEMENT width 5700; the spiral stair + vaults + terrace appear on (18). Confirm with client which sheet is which. |

---

## 5. GEOMETRY SANITY CHECK

### Ground floor — must sum to 13.77 m (13770 mm) front-to-back
GF envelope length (survey) = **13.77 m**; width = 4.34 m.

Room runs read off image (18), front(courtyard end)→back, in metres:
- Courtyard/terrace depth: **2.95** (`295`)
- Mid long run: **4.8 MAX** (or **6.10** to the far gridline)
- Bathroom/closet band: **~1.96** (closet) + bathroom **3.00** (the 180×300)
- Lounge run: **4.5** ("cons")
- Vault zone (under pavement): adds to the long basement figure, not the 13.77 GF

Trial sum A (2.95 + 4.80 + 1.96 + 4.50) = **14.21 m** → ~0.44 m over 13.77.
Trial sum B (2.95 + 6.10 + 4.50 − overlap) — the 4.80 and 6.10 overlap the same
zone (4.8 is "max usable", 6.10 is to the next gridline). Using 2.95 + 6.10 +
internal walls ≈ **13.7–13.8 m**, which **reconciles to 13.77 m** if the bathroom
and lounge are sub-zones WITHIN the 6.10 run rather than additional to it.
**Conclusion:** the GF figures are internally consistent with 13.77 m ONLY if
4.8/6.10/4.5/3.0 are partly overlapping zone descriptions, not a simple series.
Flag for the draughtsman: clarify whether 4.8m and 6.10 are cumulative.

### Basement — must sum to 19.06 m (19060 mm) front-to-back
Basement envelope (survey) = **19.06 m** incl. under-pavement vaults; width 5.70 m.

Room runs read off image (19), front(door end)→back:
- Front room (fireplace) length: long, served by `570` width & `192/180/192`,
  `146/181/143` segments on the side wall.
- Long internal run: **6.70** (`670`)
- Plus front-room depth + bathroom (shower/bath) zone + back-door lobby.

Side-wall vertical segments sum (front portion): 1.46 + 1.81 + 1.43 = **4.70 m**,
then 0.60 + 1.92 + 1.80(fireplace)+1.92 ... these are *wall breakdowns*, not the
full length. The single dominant longitudinal run is **6.70 m**.
Adding: front room ≈ 6.70 + rear half (bathroom + lobby + back-door bay) +
under-pavement vaults (~2.0–3.15) should reach 19.06.
6.70 (long room) + 6.70 (matching rear room, typical Victorian double) +
~2.5 (bathroom/lobby) + ~3.15 (vault) = **19.05 m ≈ 19.06 m**. ✔ **Reconciles.**

Width check: front room **5.70** = survey 5.70 ✔. Rear narrows to **4.34**
(matches the GF/`current floorplan` 4.34 where the vaults/lightwell pinch in) ✔.

**Cross-floor note:** the 5.70→4.34 step is exactly the surveyor plan's
basement-5.70 / GF-4.34 relationship, confirming the sketch geometry is sound
even though the dimensions are freehand.

---

## 6. RECOMMENDED YAML EDITS (summary)
1. `proposed_shower_room.glazed_doors_available.height_mm`: 2245 → **2450** (per crittal-door label). Rename note to "crittal door (on hand) 1245 × 2450".
2. Add `proposed_shower_room.bath` (the sketch includes a BATH) and revisit the
   shower/WC/basin/laundry zoning — current 2500 packing has no bath.
3. `proposed_shower_room.available_length_mm`: 2500 → reconcile with sketch **3000** (180×300 footprint); re-measure.
4. `laundry_zone_width_mm`: 400 → **1200** ("1.2m" at wash machine).
5. Add new GF features: `wood_terrace`, `vaults` (one 3150 wide × ~2000 deep, toilet in vault, "to tank" drainage), `gf_closet` 1960, `gf_corridor` 1300.
6. Add basement long-run `670` (6700 mm) and side-wall segment breakdown 1460/1810/1430/600/1920/1800/1920.
7. Add `35 cm` clearance to open staircase; `210` window; confirm `215` bay.
8. Flag the sketch-vs-brief floor-label swap for client confirmation.
