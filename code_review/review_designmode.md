# Code Review — DesignMode.tsx free angled-WALL tool

File: `floorplanner_app/floorplanner_bundle/src/components/DesignMode.tsx`
Reviewed against store: `floorplanner_app/floorplanner_bundle/src/store/useStore.ts`

---

## 1. Chaining — `setDrawStart(drawEnd)` is effectively dead (BLOCKER)

`DesignMode.tsx:981-989` (mouseup) sets `isDrawing=false` and `setDrawStart(drawEnd)`. But the
next stroke needs a fresh mousedown, and `DesignMode.tsx:713-719` unconditionally overwrites
`drawStart` from the cursor:

```ts
if (tool === 'wall') {
  setIsDrawing(true);
  const p = e.shiftKey ? world : { x: snap(world.x), y: snap(world.y) };
  setDrawStart(p);   // <-- discards the chained start from mouseup
  setDrawEnd(p);
  return;
}
```

So the chain only "works" if the user happens to press down exactly on the previous endpoint
(within grid snap). The `setDrawStart(drawEnd)` call is dead state — it is overwritten before it is
ever used. The tool hint at `DesignMode.tsx:1142` ("Walls chain end-to-end") is therefore false.

There is also a latent staleness bug even if chaining were wired: `setDrawStart(drawEnd)` is a state
update; the preview draw at `:426-449` would read the *old* `drawStart` until React re-renders, but
since `isDrawing` is false the preview is hidden anyway, masking it.

**Fix — pick one real model:**

- **(Recommended) Click-to-place-vertices polyline.** On mousedown in wall tool: if not currently
  chaining, set `drawStart=cursor`, `isDrawing=true`. On *each subsequent click*, call `addFreeWall`
  from `drawStart` to the (snapped/locked) click point, then `setDrawStart(clickPoint)` and stay
  `isDrawing=true`. mousemove only updates `drawEnd` for the live preview (no drag needed). End the
  chain on double-click, Enter, or ESC. This makes the rubber-band preview meaningful between clicks
  and is the standard CAD polyline UX. Requires moving wall creation out of mouseup into mousedown
  and removing the per-stroke `setIsDrawing(false)`.

- **(Simpler) Drag-per-wall, no chaining.** Keep mousedown=start, drag, mouseup=commit, but drop the
  misleading `setDrawStart(drawEnd)` and the "chain end-to-end" hint. Each wall is an independent
  drag. Honest, but no chaining.

Do not ship the current hybrid: it claims chaining, contains dead code, and silently does drag-per-wall.

---

## 2. useEffect dependency arrays (IMPORTANT)

### Keydown effect `DesignMode.tsx:529-596`
Deps: `[floorPlan, selectedRoomIndex, selectedFurnitureId, selectedDoorId, selectedWindowId, selectedFreeWallIndex]`.

- `removeFreeWall` is referenced at `:591` but is **not** in deps. With Zustand the action identity is
  stable, so this is low-risk in practice, but it is still a missing dep (lint will flag it) and
  technically a stale-closure if the store is ever recreated. Add `removeFreeWall` (and for
  consistency `undo, redo, duplicateRoom, setTool` which are also closed over).
- `setTool` / `setFurnitureToPlace` / `setIsDrawing` are React setters (stable) — fine to omit, but
  ESLint exhaustive-deps will complain about `setTool` since it's local state setter (stable, OK).

### Draw effect `DesignMode.tsx:107-508` + `:526`
`draw` is a `useCallback` whose dep array (`:508`) **does** include the load-bearing values:
`selectedFreeWallIndex`, `defaultWallThickness`, `drawStart`, `drawEnd`, `isDrawing`, `tool`, etc.
This one looks complete for the new wall feature. No stale-closure in the render path.

**Net:** the *draw* loop is fine; the *keydown* effect is missing `removeFreeWall` and other action
deps. Stable Zustand identities make it benign today but it is fragile.

---

## 3. Shift semantics conflict (IMPORTANT)

- mousedown `:716`: `const p = e.shiftKey ? world : snap(...)` — Shift = **freehand / no grid snap**.
- mousemove `:879-888`: `if (e.shiftKey) { ...snap angle to 45° ... } else { snap to grid }` — Shift
  = **45° angle lock**.

So holding Shift through a single drag means: start point is un-snapped freehand, but the end point
is 45°-locked *and* un-snapped. The start anchor and end behave under two different rules with the
same modifier. The code comment at `:713` even says "Alt = no snap" while the code uses `shiftKey`,
and the hint at `:1142` only mentions "Shift = 45° lock" — three sources disagree.

**Fix:** assign distinct modifiers. Recommended: **Shift = 45° angle lock** (apply on both
mousedown anchor handling and mousemove), **Alt = freehand/no-snap**. Update the `:713` comment and
ensure the start point honors the same snap rule the user expects. Make mousedown and mousemove read
the same modifier for the same meaning.

---

## 4. Right-click prompt UX + tolerance + precedence (IMPORTANT)

`DesignMode.tsx:1026-1072`

