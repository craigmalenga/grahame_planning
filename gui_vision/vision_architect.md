# Vision: The Ideal Browser GUI for UK Planning-Application Floor Plans
### A chartered-draughtsman's brief for the 20 Hornton Street self-build tool

Author lens: chartered architect / CAD draughtsman.
Target user: Craig (non-architect) producing RBKC planning drawings for Flat 1,
20 Hornton Street — a Grade-II Victorian terrace.
Subject app: React + Three.js + Zustand, 2D "Design" editor + 3D view.

---

## 0. The gap, stated plainly

The current app is a **room-painting tool**, not a **drafting tool**. It thinks in
*rectangular rooms* (`addRoom(minX,minY,maxX,maxY)` → `makeRoomWalls()` emits 4
axis-aligned walls; `updateRoomBounds` regenerates them; bounds are always an
axis-aligned box). A planning draughtsman thinks in *a wall network* — a graph of
nodes and edges, dimensioned to the millimetre, annotated with dimension strings,
sliced into storeys, and stamped with a title block, scale bar and north point.

For an RBKC submission the deliverable is a **scaled, dimensioned, annotated
orthographic drawing** (typically 1:50 or 1:100, existing-and-proposed side by
side). The app today cannot draw the actual plan of Flat 1: the ground floor is
4.34 m wide × 13.77 m long with an L-shaped wet room, angled party-wall returns
and a rear lightwell — none of which is a clean rectangle. Everything below is
how to close that gap **without throwing the renderer away** — the 3D ground-truth
engine is the asset worth keeping (per the platform spec, it is "geometric ground
truth"). We extend the *input + annotation + output* layers around it.

---

## 1. Precise input — type the number, don't eyeball the drag

A draughtsman never trusts a drag for a final dimension. Drag is for *intent*;
the keyboard is for *truth*. The current room tool snaps to a 0.25 m grid
(`SNAP = 0.25`) and shows a live `Wm x Hm` label — good for sketching, useless for
a 4.337 m party wall.

What the GUI needs:

1. **Dimension-on-commit numeric entry.** While dragging a wall, a floating input
   shows the live length **in cm** (the spec asks for cm explicitly). On
   mouse-up, that input stays focused — type `434` + Enter and the wall becomes
   exactly 4.340 m. Same pattern AutoCAD calls "dynamic input."
2. **Tab between length and angle.** `434 <Tab> 12.5 <Enter>` = 4.34 m at 12.5°.
   This is the single most important feature for an *angled* wall (the spiral
   landing, the splayed party return). Today angled walls are only reachable by
   dragging orange vertex handles (`updateWallVertex`) with no numeric control.
3. **Relative / polar / absolute coordinate modes.** `@434<90` (polar, relative
   to last point) is how every wall after the first should be entered. The first
   point can be absolute from the datum (spec §10: NW corner of the rear leg).
4. **Right-click wall → exact editor.** The spec already wants "right-click to
   edit wall length / height / thickness in cm." The right-click handler today
   only toggles a sub-segment gap (`toggleWallGap`). It should open a small modal:
   *Length (cm), Angle (°), Thickness (mm), Height (mm), Type {external / party /
   internal / parapet}*. Editing length must move the **downstream** node and drag
   the connected wall with it (a graph operation, see §9).
5. **Constraint snaps:** ortho-lock (Shift), endpoint, midpoint, perpendicular,
   extension, and "parallel-at-offset" (for drawing a 300 mm-thick wall as two
   faces). Snap radius should scale with zoom, as `findNearestWall` already does.
6. **Units toggle** mm / cm / m, with mm the storage unit internally (Victorian
   surveys are in mm; the spec stores metres but the user speaks cm/mm).

---

## 2. Dimension strings & chain annotation

This is what makes a drawing a *planning drawing* rather than a cartoon. RBKC
will reject an undimensioned plan. The app currently draws one length pill per
wall of the **selected** room only (`isSel` block, DesignMode line ~357) — that is
a hover hint, not a dimension.

A drafting GUI needs **dimension entities** that are first-class, persistent, and
exported:

- **Running / chained dimension strings** along each face: e.g. the GF left wall
  reads `1460 | 1810 | 1430 | 600` (the reconciliation's rear-reception segments)
  as a continuous chain with tick marks and an overall `5300` bracket above it.
- **Overall + intermediate + opening dims** stacked: convention is overall on the
  outermost string, structural openings on the middle, fit-out on the innermost.
- **Witness lines + arrowheads/ticks**, text centred and gapped, auto-flipping so
  it never reads upside-down — standard ISO 129 behaviour.
- **Associative**: when a wall moves or is re-typed to 434, the dimension text
  recomputes. (Implies dims reference *nodes*, not frozen numbers.)
- **Door/window dims**: structural opening width + height + the to-cill / to-head
  level, pulled straight from `DoorData` / `WindowData`. The Crittall door reads
  `1245 × 2450` automatically.
- **Levels & spot heights**: a level datum symbol (the "FFL +0.000", "+3.280")
  used on sections — see §5.

Implementation: a new `Annotation` layer drawn on the 2D canvas (and ideally
projected into the 3D view as a measured overlay, which `Measurements3D.tsx`
already hints at). Dimensions are not geometry — they live in a parallel array so
they can be toggled per layer for export.

---

## 3. Wall joins & cleanup — T-, L-junctions and mitres

The deepest structural weakness. Because each room owns its own 4 walls and
shared walls are *de-duplicated at render time* (`findSharedWall` in
RoomMesh.tsx), there is **no concept of a wall meeting another wall**. Two rooms
that share a party wall today produce two coincident centrelines that the
renderer happens to draw once. Move one room and the join silently breaks.

A draughtsman demands clean junctions:

- **L-junction (corner):** two walls of possibly different thickness meet at a
  node; the outer faces mitre, the inner faces meet at the inside corner. The 5 mm
  inward nudge hack (`getWallInwardOffset`, pitfall P1) is a symptom of having no
  real join model.
- **T-junction:** an internal wall (100 mm) butts into an external/party wall
  (300 mm). The butting wall should stop at the *face* of the through wall, not
  its centreline, and the through wall's face should be unbroken.
- **Mitre vs butt** chosen automatically by wall type priority (external runs
  through; internal butts).
- **Auto-cleanup / "heal":** when two endpoints land within tolerance they weld
  into one node. This is what lets you draw a closed polyline and get a watertight
  room.

This *requires* the wall-graph model (§9). Without it, every junction is a
coincidence and the L-shaped courtyard has to be faked as "two rectangles with a
gap sub-segment" — which the spec admits is a workaround (§3.1, §4).

---

## 4. Thickness conventions & wall types

UK practice uses a small fixed vocabulary of wall thicknesses, and the drawing
must read them at a glance:

| Wall type | Typical thickness | Render convention |
|---|---|---|
| External (solid Victorian brick) | **~300 mm** (often 337 = one-and-a-half brick) | Heaviest poché, hatched solid |
| Party wall | **~225–300 mm** | Solid poché, often with a party-wall line symbol |
| Internal load-bearing | **~150 mm** | Medium |
| Internal partition (studwork) | **~75–100 mm** | Light, sometimes shown as two thin lines |
| Parapet / low wall | varies | Dashed above cut plane |

The model has `WallSegment.thickness` (free float) but **no wall type**. Add a
`type` enum so that: (a) thickness defaults correctly, (b) join priority is
decided (§3), (c) poché hatching and line weight are assigned for export, (d) the
schedule can count linear metres of each. A `Set wall type` action on the
right-click menu is the natural home.

Poché (the solid fill of the cut wall) is the single visual cue that most says
"this is an architect's drawing." The 2D canvas should fill cut walls solid black
(or hatched), not the current single grey stroke (`COLORS.wall`, `lineWidth =
thickness*scale`). A stroked centreline reads as a sketch; a filled section reads
as a drawing.

---

## 5. Levels, storeys & storey heights

Planning needs **multiple named floors** (the spec user asks for this directly:
"multiple named FLOORS with default + per-wall heights") and the building genuinely
has Basement / Lower-Ground + Ground + First. The app today is a hard
**single-storey renderer** — every room sits at `y = 0.002`, and the documented
hack is to model two storeys as one tall room (`ceilingHeight = 6.56`) with
high-`sillHeight` windows (spec §4.1). That is unacceptable for a real drawing set
where each floor is its own sheet.

What's needed:

- A **Floor / Storey object**: `{ id, name, levelFFL (mm), defaultWallHeight,
  rooms[] }`. "Basement", "Ground Floor", "First Floor", each with its own FFL
  datum (e.g. GF +0.000, Basement −2.900, First +3.280).
- **Per-floor default height** + **per-wall height override** (the spec's
  "default + per-wall heights"). `WallSegment.height?` already exists per wall;
  the floor supplies the default.
- **Floor switcher** in the UI (tabs or a left rail) — draw on one floor at a time,
  with the floor below shown as a faint **underlay** (essential for stacking walls
  and aligning the spiral that pierces basement→GF).
- **Level datums / spot heights** as annotation entities (§2) for the eventual
  sections.
- The 3D engine then **stacks** floors at their FFL instead of all-at-zero. This
  is the biggest renderer change but also the one that makes the existing
  "fake a 6.56 m room" pitfalls (P3, P4) disappear.

---

## 6. Openings — doors & windows as dimensioned, levelled objects

`DoorData` and `WindowData` are decent starting points, but for planning:

- **Doors need a sill/threshold context** even though they sit on the floor. The
  spec's own workaround — model a high-level doorway as a *window* with
  `sillHeight` — is a data-model smell. The reinstated first-floor doorway onto
  the spiral landing (600 mm wide, sill at 3000 mm) is *conceptually a door* but
  has to be entered as a window today. Unify: an `Opening` with `head`, `sill`,
  `width`, and a `kind {door|window|opening}` (see §9).
- **Cill / head heights** shown and dimensioned. Sash windows on this building
  have a 2100 × 2200 retained opening; the GUI must let you type those and see the
  cill level annotated.
- **Opening type vocabulary** matched to UK stock: timber sash (vertical sliding),
  casement, Crittall steel, French/glazed door, flat-arch head. The renderer need
  not model the arch geometry (pitfall acknowledges this) but the **2D symbol and
  schedule** should record it.
- **Door swing arcs** at correct radius and hand — the 2D canvas already draws a
  swing arc; make the hand (left/right) and direction (in/out) explicit and
  schedule-able.
- **Window/door schedule** auto-generated from the model: a table of every
  opening with ref (W01, D03), size, cill, material, "existing/proposed/new."

---

## 7. Stairs as first-class objects — straight & spiral

Stairs are currently **furniture** (`staircase-straight`, `staircase-spiral` in
the `FurnitureType` union), placed at a world `(x,y)` with no relationship to the
floors they connect, no going/rise, no clipping checks (pitfalls P2–P4, P7
catalogue the resulting disasters: spiral clipping the floor, poking through the
ceiling, mis-rotated landing). For this building the stair *is* the project — a
reclaimed Victorian cast-iron spiral, 15 treads × 200 mm = 3000 mm rise, landing
exactly at a first-floor doorway.

A `Stair` should be a first-class element with:

- **Type:** straight / dog-leg / winder / **spiral**.
- **Going & rise** (e.g. 15 × 200 mm rise; tread going); the GUI computes the
  other dimension and **validates against Building Regs** (max rise ~220 mm, min
  going ~220 mm, 2R+G ~550–700) — a credibility win for planning/BR.
- **Top & bottom storey references** (it connects Basement → GF, GF → First). This
  is *why* stairs can't be furniture: furniture lives in one room on one floor.
- **Landing & direction of travel** with an **UP/DN arrow and break line** (the
  standard 2D stair symbol the app entirely lacks).
- **Walking-line + numbered treads** in 2D; correct helical geometry in 3D with
  the landing auto-oriented to the upstairs opening (replacing the manual
  `atan2` rotation maths the spec makes the user do by hand in §5.4).
- For the spiral specifically: outer Ø, centre-pole Ø, handrail — Patch F in the
  spec is already a sketch of the better geometry.

---

## 8. Sheet furniture — north point, scale, title block, layers

A drawing without these is not a planning drawing; it's a doodle. None exist
today (the app exports JSON, never a sheet — spec §1 forbids PDF/SVG output *for
the agent*, but the **human deliverable to RBKC is a PDF**, so the GUI itself must
produce one).

- **North point** — a rotatable north arrow placed once per project; all plans
  inherit it. RBKC site plans must show north.
- **Scale + scale bar** — true 1:50 / 1:100 with a graphic bar that survives
  photocopying. The app has a `scale` field on `FloorPlanData` but it's a
  pixels-per-metre render hint, not a drawing scale.
- **Title block** — practice/agent name, project address (Flat 1, 20 Hornton St,
  W8 4NR), drawing title, drawing number (the 20-sheet set, spec §13), revision
  (Rev B), date, scale, "DO NOT SCALE", paper size (A1/A3). Bound to project
  metadata so it fills itself.
- **Layers** — at minimum: *Existing*, *Proposed*, *Demolished*, *Dimensions*,
  *Annotation*, *Furniture*, *Grid*. Each toggle-able and assigned a line
  weight/style for export. Demolished = dashed; new = bold/solid; retained =
  medium — the standard existing/demolished/proposed convention.
- **Export to scaled PDF/SVG** at a chosen sheet size, with vector poché, dim
  strings, schedules and title block composited. This is the missing "Stage A
  deliverable for humans."

---

## 9. Existing-vs-proposed overlay

RBKC submissions are *comparative*: every plan is presented **Existing** beside
**Proposed**, and often a **demolition** plan between them. The spec already
mandates twin files (`*.before.floorplan.json` / `*.after.floorplan.json`, §1)
sharing a datum (§10) so they overlay 1:1 — but the app has no overlay UI; you
load one *or* the other.

The GUI should:

- Hold **Existing** and **Proposed** as two states of the *same project* (not two
  files the user juggles), keyed to one datum.
- **Overlay / onion-skin** mode: existing in grey, proposed in black, demolished
  walls dashed-red, new walls solid-green — the classic planning colour-up.
- **Diff view**: auto-highlight what changed (the Crittall opening, the +350 mm
  rear-reception extension, the lowered/enlarged kitchen window).
- One-click **"duplicate Existing → Proposed"** to start editing the proposed
  from the survey.

---

## 10. What the current rectangular model lacks — and the fix

The root limitation, restated as a list the dev team can act on:

1. **No free polyline / angled walls as a primitive.** `addRoom` only makes
   axis-aligned rectangles; `updateRoomBounds` *regenerates* 4 walls from a box,
   destroying any vertex edits. Angled walls survive only via `updateWallVertex`
   and break on any bounds edit. **Fix: a Wall/Polyline tool** that drops nodes
   and draws edges directly, independent of "rooms."
2. **No wall graph.** Walls are owned by rooms and de-duplicated by coincidence.
   **Fix: promote walls to a shared node/edge graph** (§9 below in the data
   model); rooms become *derived faces* (closed loops in the graph), not the
   primary entity.
3. **No junctions, no poché, no line weights** (§3, §4).
4. **Single storey** (§5).
5. **Stairs are furniture** (§7).
6. **No annotation/dimension entities, no sheet/title block/north/scale, no
   layers, no existing-vs-proposed overlay, no PDF export** (§2, §8, §9).
7. **L-shapes only via the two-rectangles-plus-gap hack** (spec §3.1) — dissolves
   once §1–§2 land.

---

## 11. Data-model changes (in terms of `WallSegment` / `RoomData`)

The migration is *additive* — keep the current types loading (importers stay
valid) and layer the graph on top.

### 11a. New node + graph layer (the keystone)

```ts
interface WallNode {                 // a junction / vertex, deduplicated
  id: string;
  x: number; y: number;              // metres, on a floor plane
  floorId: string;
}

type WallType = 'external' | 'party' | 'loadbearing' | 'partition' | 'parapet';

interface WallEdge {                 // replaces room-owned WallSegment as truth
  id: string;
  startNodeId: string;
  endNodeId: string;
  thickness: number;                 // metres (default per WallType)
  type: WallType;                    // NEW — drives poché, join priority, schedule
  height?: number;                   // per-wall override; floor supplies default
  texture?: string;
  side?: 'left' | 'right' | 'center';// centreline offset for face-drawn walls
  openings: Opening[];               // openings live ON the wall edge, not the room
  subSegments?: WallSubSegment[];    // keep for backward-compat gaps
}
```

### 11b. Unify openings (door + window → one element with levels)

```ts
interface Opening {                  // supersedes DoorData + WindowData
  id: string;
  kind: 'door' | 'window' | 'opening';
  position: number;                  // 0–1 along the edge (unchanged convention)
  width: number;
  height: number;
  sill: number;                      // 0 for doors; e.g. 3.0 for the high doorway
  head?: number;                     // = sill + height, derived
  swing?: { hand: 'left'|'right'; dir: 'in'|'out' };  // doors
  subtype?: 'sash'|'casement'|'crittall'|'french'|'glazed'|'flat-arch';
  status: 'existing' | 'proposed' | 'demolished';     // NEW — for overlay/schedule
  ref?: string;                      // 'W01','D03' for the schedule
  style?: DoorStyle;
}
```
This kills the "model a high door as a window" smell (spec §3.4 / §4.2).

### 11c. Storeys

```ts
interface Floor {
  id: string;
  name: string;                      // 'Basement','Ground Floor','First Floor'
  levelFFL: number;                  // metres relative to project datum
  defaultWallHeight: number;
  roomIds: string[];
}
```
`FloorPlanData` gains `floors: Floor[]` and `walls/nodes` move to the graph; the
3D engine stacks each floor at `levelFFL` (removes pitfalls P3/P4).

### 11d. Stairs as a first-class element

```ts
interface Stair {
  id: string;
  kind: 'straight'|'dogleg'|'winder'|'spiral';
  x: number; y: number; rotation: number;
  treads: number; rise: number;      // mm; total rise = treads*rise (3000 here)
  going?: number; outerDiameter?: number; centrePoleDiameter?: number; // spiral
  fromFloorId: string; toFloorId: string;     // connects storeys, not "in a room"
  landingOpeningId?: string;         // auto-orient landing to this opening
}
```
Removes `staircase-straight`/`staircase-spiral` from `FurnitureType`; furniture
stays purely fit-out.

### 11e. Annotation + sheet metadata

```ts
interface Dimension {
  id: string;
  kind: 'chain'|'overall'|'level'|'radial';
  fromNodeId: string; toNodeId?: string;       // associative — recomputes on edit
  offset: number;                              // witness-line offset
  layer: string;
}
interface SheetMeta {
  northRotation: number;             // radians
  drawingScale: number;              // 1:50 → 50
  paperSize: 'A1'|'A2'|'A3';
  titleBlock: { project; address; drawingTitle; drawingNo; rev; date; scaleText };
  layers: { id: string; name: string; visible: boolean; lineWeight: number;
            lineStyle: 'solid'|'dashed'; color: string }[];
}
```

### 11f. Existing/Proposed

Either a `status` field per element (11b shows the pattern — extend to `WallEdge`,
`Stair`) **or** two `Scheme` snapshots (`existing`, `proposed`) sharing one datum.
The per-element `status` route is lighter and powers the onion-skin/diff directly.

### 11g. Back-compat

`RoomData` is **retained but derived**: a room becomes a named closed loop over
the node graph (`nodeLoop: string[]`) plus its finishes (textures, show
floor/ceiling). A one-time importer reads today's room-owned `walls[]`, welds
coincident endpoints into shared `WallNode`s, and emits `WallEdge`s — so every
existing `SavedProject` JSON (and the Hornton St. files the platform agent emits)
still loads.

---

## 12. PRIORITISED BUILD ORDER

Ordered by *credibility-per-effort* for producing a real RBKC drawing.

1. **Numeric / dimensional input** — type exact length (cm) + angle on draw and
   on right-click wall edit (length / angle / thickness mm / height mm). Highest
   value, smallest blast radius: it makes *every* dimension trustworthy and is the
   feature the user asked for first. (Touches DesignMode input + a wall-edit
   modal; no graph needed for the v1 of right-click-edit-one-wall.)

2. **Free polyline wall tool + wall graph (nodes/edges) with auto-weld &
   junction cleanup** — the keystone refactor (§9, §11a, §11c-of-joins). Unlocks
   angled walls, L-shapes, T/L junctions and poché. Everything credible depends
   on this. Ship behind the existing room importer so nothing breaks.

3. **Multiple named floors with default + per-wall heights, stacked in 3D, with
   below-floor underlay** — directly requested; removes the 6.56 m-fake-room and
   the spiral-clipping pitfalls; required to draw Basement/GF/First as separate
   sheets.

4. **Dimension strings + wall-type/thickness conventions with poché & line
   weights** — turns the canvas from a sketch into a drawing: chained running
   dims, overall brackets, external 300 / party / internal 100 with solid poché.

5. **Sheet output: title block + scale bar + north point + Existing/Proposed
   overlay → scaled PDF/SVG export** — the actual thing you hand to the planners.
   Stairs-as-first-class-objects and the opening schedule follow immediately
   after, riding on the graph + floors already built in 2–3.

---

### One-line summary
Keep the millimetre-accurate 3D engine; replace the *rectangular-room* input
model with a *dimensioned wall graph across named storeys*, wrap it in
draughting annotation (dim strings, poché, north, scale, title block, layers) and
an existing-vs-proposed overlay, and let the user **type the numbers** instead of
dragging for them.
