# 3D / Walk-Mode Vision — Multi-Storey Floor-Plan Builder

Scope: a 3D specialist's view of the ideal browser GUI/engine for editing **multiple
named floors**, viewing them stacked or side-by-side, and **walking up the stairs** so
the camera rises between storeys. Grounded in the current React + Three.js + Zustand
bundle (`Scene3D.tsx`, `CameraController.tsx`, `RoomMesh.tsx`, `types/index.ts`).

---

## 0. Where the engine is today (the honest baseline)

- **Single active `floorPlan`.** `Scene3D` reads one `floorPlan` from the store and maps
  every room at `(x, 0.002, y)`. There is *no Z (vertical) offset anywhere* — all rooms
  live on one slab. (`PLATFORM_AGENT_SPEC.md` §4.1.)
- **But the data model already has the bones of multi-floor.** `Project.floorPlans:
  FloorPlanData[]` exists in `types/index.ts:112`. The app simply renders one at a time.
  Multi-storey is therefore mostly a *render + camera* problem, not a schema rewrite.
- **Walk mode is a flat-plane FPS.** `FirstPersonCamera` (`CameraController.tsx:174`)
  ends every frame with `camera.position.y = eyeHeight` (1.6 m, hard-pinned). No gravity,
  no floor sampling, no stair climbing. Walking "up" the spiral does nothing — you clip
  through it and stay at 1.6 m.
- **Spiral wraps 360° once** and renders full catalog height regardless of `ceilingHeight`
  (pitfalls P3/P4). Straight stair (`staircase-straight`) exists in the catalog but the
  camera ignores both.
- **Walls are `DoubleSide`, same texture both faces** (P5); furniture has no Y field (P3);
  there is no "world exterior" (P8).

The good news: the geometry is millimetre-accurate. We are adding **vertical structure
and vertical camera motion** on top of a sound 2D-per-floor foundation.

---

## 1. True multi-storey stacking — how to stack the single model

### 1.1 The data move
Promote the existing `Project.floorPlans[]` to first-class **Floors**. Add a thin
`FloorMeta` so each storey knows where it sits vertically:

```ts
interface FloorMeta {
  id: string;
  name: string;            // "Ground", "First", "Basement"
  level: number;           // ordinal: -1, 0, 1, 2 …
  baseElevation: number;   // metres — world Y of this floor's slab
  storeyHeight: number;    // metres — slab-to-slab (e.g. 3.28)
  floorPlan: FloorPlanData;// the existing per-floor rooms (unchanged!)
  visible: boolean;
  ghost: boolean;          // render at low opacity as a tracing aid
}
```

`baseElevation` is *derived* (cumulative sum of storey heights below) but stored so a
mezzanine or split-level can override it. **No `RoomData` field changes** — rooms still
describe a flat rectangle; the floor's `baseElevation` is the only new vertical input.

### 1.2 The render move (minimal, surgical)
Today `Scene3D` does:
```tsx
{floorPlan.rooms.map((room, i) => <RoomMesh room={room} … />)}
```
Wrap each floor's rooms in a `<group position={[0, floor.baseElevation, 0]}>`:
```tsx
{floors.filter(f => f.visible).map(floor => (
  <group key={floor.id} position={[0, floor.baseElevation, 0]}>
    {floor.floorPlan.rooms.map((room,i) =>
      <RoomMesh room={room} roomIndex={i} allRooms={floor.floorPlan.rooms}
                opacity={floor.ghost ? 0.18 : 1} />)}
  </group>
))}
```
That single `group` Y-offset is the *entire* core of true stacking. Every existing wall,
opening, sill-height and furniture coord stays valid because it's now relative to the
floor group. The "tall-room hack" (`ceilingHeight: 6.56`, `sillHeight: 3.0`) from the spec
becomes **unnecessary** — you model each storey at its real 3.28 m and stack them.

### 1.3 Floor-to-floor alignment
Floors share the **same plan origin** (the spec already mandates one datum, §10). A small
"align floors" overlay in 2D (ghost of the floor below) lets the user trace load-bearing
walls so stacks line up. Stairwells get a **void** — a room flagged `isVoid` (or simply a
room with `showFloor:false` and `showCeiling:false`) so you can see/fall through to the
floor below.

---

## 2. Floor visibility, ghosting, and the section/cutaway slider

A right-hand **Floor Stack panel** (like Photoshop layers, vertical):

