# Claude GUI Vision and Code Review

Prepared for: Claude / Craig  
Date: 2026-05-28  
Bundle reviewed: `gui_vision_and_code_for_review.zip`

## Review status and limits

I reviewed the zip statically, file by file. I extracted and inspected the vision docs plus the React/Zustand/Three/Prisma code. I attempted to install dependencies to run a build/test pass, but `npm install --ignore-scripts --no-audit --no-fund` did not complete within the available execution window, so this review is a static architecture and source review rather than a verified runtime/build review.

That limitation matters: several issues below are definite from source inspection, but I have not validated the full rendering behaviour in a browser. Where something is inferred rather than proven at runtime, I say so.

## Executive verdict

The proposed vision is directionally right, but it mixes three different ambitions that should not be coded as one large refactor:

1. A better manual drafting GUI: draw walls, set exact lengths/angles, type dimensions, edit doors/windows precisely.
2. A Hornton-specific planning model: two floors, existing/proposed variants, lightwell/void, not-demised areas, exact ceiling and opening heights.
3. A long-term architectural CAD-like model: wall graph, floor stack, collisions, stair climbing, export/PDF, sections, annotations.

Claude should not jump straight to a full wall-graph rewrite. That is the riskiest path because the current app is still room-centric, and many systems assume rectangular room bounds. A careful phased approach is safer:

- First, fix exactness and data correctness.
- Then add floors/variants or free walls depending on Craig's priority.
- Then add a bounded free-wall layer using existing `floorPlan.wallSegments`.
- Only later consider a true wall-node graph and polygon room generation.

My strongest critique: the vision docs correctly identify the pain, but some items labelled as GUI polish are actually data-model blockers. In particular, multi-floor, existing/proposed, not-demised, voids, and free walls cannot be robustly solved only inside `DesignMode.tsx`; they require a versioned project model and migration path.

## Recommended immediate decision before Claude codes

There is one major priority conflict to settle before Claude begins the next code batch.

### Option A - Hornton deliverable first

Prioritise the real project requirements:

- versioned project container
- named floors: basement and ground floor
- existing/proposed variants
- exact numeric room, wall, door, window and opening inputs
- `WallSegment.height` actually rendered
- not-demised / excluded-from-area flag
- spiral staircase height fixed to 3.0 m or made explicitly configurable

This gets the app closer to producing a faithful Hornton model quickly, even if free-wall drawing remains basic for a little longer.

### Option B - Drawing UX first

Prioritise the tactile GUI:

- add a Wall tool
- draw arbitrary wall segments
- live length and angle pill
- type exact length/angle
- right-click wall editor
- render top-level free walls in 2D and 3D
- later close wall loops into rooms

This makes the app feel more like a floorplanner, but does not by itself solve Hornton's two-storey, variant, void, and demised-area needs.

### My recommendation

For this project, I recommend Option A first, plus two small free-wall groundwork patches.

Claude should first implement data correctness and exact numeric controls, because the current sliders and single-floor model make accurate Hornton work impossible. Then Claude should add a minimal free-wall layer, not a full graph, so the wall tool can evolve without breaking all existing rectangular room behaviour.

## Major review conclusion

The current app is not missing a little polish. It has a coherent prototype architecture, but that architecture is room-first and rectangle-first:

- `useStore.ts` owns one active `floorPlan`.
- `DesignMode.tsx` creates and edits rectangular rooms.
- `RoomMesh.tsx` renders room floors and ceilings from rectangular bounds.
- `Scene3D.tsx` renders all rooms at y=0.
- `CameraController.tsx` pins first-person camera height.
- `floorPlan.wallSegments` exists in the type but is not meaningfully rendered or edited by the main UI.
- `Project.floorPlans[]` exists in the type but is not what the active app state or saved project model uses.

So the vision should be framed as a staged migration, not a small patch.

---

# Part 1 - Vision critique

## 1. `gui_vision/GUI_VISION_synthesis.md`

### What it gets right

`GUI_VISION_synthesis.md` is the most accurate of the vision docs because it reconciles several earlier assumptions against the code.

Key accurate observations:

- `DesignMode` already exists, so the app is not purely a 3D/JSON viewer.
- Dimension labels already exist for selected room walls and can be reused.
- `WallSegment.height?` exists in the type but is ignored in the renderer.
- Multi-floor is present in some types but not in the active store or saved project model.
- The camera pins y in first-person mode.
- The app is fundamentally room-centric and axis-aligned for creation/resizing.
- `addFreeWall`, `updateFreeWall`, and `defaultWallThickness` do not exist in the store.

### What needs correction or tightening

#### `floorPlan.wallSegments` should be treated as an orphaned hook, not a ready feature

The synthesis is right that `FloorPlanData.wallSegments` exists. But the current app does not actually use that array as a first-class modelling layer. Any vision that says "just store free walls there" must also explicitly patch:

- 2D rendering
- 2D hit testing
- 2D auto-centering
- nearest-wall search for doors/windows
- 3D rendering
- scene bounds
- save/load migration
- undo/redo
- deletion
- wall editing

If Claude only adds `addFreeWall` to the store, most of the app will still ignore those walls.

#### The MVP should not require a full wall graph

The synthesis asks whether to build a true wall-node graph now. My answer: no, not yet.

A full graph is the correct long-term model, but it will touch almost every subsystem. Claude should first ship a bounded free-wall layer using `wallSegments` and keep rectangular rooms working. Then, once the UX and data semantics are proven, convert closed wall chains to rooms or introduce graph nodes.

#### The trailing `</content>` artifact should be removed

The synthesis file ends with a stray `</content>` marker. Minor, but it should be cleaned before being treated as a canonical spec.

### Requested change to the vision doc

Add an explicit split:

- **MVP free-wall layer:** arbitrary segments, numeric length/angle, render in 2D/3D, no automatic room generation.
- **Later graph model:** nodes, shared walls, room inference, polygon floors/ceilings, constraints.

This prevents Claude from overbuilding.

---

## 2. `gui_vision/RECONCILIATION_synthesis.md`

### What it gets right

This is useful because it separates confirmed facts from conflicts. It gives important anchor dimensions:

- Ground floor width: 4.34 m.
- Basement width: 5.70 m.
- Rear lightwell/terrace: 3.25 m x 2.95 m.
- Ground floor total depth: 13.77 m.
- Basement total depth: 19.06 m.
- Front lounge depth: 5.70 m.
- Rear reception depth: 6.70 m.
- Crittall opening: 1245 mm x 2450 mm.
- Appliance bay: likely 1200 mm, but needs confirmation.

This should become input data for the model, not hidden in prose.

### Main critique

Several conflicts are still marked unresolved:

- bath versus no bath in the ground floor wet room
- Crittall height 2450 mm versus 2245 mm
- appliance bay 1200 mm versus 400 mm
- hall length 4.8 m versus 6.1 m
- number/location of bathrooms
- vault depths
- rear deck/lightwell width conflict with another doc

Claude should not hard-code any of these uncertain values as if they are final. If they are used in a template, they should be labelled uncertain in the template or stored as notes.

### Requested change

Add a `measurementConfidence` or `notes` convention to the template/project data, or at minimum put unresolved dimensions in comments near the template generation code. The GUI should not silently present disputed dimensions as authoritative.

---

## 3. `gui_vision/OCR_comparison_vs_other_AI.md`

### What it gets right

It correctly flags that the two OCR/model interpretations agree on major anchors but conflict on details.

Important conflicts listed:

- rear deck/lightwell width: 3.75 m versus 3.25 m
- basement opening: 180 x 83 versus 180 x 300
- right-lower room width: 4.64 m versus 4.40 m
- ground floor left wall segment chain conflicts

