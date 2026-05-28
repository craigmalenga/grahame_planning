# GUI Vision — Consolidated Synthesis (5-agent ideation)

**Project:** Flat 1, 20 Hornton Street — self-build floor-plan tool
**App:** React + Three.js + Zustand (2D "Design" editor + 3D "View"/walk)
**Audience for this doc:** the other Claude instance that owns/builds the
floorplanner. Please critique before we change code.

Five independent agents brainstormed from distinct lenses (homeowner/DIY,
chartered architect, 3D/visualisation, best-in-class competitive,
Hornton-St-specific). Full write-ups: `vision_homeowner.md`,
`vision_architect.md`, `vision_3d.md`, `vision_competitive.md`,
`vision_hornton.md`. This is the reconciled, de-conflicted summary.

---

## 0. Code-reality findings (verified against the source)

These correct/confirm assumptions — read before building:

1. **The 2D editor exists and is live.** `App.tsx:74` → `viewMode === 'design'`
   renders `<DesignMode/>` (a 1281-line canvas editor with its own
   click-drag room tool + live `Wm x Hm` label + length-pill rendering).
   The competitive agent's claim "there is no 2D canvas" is WRONG. The wall
   tool is therefore a **thin extension of an existing canvas**, not a new build.
2. **Live dimensions are already cheap.** The room-draw preview already draws
   a live size label (`DesignMode.tsx` ~408-414) and wall length pills
   (~357-380). Reuse this for the wall tool's live cm readout.
3. **`WallSegment.height?` is read but IGNORED** — `RoomMesh.tsx:143` applies
   the room's single `ceilingHeight` to every wall. Per-wall height override
   (a Craig ask) needs RoomMesh to honour `wall.height ?? room.ceilingHeight`.
4. **Multi-floor is half-present.** The `Project` type has `floorPlans[]`, but
   the store drives a single `floorPlan`. No floor switcher, no Z-stacking;
   `RoomMesh`/`Scene3D` render everything at y≈0. Two storeys are currently
   faked as one 6.56 m-tall room (the source of the spiral-clipping pitfalls).
5. **Walk mode can't climb.** `CameraController.tsx:174` hard-pins
   `camera.position.y = eyeHeight` every frame.
6. **Rooms are axis-aligned rectangles only.** `addRoom/makeRoomWalls` emit 4
   axis-aligned walls; `updateRoomBounds` regenerates them (destroying vertex
   edits). Angled/irregular walls only exist via orange vertex-handle drags
   with no numeric control. There is no wall graph / junction model.
7. **`addFreeWall`/`updateFreeWall`/`defaultWallThickness` are NOT in the base
   store** (they were briefly added during this session then reverted —
   ignore any agent reference to them as pre-existing).

---

## 1. The unifying idea: room-centric → wall-centric

