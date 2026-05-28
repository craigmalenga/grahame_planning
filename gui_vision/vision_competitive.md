# Competitive GUI Vision — DIY Floor-Plan Builder

**For:** Flat 1, 20 Hornton Street — 2-storey Victorian flat, planning application.
**Stack:** React + Three.js + Zustand. 2D editor (to build) + 3D view (exists).
**User:** non-architect, wants to draw angled walls by click-drag with live cm, type exact
lengths, right-click to edit length/thickness/height, and manage multiple named floors with heights.

---

## 0. Grounding — what the codebase already has vs. what's missing

This shapes every "quick win vs heavy" call below. Verified against
`src/store/useStore.ts`, `src/utils/geometry.ts`, and the component list.

**Already in the store (logic exists, UI does not expose it):**
- `addFreeWall` / `updateFreeWall` / `removeFreeWall` — free-standing **angled** walls on
  `floorPlan.wallSegments`, with thickness + height. The data model for the user's #1 ask is done.
- `undo()` / `redo()` with a 50-entry history stack and human-readable labels ("Add door", "Split wall").
- `duplicateRoom` — deep-clones a room with fresh IDs (the seed for copy-floor-as-starting-point).
- `splitWall` / `toggleWallGap` / `deleteWallSegment` — sub-segment system for openings/wide gaps.
- `updateWallVertex` — drag a wall endpoint, auto-fixes the neighbouring wall + recomputes bounds.
- Per-wall texture, room CRUD, door/window/furniture CRUD, custom textures.
- `findAlignmentGuides` in `geometry.ts` — snap-to-wall/furniture/center with guide lines (built, unused).
- `wallLength`, `calcPolygonArea` (shoelace) — length + area maths ready.
- `houseTemplates.ts` — template room sets, loaded via `loadTemplate`.

**Missing (the real gap):**
- **There is no 2D editor canvas at all.** `viewMode: 'design'` renders the 3D scene
  (`DesignMode` / `Scene3D`), not a drawing surface. The user's asks (click-drag draw, on-canvas
  length, right-click edit) need a brand-new 2D SVG/Canvas editor component wired to the store
  actions above.
- No multi-floor model. `FloorPlanData` is a single flat list of rooms; there is no `floors[]`,
  no per-floor height/name. Two-storey is currently faked with one tall room (ceiling 6.56 m).
- No auto-room-detection from closed loops, no drag-to-split-room, no constraint/lock system,
  no on-canvas numeric entry, no shortcut layer.

**Implication:** the heaviest single lift is the 2D editor surface itself. Once it exists,
most "best-in-class" patterns become thin layers over store actions that already work.

---

## 1. Wall-drawing UX

### magicplan / Floorplanner — click-drag with live length + angle readout
**What they do well:** You click a start point and drag; a tooltip pinned to the cursor shows the
running length (and Floorplanner shows the angle). Release to commit. The next click chains from the
last endpoint so you draw a whole perimeter without re-clicking the origin.
**Translate:** On the new 2D canvas, `pointerdown` sets `start`, `pointermove` previews a rubber-band
wall and renders a cursor-following label `len = wallLength(preview) * 100 | 0 cm` plus
`angle = atan2(dy,dx)`. `pointerup` calls `addFreeWall(x1,y1,x2,y2, defaultWallThickness)` and seeds
the next segment's start at the released endpoint (chained polyline). The length maths is `wallLength()`
which already exists.
**Cost:** Medium — needs the canvas to exist, but the store action and length fn are done.

### Floorplanner / Sweet Home 3D — angle + length snap (15° increments, ortho with Shift)
**What they do well:** Walls snap to 0/15/30/45/90° as you drag; holding Shift forces orthogonal.
Length snaps to a grid (e.g. 5 cm). This is what makes freehand drawing produce clean geometry.
**Translate:** During `pointermove`, quantise the preview angle to the nearest 15° unless within a few
degrees of a "real" angle from a neighbouring wall; snap length to a 5 cm grid; `Shift` locks to
0/90°. Feed the snapped endpoint into `findAlignmentGuides` (already written) so it also snaps to
existing wall endpoints and shows guide lines.
**Cost:** Quick — pure math in the move handler reusing `findAlignmentGuides`.