### Main critique

This should not be treated as implementation-ready. It is a validation note, not a product spec.

### Requested change

Use this file as a checklist for human confirmation, not as a coding source of truth. Claude should not build dimensions from it unless the uncertain items are resolved.

---

## 4. `gui_vision/vision_hornton.md`

### What it gets right

This is the strongest Hornton-specific file. It correctly identifies hard blockers:

- no true stacked floors
- no existing/proposed variants
- no two-storey void/lightwell concept
- no not-demised/communal area flag
- spiral staircase height defaults to 2.7 m, while Hornton wants 3.0 m
- no true support for partial/varying wall heights in rendering
- no true support for irregular perimeter/free wall modelling

It also correctly says the current workaround of faking two storeys as one tall room is not a real solution.

### Main critique

This doc should be treated as the primary product requirement if the goal is the actual Hornton planning workflow. It has more immediate value than abstract CAD features.

The current app can fake some Hornton elements, but the fakes will become technical debt:

- one tall room for two-storey lightwell
- one room containing the spiral staircase
- rectangular rooms for irregular areas
- duplicated files for existing/proposed
- all rooms counted in total area

### Requested change

Promote these items to first-phase requirements if Craig wants the Hornton model to be credible:

1. Named floors with base elevation and floor height.
2. Existing/proposed variants inside one project.
3. Exact numeric controls for heights and openings.
4. Not-demised / excluded-from-area flag.
5. Explicit void/lightwell marker, even if first rendering is simple.

---

## 5. `gui_vision/vision_3d.md`

### What it gets right

It correctly sees that:

- the active app renders a single `floorPlan`
- `Scene3D` maps rooms as one flat list
- all rooms are at y=0
- first-person movement is planar
- true floor stacking needs floor metadata such as base elevation

### Main critique

The proposed 3D ambitions should be split into two levels:

#### Level 1: visual stacking

This is achievable soon:

- wrap each floor's rooms in a `<group position={[0, baseElevation, 0]}>`
- compute scene bounds across all floors
- allow floor visibility/ghosting
- allow active floor selection

#### Level 2: physical navigation

This is much harder:

- gravity/floor sampling
- stair colliders or stair path constraints
- head height/eye height transitions
- collision with walls/openings
- no walking through walls
- transition between floors through stairs

Claude should not implement Level 2 in the same batch as the data-model migration unless Craig explicitly prioritises walkthrough behaviour over planning accuracy.

---

## 6. `gui_vision/vision_architect.md`

### What it gets right

This file correctly identifies the architectural direction:

- numeric wall input
- snapping
- dimensions
- storeys
- scaled plan outputs
- wall-centric drafting instead of room painting

### Main critique

It risks overshooting the current codebase. A real wall graph, annotations, title block, RBKC-style output, and scaled PDF are all useful, but they should not precede a stable project model.

The current code cannot yet answer basic questions like:

- Which floor does this room belong to?
- Is this existing or proposed?
- Should this area count toward total area?
- Is this opening final or uncertain?
- Does this wall have a lower height than the room?

So PDF/export work should wait until those answers exist in the data.

### Requested change

Demote title block/PDF output to after:

1. exact numeric model
2. floors
3. variants
4. wall/opening data correctness

---

## 7. `gui_vision/vision_homeowner.md`

### What it gets right

The homeowner UX is good:

- live length/angle pills
- type dimensions while drawing
- snap to grid/walls
- right-click wall editor
- visible floor panel
- simple labels and confidence

### Main correction

It appears to imply that `defaultWallThickness` already exists in the store. It does not. The synthesis file corrects this.

### Requested change

Keep the UX direction, but require Claude to implement the missing store primitives explicitly:

- `defaultWallThickness`
- `setDefaultWallThickness`
- `addFreeWall`
- `updateFreeWall`
- `deleteFreeWall`
- `selectWallSegment`
- undo/redo integration

---

## 8. `floorplanner_code/PLATFORM_AGENT_SPEC.md`

### What it gets right

This file is valuable, but it is a different kind of spec. It is mostly a platform-agent spec for generating JSON and photoreal prompts, not a GUI refactor spec.

It accurately documents:

- canonical JSON structure
- known Hornton facts
- known rendering limitations
- common pitfalls
- JSON import workflow
- photoreal brief workflow

Important known limitations are already called out:

- rectangular rooms
- doors lock to floor
- furniture has footprint scaling but no vertical scaling
- spiral staircase default 2.7 m
- no collision
- no true two-storey support
- no exterior/interior material distinction
- schematic visuals

### Main critique

Do not treat this as saying the GUI is enough. It is a workaround guide for generating data inside existing limitations. The new GUI vision should replace some of those workarounds with real modelling features.

### Requested change

Separate it into two sections:

1. **Current JSON authoring guide** for what works today.
2. **Target GUI model** for what Claude is now being asked to implement.

Otherwise Claude may optimise the JSON workaround path instead of fixing the underlying GUI/data model.

---

# Part 2 - Code critique by file

## 1. `src/types/index.ts`

### `WallSegment` already has useful fields, but they are underused

Relevant lines: `10-18`

`WallSegment` includes:

- coordinates
- thickness
- optional height
- material
- texture
- optional `isGap`
- optional `subSegments`

This is a good base for a free-wall layer. But the rest of the app mostly treats walls as children of rooms. Top-level `floorPlan.wallSegments` is not used by the main editor/renderer.

#### Requested change

Define the semantics clearly:

- `room.walls`: walls that enclose a room.
- `floorPlan.wallSegments`: loose/free walls not yet converted into rooms, plus possibly site/external walls.

Do not mix these silently.

### `DoorData` and `WindowData` are close, but exact planning openings need more care

Relevant lines: `23-42`

Doors have width and height, windows have width/height/sill height. That is useful. But planning drawings need exact mm-level typing, and some openings are not conventional doors/windows.

#### Requested change

Consider adding:

```ts
type OpeningKind = 'door' | 'window' | 'opening' | 'crittall' | 'arch' | 'void';
```

or add `kind`/`isStructuralOpening` to avoid abusing door/window types for every opening.

### `FurnitureItem` cannot represent vertical size or floor-spanning objects

Relevant lines: `66-75`

`FurnitureItem` has `scaleX` and `scaleY`, but no `scaleZ`, no explicit height override, no y/elevation, and no floor-spanning metadata.

This directly affects the spiral staircase. The catalogue default height is used, and the item cannot cleanly say "this stair is 3.0 m tall and connects basement to ground floor".

#### Requested change

Add at least:

```ts
height?: number;
elevation?: number;
connectsFloorId?: string;
targetFloorId?: string;
```

For the first pass, `height?: number` is the most important.

### `RoomData` lacks floor, variant, demised status, and confidence/notes

Relevant lines: `77-92`

`RoomData` has `floor`, but that is a numeric-ish/string field inside the room rather than a proper parent floor container. It also lacks:

- `floorId`
- `variantId`
- `isDemised` or `areaIncluded`
- `status` such as existing/proposed/demolished/new
- `notes`
- `measurementConfidence`

#### Requested change

Do not rely on `room.floor` as the main floor model. Introduce a floor container and keep `room.floor` only as backward-compatible imported data.

### `FloorPlanData.wallSegments` exists but has no clear UI contract

Relevant lines: `94-104`

This is the obvious place to store free walls. But because the current code ignores it in several places, adding data there alone will create invisible or uneditable geometry.

#### Requested change

If Claude uses `floorPlan.wallSegments`, he must update all of these together:

