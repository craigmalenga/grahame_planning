# Store / State Correctness Review — useStore.ts (multi-floor + free walls)

Files reviewed:
- `floorplanner_app/floorplanner_bundle/src/store/useStore.ts`
- `floorplanner_app/floorplanner_bundle/src/types/index.ts`
- `floorplanner_app/floorplanner_bundle/src/utils/projectStorage.ts`
- `floorplanner_app/floorplanner_bundle/src/components/SaveLoadPanel.tsx`, `Header.tsx`, `DesignMode.tsx`

---

## BLOCKER

### B1. Parked floors (all storeys except the active one) are silently lost on save/load — multi-floor does not round-trip
`types/index.ts:159-167` — `SavedProject` has only a single `floorPlan`, no `floors`/`activeFloorIndex`.
`Header.tsx:10-21,25-33` and `SaveLoadPanel.tsx:27-35` (`buildSavedProject`) only serialize `floorPlan`.
`SaveLoadPanel.tsx:55,68,83` / `Header.tsx` — load/import/recover only call `setFloorPlan(project.floorPlan)`; they never restore `floors`.

Effect: a 3-storey building saves to disk, but only the **currently active** storey survives. The two parked storeys in `floors[].data` are gone. Reloading produces a single-floor project. This is unrecoverable data loss for the user.

Minimal fix:
- Extend `SavedProject` (types/index.ts) with `floors?: { id: string; name: string; height: number; data: FloorPlanData }[]` and `activeFloorIndex?: number`.
- In `buildSavedProject`/`handleQuickSave`/`handleExport`, read `floors` and `activeFloorIndex` from the store. CRITICAL: before serializing, park the live `floorPlan` into `floors[activeFloorIndex].data` (or just write `floorPlan` over that slot at build time) — otherwise the active storey's unsaved live edits are written to `floorPlan` but the stale copy is written into `floors[active].data`, and on reload the parked copy wins.
- On load, add a store action `loadFloors(floors, activeFloorIndex, floorPlan)` that sets all three atomically and resets undo/redo. Fall back to seeding a single floor when `floors` is absent (older files).

### B2. `setFloorPlan` keeps stale `floors`/`activeFloorIndex` when loading a different project over an existing one
`useStore.ts:215-222`:
```
floors: state.floors && state.floors.length ? state.floors : [ seed ],
activeFloorIndex: state.floors && state.floors.length ? state.activeFloorIndex : 0,
```
Loading/importing/recovering all go through `setFloorPlan` (`SaveLoadPanel.tsx:55,68,83`). If the user already has floors set up (e.g. mid-edit of a 3-storey building, `activeFloorIndex = 2`) and then loads a *different* project:
- `floorPlan` becomes the loaded plan, but `floors` is left untouched (old building) and `activeFloorIndex` stays `2`.
- The floor bar now shows the OLD building's storey names while `floorPlan` is the NEW project — inconsistent UI.
- The first `setActiveFloor` parks the loaded plan into `floors[2].data` (overwriting the old top storey) and loads `floors[0/1].data` — the OLD building's storeys. The freshly loaded project is now mixed into/buried under the previous building.
- Undo stack (`undoStack`) is NOT reset on load, so an undo replays history belonging to the previous project (see B3).

Fix: load must fully reset floor state. Either route loads through a dedicated `loadFloors` action (see B1) that overwrites `floors`, `activeFloorIndex`, `undoStack`, `redoStack`, or make `setFloorPlan` always reseed a fresh single-floor `floors` array + reset `activeFloorIndex` to 0 + clear undo/redo (matching what `loadTemplate` already does at `useStore.ts:566-571`).

### B3. Undo stack is global and not floor-scoped — undo after a floor switch applies one floor's history to another
`useStore.ts:120-121,183-191,586-618`. `undoStack`/`redoStack` hold `{ floorPlan }` snapshots with no floor id. `setActiveFloor`/`addFloor`/`duplicateActiveFloor`/`removeFloor` swap `floorPlan` but do NOT clear the undo/redo stacks.

