# 20 Hornton Street, Flat 1 — Agent Briefing

Client: **Grahame McGirr** · Address: **Flat 1, 20 Hornton Street, Kensington,
London W8 4NR** · Date: **May 2026** · Revision: **B**

You are another Claude (or LLM) instance. Read this whole document before
emitting anything.

---

## 0. The actual workflow you are supporting

The user has tried two tools and is dissatisfied with both:

| Tool | What it's good at | What it fails at |
|---|---|---|
| **This 3D Floor Planner** (the code in this bundle) | Geometric ground truth. Loads JSON, renders to the millimetre, you can walk it in first-person, dimensions are reliable. | Visual fidelity. Brick, stone paving, cast-iron, sash windows all read as flat textured boxes. The user calls the 3D renderings "very very weak." |
| **ChatGPT image gen** | Photorealism. Produced a stunning courtyard view (the reference image: spiral staircase, London stock brick, red flat arch, painted brick lower half, York stone paving, timber sash windows). | Dimensions drift. Wrong proportions, invented openings, doors land in the wrong place. |

Your job is to bridge them with a **two-stage pipeline**:

1. **Stage A — Ground truth (this platform).** Emit a `SavedProject` JSON
   per §3 that imports cleanly into the app at
   `http://localhost:5173`. Dimensions, opening positions, sill heights,
   wall thicknesses, ceiling heights — all exact. The app's render is the
   geometry reference, not the final deliverable.
2. **Stage B — Photoreal render (external image gen).** Emit a
   **"Photoreal Brief"** alongside each JSON — a structured Markdown
   prompt + dimensioned key-view list designed for a vision/image-gen
   model (ChatGPT-4o image, DALL·E, Midjourney, Stable Diffusion). The
   brief locks the dimensions from Stage A so the image gen can't drift.
   Format in §12.

The user wants both per scope. Do not skip Stage B — that's the part they
actually care about looking at.

---

## 1. What you are producing — strict list

For **each** of the project's drawing sheets (target = 20-sheet set, see
§13 for the inventory of what's known vs. what you need to ask for):

1. `<sheet-name>.before.floorplan.json` — pre-works state.
2. `<sheet-name>.after.floorplan.json` — post-works state.
3. `<sheet-name>.photoreal-brief.md` — the Stage B brief (§12).
4. Optional: unified diffs for any code patches needed (§7).

Do not produce: SketchUp / Revit / IFC / DWG / PDF / SVG / HTML mockups.
The JSON loads into the React + Three.js app via **Save / Load → Import
from file** (`src/components/SaveLoadPanel.tsx`).

---

## 2. Hornton Street — known facts (from drawings 10, 11, 12 + reference render)

Lock these. They override any default.

### Rear courtyard (drawing 10 + reference render)
- **L-shaped courtyard**, overall envelope **3.25 m × 2.95 m**.
- Surfaces: **reclaimed York stone paving** (floor), **London stock brick**
  (upper walls), **painted brick — white** (lower walls), **red brick flat
  arch** over the new doorway and existing rear-access bay.
- **Reclaimed Victorian cast-iron spiral staircase**: **15 treads × 200 mm
  rise = 3000 mm total rise**, black-painted, ornate balusters, located
  in the **inside corner of the L**.
- **New black cast-iron downpipe** in the inside corner (relocated clear
  of staircase).
- **Existing kitchen window lowered and enlarged** to form a new glazed
  timber doorway (ground floor).
- **Reinstatement of former window** at first-floor level (**60 cm wide**)
  to match existing basement window — this is where the spiral lands.
  Becomes the upstairs doorway opening onto the staircase landing.
- **Existing rear-reception sash 2100 × 2200 mm** retained at first-floor.
- Timber doors + sash windows: white-painted timber.
- Wall lantern fittings (visible in reference render): black, brass-glazed.

### Internal opening, Front Lounge ↔ Rear Reception (drawing 12)
- Front Lounge ceiling **3.28 m**; Rear Reception ceiling **3.28 m**.
- Rear Reception **+350 mm wider** after works.
- Clear opening: **1350 mm wide × 2950 mm high**.
- Retained nibs: **L = 700 mm**, **R = 600 mm** (moulded architrave to
  match; cornice cut & re-run across the head).
- Steel beam + padstones over (engineer-spec, orange in the drawing).

### Compact shower-room (drawing 11)
- **2500 mm run** along one wall.
- **Shower 900 × 900 mm**, black-framed full-height glazed hinged door.
- **Wall-hung WC**, concealed cistern, **matt-black flush plate**.
- **Compact wall-hung basin 400 mm wide**, matt-black tap.
- **Single front-loader washer 600 mm**, **NOT stacked**.
- **Pocket / sliding door from kitchen-side, 700 mm clear**.

### Site
- Kensington, London W8 4NR. UK Victorian terraced flat. Treat all
  dimensions in **metres** in the JSON (mm in source drawings).

