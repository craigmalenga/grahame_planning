# Whole-House Dimension Reconciliation — Flat 1, 20 Hornton Street

Synthesised from 5 independent OCR agents (agent1–agent5) + my direct read
+ the surveyor plan (job 16873) + Craig's clarifications.

## Floor assignment (DEFINITIVE)
- **BASEMENT / LOWER GROUND = `shared image (18).jpg`** — wood-terrace
  lightwell (OPEN to sky, no roof) with the spiral staircase, central
  bathroom band, under-pavement vaults + "TO TANK", cupboards.
- **GROUND FLOOR = `shared image (19).jpg`** — front lounge (fireplace +
  front door), NEW OPENINGS with the Crittall door, rear reception,
  rear shower/bath room, spiral-access door, existing open staircase.

The "WOOD TERRACE" is the **wood-decked floor of the open rear lightwell**
where the spiral staircase sits — NOT a roofed terrace. (Craig confirmed.)

## Anchor dimensions (appear on sketch AND surveyor — calibration points)
- GF internal width **4.34 m** (`4.34` on GF sketch = surveyor 4.34) ✓
- Basement internal width **5.70 m** (surveyor) ✓
- Rear lightwell/courtyard **3.25 × 2.95 m** (`325` / `295` on basement sketch;
  surveyor lightwell depth 2.94 ≈ 295) ✓
- GF total length **13.77 m**, basement total length **19.06 m** (surveyor) ✓

## GROUND FLOOR — reconciled dimensions (front → rear)
| Zone | Dimension | Source / confidence |
|---|---|---|
| Overall width | 4340 mm | surveyor + sketch — HIGH |
| Front lounge depth | 5700 mm ("570") | sketch — HIGH |
| Front-lounge fireplace wall (left) | 1920 + 1800(fireplace) + 1920 ≈ 5640 | sketch 192/180/192 — HIGH |
| Front door | bottom-right | sketch |
| Open staircase (existing) | right-side strip; 35 cm clearance | sketch "35 cm" — MED |
| NEW OPENINGS dividing wall | nibs ~700 + ~600; Crittall door between | sketch "70"/"60" — MED |
| **Crittall door** | **1245 wide × 2450 high** | sketch (on-hand steel door) — HIGH |
| Rear reception depth | 6700 mm ("670") | sketch — HIGH |
| Rear-reception left wall segments | 146 / 181 / 143 / 60 (cm) top→bottom | sketch — MED |
| Rear-reception window (left wall) | 2100 wide, 400 offset | sketch "210"/"40" — MED |
| Spiral-access door (rear-left) | new doorway onto spiral going DOWN | sketch — HIGH |
| Rear wet room (rear-right) | SHOWER + BASIN + **BATH** + WASH MACHINE | sketch — HIGH |
| Wash-machine / appliance bay | **1200 mm** ("1.2m") | sketch — HIGH (supersedes YAML 400) |
| Back door | rear, middle | sketch |
| Length check | 5.70 + 6.70 + ~1.4 wet-room ≈ 13.8 ≈ 13.77 | ✓ |

## BASEMENT / LOWER GROUND — reconciled dimensions (front → rear)
| Zone | Dimension | Source / confidence |
|---|---|---|
| Overall width | 5700 mm (narrows to 4340 at rear) | surveyor — HIGH |
| Under-pavement vaults (front) | 2 vaults; one **3150 wide**, ~2000–2280 deep; TOILET in/near; "TO TANK" drainage | sketch — MED |
| Front room | **4500 long × 4400 wide** ("4.5"/"4.4") | sketch — MED |
| Bathroom band (pocket sliding door) | closet/cubicle **1960×1960**; centre **1800×3000**; WC **2200×2000**; corridor **1300** | sketch — MED |
| Central hall | **4800 clear / 6100 gross** (overlapping reads) | sketch — LOW (clarify) |
| Spiral staircase | rear of hall, in the lightwell | sketch — HIGH |
| Wood-terrace lightwell | **3250 wide × 2950 deep**, OPEN to sky | sketch + surveyor — HIGH |
| Strip beside terrace | 2150 ("215") | sketch — LOW |
| Cupboards | rear-right wall | sketch |
| Length check | vaults ~3.15 + front 4.5 + bath ~2.5 + hall 6.1 + terrace 2.95 ≈ 19.2 ≈ 19.06 | ✓ (loose) |

## CONFLICTS needing Grahame/Craig confirmation
1. **Bath vs no bath (GF wet room).** Sketch clearly draws SHOWER + BASIN +
   **BATH** + WASH MACHINE. Earlier YAML/scope had a shower-only compact
   room (no bath). The hand sketch is newer → assume **bath included**.
   Need the wet-room footprint (the "180×300" may be this room, = 1800×3000).
2. **Crittall door height 2450 vs YAML 2245.** Use **2450** (labelled on the
   on-hand door). Width 1245 agrees.
3. **Appliance bay 1200 vs YAML 400.** Use **1200**.
4. **Central-hall 4.8 m "MAX" vs 6.10 m.** Are these cumulative or the same
   run measured two ways? Need clarification.
5. **Which floor has the bath room** — GF (image 19) shows shower/bath;
   basement (image 18) shows a separate bathroom band (toilet, WC, 196,
   180×300). So there appear to be **two bathrooms** (one per floor). Confirm.
6. **Vault depths** (200 / 228 / 315) — faint; re-measure.

## Net changes to dimensions.yaml (to apply once confirmed)
- glazed/Crittall door height 2245 → 2450
- add `bath` to the GF wet room; appliance bay 400 → 1200
- add basement: vaults, front room 4500×4400, bathroom band, central hall,
  wood-terrace lightwell
- add GF: front lounge 5700, rear reception 6700, wet room, open staircase,
  spiral-access door
