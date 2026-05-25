# Handover Brief — Floorplanner-Agent (other Claude instance)

**Project:** Flat 1, 20 Hornton Street, London W8 4NR
**Client:** Grahame McGirr (cousin of Craig, who is co-ordinating)
**Date of handover:** 2026-05-25
**Revision baseline:** Rev D (the planning-drawing pack)

---

## Why you are receiving this

I'm the other Claude instance that has been producing the **planning-application
drawings** (matplotlib axonometric pack — PDFs/PNGs/dimensions.yaml). Craig
also has the **3D floorplanner platform** that you live in
(`floorplanner_bundle.zip` + `PLATFORM_AGENT_SPEC.md`).

The two outputs are complementary, not competing:

| Mine (drawings pack)                              | Yours (3D floorplanner)                      |
|---------------------------------------------------|----------------------------------------------|
| RBKC-submittable A3 PDFs with title blocks, dim chains, scale bars, notes panels. | Interactive 3D model — Grahame can walk through it and view from any angle. |
| Parametric — `dimensions.yaml` is the single source of truth. | Loads JSON; emit JSON aligned to my YAML. |
| Matplotlib-axonometric "3D" views are weak.       | Three.js renders are far better visually.   |

Craig has asked for a full context dump so you can refine what you
generate to dovetail with my output. Everything I have is in this zip.

---

## Agreed division of labour (NEW — please follow this exactly)

Craig has just confirmed the workflow:

1. **You** (this agent) make ALL the necessary code changes to the
   floorplanner platform directly — apply Patch A/B (required), and any
   of Patches C–G that improve the visual fidelity (custom York-stone
   texture, helical handrail tube, wall-hung WC, washing-machine
   primitive, etc.).
2. **You** then produce the 3D renders themselves as deliverable
   **PDF or PNG files** (high-resolution, please) for each scope and each
   key view (see "Recommended views" in each photoreal-brief.md).
   - PDF preferred so we keep vector quality.
   - **No title block, no border, no dimension chains** in your output —
     just the rendered scene filling the frame. I add the title block in
     mine.
   - Consistent aspect ratio across all renders so they drop into my
     A3 layout without cropping. **Suggested: 16:10 landscape, ~2500
     × 1560 px (or vector equivalent).**
   - Filename convention: `<scope>.<view>.png` /
     `<scope>.<view>.pdf` (e.g. `courtyard.hero.png`,
     `courtyard.from-doorway-looking-down.png`, …).
3. **Craig** sends your rendered files back to me.
4. **I** drop them into sheets 10 / 11 / 12 (and any new sheets you'd
   like to add) of the planning pack — adding my title block, scale
   note, callouts and notes panel — so the planning pack stays visually
   consistent A3-to-A3.

So you don't need to worry about title blocks / borders / RBKC drafting
conventions. Just produce the rendered scenes at high quality with
honest dimensional fidelity.

---

## What's in this bundle (file map)

### Source-of-truth dimensions
- `dimensions.yaml`  — **THE** authoritative parametric file. **Read this
  first.** It has every measured dimension (Grahame's site measurements
  cross-checked by 5 review agents), with notes on what's "TBC" and what
  cascaded from a Rev B/C correction. Everything you generate should
  trace back to a key in here.

### Brief / requirements
- `read_me.,md` — original brief from Craig describing what Grahame
  wants for the planning application (with both initial and superseded
  passages preserved in chronological order).
- `PLATFORM_AGENT_SPEC.md` — your spec (already in `floorplanner_bundle.zip`).

### Photos (the property)
- `shared image (11).jpg` — front elevation street view of No. 20 +
  neighbour.
- `shared image (13).jpg` — LEFT (side) wall of the L from inside the
  courtyard. Basement-level glass sash + black cast-iron downpipe.
- `shared image (14).jpg` — REAR wall of the L from the courtyard floor.
  **Central door + 2 flanking sash windows** under one red-brick flat
  arch. Black cast-iron downpipe on the left side of the door.
  **CRITICAL** — earlier Claude sessions assumed double-doors here; the
  correct reading is single central door + 2 sashes.
- `shared image (15).jpg` — second front-elevation framing.
- `shared image (16).jpg` — looking up the LEFT wall from below. Shows
  the bricked-up opening at lower level and the courtyard L geometry.
- `shared image (17).jpg` — phone screenshot of a different property's
  drawings (30 Hornton St — neighbour precedent, NOT subject property).
- `shared image (12).jpg` — screenshot of RBKC planning guidance.
- `chatgpt attempt 1-4.png` + `ChatGPT Image May 24 ... 06_09_48 PM.png`
  — earlier AI-generated reference images from Craig's previous ChatGPT
  session. Some are wrong (flat rear wall, no L-shape); some are
  improving (attempt 3 = first 3D, attempt 4 = composite with proposed
  layout). The most recent ChatGPT image Craig shared (June 2026,
  external to this pack but described in the photoreal briefs) shows
  the staircase tucked in the L corner with the correct material palette.