- `DesignMode` draw layer
- `DesignMode` hit testing
- `DesignMode` bounds/autocenter
- `DesignMode` wall selection/editor
- `Scene3D` bounds
- `Scene3D` rendering
- save/load normalisation
- undo/redo

### `Project.floorPlans[]` and `SavedProject.floorPlan` conflict

Relevant lines: `106-113` and `159-167`

The type file has a `Project` with `floorPlans[]`, but the saved project model uses one `floorPlan`. The active Zustand store also uses one `floorPlan`.

This is one reason the vision docs talk past the code: multi-floor exists in a type but not in the actual app path.

#### Requested change

Introduce a versioned saved project model, for example:

```ts
interface SavedProjectV2 {
  id: string;
  name: string;
  version: '2.0';
  activeVariantId: string;
  activeFloorId: string;
  variants: ProjectVariant[];
  customTextures?: CustomTexture[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectVariant {
  id: string;
  name: 'Existing' | 'Proposed' | string;
  floors: FloorData[];
}

interface FloorData {
  id: string;
  name: string;
  level: number;
  baseElevation: number;
  floorToFloorHeight?: number;
  floorPlan: FloorPlanData;
}
```

Keep a migrator from existing `SavedProject` v1.

---

## 2. `src/store/useStore.ts`

This is the most important file for the refactor.

### The store has a single active `floorPlan`

Relevant line: `22`

The current state is:

```ts
floorPlan: FloorPlanData | null;
```

That makes true floors/variants impossible without replacing or wrapping state.

#### Requested change

Add a project-level container rather than only bolting fields onto `floorPlan`.

Minimum acceptable transition:

```ts
project: ProjectModel | null;
activeVariantId: string;
activeFloorId: string;
```

Then derive the active floor plan from those fields. Do not maintain two independent sources of truth forever.

### Wall thickness is hard-coded at room creation

Relevant lines: `149-155`

`makeRoomWalls` creates four walls with fixed thickness `0.15`.

This conflicts with the vision's `defaultWallThickness` and wall editor.

#### Requested change

Add `defaultWallThickness` to state and use it when creating new rooms and free walls.

Also add wall-level editing so a specific wall can override thickness.

### `setFloorPlan` normalises only part of the data

Relevant lines: `181-190`

`setFloorPlan` normalises rooms and nested arrays, but it does not robustly normalise future fields, variants, free walls, or project-level metadata.

#### Requested change

Move normalisation into a dedicated migration function, for example:

```ts
function migrateSavedProject(input: unknown): SavedProjectV2
function normaliseFloorPlan(input: Partial<FloorPlanData>): FloorPlanData
```

This becomes crucial once files may contain v1 and v2 project shapes.

### Several updates bypass undo history

Relevant lines:

- `199-200` `updateRoomHeight`
- `202-209` `updateRoomName`
- `212-219` `updateRoomFloor`
- `222-229` `toggleCeiling`
- `255-295` `updateWallVertex`
- `302-321` `updateDoor` / `updateWindow`
- `348-351` `updateFurniture`
- `514-524` `toggleWallGap`

Some add/remove actions call `pushHistory`, but many edit actions do not.

#### Why it matters

The more exact numeric editing Claude adds, the more destructive it becomes if undo does not cover these actions. Wall drawing, wall endpoint dragging, and exact opening edits must be undoable.

#### Requested change

Every user-visible geometry edit should call history once per committed interaction, not on every mousemove. Pattern:

- On mouse down or before first mutation, snapshot previous state.
- During drag, mutate live preview.
- On mouse up, commit one history entry.

### `updateRoomBounds` destroys custom wall edits

Relevant lines: `247-253`

`updateRoomBounds` regenerates walls using `makeRoomWalls(newBounds)`. This discards any hand-edited wall vertices, wall heights, subsegments, textures, or custom wall details.

#### Why it matters

This is a direct conflict with the vision. A user might drag vertices to create an angled room, then resize the room and lose the edited shape.

#### Requested change

After free/angled wall support is added, either:

- disable rectangular resize handles for non-rectangular rooms, or
- implement polygon-aware transform/scale, or
- explicitly warn that resizing will rectangularise the room.

Do not silently destroy wall edits.

### `updateWallVertex` is a useful seed, but not enough

Relevant lines: `255-295`

This function moves a wall endpoint and the adjacent wall endpoint. It supports simple polygon editing for an ordered wall list, but:

- it only works inside a selected room
- it assumes ordered walls
- it does not support adding/removing vertices
- it does not validate self-intersection
- it does not support top-level free walls
- it does not push undo history

#### Requested change

Keep it for room polygon vertex dragging, but do not mistake it for a free-wall system.

### `loadTemplate` creates one floor plan with empty top-level wall segments

Relevant lines: `390-407`

Templates still load as a single flat plan. That means even if type-level `Project.floorPlans` exists, the app template pathway does not use it.

#### Requested change

When floors/variants are added, migrate templates too. Do not leave templates as legacy single-floor objects unless they are wrapped automatically.

### Autosave only saves the active `floorPlan`

Relevant lines: `562-567`

Currently autosave stores one plan.

#### Requested change

Once a project model exists, autosave must save the full project container, including variants, floors, active ids, and custom textures.

---

## 3. `src/components/DesignMode.tsx`

This is the main GUI file and is currently doing too much. It contains canvas rendering, event handling, hit testing, toolbar, properties panel, dimensions, resizing, door/window/furniture editing, and context menu behaviour.

### `DesignTool` has no wall tool

Relevant line: `19`

Current tools include room, door, window, furniture, measure, select, and delete. There is no wall/free-wall tool.

#### Requested change

Add a `'wall'` tool only after the store primitives exist.

Do not implement it as another room rectangle mode. It should create/edit `floorPlan.wallSegments`.

### Snap is too coarse for planning work

Relevant line: `57`

```ts
const SNAP = 0.25;
```

A 250 mm snap is too coarse for exact planning dimensions and the Hornton values.

#### Requested change

Make snap configurable. Suggested defaults:

- 0.05 m for normal drafting
- 0.01 m when precision mode is enabled
- 0.25 m only as a coarse option

Also allow typed numeric override independent of snap.

### Auto-centering ignores top-level free walls

Relevant lines: `75-98`

Bounds are computed from `floorPlan.rooms` only.

#### Why it matters

If the new Wall tool stores geometry in `floorPlan.wallSegments`, a free-wall-only drawing could appear off-screen or be centred incorrectly.

#### Requested change

Bounds calculation must include:

- room bounds
- room wall vertices
- top-level `floorPlan.wallSegments`
- perhaps furniture if it can sit outside rooms later

### Floor fill is rectangular even for edited/angled rooms

Relevant lines: `133-145`

The 2D fill uses `room.bounds`, not the wall polygon.

#### Why it matters

`updateWallVertex` allows angled walls, and future wall-loop rooms will not necessarily be rectangles. A rectangular fill will lie to the user.

#### Requested change

For polygonal rooms, draw the room floor using the ordered wall vertices. Keep rectangular fallback only for legacy rooms.

### Top-level `floorPlan.wallSegments` are not rendered

Relevant lines: `145-190` render only `room.walls`

The visible wall layer loops through rooms and their walls. Loose wall segments are invisible.

#### Requested change

Add a separate draw pass for `floorPlan.wallSegments`. It should support:

- selected style
- hover style
- wall height/thickness indication if possible
- length/angle label while selected or drawing

### Door/window placement only searches room walls

Relevant lines: `593-609`

`findNearestWall` iterates over `floorPlan.rooms` and `room.walls`. It ignores `floorPlan.wallSegments`.

#### Requested change

If free walls can receive openings, `findNearestWall` needs a target type:

