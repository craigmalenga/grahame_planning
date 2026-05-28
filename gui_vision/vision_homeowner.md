# The Ideal Browser GUI for a DIY Floor-Plan Builder
## Designed from the lens of a non-technical homeowner who wants to "build it myself"

**Audience:** Craig (non-architect), self-building the 20 Hornton Street plan.
**Premise:** Craig is done fighting auto-generation from sketches. He wants to
*place every wall himself*, see real centimetres as he drags, type exact
numbers when he knows them, and fix mistakes without fear. The app should feel
like sketching with a confident ruler — not operating CAD.

This document is grounded in the actual codebase
(`src/components/DesignMode.tsx`, `src/store/useStore.ts`, `src/types/index.ts`).
Where the current app already half-supports something, that is flagged so the
build is realistic, not fantasy.

---

## 0. The single most important mindset shift

The current app is **room-centric**: you drag a *rectangle* and it becomes a
4-walled room (`addRoom` → `makeRoomWalls`). Craig is asking for a
**wall-centric** tool: draw *one wall at a time*, including angled walls, and
let rooms emerge from walls that meet.

The store already anticipates this — `FloorPlanData.wallSegments` exists, and
`addFreeWall / updateFreeWall / removeFreeWall / defaultWallThickness` are
*declared* in the `AppState` interface (useStore.ts lines 43–51) but **not
implemented**. So the foundation is half-laid. The vision below builds the
wall-centric tool as the primary creation flow, with rooms as a convenience
that auto-forms when walls enclose a space.

---

## 1. Onboarding — the first 60 seconds

A non-technical homeowner must reach "I drew a wall and it told me it was 320
cm" within one minute, with zero documentation.

**Behaviours:**
- **Start screen, three big cards, plain English:** "Start a blank plan",
  "Open a saved plan", "Trace over a photo/PDF". No "Import JSON" as the
  primary verb — that is the developer's path, kept in a secondary menu.
- **Blank plan opens straight into Draw-Walls mode** with the Wall tool
  pre-selected (not Select). The empty canvas shows a faint grid and one line
  of ghost text in the middle: *"Click once to start a wall. Move the mouse —
  the length shows live. Click again to finish."* The hint fades on first
  successful wall.
- **Units chosen once, up front:** a small toggle "cm / m / ft-in", defaulting
  to **cm** because Craig thinks and measures in cm (the brief, the emails, the
  questionnaire all use cm/mm). Everything on screen then speaks cm.
- **A worked "first wall" coach-mark:** the very first drag shows an oversized
  dimension pill and a tooltip "Type a number any time to set the exact length,
  then Enter." Dismissable, never shown again.
- **No mode jargon.** The toolbar reads "Draw walls", "Add door", "Add window",
  "Floors", "3D view" — verbs a homeowner uses, not "Segment / Sub-segment /
  Vertex".

---

## 2. Drawing walls by dragging — the core interaction

This is the feature Craig spent hours wanting. It must be flawless.

### 2.1 The basic gesture
- **Click to drop the start point. Move. Click to drop the end.** (Click-click,
  not press-drag-release — click-click is far steadier for long walls and for
  trackpads/touch, and lets the mouse leave the canvas mid-wall.)
  Press-drag-release should *also* work for people who expect it; detect which
  the user did and accept both.
- **Chained drawing:** after finishing a wall, the end point becomes the next
  wall's start automatically, so Craig walks the perimeter wall-by-wall without
  re-clicking each corner. **Esc** or **double-click** ends the chain.
- **Right side of the cursor shows a live readout the whole time** (see 2.2).

### 2.2 Live dimensions on screen as he drags — *the headline request*
While a wall is being rubber-banded, draw a **dimension pill that tracks the
cursor**, showing:
- **Length in cm**, big and bold: `320 cm` (updates every mouse-move; round to
  the nearest cm, never show `319.7`).
- **Angle**, smaller, below it: `30°` (measured from horizontal, or from the
  previous wall when chaining — show both: `30° from level · 90° from last
  wall`).
- A faint **running total** if mid-chain: `perimeter so far 11.4 m`.

The current code already proves this is easy: `DesignMode.tsx` lines 357–380
render per-wall length pills with a white background "pill"; the room-draw
preview (lines 408–414) already shows a `WxH` label live. Re-use that exact
rendering for the single-wall live readout, but format in cm and add the angle.

The pill must **never sit under the cursor** — offset it up-and-right so the
wall end is always visible. As the wall crosses vertical/horizontal it should
not flicker between `0°/90°` and `360°/−90°`; normalise.