### Source PDFs (subject + neighbour)
- `job16873-1.pdf` — **the only authoritative measured plan of #20**.
  Real Estate Services survey 12 Feb 2026 for Land Registry. Single A4
  at 1:150 covering basement + ground floor. Has ceiling heights
  annotated and overall envelope dimensions (basement 19.06×5.70 m,
  GF 13.77×4.34 m). Plus a 1:1250 OS-map inset showing No. 20 in its
  row on Hornton Street.
- `24 hornton street plan*.pdf` — neighbour No. 24, Savills 2007 LB
  consent. **Not subject property** — useful as precedent / typology.
- `Document-*.pdf` — neighbour No. 30, Rawspace 2014 LB consent.
  **Not subject property** — but the internal-door-elevation drawings
  in `Document-0C57AD4F3AEE4AA558DF57C9E0DB2519.pdf` are the closest
  precedent for the proposed internal opening at No. 20.

### Email messages (Grahame's site measurements)
- `File1.msg` … `File5.msg` — original Outlook .msg files from
  Grahame's emails describing the project + initial dimensions.
- `Re_ For what it is worth... 1-5.msg` — follow-up emails with refined
  measurements (the 51/60/49/123/17 cm rear-elevation sequence, the
  bathroom layout, the staircase dimensions, etc.).
- All of these have been parsed into `dimensions.yaml`; the .msg files
  are provided as primary source for cross-check.

### Review-agent reports (5 independent reviews of my work)
- `photo_analysis.md`  — first-pass interpretation of every photo.
- `second_pass_review.md` — independent re-read for cross-check.
- `pdf_drawings_inventory.md` — every drawing found in the supplied
  PDFs, catalogued by which property and what scale.
- `extracted_dimensions.yaml` — separate dimension extraction from emails+PDFs.
- `dimension_questions.md` — list of every conflict / TBC / missing
  dimension the extraction agent flagged for Grahame.
- `dimension_audit.md` — dimensional audit cross-checking my YAML
  against every source.
- `critique_text_legibility.md`, `critique_accuracy.md`,
  `critique_layout.md` — three independent critiques of the
  rendered drawing pack (legibility, correctness, page layout).
- `drawing_critique.md` — earlier consolidated critique.

### My planning-drawing pack (the latest output)
- `drawings_pack_revD.zip` — Rev D full pack (13 sheets PDFs + PNGs +
  the dimensions YAML + the review .md files + the questionnaire HTML
  + the photoreal prompt MD).
- `drawings/dimensions.yaml` — same content as the top-level
  dimensions.yaml; kept here for easy reference next to the renderers.
- `drawings/src/*.py` — the parametric renderers. Useful if you want to
  see exactly HOW I converted YAML keys into 2D drawing primitives
  (e.g. how the spiral staircase is parametrised at
  `staircase.py`, how the courtyard plan is laid out at
  `render_courtyard_plan.py`).

### Floorplanner-pipeline outputs (what I produced for you)
- `floorplanner_output/` — 6 floorplan JSON files (before+after for
  three scopes) + 3 photoreal briefs + the required Patch-A/B diff for
  your codebase. **Improve these** — that's the point of this handover.

### Questionnaire
- `Hornton_Questions_for_Grahame.html` — 49-question + free-text
  questionnaire Grahame will fill in on his iPhone. Generates a PDF
  answer-sheet via jsPDF + iOS share sheet. The "QC-1..9" section
  validates every Rev B/C dimension change (slab-to-FFL 3000, staircase
  15×200, central door 820, side windows 465, internal opening 1350,
  etc.). When his answers come back, update `dimensions.yaml` and we
  regenerate both packs.
- `Photoreal_Render_Prompt_for_ChatGPT.md` — 5 ready-to-paste prompts
  for ChatGPT image-gen (your "Stage B" equivalents).

---

## State of the work — what's solid, what's TBC

### Solid (cross-checked by ≥ 3 sources)
- Property identity: Flat 1, 20 Hornton Street, W8 4NR (NOT 24 or 30,
  despite some filename misnaming).
- Building rear faces NE.
- Courtyard envelope: 3.25 m × 2.95 m, L-shaped.
- L geometry: rear leg (3.25 wide × 1.75 deep) + kitchen leg
  (1.80 × 1.20), inside corner where they meet.
- Lower-basement rear-wall opening: single central door + 2 flanking
  sash windows with raised brick sills, under one red-brick flat arch.
- Cheeks: ~700 mm each (so 700+1850+700 = 3250 fits courtyard width).
- Side wall (kitchen-side) basement openings: 510 + 600 (bricked-up) +
  490 (pier) + 1230 (existing glass) + 170 = 300 cm total.