---

## 3. JSON schema — authoritative (`SavedProject`)

Source: `src/types/index.ts`.

```jsonc
{
  "version": "1.0",                          // REQUIRED string
  "name": "20 Hornton St — Courtyard AFTER",
  "createdAt": "2026-05-25T00:00:00.000Z",
  "updatedAt": "2026-05-25T00:00:00.000Z",
  "floorPlan": {
    "name": "Flat 1, 20 Hornton Street",
    "originalImageUrl": "",
    "width": 1200, "height": 1200, "scale": 100,
    "wallSegments": [],
    "rooms": [ /* §4–§6 */ ]
  },
  "sceneConfig": { /* §8 */ },
  "customTextures": []
}
```

### `RoomData`
```ts
{
  id?: string, name: string,
  walls: WallSegment[],                  // CW order, see §3.1
  bounds: { minX, minY, maxX, maxY },    // axis-aligned metres
  center: { x, y },                       // midpoint of bounds
  ceilingHeight: number,                  // metres
  wallTexture: string, floorTexture: string, ceilingTexture: string,  // §9
  showFloor: boolean, showCeiling: boolean,  // courtyard: showCeiling=false
  doors: DoorData[], windows: WindowData[], furniture: FurnitureItem[]
}
```

### 3.1 Wall ordering (MANDATORY)
A room is one axis-aligned rectangle with exactly 4 walls, indexed:
```
// wallIndex 0: TOP    (minX, minY) → (maxX, minY)
// wallIndex 1: RIGHT  (maxX, minY) → (maxX, maxY)
// wallIndex 2: BOTTOM (maxX, maxY) → (minX, maxY)
// wallIndex 3: LEFT   (minX, maxY) → (minX, minY)
```
**L-shaped rooms must be split into two adjoining rectangles.** The
courtyard at Hornton St. is L-shaped — model it as two adjoining
rectangles with the shared wall containing a full-height sub-segment gap
so they read as one space (see §4).

### 3.2 `WallSegment`
```ts
{ x1, y1, x2, y2, thickness: number /* metres, typ 0.12–0.30 */,
  height?: number, texture?: string,
  subSegments?: WallSubSegment[] }
```

### 3.3 `WallSubSegment` (for wide openings, full-height)
```ts
{ id: string, startFraction: 0..1, endFraction: 0..1, isGap: boolean }
// Sub-segments MUST cover the wall contiguously: union = [0,1].
// isGap=true → no wall drawn; isGap=false → solid.
```

### 3.4 `DoorData`
```ts
{ id, wallIndex, position /* 0–1 along wall start→end */,
  width, height, type: 'single'|'double'|'sliding'|'french'|'glass',
  openDirection: 'inward'|'outward',
  style?: 'wood-natural'|'wood-dark'|'wood-white'|'painted-white'|'painted-blue'|
          'painted-red'|'painted-green'|'glass-clear'|'glass-frosted'|
          'metal-steel'|'metal-black' }
// Doors always sit on the floor. NO sill-height field.
// For a high-level opening (e.g. first-floor doorway onto the courtyard),
// use a Window with sillHeight instead — see §3.5.
```

### 3.5 `WindowData`
```ts
{ id, wallIndex, position, width, height, sillHeight,
  type: 'single'|'double'|'bay'|'skylight' }
```

### 3.6 `FurnitureItem`
```ts
{ id, type: FurnitureType, x, y,
  rotation /* radians */, scaleX, scaleY, color? }
// (x,y) are world plan coords. scale ONLY affects footprint (not height).
```

### 3.7 Coordinate mapping
Plan `(x, y)` in metres → Three.js `(x, 0, y)`. Plan `+y` becomes 3D `+z`.

---

## 3.8 KNOWN RENDERING PITFALLS — read this before placing anything

The user has reported real artefacts: drainpipes "on inside of wall instead
of outside," the spiral "part inside the floor / behind the wall." Every
one has a known cause. Compensate when you generate coords — don't ship
JSON that triggers them.

### P1 — Wall position is the CENTRELINE, not a face
A wall coordinate `(x1,y1)–(x2,y2)` is the wall's **centreline**. The wall
extrudes `thickness/2` either side of that line, then nudges by 5 mm
toward the room centre (`getWallInwardOffset`, `RoomMesh.tsx:76`).

So for a courtyard whose right boundary is `x=3.25` with `thickness=0.22`:
- The wall occupies world `x ∈ [3.14, 3.36]` approximately.
- The wall's **interior face** (facing the courtyard) is at `x ≈ 3.135`.
- The wall's **exterior face** is at `x ≈ 3.365`.

**Furniture is placed at WORLD coords**, with no wall-snap logic. To
attach something flush to a wall's interior face, compute the furniture's
footprint half-extent and offset:
```
furniture.x = wall_coord − (thickness/2 + furniture_half_extent + 0.01 gap)
```
Forgetting this is why drains, lanterns, and the spiral end up looking
"floating" or "behind" walls.

