# 3D Render Correctness Review — Free Walls, Per-Wall Height, Spiral Height

Scope: `Scene3D.tsx`, `RoomMesh.tsx`, `furnitureCatalog.ts` (+ cross-file checks in
`FurnitureModels.tsx`, `useStore.ts`, `types/index.ts`, `DesignMode.tsx`). Static reasoning, no browser.

## 1. Coordinate / rotation convention — CONSISTENT (no bug)

Reference (RoomMesh `RoomMesh.tsx:108-142`):
- `angle = atan2(dy, dx)` where `dy = wall.y2 - wall.y1` (plan-y), `dx = wall.x2 - wall.x1`
- `position = [centerX, 0, centerZ]`, `centerZ = (wall.y1 + wall.y2)/2`  (plan +y -> +z)
- `rotation = [0, -angle, 0]`

New free-wall block (`Scene3D.tsx:100-115`):
- `angle = atan2(dz, dx)` where `dz = seg.y2 - seg.y1`, `dx = seg.x2 - seg.x1`
- `position = [cx, wh/2, cz]`, `cz = (seg.y1 + seg.y2)/2`
- `rotation = [0, -angle, 0]`

Both use the identical `-atan2(plan_dy, dx)` rotation and the identical plan-y -> z mapping for the
center. The `boxGeometry args=[len, wh, th]` lays length along local +X (same axis the RoomMesh
extruded shape uses for length), so after `rotation=[0,-angle,0]` the box length aligns with the wall
vector exactly as the room walls do. The 2D canvas draws the same segment with `worldToScreen(seg.x1,seg.y1)->(x2,y2)`
(`DesignMode.tsx:404-405`), so a wall drawn at a given 2D angle appears at the matching 3D angle.
No sign flip, no mirroring. **No action needed.**

## 2. Height / anchor — CORRECT

- Box is centered at origin; placing `position.y = wh/2` puts the base on the floor plane (y=0).
  RoomMesh walls extrude from y=0 to height; tops match when heights match. Correct. (`Scene3D.tsx:110`)
- Free walls intentionally skip the 5 mm inward nudge (`getWallInwardOffset`, `RoomMesh.tsx:76`).
  Correct — they are standalone, not paired room faces, so there is no co-planar z-fight to avoid.
- `isNightMode` IS in scope: destructured at `Scene3D.tsx:14` and used at line 112. Correct.

### MINOR — `Scene3D.tsx:108`  hardcoded fallback height
`const wh = seg.height ?? 2.7;` The literal 2.7 is fine today (the app-wide default ceiling/wall
height is 2.7: `useStore.ts:220,260,281,381,568`; RoomMesh `room.ceilingHeight || 2.7`). But it is a
magic number duplicated from the store. If the default is ever bumped (as the spiral just was),
free walls silently desync. Concrete fix: source from a shared constant or `state.defaultWallHeight`,
e.g. `const wh = seg.height ?? DEFAULT_WALL_HEIGHT;`. Not blocking.

### MINOR — `Scene3D.tsx:110`  free walls are untextured / non-interactive
Free walls render a flat `meshStandardMaterial` color, not the plaster texture room walls use, and
cannot host doors/windows or be clicked. Likely intentional for v1, but visually inconsistent beside
textured room walls. Cosmetic — flag only.

## 3. Per-wall height in RoomMesh — ONE REAL ISSUE (ceiling) + memo OK

Change: `height: (wall.height ?? height)` (`RoomMesh.tsx:146`).

### IMPORTANT — `RoomMesh.tsx:212-221`  ceiling ignores per-wall height
The ceiling mesh is placed at `position={[cx, height, cz]}` using the room default `height`
(`RoomMesh.tsx:94`), NOT the per-wall value. If any wall is set taller than the room default, that
wall now extrudes ABOVE the ceiling plane (wall pokes through the ceiling); if shorter, a gap opens
between wall top and ceiling. The feature is "vary height wall-by-wall," so a uniform ceiling is
geometrically inconsistent with non-uniform walls. Concrete fix: either (a) clamp per-wall override
to `<= height` and document it, or (b) drop the flat ceiling in favor of one spanning the max wall
height / a sloped surface, or (c) compute `ceilingY = max(room.ceilingHeight, ...wall heights)`.
At minimum, gate/clamp so walls never exceed the ceiling.

### Doors/windows head calcs — OK
`door.height` / `win.sillHeight + win.height` are absolute values independent of wall height
(`RoomMesh.tsx:357-379`). A per-wall height only needs to exceed the opening head, which was already
the implicit assumption. No new breakage, though a too-short `wall.height` could clip an opening top
— same pre-existing risk, not introduced here.

### Memo deps — CORRECT
`wallMeshes` useMemo deps are `[room.walls, height, room.doors, room.windows, roomIndex, allRooms]`
(`RoomMesh.tsx:152`). `wall.height` lives inside each element of `room.walls`, so editing a per-wall
height produces a new `room.walls` reference (store does immutable updates, e.g. `useStore.ts:337`)
and the memo recomputes. `height` (room default) is also a dep, covering the `?? height` branch.
Deps are sufficient — no stale-render bug. `WallWithOpenings`'s inner geometry memo includes `height`
(`RoomMesh.tsx:387`), so the per-wall value flows into the extrusion too. Correct.

## 4. Spiral 3.0 — CORRECT (no clipping)

Catalog `defaultHeight: 3.0` for `staircase-spiral` (`furnitureCatalog.ts:54`).
`SpiralStaircaseModel` is fully parametric in `h` — center pole `cylinderGeometry args=[..,h,..]`,
`stepHeight = h/steps`, railing offsets all derive from `h` (`FurnitureModels.tsx:1098-1137`).
There is NO hardcoded 2.7 anywhere in the spiral model. `h = catalog.defaultHeight`
(`FurnitureModels.tsx:25`). So the model scales cleanly to 3.0 with no clipping or floating steps.
Note: a 3.0 m spiral now exceeds the 2.7 m default ceiling — expected for a stair void, but it WILL
poke through a `showCeiling` ceiling in a 2.7 m room. Acceptable / by-design; flag only.

## Summary of tagged findings
- BLOCKER: none.
- IMPORTANT: `RoomMesh.tsx:212-221` — flat ceiling at room default `height` ignores per-wall
  height overrides; tall walls clip through ceiling / short walls leave a gap. Clamp or recompute.
- MINOR: `Scene3D.tsx:108` hardcoded 2.7 fallback duplicates store default (desync risk);
  `Scene3D.tsx:110` free walls untextured/non-interactive (cosmetic); spiral 3.0 exceeds 2.7 ceiling
  (by-design).