```
┌─ Floors ───────────────┐
│ ☑ 👁 First    3.28 m  ⋮ │  ← active (editing)
│ ☑ 👁 Ground   3.28 m  ⋮ │
│ �ौ 👻 Basement 2.60 m  ⋮ │  ← ghosted
└─────────────────────────┘
```

- **Per-floor visibility toggle** — eye icon, drives `floor.visible`.
- **"Ghost the floor below"** — auto-mode: when a floor is active for editing, the floor
  directly beneath renders at ~18% opacity (`transparent`, `depthWrite:false`) so the user
  traces walls onto the layout below. One checkbox, hugely useful for stair alignment.
- **Solo / isolate** — alt-click an eye to hide all others.
- **Section / cutaway slider** — a global **horizontal clipping plane** driven by a vertical
  slider on the canvas edge. Three.js: set `renderer.localClippingEnabled = true` and feed
  `material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0,-1,0), cutY)]`. Drag the
  slider and the whole house slices open at height `cutY` — the classic doll's-house section
  for showing the client "here's the first floor sitting on the ground floor." Pair with a
  **per-floor cut** mode (clip just above each floor's `baseElevation + 1.2 m` so you see
  furniture layout from above, like an architect's plan-with-furniture).

---

## 3. First-person walk: gravity + stair climbing

This is the headline request. Replace the hard `camera.position.y = eyeHeight` pin with a
**ground-following controller**.

### 3.1 Floor sampling (the core trick)
Each frame, cast a ray **straight down** from the camera (`origin = cam.xz, y = cam.y +
0.5`, dir `(0,-1,0)`) against a collision set: floor slabs + stair tread colliders. The
first hit's `y` is the surface under the player's feet. Target eye height:

```ts
const hit = raycaster.intersectObjects(walkableColliders, true)[0];
const groundY = hit ? hit.point.y : currentFloorBaseY;
// simple gravity / smoothing so steps don't teleport the eye:
targetEyeY = groundY + eyeHeight;
camera.position.y = THREE.MathUtils.damp(camera.position.y, targetEyeY, 12, dt);
```

That `damp` gives a natural "rise as you climb" feel instead of a snap. Add a max
step-up of ~0.25 m per tick so you can't walk up a vertical wall, and let the camera fall
(gravity) when there's no ground (walking off a landing / into a stairwell void).

### 3.2 Walls as colliders
Currently you can walk through walls. Add cheap **AABB collision**: from each room's
`bounds` + wall thickness, build wall boxes; before committing the XZ move, reject the
component that would enter a solid wall (slide along it). Doorway/window sub-segment gaps
become passable by subtracting their span. This makes the walk-through feel real and stops
the "I walked outside the building into the void" problem.

### 3.3 Straight-stair traversal
A straight stair is a ramp for camera purposes. Give `staircase-straight` an invisible
**ramp collider** (a tilted box from `baseElevation` to `baseElevation + storeyHeight`
over its run). The down-ray hits the ramp; `groundY` rises linearly as the player walks
its length; the damped eye glides up. At the top the ray catches the upper floor slab and
the player is now on the next storey. No special-casing needed — it falls out of §3.1.

### 3.4 Spiral-stair traversal (the hard, characterful one)
The spiral is a 360° helix. Two options:

- **Cheap & robust (ship first): helical ramp collider.** Generate a thin helical
  `tubeGeometry`/swept box matching the spiral's radius, rise (3.0 m) and 360° wrap — the
  *same curve* Patch F uses for the handrail. Make it an invisible walkable collider. The
  down-ray samples it; as the player circles the centre pole their eye spirals upward.
  Add a soft **radial guide**: gently nudge the player's XZ toward the tread radius so
  they don't drift off the open inner/outer edge while turning. Feels like ascending a
  real spiral.
- **Faithful (later): per-tread colliders.** Emit a box collider per tread (15 of them)
  at increasing Y. More accurate footfall, supports "miss a step," but needs the proportional
  tread patch (Patch B) so collider count == visible treads.

Either way, the **top tread must align with the first-floor doorway** (the spec's `atan2`
orientation maths, §5.4) so that stepping off the spiral lands you *through* the upstairs
opening onto the first floor — the exact journey the user wants to walk.

### 3.5 Walk-mode HUD
Small overlay: current floor name ("Ground → First"), a vertical elevation tick, and a
"snap to nearest stair base" key so the user can teleport to a stair foot and just walk up.

---

## 4. Dollhouse view

A dedicated **orbit preset** distinct from free orbit:
- Auto-frames the whole stack, tilts ~35° down, slow auto-rotate optional.
- Honours the **section slider** so you can lop the roof/upper floors and peer in.
- **Exploded mode**: animate each floor group's `baseElevation` apart by +1.5 m (lerp) so
  the storeys float separated — the money shot for explaining a multi-storey scheme. One
  slider drives "explode amount" 0→1.
- **Floor-focus**: click a floor in the stack panel → camera dollies to a clean top-down-ish
  view of just that storey with the others ghosted.

## 5. Side-by-side editing

The user explicitly wants floors editable next to each other. Two complementary modes:

- **Stacked (default 3D)** — true Z-offset, as §1.
- **Spread / contact-sheet** — lay the floor plans out on the *ground plane* side by side
  (translate each floor group in X by `index * (planWidth + gap)`, all at Y≈0). Lets the
  user compare ground vs. first at a glance and edit either. A toggle swaps Stacked ⇄ Spread
  with a smooth lerp so spatial continuity is preserved.
- In **2D Design** mode: a floor tab-bar at the top ("Ground | First | Basement | +"), plus
  the ghost-below underlay so you draw the first floor *over* a faint ground floor.

---

## 6. Day/night + sun position for the NE-facing rear

Today `Scene3D` hard-codes `<Sky sunPosition={[5,1,8]}>` and a binary `isNightMode`. For a
real Kensington rear courtyard that faces **north-east**, the sun barely reaches it — morning
glance only, shade by midday. Make this honest:

- **Geo-aware sun**: expose **time-of-day** and **date** sliders; compute the sun vector from
  latitude (51.50° N, London) + orientation. The model's `+y`=south datum (spec §10) means we
  know which way is north — drive `directionalLight.position` and `Sky sunPosition` from a real
  solar-position calc. The NE rear then correctly gets low golden morning light and falls into
  cool ambient shade later — exactly what sells the "is this courtyard gloomy?" question.
- **Sky + exposure**: keep `ACESFilmicToneMapping`; tie `toneMappingExposure` and the `Sky`
  turbidity/rayleigh to time-of-day (overcast-London preset = high turbidity, low sun).
- **Night/dusk**: the spec already has a dusk `sceneConfig` (warm lanterns, `#3a4a66` sky).
  Promote that to a **time slider keyframe** rather than a boolean, and switch the two
  courtyard `pointLights` (the wall lanterns) on automatically below a sun-altitude threshold.
- **Soft shadows**: raise the directional light's shadow map and add a small PCF/area term so
  cast-iron and brick get believable contact shadows instead of hard edges.

## 7. Materials that read well (brick / stone / cast-iron)

The renderer's flat tiled textures (P5, spec §4.8) are the user's #1 complaint. Within
real-time we can close most of the gap *before* falling back to Stage B:

- **PBR upgrade**: give every texture a **normal + roughness (+ AO) map**, not just albedo.
  London-stock brick with a normal map gains mortar-joint relief under raking morning light —
  the single biggest perceived-quality jump for the least cost.
- **Brick**: normal-mapped, low metalness, high roughness; subtle albedo variation map so it
  doesn't obviously tile. Add the painted-white lower band via a **vertical material split**
  (two stacked sub-walls or a blended mask in the shader) rather than the "pick one" compromise
  the spec currently forces (§9.1).
- **York stone paving**: a real stone normal/roughness map (Patch G slot already exists for the
  albedo) — irregular slabs read far better with relief + roughness breakup than flat `concrete`.
- **Cast iron** (spiral, downpipe, lanterns): `metalness ≈ 0.6–0.8`, `roughness ≈ 0.35`, dark
  near-black albedo, and crucially **a proper environment map** (we already mount `<Environment>`)
  so the metal picks up sky/sun reflections — that specular life is what makes cast iron *look*
  like cast iron. Add the handrail tube (Patch F) so the silhouette reads as Victorian ironwork.
- **Glazing**: sash/door glass as a low-roughness, slightly transmissive material with an env
  reflection rather than a flat blue panel.

These get the in-app render from "very very weak" to "clearly a good proxy" — and make the
*screenshot we hand to Stage B* far more useful as a composition lock.

## 8. Clean bridge to photoreal (export camera + scene → image-gen brief)

The spec's Stage-B "Photoreal Brief" is currently hand-written. The 3D engine can **generate
it** from the live scene, which guarantees the dimensions and the *exact framing* match:

- **"Capture view" button** in 3D/walk mode. It records:
  - Camera pose (position, target, FOV) → a one-line human description + a rendered **viewport
    PNG** (the geometry screenshot) as the composition reference image.
  - From the current floor stack: auto-fill **LOCKED DIMENSIONS** (envelope, storey heights,
    every opening's width/height/sill, spiral treads×rise) straight from the JSON — no manual
    transcription, no drift.
  - From `sceneConfig` + the sun calc: **LIGHTING** (time of day, sun altitude/azimuth, "NE
    rear in morning light / afternoon shade").
  - Materials list from each room's texture IDs mapped through the §9.1 palette table.
- **Output**: the §12 Markdown brief, pre-filled, plus the screenshot, ready to paste into
  ChatGPT-image / Midjourney / SDXL. The screenshot doubles as an img2img/ControlNet structure
  reference so the photoreal model keeps the proportions.
- This makes the two-stage pipeline a **one-click** flow: frame it in the walk-through →
  Capture → paste. The geometry app becomes the *art director* for the image gen.

---

## 9. PRIORITISED BUILD ORDER

Ordered by (value to the user) × (1 / engine churn). Each step is shippable on its own.

**P0 — Multi-storey stacking (data + render).**
- Promote `Project.floorPlans[]` → `FloorMeta[]` with `baseElevation` / `storeyHeight`.
- Wrap each floor's rooms in `<group position={[0, baseElevation, 0]}>` in `Scene3D`.
- *Engine change: ~1 store refactor + 1 group wrapper.* Unlocks everything else; retires the
  "tall-room / high-sill" hack.

**P1 — Floor Stack panel: visibility + ghost-below + floor tabs in 2D.**
- Per-floor eye toggle, opacity-driven ghost of the floor below, 2D floor tab-bar + underlay.
- *Engine change: UI panel + an `opacity` prop threaded into `RoomMesh` materials.*

**P2 — Walk mode gets gravity + floor-following + straight-stair climb.**
- Replace the `camera.position.y = eyeHeight` pin with the down-ray floor sampler + damped
  eye height (§3.1). Add straight-stair ramp colliders (§3.3).
- *Engine change: rewrite the `useFrame` body in `FirstPersonCamera` + add an invisible
  walkable-collider set.* This is the single feature the user asked for most.

**P3 — Spiral-stair traversal (helical ramp collider) + top-tread doorway alignment.**
- Reuse the Patch-F helix curve as a walkable collider; soft radial guide; verify the top
  lands at the first-floor opening. *Engine change: one collider mesh + reuse existing maths.*

**P4 — Section/cutaway slider + dollhouse/exploded view.**
- `localClippingEnabled` + a clip plane bound to a slider; orbit presets; exploded-floors lerp.
- *Engine change: clipping-plane plumbing into materials + a couple of camera presets.*

**P5 — Wall AABB collision in walk mode.**
- Stops walking through walls / into the void; slide-along response. *Engine change: build
  wall boxes from `bounds`+thickness, test before committing XZ move.*

**P6 — Material PBR upgrade (normal/roughness/env on brick, stone, cast iron, glass).**
- Biggest in-app visual-fidelity jump. *Engine change: extend `TextureInfo` with normal/rough
  map URLs; set metalness/roughness/envMap on the relevant materials.*

**P7 — Geo-aware sun + time-of-day slider (NE-rear lighting honesty).**
- Solar-position calc → directional light + `Sky`; auto-lantern at dusk. *Engine change:
  replace hard-coded `sunPosition` + boolean night with a time→sun function.*

**P8 — One-click "Capture view → Photoreal Brief + screenshot".**
- Auto-fill the §12 brief from live scene + camera + sun; export viewport PNG. *Engine change:
  a serializer over the floor stack + a `gl.domElement.toDataURL()` capture.*

### Minimal engine-change summary
1. `FloorMeta[]` in the store + a Y-offset `<group>` per floor in `Scene3D` (P0).
2. An `opacity` prop on `RoomMesh` materials (P1, P4 ghosting/clipping reuse it).
3. Rewrite of `FirstPersonCamera`'s `useFrame` to a ray-sampled, damped, gravity-aware
   controller + a shared **walkable-collider** set (slabs, ramps, helix) and a **wall-AABB**
   set (P2/P3/P5). This one file is the heart of the whole "walk upstairs" feature.
4. Clipping-plane + camera presets (P4); `TextureInfo` PBR map fields (P6); sun function (P7);
   scene→brief serializer + PNG capture (P8).

Nothing here requires touching the JSON schema beyond the additive `FloorMeta`/`baseElevation`
layer — existing single-floor projects keep loading, just as `level:0, baseElevation:0`.