- **Three sequential `window.prompt`s** (`:1039`, `:1042`, `:1043`) are clunky and block the thread;
  cancelling length aborts everything (`:1040` early return) but cancelling thickness/height is
  tolerated inconsistently. Replace with the existing right-panel editor pattern (the file already
  renders door/window/furniture editors in `DesignPanel`) — add a "Free Wall" editor section keyed
  on `selectedFreeWallIndex` with numeric inputs. Much cleaner and testable.
- **`findNearestFreeWall` tolerance is fixed 0.25 m world units** (`:658` `let bestDist = 0.25`).
  Compare `findNearestWall` `:687` which scales: `Math.max(0.8, 2.0/zoom)`. At zoom 0.2 the free-wall
  hit radius is a 1.25 px ring (impossible to hit); zoomed in it's a huge grab zone over other
  elements. **Fix:** `let bestDist = Math.max(0.15, 0.4 / zoom);` (scale with zoom like the room-wall
  test). Note this function is used for **both** selection (`:767`) and right-click (`:1034`), so the
  fix improves both.
- **Precedence:** the contextmenu handler checks `findNearestFreeWall` **before** the room/gap logic
  (`:1034` before `:1058`). With the oversized zoomed-in tolerance, a right-click intended to toggle
  a room-wall gap can be hijacked by a nearby free wall and instead open the length prompts. After
  fixing the tolerance this is mostly mitigated, but consider: if both a free wall and a room wall are
  within tolerance, decide intent by smallest distance rather than "free wall always wins."

---

## 5. ESC / tool exit / floor switch (IMPORTANT)

- ESC (`:531`) sets `setTool('select'); setFurnitureToPlace(null); setIsDrawing(false)` — this
  **does** cleanly stop wall drawing. Good. (`drawStart/drawEnd` are stale but harmless once
  `isDrawing=false`.)
- **Floor switch mid-draw leaves `isDrawing` stuck (BUG).** `setActiveFloor`
  (`useStore.ts:234-251`) resets store-level selection but **cannot** touch the component's local
  `isDrawing`/`drawStart`/`drawEnd` (they are `useState` in `DesignMode`). If the user is mid-drag in
  wall tool and clicks a floor tab (`:1082`), `isDrawing` stays `true`. The next mousedown on the new
  floor will still be treated as start (it resets `drawStart` anyway), but the live preview at `:426`
  will momentarily render a phantom wall using the old `drawStart`/`drawEnd` in the new floor's
  coordinate space. Same risk for `+ Floor` / `Duplicate` / `Delete` floor buttons.
  **Fix:** in the floor-tab `onClick` (and add/dup/delete), call a local reset:
  `setIsDrawing(false); setDragHandle(null); ...` before/after `setActiveFloor(i)`. Or add a
  `useEffect(() => { setIsDrawing(false); }, [activeFloorIndex])` to clear transient interaction
  state whenever the floor changes.

---

## 6. Hit-test precedence in select mousedown (IMPORTANT)

`DesignMode.tsx:766-858` — order is: **free wall (`:767`)** → vertex handle (`:777`) → resize handle
(`:784`) → door/window (`:792`) → furniture (`:827`) → room (`:838`).

Free wall is checked **first**, and with `findNearestFreeWall`'s current fixed 0.25 m tolerance (and
especially if widened by the zoom fix) a free wall lying over/near a room edge will swallow the click
and `return` at `:770-771`, making it impossible to select the underlying room, its resize handle, or
a vertex. This blocks selecting a room whose wall overlaps a free wall.

**Fix:** demote free-wall selection to run **after** room/handle/vertex/door/window hit tests (or at
least after vertex/handle), so structural editing of rooms wins when overlapping. Alternatively,
compute all candidate distances and pick the nearest, but simplest is reordering: put the free-wall
check just above the final "click empty space → deselect" fallthrough. Also tighten its tolerance
(see #4) so it doesn't over-grab.

---

## Minor

- `:438` preview angle uses `Math.atan2(-dy, dx)` (screen-y down → math-y up) which is correct for a
  human-readable bearing; the stored wall and the cm label at `:416-421` use raw world coords — fine,
  just note the preview angle convention differs from any stored angle. (MINOR)
- `:588` `'a'` keydown sets wall tool with **no guard against typing in inputs**. The room-name
  `<input>` at `:1233` and floor-rename prompt are React-controlled; pressing 'a' while focused in the
  room-name field will *both* type 'a' and switch to the wall tool. Same applies to existing 'r'/'d'
  shortcuts but the new 'a' inherits the bug. Guard with
  `if ((e.target as HTMLElement)?.tagName === 'INPUT' || ...) return;` at the top of `onKey`. (MINOR→IMPORTANT)
- `:716` comment says "Alt = no snap" but code reads `e.shiftKey`; stale/misleading comment. (MINOR)
- `addFreeWall` length guard `len > 0.05` (`:984`) discards <5 cm walls silently with no feedback;
  acceptable but the chain (if fixed) could strand the user with no committed segment. (MINOR)