### magicplan — "type to set length" mid-draw
**What they do well:** While dragging a wall, you just start typing a number; it captures the length
field, and Enter commits a wall of exactly that length in the current drag direction.
**Translate:** While a wall preview is live, capture digit keypresses into an inline floating input
anchored at the cursor (default unit cm). Enter commits `addFreeWall` using the *current drag angle*
but the *typed length*. Tab toggles focus between a length field and an angle field.
**Cost:** Quick once the drawing tool + floating-input component exist.

---

## 2. Guided dimensioning (on-canvas numeric entry)

### Arcsite / Cedreo — every wall shows a live dimension you can click and overwrite
**What they do well:** Each wall segment displays its length as an editable chip on the canvas. Click
it, type 3450, press Enter — the wall resizes and pushes/pulls connected geometry. No side panel
round-trip.
**Translate:** Render a dimension label at each wall midpoint (free walls and room walls). Clicking
it opens an inline input; on commit, recompute the endpoint along the wall's existing direction
(`updateFreeWall` for free walls; `updateWallVertex` for room walls, which already cascades to the
neighbour). Show running totals and, for rooms, the `calcPolygonArea()` figure (m²) in the room centre.
**Cost:** Medium — label layer + inline edit; both store mutators exist.

### Revit/ArchiCAD-lite — temporary dimensions while an element is selected
**What they do well:** Select a wall and witness-lines + editable dimensions appear to the nearest
parallel elements, so you reposition relative to context, not just absolute coords.
**Translate:** When a wall is selected, draw dimension lines to the nearest parallel wall on each side
and make them editable (moves the selected wall to satisfy the typed gap). This is the architect's
"set the corridor to exactly 900 mm" move — genuinely useful for a planning-accurate flat.
**Cost:** Heavy — needs parallel-element detection + a solver. Defer.

---

## 3. Auto-room-detection from closed wall loops

### Floorplanner / RoomSketcher / Sweet Home 3D — close a loop, a room appears
**What they do well:** The instant your walls form a closed polygon, the enclosed area auto-fills as a
named room with floor + area label. You draw walls, not rooms; rooms emerge.
**Translate:** After each `addFreeWall`, run a planar cycle-detection pass over `wallSegments`
(build a graph of endpoints within a snap tolerance, find minimal cycles). For each new closed cycle,
synthesise a `RoomData` (walls in order, bounds, center, default textures/height) and add it. The
schema mandates 4-wall axis-aligned rectangles per room (§3.1 of the platform spec) and splits
L-shapes into two rectangles — so the detector should emit rectangles where possible and fall back to
the polygon walls for angled rooms (the 3D `RoomMesh` tolerates non-rect walls; the strict-rectangle
rule is an import convention, not a hard renderer limit).
**Cost:** Heavy — graph cycle-finding + reconciling with the rectangle convention. High value though:
it's *the* defining interaction of the consumer tools and removes the user's biggest confusion
(walls vs rooms). Build after the basic draw tool lands.

---

## 4. Drag-to-split

### Cedreo / RoomSketcher — drag a divider across a room to split it into two
**What they do well:** Hover a room, drag a line wall-to-wall, and the room splits into two rooms
sharing the new wall — instant for "add a partition for the shower-room."
**Translate:** A "split room" tool: click one wall, drag to the opposite wall; on release, create a
new free wall along the drag and re-run room detection (or, in the rectangle model, replace the room
with two adjoining rectangles + a shared wall). For the user's compact shower-room carved off the
kitchen, this is the natural gesture.
**Cost:** Medium-Heavy — depends on room-detection existing; without it, fall back to "insert wall +
manually create the two rectangles."

### magicplan — drag a wall midpoint to add a corner (split a wall in two)
**Translate:** Double-click a wall to insert a vertex at the click fraction; thereafter drag either
half. The sub-segment `splitWall(roomIndex, wallIndex, fraction)` already does the data split for
openings; a geometry-vertex split is the sibling operation.
**Cost:** Quick (wall-vertex split) / the room-split is the heavier one.

---

## 5. Libraries (doors / windows / stairs / furniture)