### 2.3 Typing an exact length (keyboard entry)
A homeowner with a tape measure knows "that wall is 412 cm." He should not have
to drag to a pixel.
- **While dragging, just start typing digits.** A small input appears inline in
  the dimension pill: `[412] cm`. The wall's *direction* stays locked to the
  current cursor angle, but its *length* snaps to the typed value. **Enter**
  commits; the next wall starts from there.
- **Tab toggles which field you are typing:** length ↔ angle. So Craig can type
  `412` Tab `30` Enter to place a 412 cm wall at exactly 30°. This is the single
  biggest "feels like a pro tool" win and is cheap to build.
- **Backspace/Esc** while typing cancels just the number, not the wall.

### 2.4 Snapping that helps, never fights
Snapping must be *suggestive and visible*, with an obvious override.
- **Endpoint snap (highest priority):** when the cursor nears an existing wall
  end or corner, show a solid dot and snap to it, so walls actually *join*.
  Joining is what makes rooms close and 3D render correctly.
- **Wall/edge snap:** snap onto an existing wall line (to start a partition off
  a wall) — show a small "T" glyph.
- **Grid snap:** the existing 0.25 m grid (`SNAP = 0.25`) is a sensible default
  but **too coarse for cm-accurate work** — make it **5 cm** by default with a
  menu for 1/5/10/25 cm, and surface it as "Snap: 5 cm ▾" in the status bar.
- **Ortho lock (hold Shift):** constrains the wall to 0/90/180/270°. Show a faint
  horizontal/vertical guide and change the angle readout to `90° (locked)`.
- **Angle lock (hold Shift after typing an angle, or a 15° "magnet"):** when
  near 15°/30°/45°/60° the angle gently snaps and the readout turns blue to say
  "I snapped you to 45°". This is how Craig draws *deliberate* angled walls (the
  courtyard L, splayed bays) without protractor maths.
- **Alignment guides** already exist (`findAlignmentGuides`, drawn at lines
  424–440) — extend them so a new wall end shows a dashed extension line when it
  lines up with another wall's end ("this wall is exactly as long as that one").
- **One toggle to kill all snapping** (hold **Alt**, or a status-bar switch) for
  the rare case where the homeowner wants a truly freehand point.

### 2.5 Closing a loop into a room
When a chain of walls returns to its start point (endpoint snap fires on the
first point), **offer to close it into a room**: the enclosed area flashes a
soft fill and a toast appears — "Closed shape — name this room?" with an inline
text field defaulting to "Room 1". This bridges Craig's wall-by-wall mental
model to the app's room-centric data model (`addRoom`) without him ever learning
the word "bounds".

---

## 3. Editing a wall after the fact

Craig asked specifically for **right-click to edit length / height**, and
**right-click to set thickness**.

### 3.1 Right-click context menu (new)
Today, right-click on a wall only toggles a gap (`onContextMenu`, lines
900–922). Replace that with a proper **context menu** anchored at the cursor:

```
┌──────────────────────────────┐
│  Wall  (320 cm · 30°)         │
├──────────────────────────────┤
│  Length…            320 cm    │  ← click → inline number field
│  Height…            656 cm    │  ← per-wall override of floor default
│  Thickness…          22 cm    │  ← per-wall override of project default
│  Angle…              30°       │
│  ──────────────                │
│  Add door / window on this wall│
│  Make a gap (opening)          │
│  Split into two walls          │
│  Delete wall                   │
└──────────────────────────────┘
```

- Each "…" row opens an **inline numeric field in cm** (not a slider). Sliders
  (current door/window/height editors, lines 1104–1213) are fine for fuzzy
  values but **wrong for a planning application** where Craig knows the exact
  number. Provide a number field with the slider as an optional fine-tune.
- **Length edit** keeps the wall's start fixed and moves its end along the
  current angle (with a "from which end?" toggle if he wants the centre fixed).
- **Height** writes `WallSegment.height` (already in the schema, line 16) — the
  per-wall override. If left blank it inherits the floor's default height.
- **Thickness** writes `WallSegment.thickness` (line 15). Default comes from the
  project-level `defaultWallThickness` (already declared in the store).

### 3.2 Direct-manipulation editing (drag)
- **Drag an endpoint** to re-angle/lengthen a wall — already works for room
  walls via orange vertex handles (`updateWallVertex`, drawn lines 384–392).
  Generalise it to free walls. While dragging, the **same live cm pill** from
  §2.2 appears, so editing feels identical to drawing.
- **Drag the middle of a wall** to move the whole wall (keeping its length),
  with connected walls stretching to stay joined.
- **Selected wall always shows its length pill** (already true for selected
  rooms, lines 356–381) plus small grab handles at both ends and the midpoint.