```ts
type WallRef =
  | { kind: 'roomWall'; roomIndex: number; wallIndex: number }
  | { kind: 'freeWall'; wallIndex: number };
```

Do not overload room indexes with magic values.

### Mouse handling has no free-wall branch

Relevant lines: `626-657`, `773-776`, `850-872`

Current draw/commit logic handles rooms, doors, windows, furniture, selection, and drags. There is no wall drawing state machine.

#### Requested change

Add explicit wall drawing state:

```ts
const [wallDraft, setWallDraft] = useState<{
  start: Point;
  end: Point;
  lockedLength?: number;
  lockedAngle?: number;
} | null>(null);
```

Wall drawing should not reuse rectangle drawing state.

### Room hit testing is rectangular

Relevant lines: `739-760`

Hit testing checks whether the pointer is inside room bounds. That is fine for rectangular rooms, but wrong for angled or polygon rooms.

#### Requested change

Use a point-in-polygon test when `room.walls` form a polygon. Fall back to bounds for legacy data.

### Resize handles regenerate rectangular walls

Relevant lines: `548-558`, `778-790`

Resize handles use rectangular bounds and `updateRoomBounds`, which regenerates walls.

#### Requested change

Once polygon/free wall editing exists, only show these handles for rectangular rooms or label them as "rectangular resize". Otherwise they will destroy custom geometry.

### Wall vertex dragging is useful but too hidden and too limited

Relevant lines: `561-572`, `793-796`

It only tests wall starts of the selected room. It does not expose adding a vertex, deleting a vertex, editing exact coordinates, or snapping to another wall endpoint.

#### Requested change

Keep it, but add numeric controls in the side panel for selected vertex/wall.

### Total area counts every room

Relevant lines: `444-450`

Current total area sums all room areas. It cannot exclude not-demised communal stairs or voids.

#### Requested change

Add room/area flags:

```ts
areaIncluded?: boolean;
areaCategory?: 'demised' | 'common' | 'void' | 'external' | 'excluded';
```

Then total area should show at least:

- gross modelled area
- demised/included area
- excluded area

### Keyboard shortcuts are inconsistent

Relevant lines: `472-535`

The toolbar labels mention keys, but `r` is used for furniture rotation and not for the Room tool. Delete removes selected furniture/door/window but not selected room/wall in a clear way.

#### Requested change

Create a central shortcut map. Avoid conflicting `R` for rotate versus room. Suggested:

- `V` select
- `W` wall
- `R` room
- `D` door
- `N` window, or `Shift+W` window if W is wall
- `F` furniture
- `M` measure
- `Delete` delete selected object
- `[` and `]` rotate selected furniture

### Right-click wall behaviour is too narrow

Relevant lines: `900-922`

Right-click currently toggles a gap only if the wall already has multiple subsegments. It is not a wall editor.

#### Requested change

Replace or extend with a real wall context menu:

- edit length
- edit angle
- edit thickness
- edit height
- split wall
- add opening/gap
- toggle full wall/gap
- delete wall
- convert free wall chain to room, if applicable later

### Room height slider cannot represent Hornton values

Relevant lines: `1061-1064`

Slider min is 2 m, max 6 m, step 0.1 m.

#### Why it matters

Hornton includes heights such as 1.89 m, 2.45 m, 2.76 m, 2.82 m, 3.28 m. A 0.1 m slider cannot represent exact planning measurements.

#### Requested change

Use numeric input with metres and/or millimetres:

- allow at least 1.5 m to 6 m
- step 0.01 m or 0.001 m depending on UI
- optionally show mm input
- keep slider only as a convenience, not source of truth

### Door controls are too coarse

Relevant lines: `1106-1117`

Door width min/max/step and height min/max/step do not handle exact Crittall/opening values well.

Problems:

- Crittall width 1.245 m cannot be represented exactly with step 0.05.
- A 2.95 m opening exceeds the 2.8 m height max.
- Planning work needs typed values, not only sliders.

#### Requested change

Use number fields:

- width min 0.2 m, max 5 m, step 0.001 m
- height min 0.2 m, max 5 m, step 0.001 m
- distance along wall min 0, max wall length, step 0.001 m
- show remaining nibs on left/right of opening

### Window controls are also too constrained

Relevant lines: `1186-1204`

Window sill max 2 m and step values are too coarse for unusual openings or high-level windows.

#### Requested change

Use the same exact number input pattern as doors.

### `as any` casts in the door editor should be removed

Relevant lines: around `1145-1147`

The type already supports door style. Avoid `as any` because these casts hide real type mismatches.

#### Requested change

Make the event value properly typed or map it through a typed list.

### The right panel needs wall, floor, variant, and area sections

Current side panel supports rooms, doors, windows, and furniture. It lacks:

- selected wall/free wall editor
- floor editor
- variant selector
- not-demised / area-included flag
- wall height/thickness controls
- measurement notes/confidence

#### Requested change

Do not bury all new controls in `DesignMode.tsx`. Break the side panel into smaller components before adding all of this.

---

## 4. `src/components/RoomMesh.tsx`

### `WallSegment.height` is ignored

Relevant lines: `91-95`, `108-148`, especially `143`

The room height is calculated, and every wall mesh uses that same height. The optional `wall.height` field is not used.

#### Why it matters

The vision specifically requires partial/lower wall heights. The type already supports this, but rendering ignores it.

#### Requested change

Change wall mesh generation to use:

```ts
const wallHeight = wall.height ?? height;
```

Then pass `wallHeight` to `WallWithOpenings`.

Also validate/clamp openings so a door/window cannot exceed the actual wall height without warning.

### Shared-wall opening merging is clever but fragile

Relevant lines: `118-135`

The renderer tries to merge openings from adjacent rooms into shared walls. This is useful, but with angled/free walls it may misidentify walls unless wall matching becomes more robust.

#### Requested change

If wall graph/shared-wall identities are introduced later, use explicit shared wall ids rather than coordinate inference.

For now, keep coordinate matching but be careful not to apply it to unrelated top-level free walls.

### Floors and ceilings are rectangular

Relevant lines: `196-217`

Floor and ceiling meshes are created from `room.bounds`. This is wrong for edited polygon rooms and future wall-loop rooms.

#### Requested change

When `room.walls` form an ordered closed polygon, create the floor/ceiling from polygon vertices. For simple rectangles, the existing path is fine.

This should not block phase one if Claude only adds free walls, but it becomes mandatory if free-wall loops create rooms.

### Furniture is anchored at room level only

Relevant lines: `219-224`

Furniture is rendered inside a room group without explicit elevation or height override.

#### Requested change

Support `item.height` and possibly `item.elevation` for stairs, lighting, and unusual architectural elements.

### Wall opening geometry lacks validation

Relevant lines: `267-383`

`WallWithOpenings` cuts holes for doors and windows. It does not appear to validate whether an opening:

- starts before the wall
- extends beyond the wall length
- exceeds wall height
- overlaps another opening
- conflicts with a subsegment gap

#### Requested change

Add a validation helper:

```ts
validateOpeningAgainstWall(opening, wallLength, wallHeight)
```

This should return warnings and clamp only if the user explicitly allows clamping. Planning dimensions should not be silently changed.

### Subsegment geometry merge may be risky

Relevant lines: `324-342`

The code manually merges buffer attributes. If any source geometry is indexed, this can produce invalid geometry or missing faces.

#### Requested change

Use Three's `BufferGeometryUtils.mergeGeometries` or confirm all created geometries are non-indexed before manual merging. This is not the top priority, but it is a technical debt point.

### Door open direction is ignored

Relevant lines: `463-553`