Every lens reached the same conclusion. Today you paint rectangles; you
should **draw walls** (any angle), with rooms emerging as the faces enclosed
by walls. Keep the 3D engine (it's the geometric ground truth); extend the
**input + annotation + storey + output** layers around it.

---

## 2. Prioritised build plan (MVP → stretch)

### MVP — what Craig needs to self-build Hornton St (build in this order)
1. **Free wall tool** — click-drag (and click-click) to draw one wall at any
   angle; live **length in cm + angle** pill follows the cursor; chains from
   the last endpoint; `pointerup` commits. Store: implement `addFreeWall`
   onto `floorPlan.wallSegments`; render those segments in the 2D canvas AND
   in 3D. *(homeowner #1, architect #2, competitive #1)*
2. **Type-exact length/angle while drawing** — a floating numeric input
   captures keystrokes during a live wall: `434 Tab 12.5 Enter` = 4.34 m at
   12.5°. Shift = ortho-lock; 15° angle magnets; endpoint/midpoint snap
   (reuse the written-but-unused `findAlignmentGuides`). *(architect #1)*
3. **Right-click wall editor** — small popover with cm/mm fields:
   Length, Angle, Thickness (default 100 mm internal; offer 300 external /
   party presets), Height (default = floor height; override here), Type, plus
   Split / Delete. Editing length moves the downstream endpoint. *(all lenses)*
4. **Named multiple floors** — a `floors[]` layer above `rooms[]`: add / name /
   switch / duplicate-floor-up; per-floor **default height** (pre-fill 328 cm
   GF, basement per-room 282/276/189); per-wall override via #3. 2D floor
   tabs + faint **tracing underlay** of the floor below. *(homeowner #4,
   hornton #1, 3D #1-2, competitive #5)*
5. **Endpoint snapping + close-loop → room**, with an amber "ends don't meet —
   join?" prompt (prevents the spec's "walls don't match bounds" load
   failure). *(homeowner #5)*

### Strong next (high value, moderate lift)
6. **3D multi-storey stacking** — promote to `FloorMeta` with `baseElevation`
   + `storeyHeight`; wrap each floor's rooms in `<group position={[0,
   baseElevation, 0]}>` in `Scene3D`; retires the 6.56 m fake-room hack.
   Floor visibility toggles + "ghost the floor below". *(3D #1-2)*
7. **Existing / Proposed variant toggle** — two states on one datum, "copy
   Existing → Proposed", for the before/after deliverable. *(hornton #2,
   architect #5)*
8. **Per-room exact ceiling-height entry incl. low values** (1.89/2.45) and
   **"not demised" flag** (communal stair: hatched/greyed, excluded from m²).
   *(hornton #4-5)*

### Stretch (the "real drawing" + immersive layers)
9. **Walk-mode stair climbing** — replace the camera Y-pin with a per-frame
   down-ray sampling floor slabs + stair colliders, damped to `groundY+1.6`;
   straight stairs = ramp colliders; spiral = helical walkable collider
   (reuse Patch-F helix), top tread aligned to the GF doorway. *(3D #3-4)*
10. **Annotation + sheet output** — dimension strings, wall poché + line
    weights, north point, scale bar, title block → scaled PDF/SVG (the actual
    RBKC deliverable). *(architect #4-5)*
11. **Wall graph (nodes/edges)** — the architect's keystone for true T/L
    junctions, mitres and derived rooms. Heaviest; do last or incrementally.
12. **Auto-room-detection from closed loops, libraries (Victorian sash /
    6-panel / cast-iron spiral / pocket door presets), dollhouse + section
    slider, geo-aware sun (NE rear), PBR materials, one-click Photoreal-Brief
    capture.** *(competitive, 3D)*

---

## 3. Minimal data-model changes (additive, back-compatible)

- `floors[]` (or promote `Project.floorPlans[]` into the live store) with
  `{ id, name, baseElevation, storeyHeight }`; existing single-floor JSON
  loads as `level:0, baseElevation:0`.
- Honour `WallSegment.height` in `RoomMesh` (`wall.height ?? room.ceilingHeight`).
- `defaultWallThickness` (store) + per-wall `thickness` (exists).
- `floorPlan.wallSegments` becomes a first-class drawn+rendered list.
- (Stretch) per-element `status: 'existing' | 'proposed'`; `notDemised: bool`;
  unified `Opening` (door/window with sill); first-class `Stair`
  (rise/going/storey link); `WallNode`/`WallEdge` graph.

---

## 4. The three Craig-explicit asks, mapped

| Craig's ask | Build item | Lift |
|---|---|---|
| Add/name floors, default height, per-wall override | MVP #4 + honour wall.height | medium |
| Draw angled walls click-drag, length in cm live | MVP #1 + #2 | small (extends existing canvas) |
| Right-click edit length/height/thickness | MVP #3 | small |
| Wall thickness cm, default + override | MVP #3 + defaultWallThickness | small |
| (earlier) walk up stairs; floors side-by-side | Next #6 + Stretch #9 | heavy |

---

## 5. Open questions for the other agent before we code
1. Do we extend the **existing DesignMode canvas** (recommended — it works) or
   refactor? (We recommend extend.)
2. Floors: add a new `floors[]` to the store, or activate the dormant
   `Project.floorPlans[]`? Which keeps save/load + autosave simplest?
3. Free walls in `floorPlan.wallSegments` vs. as degenerate "rooms" — which
   renders more cleanly in your `RoomMesh`/`Scene3D` without poché glitches?
4. Is the wall **graph** (nodes/edges) worth doing now, or do we ship the
   simpler free-segment model first and migrate later?
</content>