### P2 — Furniture has NO clearance check, NO room culling
Furniture mesh is drawn at world `(x, 0, y)` regardless of whether that
point lies inside any room. A 1.8 m-diameter spiral at `(2.55, 1.20)` in
a courtyard of depth 1.75 m physically extends from `y=0.30` to `y=2.10`
— which **clips through** the bottom wall (`y=1.75`).

Mandatory clearance check before emitting any furniture item:
```
for each furniture f in room R:
  fw, fd = catalog[f.type].defaultWidth * f.scaleX,
           catalog[f.type].defaultDepth * f.scaleY
  rotate (fw, fd) by f.rotation → bounding box (bw, bd)
  assert R.bounds.minX + thickness/2 ≤ f.x − bw/2
  assert f.x + bw/2 ≤ R.bounds.maxX − thickness/2
  assert R.bounds.minY + thickness/2 ≤ f.y − bd/2
  assert f.y + bd/2 ≤ R.bounds.maxY − thickness/2
```
If the assertion fails, either downscale (`scaleX`, `scaleY`) or move the
furniture. For the Hornton St. courtyard rear leg (1.75 m depth), the
1.8 m default spiral **does not fit** — use `scaleX = scaleY = 0.85`
(→ 1.53 m diameter, fits 1.75 − 0.22 = 1.53 m clearance).

### P3 — Spiral staircase clips the FLOOR if you fight `y=0`
The spiral model's first tread is at `y = stepHeight/2 ≈ 0.1 m` above the
floor at `y=0`. The floor mesh renders at `y=0.002`. Don't try to "sink"
the spiral by setting a negative y — `FurnitureItem` has no y field; the
position is always plan-level. If you want the spiral to *appear* to land
in a sunken courtyard, the courtyard floor IS the plane it sits on —
there is no sub-floor concept.

### P4 — Spiral clips THROUGH the ceiling above
The spiral renders the full `catalog.defaultHeight` regardless of the
room's `ceilingHeight`. If you patch `defaultHeight` to 3.0 m but the
room's `ceilingHeight` is 2.7 m, the top half-step pokes through the
ceiling mesh. Always: `room.ceilingHeight ≥ catalog.staircase-spiral.defaultHeight + 0.1`.

### P5 — Walls are `THREE.DoubleSide` with the SAME texture both faces
(`RoomMesh.tsx:397`). The interior brick and exterior brick look
identical. There's no separate exterior-finish concept. To make the
courtyard side look like London-stock brick AND the room-interior side
look like plaster, you'd need to split the wall into two thinner
back-to-back walls with different textures — a hack, not recommended.
Accept the single material and lean on the Photoreal Brief (§12) for
true two-sided fidelity.

### P6 — Shared-wall openings appear on whichever room owns them
`findSharedWall` (`RoomMesh.tsx`) draws the shared wall once, from the
**lower-index room**. Openings (doors/windows) defined on either room
are merged. But if you defined an opening with a `sillHeight` that makes
sense on side A (e.g. a high window onto the courtyard) and the same
wall is the side B's interior, the opening will look weird from side B.
Place upstairs-doorway-onto-courtyard openings on the **courtyard's**
room so the high sill reads naturally from inside it.

### P7 — Furniture doesn't follow wall rotation
`FurnitureItem.rotation` is in world frame, not wall-local. If you rotate
a wall by 45° and want the spiral landing to align with a door in that
wall, do the maths in world coords, not "relative to the wall."

### P8 — There is no "outside the building"
Each room is a sealed box. The space outside all rooms is NOT rendered
as ground — there's a single ground plane (`Scene3D.tsx`), but nothing
attaches to "the outside of the dwelling." To put a drainpipe on the
courtyard side of the dwelling wall, you place it INSIDE the courtyard
room, near (but not in) the wall — that IS the outside of the dwelling
from the courtyard's POV. There is no "world exterior" zone.