Doors animate, but `openDirection` is not meaningfully used. All doors appear to open with the same hinge behaviour.

#### Requested change

Use `openDirection` to decide hinge side and swing direction. For planning, this matters.

---

## 5. `src/components/Scene3D.tsx`

### Scene uses one flat floor plan

Relevant lines: `13-21`, `95-97`

The component reads `floorPlan` directly and maps all rooms at the same y level.

#### Requested change

Once project/floors exist, render by floor:

```tsx
{visibleFloors.map(floor => (
  <group key={floor.id} position={[0, floor.baseElevation, 0]}>
    {floor.floorPlan.rooms.map(...)}
    {floor.floorPlan.wallSegments.map(...)}
  </group>
))}
```

### Bounds ignore top-level wall segments

Relevant lines: `23-44`

Bounds are computed from rooms only.

#### Requested change

Include free walls and all visible floors in scene bounds.

### Ground plane is single-level

Relevant lines: `99-109`

The app renders one ground plane beneath the whole scene.

#### Requested change

For stacked floors, this should become either:

- one site ground plane at y=0, plus floor slabs, or
- separate ghosted floor planes for each active floor.

Do not make a basement floor appear as if it is the only ground plane.

---

## 6. `src/components/CameraController.tsx`

### First-person y position is pinned

Relevant line: `174`

```ts
camera.position.y = eyeHeight;
```

This confirms the vision doc's point. The app cannot walk up stairs or move between floors in first-person mode.

#### Requested change

Do not try to solve full stair walking immediately. For a first multi-floor phase, implement floor switching/teleporting instead:

- active floor camera height = floor base elevation + eye height
- button/dropdown to move to selected floor
- optional stair click target later

Full walking stairs require collision/floor sampling and should be a separate task.

### No collision

The camera movement does not collide with walls. Users can walk through geometry.

#### Requested change

Do not market first-person mode as a physically accurate walkthrough until collision exists.

---

## 7. `src/components/FurnitureModels.tsx`

### Furniture height is catalogue-driven, not item-driven

Relevant lines: `22-25`

The model reads default dimensions from the furniture catalogue and applies `scaleX`/`scaleY` to footprint only. It does not allow item-specific height.

#### Requested change

Support:

```ts
const h = item.height ?? itemData.defaultHeight;
```

Then let the spiral staircase and other architectural objects set exact heights.

### Stairs are schematic

Straight and spiral stairs are visual primitives, not navigable geometry. That is fine for the current app, but the vision should not assume they already solve vertical movement.

#### Requested change

Separate visual stair representation from navigation logic.

---

## 8. `src/utils/furnitureCatalog.ts`

### Spiral staircase default height conflicts with Hornton

Relevant line: around `54`

The spiral staircase default height is 2.7 m. The platform spec/Hornton material wants 3.0 m for 15 treads x 200 mm.

#### Requested change

Either:

- change the default spiral height to 3.0 m, if Hornton is the main template, or
- better, add item-level height override and set Hornton stair item height to 3.0 m.

The second option is cleaner because not every project has a 3.0 m stair.

### Spiral stair geometry has hard-coded step count

Relevant lines: around `1098-1138` in `FurnitureModels.tsx`

The spiral model uses a hard-coded step count rather than deriving it from height/riser count.

#### Requested change

Use either:

```ts
const riserHeight = 0.2;
const steps = Math.round(h / riserHeight);
```

or allow explicit `stepCount` metadata.

For Hornton, 15 treads x 200 mm should equal 3.0 m.

---

## 9. `src/utils/geometry.ts`

### Polygon area helper is useful

Relevant lines: `6-15`

`calcPolygonArea` uses wall starts. This can support polygon rooms if walls are ordered and closed.

#### Requested change

Build on this for polygon room fill and 3D floor generation.

### Alignment guides are axis-only

Relevant lines: `25-85`

This is useful for furniture and rectangular editing, but free-wall drafting also needs endpoint snaps, midpoint snaps, perpendicular/parallel constraints, and angle snaps.

#### Requested change

Add separate drafting helpers rather than overloading the current alignment guide function.

Suggested helpers:

```ts
snapPointToGrid(point, snap)
snapPointToWallEndpoints(point, walls, threshold)
snapAngle(angle, increments)
projectPointToAngle(start, rawEnd, lockedAngle)
pointToSegmentDistance(point, segment)
```

---

## 10. `src/utils/projectStorage.ts`

### Save creates duplicates instead of updating existing projects

Relevant lines: `56-69`

`saveProject` always creates a new id and pushes it into localStorage. `updateProject` exists, but the save panel does not use it for existing projects.

#### Why it matters

As projects become larger, accidental duplicates will be confusing and wasteful.

#### Requested change

Use `savedProjectId` in store or pass the current project id to decide between create and update.

### Import validation is too shallow

Relevant lines: `115-125`

Import checks for `data.floorPlan` and `data.version`, but it does not deeply validate or migrate geometry.

#### Requested change

Add migration/normalisation:

- v1 saved project with one floorPlan -> v2 project with one variant and one floor
- missing arrays -> empty arrays
- missing wall thickness -> default
- missing ceiling height -> default
- invalid numeric values -> warning, not silent failure

### LocalStorage remains the real source of truth

The Prisma/backend model does not round-trip all client data. Until that is fixed, localStorage/import/export should be treated as canonical.

#### Requested change

Do not rely on the backend for project persistence until Prisma schema catches up.

---

## 11. `src/components/SaveLoadPanel.tsx`

### Save panel uses create-save path only

Relevant lines: `37-43`

The panel calls `saveProject` rather than updating an existing project. This contributes to duplicate saves.

#### Requested change

When `savedProjectId` exists, call `updateProject`. Otherwise create a new save.

### Custom textures may be duplicated on import/load

Relevant lines: `55-58`, `68-72`

The import/load path appends custom textures. It does not clearly de-duplicate by id/name/content.

#### Requested change

De-duplicate imported custom textures.

### Autosave recovery only appears when there is no current floor plan

Relevant lines: `112-117`

If the user has a current plan but wants to recover an autosave, the option may not show.

#### Requested change

Show autosave recovery as a deliberate option, maybe with timestamp and preview, not only when `!floorPlan`.

---

## 12. `src/components/App.tsx`

### Total area uses rectangular bounds

Relevant lines: `21-25`

This total area calculation multiplies room width by room height from bounds. `DesignMode` uses polygon area in one place. These can diverge.

#### Requested change

Centralise area calculation with one helper:

```ts
calculateRoomArea(room)
```

Use it everywhere.

### Edit mode button label is duplicated

Relevant line: around `98`

The button text appears to be `'Edit Mode'` whether edit mode is on or off.

#### Requested change

Use distinct labels such as:

- `Enter 3D Edit`
- `Exit 3D Edit`

### Zombie mode is product noise for the planning workflow

`ZombieSurvival` may be fun, but for a planning/CAD workflow it is distracting.

#### Requested change

Hide it behind a dev/demo flag or separate mode if this app is being positioned as a serious planning tool.

---

## 13. `src/components/UploadPanel.tsx` and `src/utils/api.ts`

### Upload flow depends on server even though processing is client-side

Relevant lines in `UploadPanel.tsx`: around `17-31`

The panel uploads an image to the server, then processes it client-side. If the server is not running, this fails even if client-side processing could work.

#### Requested change

Allow local file processing directly in the client. Use server upload only when persistence is needed.

### Image extraction is very limited

`api.ts` uses simple image-processing heuristics for dark runs and rectangular rooms. It is not robust enough for hand sketches or planning drawings.

#### Requested change