Scenario: edit Floor A (history accrues snapshots of A), switch to Floor B, press Undo. `undo()` (`:597`) overwrites the live `floorPlan` (now B's) with `entry.floorPlan` (a snapshot of A). Floor B's content is replaced by an old Floor A snapshot; the redo entry captures B's plan but it is now associated with A's label/stack. Cross-floor corruption.

Fix: clear `undoStack`/`redoStack` (+ `canUndo:false, canRedo:false`) inside `setActiveFloor`, `addFloor`, `duplicateActiveFloor`, and `removeFloor`. (Cheapest correct option.) A nicer option is per-floor history keyed by floor id, but clearing on switch is the minimal safe fix.

---

## IMPORTANT

### I1. Autosave captures only the active floor — same data-loss shape as B1
`useStore.ts:727-734` subscriber and `projectStorage.ts:8-15` (`autoSave`) only persist `floorPlan`. `loadAutoSave` (`projectStorage.ts:17`) returns only `floorPlan`, and `handleRecoverAutoSave` (`SaveLoadPanel.tsx:80-87`) restores only `floorPlan`. A crash/refresh while working on a multi-floor building recovers just the active storey.

Fix: extend `autoSave`/`loadAutoSave` to include `floors` + `activeFloorIndex`; have the subscriber pass `state.floors` and `state.activeFloorIndex` and park the live plan first; recover via the `loadFloors` action from B1.

### I2. Autosave subscriber persists the *unparked* active floor; floors[] in the saved blob is stale
`useStore.ts:731` passes `state.floorPlan` only. Even once I1 adds `state.floors`, the subscriber must park `floorPlan` into `floors[activeFloorIndex].data` before writing, or autosave will store an out-of-date copy of the active storey inside `floors[]` alongside an up-to-date `floorPlan`. On recovery the two disagree. Park-before-persist must be applied consistently in B1, I1, I2.

### I3. `duplicateActiveFloor` / `addFloor` do not guard `floors[activeFloorIndex]` existing
`useStore.ts:278` (`duplicateActiveFloor`) does `floors[state.activeFloorIndex] = { ...floors[state.activeFloorIndex], data: ... }` and `:280-281` reads `.name`/`.height` from it unconditionally. `addFloor` (`:257`) guards with `&& floors[state.activeFloorIndex]`, but `duplicateActiveFloor` does not. If `floorPlan` exists but `floors` is empty/short (reachable via the B2 stale-state path, or any future code that sets `floorPlan` without seeding), `floors[activeFloorIndex]` is `undefined` and the spread `{ ...undefined }` plus `.name` access throws (`Cannot read properties of undefined`). Guard it like `addFloor` does, or seed floors defensively.

---

## MINOR

### M1. `selectedFreeWallIndex` becomes stale after `removeFreeWall` of a lower index
`useStore.ts:343-351`. `removeFreeWall` sets `selectedFreeWallIndex: null`, which is safe for the deleted item. But `updateFreeWall`/`addFreeWall` use raw array indices, and after any deletion every later wall shifts down by one. If other code holds an index (e.g. a hover/drag index in `DesignMode`) it now points at the wrong segment. Indices-as-identity is fragile for free walls; consider giving `WallSegment` an `id` for free walls and selecting by id. Not a blocker because the action itself nulls selection.

### M2. Free-wall actions correctly go through `withHistory` — but they snapshot the whole `floorPlan` per drag update
`useStore.ts:332-341` (`updateFreeWall`) calls `withHistory` on every update. If `updateFreeWall` is called on each pointer-move during a drag, the undo stack fills with one entry per mouse delta (capped at 50, so older real edits are evicted). Confirm the caller debounces / only commits on drag-end; otherwise undo granularity is unusable. (`addFreeWall`/`removeFreeWall` are one-shot and fine.)

### M3. `wallSegments` defaulting is handled in new code but old in-memory plans can still be undefined at read sites
`setFloorPlan` (`:214`) backfills `wallSegments: data.wallSegments ?? []`, and the free-wall actions all read `state.floorPlan.wallSegments ?? []` (`:325,335,346`) defensively — good. `addFloor`/template create `wallSegments: []` explicitly. No bug found here; flagging only that any render code reading `floorPlan.wallSegments` directly (outside the store) should keep the `?? []` guard for plans that bypassed `setFloorPlan`.

### M4. `setFloorPlan` seed names every reseed "Ground Floor" / `data.name`
`useStore.ts:220`. Cosmetic: when floors is empty the seed uses `data.name || 'Ground Floor'`. Fine, but combined with B2 the seeding-vs-keep branch is the root of the inconsistency; resolving B2 supersedes this.

---

## Summary of required fixes (ordered)
1. Persist `floors` + `activeFloorIndex` in `SavedProject` and autosave, parking the live plan first (B1, I1, I2).
2. Reset floor state + undo/redo on every project load (B2, B3).
3. Clear undo/redo on floor switch/add/dup/remove (B3).
4. Guard `duplicateActiveFloor` against a missing active floor (I3).
