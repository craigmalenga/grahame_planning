# Requirements Review — Free Walls, Floors, Thickness, Per-Wall Height

Reviewed statically (no browser) against Craig's stated requirements for this version.
Files: `DesignMode.tsx`, `useStore.ts`, `Scene3D.tsx`, `RoomMesh.tsx`.

---

## 1. Angled walls + live cm readout — SATISFIED (2D), SATISFIED (3D)

**Drawing.** The `wall` tool (`'Draw Wall'`, key `A`) does a genuine click-drag of a single
free segment, NOT a rectangle. `handleMouseDown` (tool === 'wall') sets `drawStart`;
`handleMouseMove` sets `drawEnd` to the raw cursor world position — so the angle is fully
free (any direction). On `mouseUp` it calls `addFreeWall(drawStart, drawEnd, defaultWallThickness)`.
Craig decides when to stop by releasing the mouse. Confirmed NOT rectangular-only.

**Live cm.** While dragging, `draw()` lines 426-450 render a dashed preview plus a live label
`"<n> cm  ∠<deg>°"` at the segment midpoint. `lenCm = round(hypot(dx,dy)*100)`. So the length in
CM updates live as he drags. Bonus: live angle in degrees. This directly meets his emphatic ask.

**Persistence + both views.**
- Stored on `floorPlan.wallSegments[]` via `addFreeWall` (with undo history).
- 2D: rendered in `draw()` lines 403-422 with a permanent cm label at midpoint, selectable.
- 3D: `Scene3D.tsx` lines 100-115 render each segment as a `boxGeometry` of `[len, wh, th]`,
  positioned/rotated correctly. So a drawn wall persists and shows in BOTH 2D and 3D. Good.

**Nice touch:** walls "chain" — after releasing, `drawStart` is set to the previous `drawEnd`,
so the next drag continues from the last endpoint. Shift = 45° lock. Both are documented in the
tool hint. This is better than asked.

**Minor:** start point snaps to 0.25 m grid (Shift bypasses snap on mousedown but on mousemove
Shift instead does angle-lock — slightly inconsistent: there is no pure free-position start+end
mode, every release snaps the end via `snap()` unless Shift, and Shift then forces 45°). Net: he
can't place a wall whose endpoints are both off-grid and off-45°. Likely fine, worth noting.

---

## 2. Per-wall height override — PARTIAL

**Free walls (wallSegments):** override EXISTS and RENDERS.
- Right-click a free wall (DesignMode lines 1033-1054) prompts for height in cm; stored as
  `seg.height`. Scene3D line 108 uses `wh = seg.height ?? 2.7` — so a per-free-wall height
  genuinely renders in 3D. SATISFIED for free walls.

**Room walls:** override is HALF-WIRED.
- `RoomMesh.tsx` line 147 reads `wall.height ?? height` (height = room/floor default) and the 3D
  wall extrusion honours it. So IF a room wall had a `height`, 3D would render it.
- BUT there is NO UI anywhere to set a room wall's `.height`. The right-click handler only handles
  free walls and gap-toggling on split room walls — it never sets `wall.height`. The DesignPanel
  has a per-ROOM ceiling-height slider (lines 1242-1246) but nothing per individual room-wall.
- So for room walls, per-wall height is reachable only by hand-editing data, not via UI.

**Gap in default sourcing:** Free walls fall back to a hard-coded `2.7` in Scene3D, NOT to the
active floor's `height`. So if Craig sets a floor default of, say, 3.0 m, free walls without an
explicit height still render at 2.7 — they ignore the floor default. Inconsistent with room walls
(which use the room ceilingHeight). Flag.

**Verdict:** Per-wall height = SATISFIED for free walls (via right-click), MISSING UI for room
walls, and free-wall default does not track the floor height.

---

## 3. Multiple named floors — PARTIAL (2D works, 3D is NOT stacked)