Do not make OCR/image extraction a central first-phase feature. Manual exact drafting is more controllable and more important.

---

## 14. `server/` and `prisma/schema.prisma`

### Server parser and client parser appear parallel

`server/floorplan-parser.ts` is a separate parser path from the client `api.ts` logic. It does not look like the main app path depends on it.

#### Requested change

Avoid maintaining two divergent parsers unless both are actively used and tested.

### Prisma schema cannot round-trip current client projects

The client saved project includes things the Prisma schema does not fully represent, such as furniture and detailed room bounds/wall segments in the same way.

#### Requested change

If backend persistence becomes important, update Prisma only after the new project model is settled. Otherwise the schema will be migrated twice.

### Texture delete route does not appear to constrain by project id

Relevant lines in `server/routes/textures.ts`: around `87-95`

The route includes `projectId`, but deletion appears to be by texture id only.

#### Requested change

Constrain deletion by both texture id and project id if this is multi-project or multi-user.

### Upload validation is weak

`server/routes/upload.ts` checks file extension but not robust MIME/content signatures.

#### Requested change

For local prototype this is okay. For deployed use, validate MIME/content and set stricter limits.

---

# Part 3 - Proposed implementation plan for Claude

## Phase 0 - Stabilise data model and migrations

This should happen before large GUI additions.

### Required changes

1. Add a versioned project model.
2. Support variants: at minimum Existing and Proposed.
3. Support floors: id, name, level, baseElevation, floorPlan.
4. Add migration from existing single-floor saved projects.
5. Keep old imports working.
6. Make autosave/save/load use the new model.
7. Add selectors for active floor and active variant.

### Acceptance tests

- Old saved project imports successfully.
- Old template loads as one variant with one floor.
- New project can have Basement and Ground Floor.
- Switching floors does not lose edits.
- Switching variants does not lose edits.
- Exported project can be re-imported with all floors and variants intact.

## Phase 1 - Exact numeric controls and rendering correctness

This phase delivers immediate planning value.

### Required changes

1. Honour `WallSegment.height` in `RoomMesh`.
2. Add exact numeric room height input.
3. Add exact numeric door/window/opening width, height, sill, and wall-position inputs.
4. Allow Crittall-style opening dimensions such as 1.245 m x 2.450 m.
5. Allow tall openings such as 2.950 m.
6. Show nib distances either side of an opening.
7. Add item-level furniture height override, at least for spiral stairs.
8. Set Hornton spiral height to 3.0 m via item override, not global catalogue default if possible.
9. Add area inclusion/demised flag and update totals.
10. Fix undo/redo for committed numeric edits.

### Acceptance tests

- A room can be set to 1.89 m high.
- A room can be set to 2.45 m high.
- A room can be set to 2.82 m high.
- A wall can be set lower than the room ceiling and renders lower in 3D.
- A door/opening can be set to 1.245 m wide and 2.450 m high.
- A door/opening can be set to 1.350 m wide and 2.950 m high.
- Spiral stair can be set to 3.0 m high without changing every stair in every project.
- Not-demised/common area can be excluded from demised total.
- Undo restores previous dimensions after a numeric edit.

## Phase 2 - Floor stack visualisation

### Required changes

1. Render visible floors at their `baseElevation`.
2. Add floor visibility and ghosting.
3. Compute scene bounds across visible floors.
4. Let camera target active floor or whole stack.
5. Add simple teleport/switch-to-floor for first-person mode.

### Not required yet

- walking up stairs
- collision detection
- physically accurate stair traversal

### Acceptance tests

- Basement and ground floor appear at different elevations in 3D.
- Hiding/showing a floor works.
- The camera frames both floors when needed.
- First-person mode can start on selected floor.

## Phase 3 - Minimal free-wall tool

This is the safe wall-tool phase. It is not yet a full graph/CAD engine.

### Required changes

1. Add `defaultWallThickness` to store.
2. Add `addFreeWall`, `updateFreeWall`, `deleteFreeWall`, `selectFreeWall` actions.
3. Store free walls in `floorPlan.wallSegments`.
4. Render free walls in 2D.
5. Render free walls in 3D.
6. Include free walls in bounds/autocenter.
7. Add wall drawing mode with live length/angle pill.
8. Add numeric length and angle input.
9. Add right-click wall editor.
10. Support snapping endpoints to grid and other wall endpoints.
11. Add undo/redo for free-wall creation/edit/deletion.

### Not required yet

- auto-generating rooms from closed loops
- full wall-node graph
- shared-wall topology
- polygon triangulation for arbitrary loops, unless rooms are generated

### Acceptance tests

- User can draw a wall at an arbitrary angle.
- User can type exact length.
- User can type exact angle.
- Wall appears in 2D and 3D.
- Wall remains after save/load.
- Wall is included in camera bounds.
- Wall can be selected, edited, and deleted.
- Undo/redo works for wall creation and edit.

## Phase 4 - Polygon rooms and closed loops

Only after Phase 3 is stable.

### Required changes

1. Convert selected closed free-wall loops into rooms.
2. Generate polygon floor and ceiling from wall vertices.
3. Use polygon hit testing.
4. Use polygon area everywhere.
5. Protect against self-intersections.
6. Preserve wall identities when editing vertices.

### Acceptance tests

- Closed wall loop can become a room.
- Area is correct for a non-rectangular polygon.
- 2D fill matches the polygon.
- 3D floor/ceiling matches the polygon.
- Resize handles do not silently rectangularise the room.

---

# Part 4 - Specific line-level comments for Claude

This section is written as direct implementation feedback.

## Types

- `src/types/index.ts:10-18` - `WallSegment.height` exists. Use it in renderers instead of adding another wall-height field.
- `src/types/index.ts:66-75` - `FurnitureItem` needs `height?: number` for spiral stairs and other architectural objects.
- `src/types/index.ts:77-92` - Add area inclusion/demised/status/notes fields or attach them through a metadata object.
- `src/types/index.ts:94-104` - Decide and document what top-level `floorPlan.wallSegments` means. Do not leave it as an invisible array.
- `src/types/index.ts:106-113` versus `159-167` - Resolve `Project.floorPlans[]` versus `SavedProject.floorPlan`. This is the heart of multi-floor migration.

## Store

- `src/store/useStore.ts:22` - Single `floorPlan` state blocks true multi-floor. Wrap it in a project/variant/floor model.
- `src/store/useStore.ts:149-155` - Wall thickness is hard-coded to `0.15`. Add `defaultWallThickness` and wall-level overrides.
- `src/store/useStore.ts:181-190` - Normalisation is too shallow for new project model. Add a migrator.
- `src/store/useStore.ts:199-229` - Room height/name/floor/ceiling updates need undo history.
- `src/store/useStore.ts:247-253` - `updateRoomBounds` regenerates walls and destroys custom wall edits. Guard or rewrite before adding polygon features.
- `src/store/useStore.ts:255-295` - `updateWallVertex` needs history, validation, and probably selected vertex state.
- `src/store/useStore.ts:302-321` - Door/window updates need undo history and validation.
- `src/store/useStore.ts:348-351` - Furniture update needs commit-based history, especially after adding exact dimensions.
- `src/store/useStore.ts:390-407` - Template loading should wrap into project/floor/variant model.
- `src/store/useStore.ts:487-536` - Wall split/gap operations need consistent history and should probably be generalised for free walls.
- `src/store/useStore.ts:562-567` - Autosave must save whole project, not just active floor plan.

## DesignMode