### Floorplanner / RoomSketcher / magicplan — drag-from-palette onto a wall, auto-orient
**What they do well:** A categorised, searchable palette (Doors, Windows, Stairs, Bathroom, etc.).
Drag a door near a wall and it snaps into the wall, cuts the opening, and orients to the wall normal.
Windows show a sill-height field; doors show swing direction with a live arc.
**Translate:** A left-rail palette backed by `furnitureCatalog.ts` (already has categories: stairs,
bathroom, etc.). Dropping a door on a wall computes the nearest wall + the `position` fraction along
it and calls `addDoor(roomIndex, {wallIndex, position, ...})`; the sub-segment opening system already
renders the cut. Windows expose `sillHeight` (critical here: the first-floor doorway-onto-spiral is a
Window at `sillHeight 3.0`, per the platform spec). Pre-load a **Victorian preset set**: sash window,
6-panel timber door, cast-iron spiral (`staircase-spiral`), pocket/sliding door — matching this
project's actual components.
**Cost:** Quick-Medium — catalog + CRUD exist; the palette UI + wall-snap drop math is the new work.

### Morpholio Trace / Cedreo — "smart" stair + opening objects that report their own dimensions
**Translate:** When a spiral stair is selected, show treads × rise = total-rise (the project needs
15 × 200 mm = 3000 mm) and warn if `room.ceilingHeight < stair.height + 0.1` (platform pitfall P4).
A door object shows clear-width; a window shows W × H + sill. Lightweight inspector, big trust payoff.
**Cost:** Quick — read catalog defaults + item fields into a properties panel.

---

## 6. Templates

### RoomSketcher / Floorplanner — start from a furnished template, then edit
**What they do well:** "Start from a template" gallery (studio, 1-bed, terraced house) that drops a
complete editable plan, so a novice is never staring at a blank canvas.
**Translate:** `houseTemplates.ts` + `loadTemplate` already exist. Add a startup gallery with
thumbnails, and seed a **"Victorian terraced flat"** template close to this flat's footprint (front
lounge + rear reception + kitchen + courtyard) as the user's literal starting point.
**Cost:** Quick — wiring + one new template + thumbnails.

---

## 7. Copy-floor-as-starting-point + multiple named floors