**Add / name / switch / per-floor data:** SATISFIED.
- Floor bar UI (lines 1077-1103): list of floor buttons, `+ Floor` (prompts name + default height
  cm), `Duplicate` (Existing→Proposed workflow), `Height` (set this floor's default storey height),
  `Delete`, and double-click a floor button to rename.
- Store (`useStore.ts` 225-314): each floor is `{id, name, height, data: FloorPlanData}`. Switching
  parks the live `floorPlan` back into `floors[active].data` then swaps in the target's data
  (`setActiveFloor`). So each floor keeps its OWN rooms AND wallSegments. Add/duplicate/rename/
  setHeight/remove all implemented and guard against deleting the last floor. This is solid.

**3D stacking:** MISSING / BROKEN expectation.
- `Scene3D.tsx` renders ONLY `floorPlan.rooms` and `floorPlan.wallSegments` — i.e. just the ACTIVE
  floor. The other floors in `floors[]` are never passed to the 3D scene.
- There is no Y/elevation offset by floor index anywhere. Even the active floor is drawn at Y=0.
- **Consequence:** 3D shows one floor at a time, always at ground level. Switching floors in 2D
  then viewing 3D shows that floor at Z/Y=0 — it looks identical in placement regardless of which
  floor. There is NO multi-storey 3D model; you cannot see floor 1 sitting on top of the ground
  floor. **Multi-floor is effectively 2D-only.** This is the single biggest mismatch vs. what a
  user imagines "multiple floors" means in 3D.

**Persistence note:** auto-save / Ctrl+S (`projectStorage`) saves only `floorPlan` (the active
floor), not the `floors[]` array (see DesignMode 536-543 and the store subscriber 727-733). So on
reload, only the active floor survives — all other floors are LOST. Serious data-loss flag.

---

## 4. Wall thickness in cm — PARTIAL

- **Default:** `defaultWallThickness = 0.1` m (100 mm) in store; new free walls use it. Sensible. OK.
- **Right-click override:** Free-wall right-click prompts "Wall THICKNESS in cm" and stores
  `thickness/100`. Renders in 2D (line width) and 3D (box depth). SATISFIED for free walls.
- **Gap:** there is NO UI to change the DEFAULT thickness. `setDefaultWallThickness` exists in the
  store but is never imported/used in DesignMode or DesignPanel. So Craig is stuck with 100 mm for
  every new wall unless he right-clicks each one afterwards. He asked for a sensible default +
  override; default is fixed-and-hidden, override is per-wall-only.
- Room walls are hard-coded to 0.15 m in `makeRoomWalls`; no thickness UI for them either.

**Verdict:** override = SATISFIED (free walls); settable default = MISSING.

---

## 5. Biggest UX gaps / most likely "this is broken" moments

1. **Other floors vanish on reload (data loss).** Only the active floor is persisted. A
   non-technical user will create "Ground" + "First", refresh/reopen, and find the first floor
   gone. This will read as a serious bug. HIGHEST PRIORITY.
2. **3D looks the same no matter which floor / no stacking.** He'll switch to "First Floor", hit
   View 3D, and see it sitting on the grass at ground level with no ground floor beneath. He'll
   conclude floors "don't really work in 3D."
3. **Three stacked `window.prompt()` dialogs to edit a wall.** Right-clicking a free wall fires
   prompt → prompt → prompt (length, thickness, height) sequentially. Cancelling the first aborts;
   leaving later ones blank is "keep". This is clunky, easy to mis-handle, and not what "edit a
   wall" should feel like. Also prompts are modal/ugly and can't show the current angle for editing.
4. **No way to set the default wall thickness** despite the store supporting it — every wall starts
   at 100 mm and must be individually right-click-corrected.
5. **Room-wall height can't be set from the UI at all** even though 3D would honour it.
6. **Free-wall endpoints can't be re-dragged.** Room walls have orange vertex handles; free walls
   only show small dots and are selectable but there is no handle to drag an endpoint — the only
   edit path is the length prompt (which keeps the original angle). He can't visually re-aim a wall.
7. **Free walls have no doors/windows/openings** and don't connect to rooms — fine for now but he
   may expect to put a door in a hand-drawn wall.

---

## Prioritised gap list (next batch)

| Pri | Gap | Tag |
|-----|-----|-----|
| P0 | Persist ALL floors (save `floors[]`, not just active `floorPlan`) — currently silent data loss | MISSING |
| P0 | Stack floors in 3D: render every floor offset on Y by cumulative storey heights; show active-floor highlight | MISSING |
| P1 | Replace the 3-prompt wall editor with a single numeric panel (length cm, angle°, thickness cm, height cm) — reuse the right-panel pattern | PARTIAL→improve |
| P1 | UI to set DEFAULT wall thickness (wire up existing `setDefaultWallThickness`) | MISSING |
| P1 | Per-room-wall height UI (and/or per-wall thickness) | MISSING |
| P2 | Type-exact length while drawing (let him type a number to commit an exact-length wall instead of eyeballing the drag) | MISSING |
| P2 | Draggable free-wall endpoint handles (re-aim angle visually) | MISSING |
| P2 | Free-wall 3D default should fall back to the active floor's `height`, not hard-coded 2.7 | PARTIAL |
| P3 | Walk-up-stairs / connect storeys (stairs object + vertical navigation in walkthrough) | MISSING |
| P3 | Openings (doors/windows) in free-standing walls | MISSING |

---

## Summary tags

- Angled walls + live cm: **SATISFIED**
- Edit wall length/height via right-click (free walls): **SATISFIED** (UX clunky — 3 prompts)
- Wall thickness override: **SATISFIED**; settable default: **MISSING**
- Per-wall height — free walls: **SATISFIED**; room walls: **MISSING (UI)**
- Multiple named floors (2D): **SATISFIED**; 3D stacking: **MISSING**; persistence of non-active floors: **MISSING (data loss)**