- `src/components/DesignMode.tsx:19` - Add a `wall` tool, but only after store actions exist.
- `src/components/DesignMode.tsx:57` - `SNAP = 0.25` is too coarse. Make configurable and allow exact typed override.
- `src/components/DesignMode.tsx:75-98` - Auto-centre must include free walls and all active/visible floors.
- `src/components/DesignMode.tsx:133-145` - Floor fill uses bounds. Use wall polygon for non-rectangular rooms.
- `src/components/DesignMode.tsx:145-190` - Add a separate render pass for `floorPlan.wallSegments`.
- `src/components/DesignMode.tsx:192-308` - Door/window rendering assumes room walls. Abstract wall references before adding free-wall openings.
- `src/components/DesignMode.tsx:341-354` - Width x height labels from bounds are misleading for angled rooms. Use polygon-aware labels or show bounding dimensions explicitly.
- `src/components/DesignMode.tsx:356-380` - Existing wall length pills are good. Reuse this mechanism for the Wall tool with angle and typed length.
- `src/components/DesignMode.tsx:383-392` - Vertex handles only expose wall starts. Add clearer selected vertex/wall controls if polygon editing expands.
- `src/components/DesignMode.tsx:423-440` - Alignment guides can be reused but do not replace endpoint/angle snapping.
- `src/components/DesignMode.tsx:444-450` - Total area needs demised/excluded logic.
- `src/components/DesignMode.tsx:472-535` - Keyboard shortcuts conflict and are incomplete. Centralise them.
- `src/components/DesignMode.tsx:548-558` - Resize handles should not show for non-rectangular rooms unless polygon-safe.
- `src/components/DesignMode.tsx:561-572` - Wall vertex hit testing is room-only. Free walls need their own hit tests.
- `src/components/DesignMode.tsx:593-609` - `findNearestWall` ignores free walls. Introduce a `WallRef` type.
- `src/components/DesignMode.tsx:626-657` - Mouse down needs a wall-tool branch.
- `src/components/DesignMode.tsx:659-674` - Furniture placement uses rectangular bounds. Polygon rooms need point-in-polygon.
- `src/components/DesignMode.tsx:739-760` - Room hit testing uses bounds. Use polygon hit testing when possible.
- `src/components/DesignMode.tsx:773-776` - Draw preview is rectangle-only. Wall tool needs line preview.
- `src/components/DesignMode.tsx:778-790` - Resizing selected room regenerates rectangle walls. This conflicts with custom geometry.
- `src/components/DesignMode.tsx:793-796` - Wall vertex drag needs undo and finer snap.
- `src/components/DesignMode.tsx:850-872` - Mouse up needs a free-wall commit path.
- `src/components/DesignMode.tsx:900-922` - Right-click wall action is not a wall editor. Replace with a real context menu.
- `src/components/DesignMode.tsx:926-947` - Toolbar needs Wall/Floor/Variant affordances.
- `src/components/DesignMode.tsx:950-966` - Hints should be updated once wall drawing exists.
- `src/components/DesignMode.tsx:1061-1064` - Room height slider cannot enter exact Hornton values. Add typed numeric input.
- `src/components/DesignMode.tsx:1106-1117` - Door controls are too coarse and max height too low. Add exact numeric inputs.
- `src/components/DesignMode.tsx:1186-1204` - Window controls are too coarse. Add exact numeric inputs.
- `src/components/DesignMode.tsx:1145-1147` - Remove `as any` style casts by properly typing the select options.

## RoomMesh

- `src/components/RoomMesh.tsx:91-95` - Room height is read correctly.
- `src/components/RoomMesh.tsx:108-148` - Wall meshes should use `wall.height ?? room.ceilingHeight`.
- `src/components/RoomMesh.tsx:118-135` - Shared wall opening merging should eventually use explicit shared wall identity.
- `src/components/RoomMesh.tsx:137-143` - All wall positions assume same floor level. For floor stack, wrap RoomMesh in a floor group rather than putting floor logic inside every wall.
- `src/components/RoomMesh.tsx:196-205` - Floor mesh uses rectangular bounds. Use polygon shape for polygon rooms.
- `src/components/RoomMesh.tsx:208-217` - Ceiling mesh uses rectangular bounds. Same polygon issue.
- `src/components/RoomMesh.tsx:219-224` - Furniture needs item height/elevation support.
- `src/components/RoomMesh.tsx:267-383` - Opening cutting needs validation against wall length and wall height.
- `src/components/RoomMesh.tsx:324-342` - Manual geometry merge should be replaced or verified.
- `src/components/RoomMesh.tsx:404-424` - Door/window visual models may double-render if there are wall gaps/openings; validate once free-wall gaps expand.
- `src/components/RoomMesh.tsx:463-553` - Door open direction is not properly respected.
- `src/components/RoomMesh.tsx:559-648` - Windows should validate sill+height against actual wall height.

## Scene3D and camera

- `src/components/Scene3D.tsx:13-21` - Scene reads single `floorPlan`; needs project/floor selectors.
- `src/components/Scene3D.tsx:23-44` - Bounds ignore free walls and future floor stack.
- `src/components/Scene3D.tsx:95-97` - All rooms render at y=0. Wrap by floor base elevation.
- `src/components/Scene3D.tsx:99-109` - Ground plane is single-level. Revisit for basement/floor stack.
- `src/components/Scene3D.tsx:130-131` - Measurements/camera target need stack-aware bounds.
- `src/components/CameraController.tsx:174` - First-person camera y is pinned. Do not promise stair walking until this is redesigned.

## Furniture

- `src/components/FurnitureModels.tsx:22-25` - Add item-level height override.
- `src/utils/furnitureCatalog.ts:54` - Spiral staircase default height is 2.7 m; Hornton needs 3.0 m. Prefer item override over global default.
- `src/components/FurnitureModels.tsx:1098-1138` - Spiral step count should derive from height/riser or explicit metadata.

## Storage and backend

- `src/utils/projectStorage.ts:56-69` - Save creates duplicates. Use update path for existing project id.
- `src/utils/projectStorage.ts:115-125` - Import validation needs migration and normalisation.
- `src/components/SaveLoadPanel.tsx:37-43` - Save panel should update existing saves when possible.
- `src/components/SaveLoadPanel.tsx:55-72` - Imported custom textures should be de-duplicated.
- `src/components/SaveLoadPanel.tsx:112-117` - Autosave recovery should be user-visible even when a plan is already open.
- `prisma/schema.prisma` - Backend schema cannot yet round-trip full current/future client data. Do not make backend persistence the centre of this refactor until schema catches up.
- `server/routes/textures.ts:87-95` - Delete should constrain by project id as well as texture id.

---

# Part 5 - Concrete patch specification

This is the direct brief I would give Claude.

## Patch 1 - Wall height rendering

### Goal

Make existing `WallSegment.height` functional.

### Required code changes

In `RoomMesh.tsx`, change wall mesh mapping so each wall gets:

```ts
const effectiveWallHeight = wall.height ?? room.ceilingHeight ?? 2.7;
```

Pass that into `WallWithOpenings`.

Also validate any door/window attached to that wall:

- if `opening.height > effectiveWallHeight`, show warning in UI
- do not silently clamp unless the user asks

### Acceptance

A room can have ceiling height 3.0 m and one wall set to 1.8 m. In 3D, that wall is visibly lower.

## Patch 2 - Exact dimension inputs

### Goal

Replace planning-critical sliders with typed numeric fields.

### Required code changes

Add typed number inputs for:

- room ceiling height
- selected wall height
- selected wall thickness
- door width
- door height
- door position along wall
- window width
- window height
- window sill height
- window position along wall
- furniture item height, at least for stairs

Sliders can remain as convenience, but typed fields must be source of truth.

### Acceptance

The GUI accepts and preserves:

