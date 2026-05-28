# GUI Vision — Flat 1, 20 Hornton Street

Scope: exactly the GUI capabilities Craig needs to model THIS building (a
2-storey Victorian flat in Kensington) accurately enough to produce a
believable before/after. Nothing more. Every capability below is mapped to a
specific feature of this dwelling and checked against what the current
code can and cannot do.

Grounded in the actual codebase:
- `src/types/index.ts` — `SavedProject` holds ONE `floorPlan` with ONE flat
  `rooms[]` list. No floors/storeys, no variants.
- `src/store/useStore.ts` — single `floorPlan`, no floor switcher, no
  existing/proposed concept, no "demised" flag, no day/night-of-variant.
- `src/components/RoomMesh.tsx:143` — EVERY wall in a room renders at the
  room's single `ceilingHeight`. Floor at `y=0.002`, ceiling at `y=height`.
  There is no per-wall height (the `WallSegment.height?` field is read but
  never applied), no floor stacking, no partial-height walls, no sloped
  walls. Rooms are axis-aligned rectangles (`makeRoomWalls`); the only
  non-rectangular escape hatch is `updateWallVertex` (drag a corner) which
  keeps 4 walls but lets them go non-orthogonal.
- `src/components/DesignMode.tsx` — 2D editor. No floor/level/storey,
  no before/after, no demise concepts anywhere.
- `src/utils/furnitureCatalog.ts` — `staircase-spiral` default 2.7 m tall,
  footprint-only scaling; `bathtub` 1.7×0.75×0.55 exists. No washing
  machine, no Crittall/steel door primitive (door `style` has `metal-steel`
  / `metal-black` though).

---

## The building, feature by feature — and what the model must represent

### The two named floors with real heights
- GROUND FLOOR (`shared image (19).jpg`): 4.34 × 13.77 m. Front lounge +
  fireplace (3.28 m), rear reception (3.28 m), rear wet room, front
  lightwell, rear lightwell LEFT + kitchen RIGHT. A low band reads 2.45 m.
- BASEMENT / LOWER GROUND (`shared image (18).jpg`): 5.70 × 19.06 m
  (narrows to 4.34 at rear). Under-pavement vaults + WC, front patio,
  front room, mid bathroom band with bath, rear room, rear PATIO/lightwell.
  Heights vary: 2.82 / 2.76 / 1.89 m (vaults are LOW — 1.89 m).

  WHAT THE MODEL MUST DO: hold BOTH floors as distinct, separately
  editable, separately viewable sets of rooms, each room carrying its own
  ceiling height. Multiple distinct heights per floor (2.82 vs 1.89 in the
  basement; 3.28 vs 2.45 on GF) are already supported via per-room
  `ceilingHeight` — GOOD. But there is no "floor" container, so the two
  floors currently collapse into one flat list at `y=0` and overlap on top
  of each other in plan and in 3D. THIS IS THE #1 GAP.