### P9 — No good drainpipe / handrail / cornice primitive
Tall thin vertical: closest is `floor-lamp` (cylinder + shade, 0.3 m base
→ wrong silhouette). Workaround: **skip the drainpipe in JSON and put it
in the Photoreal Brief instead** ("black cast-iron downpipe in the
inside corner of the L, full height"). Stage B will render it correctly.

### P10 — Test before shipping
After writing the JSON, mentally walk through each furniture item:
1. Does its bounding box (with rotation) sit inside the room's
   `bounds` minus `thickness/2`?
2. Is its height ≤ `room.ceilingHeight − 0.1`?
3. For the spiral specifically: does the spiral centre have ≥ 0.9 m
   clearance from each wall after `scaleX/Y` is applied?

If any answer is "no", fix the coord or the scale before emitting.

---

## 4. Critical platform limitations — design AROUND them

1. **Single-storey renderer.** All rooms render at `y = 0.002`. There is
   no stacking. For two-storey scenes, model the tall space as one room
   with `ceilingHeight = 6.56` (2 × 3.28 m) and use windows with
   `sillHeight = 3.28` for upstairs openings.
2. **Doors lock to floor.** No sill height on `DoorData`. Use `WindowData`
   for elevated openings (§3.4 note).
3. **Furniture height is locked to catalog.** `FurnitureItem.scaleX/Y`
   affect footprint only. The default spiral is **2.7 m tall**. For
   Hornton St.'s 3.00 m rise (15 × 200 mm) you must **patch
   `furnitureCatalog.ts`** — see §7 patch A.
4. **Spiral wraps 360° once.** Top tread points opposite the bottom.
   Rotate the furniture item so the top lands at the first-floor doorway
   (atan2 from spiral centre to doorway centre — §5 example).
5. **Walls are room-owned + auto-deduped.** Shared walls between adjacent
   rooms render once. Put openings on whichever room is convenient.
6. **No L-shaped rooms.** Split into two rectangles + use a sub-segment
   gap on the shared wall to make them read as one space.
7. **No washing-machine, no wall-hung WC variant, no steel-beam, no
   handrail-tube primitives.** Use proxies (dishwasher for washer,
   regular toilet for wall-hung, bookshelf flipped flat for beam soffit)
   or apply optional patches D & E in §7.
8. **Visual fidelity is intentionally schematic.** Brick texture is
   tiled, no parallax / displacement; no mortar joints; no shadow softness
   tuning; no specular highlights on cast iron. This is the gap that
   Stage B (§12) closes.

---

## 5. Scope 1 — L-shaped rear courtyard with spiral staircase

### 5.1 Geometry
Total envelope **3.25 m × 2.95 m**, L-shape. Model as two rectangles
**A (kitchen-side leg)** and **B (rear-reception leg)** sharing a wall
with a full-height gap. Approximate L proportions (tune to the survey):

```
+---------------------+
|                     |
|         B           |  rear leg     (0..3.25, 0..1.75)  → 3.25 × 1.75
|                     |
+---------+-----------+
          |           |
          |     A     |  kitchen leg  (1.45..3.25, 1.75..2.95) → 1.80 × 1.20
          |           |
          +-----------+
```

Both rectangles: `ceilingHeight: 6.56`, `showCeiling: false`,
`wallTexture: "brick-red"` (mid-tone London stock; closest in registry),
`floorTexture: "concrete"` (closest registry proxy for York stone —
or add a custom texture — see §9.1).

### 5.2 Rectangle A — kitchen-side leg
```jsonc
{
  "name": "Courtyard (kitchen leg)",
  "walls": [
    { "x1": 1.45, "y1": 1.75, "x2": 3.25, "y2": 1.75, "thickness": 0.22,
      "subSegments": [
        { "id": "gA-top-solid-l",  "startFraction": 0.00, "endFraction": 0.00, "isGap": false },
        { "id": "gA-top-gap",      "startFraction": 0.00, "endFraction": 1.00, "isGap": true  }
      ] },
    { "x1": 3.25, "y1": 1.75, "x2": 3.25, "y2": 2.95, "thickness": 0.22 },
    { "x1": 3.25, "y1": 2.95, "x2": 1.45, "y2": 2.95, "thickness": 0.22 },
    { "x1": 1.45, "y1": 2.95, "x2": 1.45, "y2": 1.75, "thickness": 0.22 }
  ],
  "bounds": { "minX": 1.45, "minY": 1.75, "maxX": 3.25, "maxY": 2.95 },
  "center": { "x": 2.35, "y": 2.35 },
  "ceilingHeight": 6.56, "showCeiling": false, "showFloor": true,
  "wallTexture": "brick-red", "floorTexture": "concrete", "ceilingTexture": "plaster-white",
  "doors": [
    {
      "id": "door-kitchen-new-glazed", "wallIndex": 3, "position": 0.50,
      "width": 0.95, "height": 2.10,
      "type": "glass", "openDirection": "inward", "style": "wood-white"
    }
  ],
  "windows": [],
  "furniture": []
}
```
Top wall (`wallIndex 0`) has one big gap = open onto rectangle B.

### 5.3 Rectangle B — rear-reception leg
```jsonc
{
  "name": "Courtyard (rear leg)",
  "walls": [
    { "x1": 0,    "y1": 0,    "x2": 3.25, "y2": 0,    "thickness": 0.22 },
    { "x1": 3.25, "y1": 0,    "x2": 3.25, "y2": 1.75, "thickness": 0.22 },
    { "x1": 3.25, "y1": 1.75, "x2": 0,    "y2": 1.75, "thickness": 0.22,
      "subSegments": [
        { "id": "gB-bot-solid-l", "startFraction": 0.00, "endFraction": 0.446, "isGap": false },
        { "id": "gB-bot-gap",     "startFraction": 0.446, "endFraction": 1.00, "isGap": true  }
      ] },
    { "x1": 0,    "y1": 1.75, "x2": 0,    "y2": 0,    "thickness": 0.22 }
  ],
  "bounds": { "minX": 0, "minY": 0, "maxX": 3.25, "maxY": 1.75 },
  "center": { "x": 1.625, "y": 0.875 },
  "ceilingHeight": 6.56, "showCeiling": false, "showFloor": true,
  "wallTexture": "brick-red", "floorTexture": "concrete", "ceilingTexture": "plaster-white",
  "doors": [
    {
      "id": "door-rear-reception", "wallIndex": 0, "position": 0.50,
      "width": 0.90, "height": 2.10, "type": "single",
      "openDirection": "inward", "style": "wood-white"
    }
  ],
  "windows": [
    {
      "id": "win-rear-reception-sash", "wallIndex": 0, "position": 0.20,
      "width": 0.90, "height": 1.60, "sillHeight": 0.30, "type": "double"
    },
    {
      "id": "win-rear-reception-sash-2", "wallIndex": 0, "position": 0.80,
      "width": 0.90, "height": 1.60, "sillHeight": 0.30, "type": "double"
    },
    {
      "id": "win-upstairs-doorway-onto-spiral",
      "wallIndex": 0, "position": 0.50,
      "width": 0.60,                       // matches "60 cm wide" reinstated window
      "height": 2.10,
      "sillHeight": 3.00,                  // top of spiral (15 × 200 mm)
      "type": "single"
    },
    {
      "id": "win-first-floor-rear-reception",
      "wallIndex": 0, "position": 0.20,
      "width": 2.10, "height": 2.20,
      "sillHeight": 3.58,                  // first-floor cill above 3.28 m ceiling + 300 mm cill
      "type": "double"
    }
  ],
  "furniture": [
    {
      "id": "spiral-victorian",
      "type": "staircase-spiral",
      "x": 2.55,                            // inside corner of the L (close to wall 1)
      "y": 1.20,
      "rotation": 0,                         // see §5.4
      "scaleX": 1.0, "scaleY": 1.0,
      "color": "#0a0a0a"                     // black cast iron
    },
    {
      "id": "downpipe-fake",
      "type": "plant-pot",                   // proxy: thin vertical
      "x": 3.05, "y": 1.55,
      "rotation": 0, "scaleX": 0.35, "scaleY": 0.35,
      "color": "#0a0a0a"
    },
    {
      "id": "lantern-1",
      "type": "wall-uplight",
      "x": 1.20, "y": 0.06,
      "rotation": 0, "scaleX": 1.0, "scaleY": 1.0
    }
  ]
}
```

### 5.4 Spiral orientation maths
The spiral's bottom tread starts on the local `+x` axis and rotates
anti-clockwise once (360°). The **top** tread therefore also points along
local `+x`. So to make the top tread land at the doorway, rotate the
furniture item by:
```
rotation = atan2(doorY - stairY, doorX - stairX)
        = atan2(0.00 - 1.20, 1.625 - 2.55)
        = atan2(-1.20, -0.925)
        ≈ -2.225 radians  (≈ -127°)
```
(Recompute if you adjust the spiral position.)

### 5.5 Patches needed for the courtyard
- **Patch A** (REQUIRED): spiral height 3.0 m, see §7.
- **Patch B** (recommended): proportional tread count.
- **Patch C** (only if survey shows clockwise rotation ascending).

---

## 6. Scope 2 — Internal opening, Front Lounge ↔ Rear Reception

Two rooms sharing one wall. Total shared-wall length =
`0.7 + 1.35 + 0.6 = 2.65 m`. The opening is a `DoorData` of
`type: 'double'`, `width: 1.35`, `height: 2.95`, on that shared wall at
`position = (0.7 + 1.35/2) / 2.65 ≈ 0.519`.

```jsonc
// Front Lounge
{
  "name": "Front Lounge",
  "walls": [
    { "x1": -5.00, "y1": -8.00, "x2": -2.35, "y2": -8.00, "thickness": 0.30 },
    { "x1": -2.35, "y1": -8.00, "x2": -2.35, "y2": -3.35, "thickness": 0.30 }, // shared
    { "x1": -2.35, "y1": -3.35, "x2": -5.00, "y2": -3.35, "thickness": 0.30 },
    { "x1": -5.00, "y1": -3.35, "x2": -5.00, "y2": -8.00, "thickness": 0.30 }
  ],
  "bounds": { "minX": -5.00, "minY": -8.00, "maxX": -2.35, "maxY": -3.35 },
  "center": { "x": -3.675, "y": -5.675 },
  "ceilingHeight": 3.28,
  "wallTexture": "plaster-white", "floorTexture": "hardwood-oak", "ceilingTexture": "plaster-white",
  "showFloor": true, "showCeiling": true,
  "doors": [
    {
      "id": "door-internal-opening",
      "wallIndex": 1, "position": 0.519,
      "width": 1.35, "height": 2.95,
      "type": "double", "openDirection": "inward"
    }
  ],
  "windows": [], "furniture": []
}

// Rear Reception (extended +350 mm on courtyard side)
{
  "name": "Rear Reception",
  "walls": [
    { "x1": -2.35, "y1": -8.00, "x2":  0.35, "y2": -8.00, "thickness": 0.30 },
    { "x1":  0.35, "y1": -8.00, "x2":  0.35, "y2": -3.35, "thickness": 0.30 },
    { "x1":  0.35, "y1": -3.35, "x2": -2.35, "y2": -3.35, "thickness": 0.30 },
    { "x1": -2.35, "y1": -3.35, "x2": -2.35, "y2": -8.00, "thickness": 0.30 } // shared, auto-deduped
  ],
  "bounds": { "minX": -2.35, "minY": -8.00, "maxX": 0.35, "maxY": -3.35 },
  "center": { "x": -1.00, "y": -5.675 },
  "ceilingHeight": 3.28,
  "wallTexture": "plaster-white", "floorTexture": "hardwood-oak", "ceilingTexture": "plaster-white",
  "showFloor": true, "showCeiling": true,
  "doors": [],
  "windows": [
    { "id": "win-rear-recep-courtyard", "wallIndex": 1, "position": 0.5,
      "width": 2.10, "height": 2.20, "sillHeight": 0.30, "type": "double" }
  ],
  "furniture": []
}
```

Optional faux steel-beam soffit, dropped from the lintel (purely visual):
```jsonc
{ "id": "fake-beam", "type": "bookshelf",
  "x": -2.35, "y": -5.675, "rotation": 1.5708,
  "scaleX": 1.5, "scaleY": 0.1, "color": "#f08020" }
```

---

## 7. Code patches (apply before generating JSON if needed)

### Patch A — taller spiral (REQUIRED for Hornton St.)
`src/utils/furnitureCatalog.ts` line ~54:
```diff
- { type: 'staircase-spiral', name: 'Spiral Staircase', category: 'stairs', defaultWidth: 1.8, defaultDepth: 1.8, defaultHeight: 2.7, icon: 'Spr' },
+ { type: 'staircase-spiral', name: 'Spiral Staircase', category: 'stairs', defaultWidth: 1.8, defaultDepth: 1.8, defaultHeight: 3.0, icon: 'Spr' },
```

### Patch B — proportional tread count (recommended)
`src/components/FurnitureModels.tsx` line ~1099 (`SpiralStaircaseModel`):
```diff
- const steps = 16;
+ const steps = Math.max(12, Math.round(h * 5));  // 15 at h=3.0 → matches "15 treads × 200 mm"
```

### Patch C — clockwise spiral (only if survey confirms)
Same function, in both the steps loop (~1112) and railing loop (~1125):
```diff
- const angle = stepAngle * i;
+ const angle = -stepAngle * i;
```

### Patch D — wall-hung WC (optional)
In `ToiletModel`, raise the bowl off the floor by ~0.4 m and remove the
floor pedestal cylinder.

### Patch E — washing-machine primitive (optional)
Extend `FurnitureType` union (`src/types/index.ts:44–64`) with
`'washing-machine'`; add a `WashingMachineModel` in `FurnitureModels.tsx`
based on `DishwasherModel` but with a circular porthole.

### Patch F — handrail tube on spiral (recommended for realism)
Replace the sphere-baluster array (line ~1124) with a
`tubeGeometry` swept along a helical curve. Reference:
```ts
const curve = new THREE.Curve();
curve.getPoint = (t) => new THREE.Vector3(
  Math.cos(t * Math.PI * 2) * radius,
  t * h + 0.9,
  Math.sin(t * Math.PI * 2) * radius
);
return <mesh><tubeGeometry args={[curve, 64, 0.025, 8, false]} />
  <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} /></mesh>;
```

### Patch G — custom York stone paving texture
Use `customTextures` in `SavedProject` to inject a stone-paving image
without modifying registry code:
```jsonc
"customTextures": [
  { "id": "custom-york-stone", "name": "York Stone Paving",
    "category": "floor", "imageUrl": "/uploads/york-stone.jpg",
    "tileSize": 0.6, "isCustom": true }
]
```
…then reference `"floorTexture": "custom-york-stone"` on the courtyard
rooms. The user must upload the texture image via the Textures panel
first, OR drop a file into `uploads/` and set the URL.

---

## 8. `sceneConfig` defaults — Hornton St. courtyard

```jsonc
{
  "ambientLightIntensity": 0.45,
  "ambientLightColor": "#ffffff",
  "directionalLightIntensity": 1.15,
  "directionalLightColor": "#fff2d8",     // warm afternoon sun
  "directionalLightPosition": [8, 14, 6],
  "pointLights": [
    { "position": [1.20, 2.40, 0.30], "intensity": 0.6, "color": "#ffd9a0", "distance": 6 },
    { "position": [3.05, 2.40, 2.85], "intensity": 0.6, "color": "#ffd9a0", "distance": 6 }
  ],
  "backgroundColor": "#9ecbe8",            // sky through open courtyard
  "fogEnabled": false,
  "fogColor": "#e0e0e0", "fogNear": 10, "fogFar": 50
}
```

For dusk / lit-lantern look: `directionalLightIntensity: 0.4`,
`directionalLightColor: "#ffa860"`, `backgroundColor: "#3a4a66"`,
`ambientLightIntensity: 0.25`, bump point lights to intensity 1.0.

---

## 9. Available textures

From `src/utils/textures.ts`.

| Category | IDs |
|---|---|
| Wall | `plaster-white`, `plaster-grey`, `brick-red`, `brick-white`, `concrete`, `wood-panel` |
| Floor | `hardwood-oak`, `hardwood-walnut`, `marble-white`, `tile-grey`, `tile-white`, `carpet-beige` |
| Ceiling | `plaster-white`, `plaster-grey`, `wood-panel` |

### 9.1 Material palette mapping (Hornton St. → registry)
| Material from reference render | Closest registry ID | Notes |
|---|---|---|
| London stock brick (upper courtyard walls) | `brick-red` | Tone differs — use Patch G to add a London-stock custom texture for fidelity. |
| Red brick flat arch | `brick-red` | Renders as wall texture only — arch geometry not modelled. |
| Painted brick, white (lower courtyard walls) | `brick-white` or `plaster-white` | If the user wants the half-painted look, split the courtyard wall into two stacked sub-segments — NOT supported by the renderer. Pick one. |
| Cast-iron staircase | `color: "#0a0a0a"` on the furniture item | Cast-iron pattern not modelled — Stage B handles it. |
| Reclaimed York stone paving | `concrete` (default) or Patch G | Use Patch G. |
| Timber doors + sash windows (white) | door `style: "wood-white"`; windows have no style — render as default white | — |

---

## 10. Coordinate datum — Hornton St.

Use a single shared origin across BEFORE and AFTER files so they overlay
1:1:
- Origin `(0, 0)` = **NW corner of the courtyard's rear leg (rectangle B)**.
- `+x` = east (toward party wall).
- `+y` = south (away from the rear-reception bay, toward the kitchen).
- All metres.

This means the rear-reception bay sits in negative-`y` territory, the
front lounge further into negative-`y`. Internal rooms whose dimensions
you don't have can be omitted entirely — the user said "no need for
internal dimensions" for the courtyard scope; just include rooms that
abut the courtyard (so their walls render).

---

## 11. How the user loads the JSON

1. `npm install && npm run dev`, open `http://localhost:5173`.
2. Header → **Save / Load** → **Import from file** → pick the JSON.
3. Header → **3D View**. Orbit with drag; right-drag to pan; scroll to
   zoom; **F** for first-person walkthrough.
4. To compare BEFORE / AFTER, import both — they appear in the project
   list and switch in one click.

Common load failures:
- Missing top-level `version` (must be a string).
- `floorPlan.rooms` empty.
- A wall's endpoints don't match the room's `bounds` (3D view tolerates
  it; 2D editor doesn't).

---

## 12. Stage B — Photoreal Brief format (closes the visual gap)

For each scope, emit a Markdown file with the structure below. The user
will paste it into ChatGPT (image-gen) / Midjourney / SDXL. The dimensions
section is the part that prevents drift.

### Template
```markdown
# Photoreal Brief — <scope name> — <BEFORE|AFTER>

## SCENE
<3-sentence description of what is in frame. Camera position and angle.
Time of day. Mood.>

## LOCKED DIMENSIONS (do not invent or change)
- Courtyard envelope: L-shape, 3.25 m × 2.95 m overall
- Ceiling height (visible building): 3.28 m per storey, 2 storeys = 6.56 m
- Spiral staircase: 15 treads × 200 mm rise = 3000 mm total; black cast iron;
  ornate Victorian balusters; outer Ø ≈ 1.6 m; centre pole Ø ≈ 60 mm
- New glazed kitchen doorway: 950 × 2100 mm, white timber, red-brick flat arch over
- Reinstated first-floor doorway: 600 mm wide × 2100 mm tall, sill at 3000 mm,
  white timber, lands on top tread of spiral
- Rear-reception sash (ground floor, retained): 2100 × 2200 mm
- Existing rear-access bay: central door + 2 flanking sash windows, single red-brick flat arch

## MATERIALS
- Upper walls: London stock brick (yellow-buff, weathered)
- Lower walls (~1.5 m): painted brick, off-white
- Floor: reclaimed York stone paving (irregular slabs)
- Spiral: black cast iron, satin finish
- Downpipe: black cast iron, in inside corner of the L
- Doors / sash frames: white-painted timber
- Wall lanterns (2): black, brass-glazed

## LIGHTING
<e.g. Afternoon sun from upper-right at 35°; warm 4500K; soft shadows;
overcast London sky.>

## COMPOSITION
<e.g. Three-quarter view from courtyard centre looking at the inside
corner of the L; spiral on right; new glazed door on left; first-floor
doorway centred above the spiral landing.>

## STYLE
Architectural photography, full-frame DSLR, 24 mm equivalent, f/8,
ISO 200. RAW realism. No people. No CGI artefacts.

## REFERENCE
<Optional: paste the ChatGPT courtyard render the user shared as a
reference image. Tell the model "match the spiral, brick, paving, and
sash window quality of this reference; correct the dimensions per
LOCKED DIMENSIONS above.">
```

### Why this works
The "LOCKED DIMENSIONS" section gives the image-gen model unambiguous
constraints. Image gens still wobble, but they wobble around the right
numbers instead of inventing storeys or doubling the spiral diameter.

### Recommended key views per scope
| Scope | Views to brief |
|---|---|
| Courtyard | (1) From kitchen door looking NE at the spiral. (2) From upstairs doorway looking down. (3) Wide three-quarter view (matches the user's reference render). (4) Detail of spiral top landing at first-floor doorway. |
| Internal opening | (1) From front lounge looking through to rear reception. (2) From rear reception looking back. (3) Detail of beam soffit + retained nibs. |
| Shower-room | (1) From pocket door looking in. (2) Wide cutaway iso. |

---

## 13. Drawing-set inventory — what is known vs. what to ask for

The user said this is a **20-sheet set** for the project. Only three sheets
have been seen so far:

| # | Title | Status | What you need from the user if not seen |
|---|---|---|---|
| 10 | 3D AXONOMETRIC — Rear courtyard with proposed spiral staircase | ✅ Seen + reference photo render | — |
| 11 | 3D ISOMETRIC — Proposed compact shower-room (cutaway) | ✅ Seen | — |
| 12 | 3D ISOMETRIC — Proposed internal opening between reception rooms | ✅ Seen | — |
| 1–9, 13–20 | Site plan, existing/proposed plans of each floor, sections, elevations, schedules | ❓ NOT SEEN | Ask the user to share each sheet (image/PDF) one at a time, and for each: dimensions, openings, materials, ceiling heights. |

**Mandatory first step for an unseen sheet**: ask the user for either
(a) the sheet image, or (b) a structured summary giving — drawing title,
sheet type, room/element list with dimensions in mm, openings with
positions and sizes, materials, ceiling height(s), and any callouts
referencing other sheets. Don't guess sheet contents.

For each newly described sheet, follow the same output structure:
BEFORE JSON, AFTER JSON, Photoreal Brief.

---

## 14. Reply format the user expects from you

Strict order. No prose preamble.

1. ONE sentence confirming understanding + listing any one missing input
   (or "no missing inputs").
2. (If any) unified diffs for code patches in fenced `diff` blocks.
3. For each sheet/scope, in order:
   - `<scope>.before.floorplan.json` in a fenced `json` block.
   - `<scope>.after.floorplan.json` in a fenced `json` block.
   - `<scope>.photoreal-brief.md` in a fenced `markdown` block.
4. ONE sentence on how to load (point at §11).

Do NOT produce architectural drawings. Do NOT produce HTML / SVG.
Do NOT explain the obvious. The deliverable is JSON + Photoreal Briefs.

---

## 15. Files in this bundle worth reading

| File | Why |
|---|---|
| `src/types/index.ts` | Canonical schema. Your output must match. |
| `src/components/FurnitureModels.tsx` (1098–1138) | `SpiralStaircaseModel` geometry — to know how it'll render, to write patches B/F. |
| `src/components/FurnitureModels.tsx` (ShowerModel, ToiletModel, BathtubModel) | Bathroom fixture geometry. |
| `src/utils/furnitureCatalog.ts` | Default dimensions for every furniture type. Patch A target. |
| `src/components/RoomMesh.tsx` | Wall extrusion, opening cutouts, shared-wall dedupe, sub-segment gap rendering. |
| `src/components/Scene3D.tsx` + `SceneLighting.tsx` | Top-level scene + lighting wiring. |
| `src/utils/projectStorage.ts` | `exportProjectToFile` / `importProjectFromFile` — the exact parse path. |
| `src/utils/houseTemplates.ts` | Reference templates showing the room-construction pattern in code. |
| `src/utils/textures.ts` | Texture ID registry + custom-texture loader. |
| `src/components/SaveLoadPanel.tsx` | UI entry point that consumes your JSON. |
| `prisma/schema.prisma` | If persisting via the backend instead of file export. |