- 1.89 m room height
- 2.45 m opening height
- 2.95 m opening height
- 1.245 m opening width
- 3.0 m spiral stair height

## Patch 3 - Project v2 model

### Goal

Stop treating the project as one flat floor plan.

### Required code changes

Add versioned project data:

```ts
interface ProjectModelV2 {
  id: string;
  name: string;
  version: '2.0';
  activeVariantId: string;
  activeFloorId: string;
  variants: ProjectVariant[];
  customTextures?: CustomTexture[];
}

interface ProjectVariant {
  id: string;
  name: string;
  floors: FloorData[];
}

interface FloorData {
  id: string;
  name: string;
  level: number;
  baseElevation: number;
  floorToFloorHeight?: number;
  floorPlan: FloorPlanData;
}
```

Add migration:

- v1 saved project -> one variant named `Proposed`, one floor named `Ground Floor`
- legacy template -> same wrapper

### Acceptance

Old projects still load. New project can have Basement and Ground Floor and save/load both.

## Patch 4 - Area inclusion / demised status

### Goal

Allow common stairs, voids, and outside/lightwell areas to be modelled without corrupting demised area totals.

### Required code changes

Add room fields:

```ts
areaIncluded?: boolean;
areaCategory?: 'demised' | 'common' | 'void' | 'external' | 'excluded';
```

Update totals to show:

- modelled total
- included/demised total
- excluded total

### Acceptance

A stair/common room can remain visible but not count toward demised total.

## Patch 5 - Minimal free-wall layer

### Goal

Add arbitrary wall drawing without rewriting the app into a full CAD graph.

### Required code changes

Store:

```ts
defaultWallThickness: number;
selectedFreeWallIndex: number | null;
addFreeWall(wall: WallSegment): void;
updateFreeWall(index: number, updates: Partial<WallSegment>): void;
deleteFreeWall(index: number): void;
setDefaultWallThickness(thickness: number): void;
```

DesignMode:

- add `wall` tool
- line preview while drawing
- live length/angle label
- exact length/angle input
- draw `floorPlan.wallSegments`
- hit-test/select free walls
- right-click wall editor
- include free walls in bounds

Scene3D:

- render top-level free walls
- include free walls in scene bounds

Storage:

- normalise missing `wallSegments` to `[]`
- save/load free walls

### Acceptance

A drawn free wall appears in 2D and 3D, survives save/load, can be selected/edited/deleted, and is included in bounds.

---

# Part 6 - What Claude should explicitly avoid in the next batch

## Avoid a full graph rewrite now

A wall-node graph is the right long-term direction, but doing it now will likely break existing room editing, rendering, saving, and templates. Ship a minimal free-wall layer first.

## Avoid fake multi-floor via one tall room

That was a useful JSON workaround, but it should not become the GUI model. Use proper floors with base elevation.

## Avoid silent dimension clamping

Planning data must not be silently changed to fit UI sliders or renderer assumptions. If a user enters a 2.95 m opening in a 2.7 m wall, the app should warn, not quietly shrink it.

## Avoid hard-coding Hornton dimensions into generic defaults

For example, do not globally make every spiral staircase 3.0 m unless the catalogue is meant to be Hornton-specific. Prefer item-level overrides.

## Avoid burying all new code in `DesignMode.tsx`

That file is already too large. New floor selector, variant selector, wall editor, numeric dimension controls, and side-panel sections should be split into smaller components.

## Avoid treating the backend schema as ready

The frontend saved project model is richer than the current Prisma schema. Update backend persistence only after the new frontend model is settled.

---

# Part 7 - Craig decisions needed before coding

These are the decisions where my view may conflict with Claude's proposed vision, or where the spec still has uncertainty.

## Decision 1 - First coding priority

Choose one:

A. Hornton accuracy first: floors, variants, exact dimensions, wall heights, demised areas.  
B. Drawing UX first: free wall tool, length/angle entry, right-click wall editor.

My recommendation: A first, with minimal free-wall groundwork.

## Decision 2 - Existing/proposed handling

Choose one:

A. Proper in-app Existing/Proposed variant toggle now.  
B. Temporary separate saved projects for existing and proposed.

My recommendation: proper variant toggle now if Hornton is the main goal. Separate files will become confusing quickly.

## Decision 3 - Free-wall scope

Choose one:

A. Minimal free-wall segments now, no automatic room generation.  
B. Full wall graph and room inference now.

My recommendation: A. Full graph later.

## Decision 4 - Stair/walkthrough ambition

Choose one:

A. Visual floor stack and floor switching now.  
B. True first-person stair climbing and collision now.

My recommendation: A. Collision/stair climbing later.

## Decision 5 - Unresolved dimensions

The reconciliation docs still show conflicts:

- rear deck/lightwell: 3.25 m or 3.75 m
- Crittall height: 2450 mm or 2245 mm
- appliance bay: 1200 mm or 400 mm
- hall length: 4.8 m or 6.1 m
- bath versus no bath in GF wet room
- vault depths

My recommendation: do not let Claude code these as final until Craig confirms them. If needed, store them with notes/confidence.

---

# Part 8 - Minimum acceptance checklist for Claude's next PR

Claude's next code batch should be judged against this checklist.

## Data and migration

- [ ] Old single-floor saved projects still import.
- [ ] Old templates still load.
- [ ] New project model can store at least one variant and multiple floors.
- [ ] Export and re-import preserves floors, variants, active floor, active variant, rooms, walls, doors, windows, furniture, custom textures.
- [ ] Autosave saves the full project model.

## Exact dimensions

- [ ] Room height accepts 1.89 m.
- [ ] Room height accepts 2.45 m.
- [ ] Room height accepts 2.82 m.
- [ ] Door/opening width accepts 1.245 m.
- [ ] Door/opening height accepts 2.95 m.
- [ ] Opening position can be typed exactly.
- [ ] Nib distances are visible for selected openings.
- [ ] No dimension is silently rounded to the old slider step.

## Walls

- [ ] `WallSegment.height` changes 3D wall height.
- [ ] Wall thickness can be configured at least for new walls.
- [ ] Free wall segments render in 2D if included in the patch.
- [ ] Free wall segments render in 3D if included in the patch.
- [ ] Free wall segments are included in bounds/autocentre/camera framing.
- [ ] Free wall creation/edit/delete are undoable.

## Floors and variants

- [ ] Basement and Ground Floor can exist in one project.
- [ ] Floors have base elevations.
- [ ] 3D view can show stacked floors or at least switch between them.
- [ ] Existing and Proposed can exist in one project if variants are included in patch.

## Area

- [ ] Rooms/areas can be marked demised/included or excluded/common/void/external.
- [ ] Total area display distinguishes included from excluded area.

## Stability

- [ ] Resizing a room does not silently destroy custom wall geometry without warning.
- [ ] Undo/redo works for numeric edits.
- [ ] Save does not create endless duplicate projects when updating an existing save.
- [ ] TypeScript has no `as any` additions where a proper type would do.

---

# Final recommendation to Claude

Do not code the whole vision in one pass.

Implement this order:

1. Wall height rendering and exact numeric inputs.
2. Versioned project model with floors and variants.
3. Demised/excluded area flags.
4. Spiral/item height override.
5. Minimal free-wall drawing/rendering.
6. Only then: polygon rooms, wall graph, voids, exports, and walkable stairs.

The current code has enough hooks to evolve, especially `WallSegment`, `FloorPlanData.wallSegments`, `RoomData.ceilingHeight`, and the existing 2D dimension labels. But the app is not yet architecturally ready for a full CAD graph. A staged migration will preserve the working prototype while making it accurate enough for Hornton.