### 3.3 Sensible defaults, overridable everywhere
- **Wall thickness:** default **12 cm** internal / **22 cm** external is too
  clever for a homeowner; ship one default (say **15 cm**, the current
  `makeRoomWalls` value) shown as "Default wall thickness: 15 cm ▾" in a project
  settings strip, overridable per-wall on right-click. Hornton St's walls are
  22–30 cm, so the default must be trivially changeable.
- **Wall height:** see §4 — comes from the floor's default, override per-wall.

---

## 4. Multi-floor support — "add and name different floors"

Craig explicitly asked for **a button to add/name floors** and **a default
floor height set once, overridable per wall**. The current app has *no* floor
concept (`ViewMode` is only `upload | design | 3d-view`; everything renders at
`y = 0.002`). This is the biggest genuine gap.

### 4.1 The Floors model (homeowner-facing)
- A **Floors panel** (left edge, vertical, like building-lift buttons):
  ```
  [ + Add floor ]
  ───────────────
  ▣ First floor      ← active (highlighted)
  ▢ Ground floor
  ▢ Basement
  ```
- **"+ Add floor"** prompts for a name ("Ground floor", "Loft") and a **default
  ceiling height for that floor** (pre-filled from the project default, e.g.
  **328 cm** for Hornton St). Per the brief: *"set a default floor height,
  override per-wall."* The floor's default fills every new wall's height; the
  right-click Height field overrides any single wall.
- **Click a floor to switch to it.** The canvas shows that floor's walls solid
  and the floor *below* as a faint grey "tracing" underlay, so Craig can stack
  the upstairs walls over the downstairs ones — exactly how a real plan set is
  drawn. Toggle the underlay on/off.
- **Reorder / rename / delete** floors by drag or right-click on the floor chip.

### 4.2 How this maps to the engine (honest constraint)
The renderer is single-storey (spec §4.1): it fakes multiple storeys with one
tall room (`ceilingHeight = 6.56`) and high-sill windows. The Floors GUI should
**author each floor as a clean separate plan** and, on export/3D, offer:
- **"View this floor flat"** (default, geometrically honest), and
- **"Stack for walkthrough"** — auto-generates the tall-room + high-sill-window
  trick the spec describes, so Craig can still walk the 2-storey courtyard.
Craig never sees the hack; he sees "Ground" and "First" and a working 3D.

This is the one area where the vision needs engine work beyond the 2D editor —
flag it clearly for scoping.

---

## 5. Undo, mistakes, and forgiveness

