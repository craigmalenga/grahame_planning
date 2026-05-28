# Code Review — Save/Load Round-Trip, Build Integrity, Type Consistency

Scope: multi-floor (`floors[]`, `activeFloorIndex`) and free walls (`floorPlan.wallSegments`) change.
Repo: `floorplanner_app/floorplanner_bundle/`

---

## BLOCKER

### B1. Multi-floor projects lose every floor except the active one on save/load
- **`src/types/index.ts:159-167`** — `SavedProject` carries a single `floorPlan: FloorPlanData` and has **no `floors[]` field**.
- **`src/components/SaveLoadPanel.tsx:27-35`** (`buildSavedProject`) and **`src/components/Header.tsx:10-18`** (`handleQuickSave`) both serialize only `floorPlan` (the live/active storey). The parked storeys in `state.floors[]` are never written.
- **`src/components/SaveLoadPanel.tsx:55, 68, 83`** (`handleImportFile`, `handleLoadProject`, `handleRecoverAutoSave`) restore with `setFloorPlan(project.floorPlan)` only. `setFloorPlan` (`useStore.ts:205-223`) re-seeds `floors` with a **single** entry from the loaded plan when `state.floors` is empty — but if the store already has floors from a prior session it keeps the stale ones (`floors: state.floors && state.floors.length ? state.floors : [...]`), so load is both lossy AND can mix the new plan with old floors.

  Net effect: a 3-storey project saves/exports, and on reload only the storey that happened to be active is present. The other storeys are silently destroyed. This is a data-loss bug, not cosmetic.

  **Minimal, back-compatible fix:**
  1. `types/index.ts` — add optional field to `SavedProject`:
     ```ts
     floors?: { id: string; name: string; height: number; data: FloorPlanData }[];
     activeFloorIndex?: number;
     ```
  2. Save paths — capture floors, parking the live plan into the active slot first. Add a store selector/helper, e.g. in `useStore` expose `getSerializableFloors()` or read `useStore.getState()`:
     ```ts
     const { floors, activeFloorIndex, floorPlan } = useStore.getState();
     const synced = floors.map((f, i) => i === activeFloorIndex && floorPlan ? { ...f, data: floorPlan } : f);
     // include: floors: synced, activeFloorIndex
     ```
     Apply in `buildSavedProject` (SaveLoadPanel:27), `handleQuickSave` (Header:10), and the Ctrl+S path (`DesignMode.tsx:538-542`).
  3. Load paths — after `setFloorPlan(...)`, restore floors when present, else fall back to single-floor seeding (old files):
     ```ts
     if (project.floors?.length) {
       useStore.setState({
         floors: project.floors,
         activeFloorIndex: project.activeFloorIndex ?? 0,
         floorPlan: project.floors[project.activeFloorIndex ?? 0].data,
       });
     } else {
       setFloorPlan(project.floorPlan); // legacy single-floor file
     }
     ```
     Old files (no `floors`) keep working because the field is optional and the fallback re-seeds one storey. The `version` string can stay `'1.0'` since the field is additive/optional.

### B2. Autosave only captures the active storey (same root cause)
- **`src/store/useStore.ts:727-734`** — the autosave subscriber calls `autoSave(state.floorPlan!, state.sceneConfig, state.customTextures)`; `autoSave` (`projectStorage.ts:8`) serializes `{ floorPlan, sceneConfig, customTextures }` with **no floors**. After the B1 fix, autosave/recover will still drop non-active storeys. Extend `autoSave` + `loadAutoSave` to round-trip `floors`/`activeFloorIndex` the same way (optional fields), and have the subscriber pass `state.floors`/`state.activeFloorIndex`.

---

## IMPORTANT

### I1. Switching floors thrashes autosave
- **`src/store/useStore.ts:727-734`** — the subscriber fires on **any** state change, including `setActiveFloor` (234), `renameFloor` (289), `setFloorHeight` (297), `addFloor`, `removeFloor`. Each schedules a 1.5s debounced full-JSON serialize of `floorPlan`. Rapidly clicking between storeys repeatedly resets the timer and, on settle, writes a large `localStorage` blob. It will not lose data, but it is wasteful and—because autosave currently captures only `floorPlan`—switching to floor B then idling will overwrite the autosave with floor B's plan only, compounding B2. Once autosave captures `floors[]`, the thrash is functionally harmless but still does redundant full serializations. Consider gating the subscriber on a structural-change check or only persisting `floorPlan`/`floors` references that actually changed. Low urgency relative to B1/B2.

---

## MINOR

### M1. No declared-vs-implemented store mismatch (verified — no action)
Every action `DesignMode.tsx:36-40` destructures is declared in `AppState` **and** implemented in the store object:

| Member | Declared (AppState) | Implemented (store) |
|---|---|---|
| `floors` | 47 | 226 |
| `activeFloorIndex` | 48 | 227 |
| `addFloor` | 49 | 253 |
| `duplicateActiveFloor` | 50 | 274 |
| `setActiveFloor` | 51 | 234 |
| `renameFloor` | 52 | 289 |
| `setFloorHeight` | 53 | 297 |
| `removeFloor` | 54 | 305 |
| `defaultWallThickness` | 59 | 228 |
| `setDefaultWallThickness` | 60 | 231 |
| `addFreeWall` | 61 | 317 |
| `updateFreeWall` | 62 | 332 |
| `removeFreeWall` | 63 | 343 |
| `selectedFreeWallIndex` | 64 | 229 |
| `setSelectedFreeWallIndex` | 65 | 230 |

`setDefaultWallThickness` (declared/implemented) is not consumed by any component; harmless and not a build error.

### M2. `WallSegment.height` optional spread — type-safe, no exactOptionalPropertyTypes issue
- **`useStore.ts:317-324`** `addFreeWall` conditionally spreads `...(height != null ? { height } : {})`, and **`332-341`** `updateFreeWall` accepts `Partial<{...; height: number}>`. `WallSegment.height` is `height?: number` (`types/index.ts:16`). `tsconfig.json` enables `strict: true` but **does not** set `exactOptionalPropertyTypes` (not part of `strict`), so assigning/omitting the optional `height` is fine. Consumers guard correctly: `Scene3D.tsx:108` (`seg.height ?? 2.7`) and `RoomMesh.tsx:146` (`wall.height ?? height`). OK.

### M3. No unused-import/dead-var build break
- **`tsconfig.json`** has `noUnusedLocals: false` and `noUnusedParameters: false`, so even unused locals would not fail the build. Spot-checked the touched files; the multi-floor/free-wall imports (`uuidv4`, store actions) are all used. No issue.

### M4. `importProjectFromFile` rejects files lacking `version`
- **`projectStorage.ts:121`** requires both `data.floorPlan` and `data.version`. Pre-existing behavior, not introduced here, but worth noting: when you bump the format for floors, keep `version` present (or relax the guard) so the additive `floors?` field stays importable.

---

## Summary of required changes for a correct floors round-trip
1. `types/index.ts` — add optional `floors?` + `activeFloorIndex?` to `SavedProject` (and to the autosave payload shape).
2. Sync active `floorPlan` into `floors[activeFloorIndex]` before serializing in all three save paths: `SaveLoadPanel.buildSavedProject`, `Header.handleQuickSave`, `DesignMode` Ctrl+S.
3. Restore `floors`/`activeFloorIndex` (with single-floor fallback) in all three load paths: import, load project, recover autosave.
4. Extend `autoSave`/`loadAutoSave` and the store subscriber to carry floors.