### Floorplanner / RoomSketcher / Cedreo — multi-storey with "duplicate this floor"
**What they do well:** A floor switcher (tabs: Ground / First / Loft), each floor named with its own
storey height. "Duplicate floor" copies the lower floor up as a tracing base so the upper floor's
load-bearing walls line up. A faint ghost of the floor below shows through.
**Translate (this is the user's explicit ask):** Introduce a `floors[]` layer above `FloorPlanData`:
each floor = `{ id, name, height, floorPlan: FloorPlanData }`. A floor-tab bar in the header switches
the active floor. "Duplicate floor up" reuses the existing `duplicateRoom` logic across the whole room
set (deep clone + new IDs). Render the floor-below as a low-opacity underlay in the 2D editor for
tracing. NOTE: the 3D renderer is single-storey (platform §4.1) — so 3D still composites floors by
offsetting/stacking or by the existing tall-room trick; the *editor* gets true floors even if 3D
keeps faking stacking initially.
**Cost:** Heavy on the data model (touches the store, save/load, 3D compositing) but the per-floor
*duplicate* primitive is reusable from `duplicateRoom`. The floor-tab + ghost-underlay UI is Medium.
This is high priority because it's a named requirement and there's currently nothing.

---

## 8. Keyboard shortcuts

### SketchUp / Revit — single-key tools + modifier locks
**What they do well:** `L`/`W` line/wall, `R` rectangle, `M` move, `Esc` cancel, `Ctrl+Z/Y` undo/redo,
arrow keys nudge, Shift = ortho lock, typed numbers = dimension entry, `Enter` re-applies last value.
**Translate:** A keymap layer over the 2D editor: `W` wall, `R` room-rect, `D` door, `N` window,
`S` split, `Esc` cancel current draw, `Ctrl+Z`/`Ctrl+Shift+Z` → `undo()`/`redo()` (store fns exist),
`Delete` removes selection, arrows nudge selected element by grid. Shift = ortho during draw.
**Cost:** Quick — a `keydown` dispatcher mapping to store actions, mostly already-built actions.

---

## 9. Constraint / lock systems

### Revit/ArchiCAD-lite — pin, lock, and equalise constraints
**What they do well:** Lock a dimension so edits elsewhere can't move it; "EQ" to equalise spacing;
pin an element. Keeps a plan internally consistent under edits.
**Translate:** A pragmatic subset: (a) **lock wall length/angle** (a per-wall `locked` flag that makes
`updateWallVertex` refuse to change it); (b) **grid snap toggle** with adjustable spacing; (c) **ortho
lock** global toggle mirroring Shift. Skip the full constraint solver — overkill for a single-flat
planning drawing.
**Cost:** Quick for lock-flags + snap toggles; the full solver is Heavy and not worth it here.

---

## 10. Undo / version history

### Floorplanner / Cedreo — undo stack + named save versions
**What they do well:** Deep undo/redo plus saved named versions/snapshots you can roll back to
(e.g. "before client revision").
**Translate:** `undo()`/`redo()` with labelled 50-entry history already exist — just surface them
(toolbar buttons showing the next label, and a history dropdown listing `undoStack` labels). For
versions, lean on the existing save/load (`projectStorage.ts`, autosave) to snapshot named projects
("Rev A", "Rev B") — matching the planning-application revisioning the user already does (Revision B
in the spec).
**Cost:** Quick — expose existing undo/redo + a named-snapshot list over save/load.

---

## STEAL THESE FIRST — prioritised (5–7)

Ordered by value-per-effort given that the 2D editor canvas must be built first (it's the prerequisite
for items 1–4 and unlocks the user's three core asks at once).

1. **Click-drag wall draw with live cm + angle label** — *source: magicplan / Floorplanner.*
   New 2D SVG canvas: rubber-band preview + cursor tooltip via `wallLength()`; `pointerup` →
   `addFreeWall`. Chain segments from the last endpoint. *(Unlocks the #1 user ask.)*

2. **Type-to-set length mid-draw + angle/grid snap** — *source: magicplan + Sweet Home 3D.*
   Floating numeric input captures keystrokes during a live wall; Enter commits exact length along the
   snapped angle (15° increments, Shift = ortho), reusing `findAlignmentGuides`. *(Unlocks "type exact
   lengths".)*

3. **Right-click context edit (length / thickness / height)** — *source: SketchUp / Revit.*
   Right-click a wall → menu/inline popover bound to `updateFreeWall` (free) or `updateWallVertex`
   (room) for length, plus `thickness` and `height` fields. *(Unlocks the explicit right-click ask.)*

4. **On-canvas editable dimension chips + room area** — *source: Arcsite / Cedreo.*
   Wall-midpoint length labels you click to overwrite; room-centre m² via `calcPolygonArea()`.
   Cheap once the canvas exists and makes the plan feel "real."

5. **Named multi-floor with "duplicate floor up" + ghost underlay** — *source: Floorplanner / Cedreo.*
   Add `floors[]` (id/name/height) + floor-tab bar; "duplicate floor" reuses `duplicateRoom`; render
   floor-below as faint tracing underlay. *(Unlocks "multiple named floors with heights" — Heavy but a
   named requirement.)*

6. **Auto-room-detection from closed loops** — *source: Floorplanner / RoomSketcher.*
   Planar cycle-finder over `wallSegments`; close a loop → a `RoomData` materialises with area label.
   Heavy, but it's the signature consumer-tool feel and removes the wall-vs-room confusion for a
   non-architect.

7. **Surface the existing undo/redo + drag-from-palette doors/windows/stairs** — *source: Floorplanner.*
   Toolbar `undo()`/`redo()` buttons (history already labelled) and a `furnitureCatalog`-backed palette
   whose drop math snaps openings onto walls via the existing `addDoor`/`addWindow` + sub-segment
   system, with a Victorian preset set (sash, 6-panel timber door, cast-iron spiral, pocket door).
   Almost all logic exists; this is mostly UI glue.

**Effort legend:** Quick = days, layer over existing store actions · Medium = the 2D canvas + new UI ·
Heavy = new data model or algorithm (multi-floor model, room detection, dimension solver).