### The OPEN rear lightwell (no ceiling, spiral spanning both floors)
- The rear lightwell is OPEN to sky (wood-decked floor), and the reclaimed
  cast-iron SPIRAL staircase sits in it, climbing from basement deck up to
  the GF landing — a single object visible from BOTH storeys.

  WHAT THE MODEL MUST DO:
  - A room with NO ceiling: supported today via `showCeiling: false`. GOOD.
  - A vertical void open across the basement AND ground floor: NOT
    supported. With per-floor stacking (gap #1) the lightwell would become
    two separate rooms at two different datums with a roof implied between.
    The renderer has no vertical-void / double-height concept once floors
    are stacked. The current ONLY workaround (per the platform spec §4.1)
    is to model the whole open well as ONE tall room with
    `ceilingHeight ≈ 2×storey` and put the upper-floor opening as a
    high-`sillHeight` window — i.e. you CANNOT have stacked floors AND a
    shared open void at the same time without a dedicated feature.
  - The spiral as a both-floors object: `FurnitureItem` lives in exactly
    one room and renders the full catalog height at that room's `y=0`. It
    cannot "belong to two floors." Needs either a tall single-void room
    (loses floor separation) or a new "spans-floors" object flag.

### Under-pavement vaults (low, front of basement)
- Two vaults, one ~3150 wide, ~2.0–2.28 m deep; WC in/near; "TO TANK"
  drainage. Ceiling LOW (1.89 m), under the pavement.

  WHAT THE MODEL MUST DO: separate low-ceiling rectangular rooms — fully
  representable as basement rooms with `ceilingHeight: 1.89`. GOOD, once
  they live on the basement floor. No special feature needed beyond the
  floor container and accurate height entry.

### Communal stair OUTSIDE the demise
- The existing communal staircase is OUTSIDE Flat 1's legal demise but must
  be drawn (it abuts and is referenced on the planning sheets).

  WHAT THE MODEL MUST DO: draw a room/object but FLAG it as not-demised so
  it (a) renders for context, (b) is visually distinguished (e.g. hatched /
  greyed / dashed), and (c) is excluded from area totals. The 2D editor
  currently sums ALL rooms into the `m²` readout (`DesignMode.tsx:444`)
  with no exclusion. There is NO not-demised flag today. GAP.

### The Crittall door (1245 × 2450) + the new internal opening
- New internal opening between the two reception rooms: clear 1350 × 2950,
  retained nibs L=700 / R=600. A Crittall steel-framed door 1245 × 2450.

  WHAT THE MODEL MUST DO: an opening of a precise width/height on a SHARED
  wall, with retained nibs (solid wall either side). Doors support exact
  `width`/`height` and `style: 'metal-steel'`/`'metal-black'` (reads as
  Crittall-ish). Nibs are handled by positioning the door so solid wall
  remains either side, or via `subSegments`. Largely supported — the gap is
  GUI ergonomics: entering exact mm and seeing the nib widths, not the
  schema. Acceptable today; nicer with numeric opening entry.

### The ground-floor shower/BATH room
- Rear GF wet room: SHOWER + BASIN + BATH + WASH MACHINE, ~2500 run, with a
  basement bathroom band ALSO containing bath/WC (two bathrooms total).

  WHAT THE MODEL MUST DO: place a `bathtub` (exists, 1.7×0.75), shower,
  basin, toilet (exist). Washing machine has NO primitive — proxy with
  `dishwasher`. Bath placement is supported. GOOD enough; washing-machine
  proxy is acceptable.

### Existing-vs-proposed toggle (before / after)
- The whole deliverable is a believable BEFORE and AFTER. Proposed adds:
  spiral, Crittall door, new reception opening, GF wet room, reinstated
  spiral-landing opening.

  WHAT THE MODEL MUST DO: hold an EXISTING state and a PROPOSED state of the
  SAME plan, on the SAME datum, and switch between them in one click. Today
  there is NO variant concept; the workaround is two separate exported JSON
  files imported as two projects (platform spec §11) — clumsy, error-prone
  (the two can drift), and can't be visually diffed. GAP.

---

## What the current rectangular-rooms model CANNOT represent (flag list)

1. TWO STACKED FLOORS. Single flat `rooms[]` at `y=0`. Basement and GF
   overlap. No floor container, no per-floor datum, no floor switcher.
   (Blocker for everything.)
2. OPEN VERTICAL VOID ACROSS 2 STOREYS (the lightwell with the spiral).
   Mutually exclusive with stacked floors in the current model; only the
   "one tall room" hack exists, which sacrifices floor separation.
3. SPIRAL AS A BOTH-FLOORS OBJECT. Furniture is single-room, single-datum,
   fixed catalog height. Cannot legitimately span basement→GF.
4. NOT-DEMISED ANNOTATION. No flag to mark the communal stair as outside
   the demise; it would wrongly count toward floor area and look identical
   to demised rooms.
5. PARTIAL / VARYING WALL HEIGHTS WITHIN A ROOM. Every wall uses the room's
   single `ceilingHeight` (`RoomMesh.tsx:143`); `WallSegment.height?` is
   ignored. Cannot model a low vault lip, a half-height parapet to the
   lightwell, or a stepped soffit.
6. ANGLED / IRREGULAR PERIMETER WALLS. The basement "narrows 5.70→4.34"
   implies a non-orthogonal jog. Only the 4-corner `updateWallVertex` drag
   exists; truly irregular (5+ sided) outlines must be faked as adjoining
   rectangles.
7. EXISTING vs PROPOSED in one project. No variant toggle; two-file
   workaround only.
8. (Cosmetic, known) single-material double-sided walls, no exterior
   finish, schematic textures — accepted; the photoreal Stage B closes it.

---

## PRIORITISED MUST-HAVE GUI FEATURES (5–7), with minimum acceptable build

Without these, Craig cannot model Hornton St. Ordered by blocking severity.

### 1. Floor / storey container with a floor switcher  [HARD BLOCKER]
WHY: two named floors (Basement 5.70×19.06, GF 4.34×13.77) with different
heights must coexist without overlapping.
MIN ACCEPTABLE: add a `floors[]` level above `rooms[]` (each floor = name,
base elevation, default height, its own `rooms[]`). A dropdown/tab in the
header to pick the active floor; only the active floor is editable in 2D;
3D stacks floors at their base elevations (GF base = basement height). Area
readout per-floor. No need for inter-floor copy or alignment helpers.

### 2. Existing / Proposed variant toggle  [HARD BLOCKER for the deliverable]
WHY: the entire job is a before/after of the SAME plan on the SAME datum.
MIN ACCEPTABLE: each project holds two named states ("Existing",
"Proposed") sharing one coordinate datum; a single toggle switches which is
shown/edited. Minimum implementation = duplicate the floorPlan into two
slots with a switch; "start Proposed from a copy of Existing" button so
they don't drift. No live overlay/diff required (nice-to-have).

### 3. Two-storey open void / double-height room across floors  [BLOCKER for the lightwell + spiral]
WHY: the rear lightwell is open to sky and the spiral climbs through both
storeys as one object.
MIN ACCEPTABLE: let a room be flagged `openToBelow` / `voidHeight` so it
renders with no floor/ceiling between the two storeys, AND let a single
furniture item (the spiral) be anchored to that void and render its full
true height (3.0 m) spanning the basement deck up to the GF landing. The
absolute minimum: a per-room "double-height (sky)" flag that suppresses the
intervening slab + ceiling and a spiral whose height = its real rise.

### 4. Per-room exact ceiling-height entry, incl. low values  [SOFT BLOCKER — already mostly there]
WHY: heights 3.28 / 2.45 GF and 2.82 / 2.76 / 1.89 basement (vaults LOW)
are load-bearing for believability.
MIN ACCEPTABLE: numeric height field per room accepting values down to
~1.8 m, surfaced clearly in the room inspector (it exists as
`updateRoomHeight`; just ensure the GUI lets you type 1.89 and 2.45 and
that low rooms render correctly). No new geometry needed.

### 5. "Not demised" room flag + visual distinction + area exclusion  [REQUIRED for the communal stair]
WHY: the communal stair must be drawn for context but is OUTSIDE Flat 1's
demise.
MIN ACCEPTABLE: a boolean `demised` (default true) on a room; not-demised
rooms render with a distinct style (greyed/hatched or dashed outline) and
are EXCLUDED from the area total. A simple checkbox in the room inspector +
a hatch fill in 2D + exclusion from the `m²` sum is enough.

### 6. Spiral staircase at its true rise + landing alignment  [REQUIRED for the headline feature]
WHY: reclaimed cast-iron spiral, 15 treads × 200 mm = 3000 mm, must land at
the reinstated GF doorway/landing.
MIN ACCEPTABLE: spiral catalog height settable to 3.0 m (Patch A in the
platform spec) and a rotation control so the top tread lines up with the
landing opening. Tread count proportional to height is a nice-to-have. The
bare minimum is height = real rise + manual rotation.

### 7. Exact-mm opening editor for the Crittall door + reception opening  [REQUIRED, low effort]
WHY: Crittall 1245×2450; new opening 1350×2950 with retained nibs 700/600.
MIN ACCEPTABLE: numeric width/height (in mm or m) for doors/openings on a
shared wall, a `metal-black`/`metal-steel` style for the Crittall look, and
a readout of remaining solid wall (nib) widths so Craig can verify 700/600.
The schema already supports the geometry; this is a GUI-entry + feedback
feature, not a renderer change.

---

NOT in scope (deliberately excluded so we don't gold-plate): photoreal
materials (handled by external Stage B image-gen), true two-sided exterior
finishes, drainpipe/handrail/cornice primitives, washing-machine model
(dishwasher proxy is fine), curved/arched geometry (red-brick flat arch is
a Stage-B render concern), and any sheet beyond the basement + ground floor.