A homeowner *will* make mistakes and must never feel punished.
- **Undo/Redo already exist** (Ctrl+Z / Ctrl+Shift+Z, 50-step history in the
  store) — keep, but add **big visible Undo/Redo buttons** (already in the
  toolbar) with a hover preview of *what* will be undone (the history entries
  already carry a `label` like "Add room", "Split wall" — surface it: "Undo:
  Add wall").
- **Auto-save is already on** (1.5 s debounce to localStorage) — show a quiet
  "All changes saved ✓" so Craig trusts he can close the tab.
- **Delete is reversible** and confirmation-free for single items (Undo covers
  it); only "Delete floor" or "Delete room with N items" asks "Are you sure?"
- **No dead-ends:** if a wall doesn't quite join (gap of a few cm), show an
  amber dot at the open end and a one-click "Join these ends?" fix-it chip,
  rather than silently producing a room that won't render. (This directly
  prevents the spec's "walls don't match bounds" load failure, §11.)
- **A persistent "Problems" tray** (collapsible, bottom): plain-English warnings
  like "First-floor bathroom wall is only 8 cm thick — unusual" or "This shape
  isn't closed yet." Never blocks; just nudges.

---

## 6. Mobile / iPad use

Grahame fills the questionnaire on his iPhone; Craig iterates fast and may sketch
on an iPad on-site. The current canvas is **mouse-only** (`onMouseDown/Move/Up`,
`onWheel`) — touch is unhandled. For a builder standing in the actual room with
a tape measure, iPad drawing is a killer feature.

**Behaviours:**
- **Tap-tap to draw** (the click-click model maps perfectly to touch). The live
  cm pill sits *above the finger* so it isn't hidden.
- **Type-the-length is even more important on touch** (dragging to a pixel is
  hopeless on glass): tapping the pill opens the numeric keypad; he taps a
  direction roughly, types `412`, done.
- **Two-finger pan, pinch-zoom** (replace `onWheel`); **long-press = right-click**
  context menu.
- **Big touch targets:** endpoint handles ≥ 44 px; the current 5 px orange dots
  (line 391) are unusable on touch — scale handles with a min hit area.
- **On-site mode:** a large, glanceable cm readout and a "lay the next wall"
  button, so Craig can measure a wall, type it, and move on while holding the
  phone in one hand.

---

## 7. The "feels effortless" details

These are the small things that separate a tool a homeowner *abandons* from one
he *finishes a planning application with*.

- **Everything speaks his units.** cm everywhere, with the m and ft-in available
  but never forced. `412 cm`, not `4.12 m` or `4.117`.
- **The number you typed is the number you get.** No silent rounding drift. If he
  types 412, the wall is 412, and the right-click panel later still says 412.
- **Live feedback is instant and legible.** White-pill-on-canvas labels (already
  the app's style) with enough contrast to read on a busy plan.
- **Hover before you commit.** Hovering a tool shows a ghost preview; hovering a
  wall highlights it and shows its length without selecting.
- **Smart defaults pre-filled, never blank.** New door = 90 cm × 210 cm; new
  window = 120 cm wide, 90 cm sill (these are the current code defaults, lines
  639–641) — good; just show them as editable cm numbers, not hidden.
- **Names suggest themselves.** Close a loop → "Room 1"; but offer a one-tap
  list ("Kitchen, Lounge, Bath, Bed, Courtyard…") so Craig labels for the
  planning officer in a second.
- **The 3D is one click away and round-trips.** "View 3D" already exists
  (line 944). After viewing, "Back to drawing" returns to the *same* floor and
  zoom, so checking work in 3D doesn't lose his place.
- **Copy/mirror.** Duplicate a room/floor (Ctrl+D exists for rooms) and
  **mirror** it — terraced flats are near-symmetric, so "mirror this floor" can
  halve the work.
- **A ruler/measure tool** that doesn't draw anything — just click two points to
  read the distance, for checking against the survey PDF.
- **Print/screenshot the plan** with dimensions, for sticking on the fridge or
  emailing Grahame.

---

## 8. PRIORITISED MVP — the 5 features to build first

So Craig can self-build the Hornton St plan, in dependency order:

1. **Single-wall draw tool with live cm + angle readout.** Click-to-start /
   move / click-to-finish, chained, with the dimension pill (length in cm, angle
   below) tracking the cursor live. *Implement the stubbed `addFreeWall` and add
   a `wall` tool to `DesignMode`; re-use the existing length-pill rendering.*
   This is the literal headline ask.

2. **Type-exact length + angle while drawing** (keyboard entry, Tab to switch
   field, Enter to commit) **plus Shift = ortho lock and 15° angle magnets.**
   This is what makes angled walls *accurate*, not approximate — essential for a
   planning submission.

3. **Right-click wall editor** with inline cm fields for **Length, Height,
   Thickness, Angle**, plus Delete/Split. *Replace the current gap-only
   `onContextMenu` with a real context menu; wire to `WallSegment.height`,
   `.thickness`, and `updateFreeWall`/`updateWallVertex`.* Covers the explicit
   "edit after via right-click" and "set thickness in cm, override on
   right-click" asks.

4. **Floors panel:** add/name floors, set a per-floor default height (pre-filled
   328 cm), switch floors, faint underlay of the floor below for tracing. *New
   `floors` array in the store; default height feeds new walls' height.* Covers
   "button to add/name floors" + "default floor height, override per-wall."

5. **Endpoint snapping + close-the-loop-into-a-room**, with the amber "ends
   don't meet — join?" fix-it. This makes the walls Craig draws actually *form
   rooms* and render in 3D without hitting the spec's "walls don't match bounds"
   load failure — i.e. it makes the other four features *produce a usable plan*.

---

## 9. Delight list — nice-to-haves (post-MVP)

- **iPad/touch support** (tap-tap draw, pinch-zoom, keypad length entry,
  on-site mode) — high value if Craig measures in situ, but not blocking.
- **Trace-over-a-photo/PDF**: drop the survey PDF (`job16873-1.pdf`) as a
  scalable underlay, calibrate by clicking a known dimension, then draw on top.
- **Mirror floor / room** for symmetric terraces.
- **Measure-only ruler tool** for cross-checking the survey.
- **"Problems" tray** with plain-English geometry warnings.
- **Smart room-name palette** and auto-area readout (area already computed,
  `calcPolygonArea`).
- **Stack-for-walkthrough** that auto-builds the tall-room + high-sill trick so
  the 2-storey courtyard + spiral can be walked in first person.
- **Per-wall material/finish** picker exposed on right-click (schema already has
  `WallSegment.texture`).
- **Dimensioned print/export** of each floor for the planning pack.
- **Undo with labelled history list** ("jump back to: Add courtyard wall").
- **Live perimeter/area HUD** while drawing.
- **Half-painted / two-finish walls** (the spec P5 hack) exposed as a simple
  "paint lower half / upper half" toggle, for the courtyard's white-below /
  stock-brick-above look.