- Side wall (kitchen-side) upper: kitchen window to be converted to a
  glazed timber doorway at the top of the spiral staircase.
- Staircase: 15 × 200 mm risers = 3000 mm total rise (Rev B+).
  Black-painted cast iron, ornate Victorian balusters. Outer Ø ≈ 1.6 m;
  envelope allowance ~1.75 m to fit clearance.
- Internal opening between reception rooms: clear 1350 mm × 2950 mm,
  nibs L 700 / R 600. Front lounge room width 2650 mm; rear reception
  3000 mm (35 cm wider).
- Compact shower-room: 2500 mm strip, four zones — shower 900 / WC 500
  / basin 400 / single front-loader 400 — with 3 × 100 mm partitions.

### TBC (in the questionnaire)
- Slab-to-GF-FFL exact value (3000 vs 2820 vs ?).
- Central door width (820 vs 900 — Grahame's wording was "82 cm").
- Side window widths (465 vs 450).
- Side-window raised-sill height (600 mm).
- Door-bay head height above slab (2300 mm).
- Position of the upper kitchen window along the 3000 mm side wall.
- Rear-wall right-side downpipe position (or whether it exists at all
  — Craig's photoreal ref says yes, the photo analysis was unsure).
- Drainage gully position in the courtyard slab.
- Rear-boundary wall height (3500 mm estimate).
- Whether the spiral artefact is truly a FULL circular or a tighter
  quarter-/half-turn type.
- Exact threshold detail at top of staircase.

### Known cascading dependencies (change one → these change too)
- Slab-to-FFL → upper-window sill above slab → staircase total rise →
  number of risers × rise per riser.
- Internal opening clear width depends on front-lounge room width.
- Shower-room zone widths must sum to 2500 with partitions.
- Side-wall-3000 mm sequence must sum to 3000.

---

## Suggested refinements you could make

1. **Apply Patch G (custom York-stone texture)** for the courtyard floor
   — this was flagged in your spec but I didn't ship a texture file.
   The user has a strong preference for York stone over concrete.
2. **Add Patch F (handrail tube)** to the spiral so it has the helical
   handrail, not just spheres. The user has called out the spiral
   handrail as a recurring weak point.
3. **Add Patch D (wall-hung WC)** + **Patch E (washing-machine primitive)**
   for the shower-room scope, then update
   `shower-room.after.floorplan.json` to use them instead of the
   `toilet` / `dishwasher` proxies.
4. **Sub-segment the courtyard walls vertically** to express the
   white-painted-brick-below-the-datum-line-then-yellow-stock-above
   look. Spec P5 calls this a hack the renderer doesn't support — but
   if you can do it via two back-to-back thin walls, it would close
   the gap to the photoreal reference.
5. **The proposed internal opening** is currently a 2.95-m-tall double
   door. Architecturally it's a plastered opening with no leaf — could
   you replace with a windowed-shaped sub-segment that reads as a
   square-headed empty opening?
6. **Top-of-spiral landing** — currently the spiral exits at a
   `sillHeight: 3.00` "window" on the kitchen-side wall. If your
   renderer can show a small extruded landing pad at the top of the
   staircase furniture, that would close the visual gap.
7. **Heritage-statement narrative** would be a nice addition for the
   board presentation. Could be a `narrative.md` alongside each scope
   describing the conservation rationale for the planning officer.

---

## Coordinate-datum reconciliation

Your spec §10 uses **NW corner of rectangle B (courtyard rear leg)** as
the origin, with +x = east, +y = south. My drawings use a different
convention per sheet (each elevation/plan has its own local origin).
The dimensions in `dimensions.yaml` are mostly DIMENSIONS (lengths) not
COORDINATES — so they translate cleanly to either convention.

When you regenerate, please keep your spec §10 datum (it's the right
one for the floorplanner pipeline).

---

## How to test alignment between my pack and yours

If your JSON loads into the floorplanner and renders the courtyard at
3.25 × 2.95 m with the staircase tucked in the inside corner of the L,
that's the geometric ground truth. My Rev D rear-wall elevation
(sheet 04-B in `drawings_pack_revD.zip`) shows the same composition in
2D at 1:40 scale with the spiral silhouette superimposed. The two
should be in 1:1 dimensional agreement.

If they're not — my YAML is the canonical source; flag the discrepancy
in your output for Craig to resolve.

---

## Contacting Craig

He's running iterations rapidly. Style of feedback:
- Be honest about tool limitations (matplotlib 3D has occlusion limits,
  generative-AI photoreal can't be replicated in code, etc.)
- Show the work — file every dimension change against a Q-number
  in the questionnaire and against a YAML key.
- Don't ship if you can see the problem yourself — Craig has said
  several times "if I can see it, you should have spotted it".
- Track every revision letter (Rev A, A.1, B, C, D, …) so we can
  bisect when something breaks.

Good luck — go make something better than what I shipped.
