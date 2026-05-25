"""Sheet 02 — Existing + Proposed Plan of the Rear Courtyard / Lightwell

Shows the L-shape formed by the side wall (kitchen-side, 3000 mm long) and
the rear wall (3250 mm wide), the spiral staircase position, all openings
seen in plan (in ghosted form below at basement level vs. above at ground
level), and full dimensional annotation.
"""
from __future__ import annotations
from pathlib import Path
import sys, math
import yaml
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle, Circle, Polygon

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet, annotation,
                   LINE_HEAVY, LINE_MEDIUM, LINE_LIGHT)
from staircase import StaircaseParams, draw_plan as draw_staircase_plan


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_courtyard_plan(ax, w, dims, *, show_existing=True, show_proposed=False,
                        ox_world=0, oy_world=0):
    """Draw the courtyard plan at world coords (ox_world, oy_world) as the
    bottom-left of the courtyard.

    Layout (looking DOWN at the plan; north up):
        +----------------- rear boundary wall (north) -------------------+
        |                                                                |
        |                     COURTYARD (open above)                     | west boundary
        |  (slab; FFL -2820 = courtyard level)                          | (party wall
        |                                                                |  with #22)
        |                                                                |
        |                                                                |
        +---SIDE WALL (kitchen side, east) -----+                       |
        |                                       |                       |
        |  (this is INSIDE the dwelling now)    |                       |
        |     KITCHEN                           |                       |
        |                                       |                       |
        +-- REAR WALL (south, rear-reception) --+----- bin store -------+

    The INSIDE CORNER of the L is at top-right of the courtyard envelope —
    where the SIDE wall meets the REAR wall.
    """
    cw = dims["courtyard"]["plan_width_mm"]      # 3250 east-west
    cd = dims["courtyard"]["plan_depth_mm"]      # 2950 north-south

    # External wall thickness — assume 350 mm solid masonry for visualisation
    ext_wall_t = 350

    # Coordinates of the courtyard rectangle (in world mm, with ox/oy origin)
    cx0, cy0 = ox_world, oy_world
    cx1, cy1 = cx0 + cw, cy0 + cd

    # ---- Boundary walls (west + north) — neighbour party / rear boundary ----
    # West (left edge): party wall with No. 22
    ax.add_patch(Rectangle(w.p(cx0 - ext_wall_t, cy0 - ext_wall_t),
                           w.s(ext_wall_t),
                           w.s(cd + 2 * ext_wall_t),
                           fc="#888", ec="#000", lw=0.4, hatch="////"))
    # North (top edge): rear boundary wall
    ax.add_patch(Rectangle(w.p(cx0 - ext_wall_t, cy1),
                           w.s(cw + 2 * ext_wall_t),
                           w.s(ext_wall_t),
                           fc="#888", ec="#000", lw=0.4, hatch="////"))

    # ---- Dwelling walls (south + east of courtyard) — the L ----
    # SIDE wall (east edge of courtyard) — kitchen-side wall, runs N-S, 3000 mm long
    sw_t = ext_wall_t  # treat as exterior wall (sep. flat from outside)
    side_wall_x = cx1
    side_wall_y0 = cy0   # south end (= corner with rear wall)
    side_wall_y1 = cy1   # north end (= boundary corner)

    # REAR wall (south edge of courtyard) — runs E-W, 3250 mm wide
    rear_wall_y = cy0
    rear_wall_x0 = cx0
    rear_wall_x1 = cx1

    # Draw rear wall (south wall, between courtyard and rear reception room)
    ax.add_patch(Rectangle(w.p(cx0 - ext_wall_t, cy0 - ext_wall_t),
                           w.s(cw + ext_wall_t),
                           w.s(ext_wall_t),
                           fc="#333", ec="#000", lw=0.7))
    # Draw side wall (east wall, between courtyard and kitchen)
    ax.add_patch(Rectangle(w.p(cx1, cy0 - ext_wall_t),
                           w.s(ext_wall_t),
                           w.s(cd + 2 * ext_wall_t),
                           fc="#333", ec="#000", lw=0.7))

    # ---- Courtyard slab ----
    ax.add_patch(Rectangle(w.p(cx0, cy0), w.s(cw), w.s(cd),
                           fc="#f4ede0", ec="#000", lw=0.4))
    ax.text(*w.p(cx0 + cw * 0.35, cy0 + cd * 0.35),
            "REAR COURTYARD\n(open to sky)\nFFL −2820",
            fontsize=7, ha="center", va="center", style="italic",
            color="#555")

    # ---- REAR WALL openings shown in plan ----
    # Recess containing CENTRAL DOOR + 2 FLANKING SASH WINDOWS
    rear_lower = dims["rear_wall"]["lower_basement"]
    cheek_l = rear_lower["left_painted_cheek_mm"]
    recess_w = rear_lower["recess_width_mm"]
    cheek_r = rear_lower["right_painted_cheek_mm"]
    sw_w = rear_lower["side_window_width_mm"]
    door_w = rear_lower["central_door_width_mm"]
    rev = rear_lower["inner_reveal_mm"]
    recess_x0 = cx0 + cheek_l
    recess_x1 = recess_x0 + recess_w
    # The recess plane (slight notch into the wall)
    ax.add_patch(Rectangle(w.p(recess_x0, cy0 - ext_wall_t),
                           w.s(recess_w), w.s(ext_wall_t),
                           fc="#f4ede0", ec="#000", lw=0.4))
    # Position 3-part assembly centred within recess
    asm_w = rev + sw_w + rev + door_w + rev + sw_w + rev
    asm_x0 = recess_x0 + (recess_w - asm_w) / 2
    # Left side window (fixed sash in plan = thin rectangle with glass line)
    lsw_x0 = asm_x0 + rev
    ax.add_patch(Rectangle(w.p(lsw_x0, cy0 - 80),
                           w.s(sw_w), w.s(40),
                           fc="#a8d5e8", ec="#000", lw=0.4))
    # Central door — schematic single leaf swinging outward
    door_x0 = lsw_x0 + sw_w + rev
    from matplotlib.patches import Arc
    ax.add_patch(Rectangle(w.p(door_x0, cy0 - 60),
                           w.s(door_w - 50), w.s(40),
                           fc="#8b6f47", ec="#000", lw=0.5))
    # Swing arc (single leaf hinged on left, swing 90° outward)
    ax.add_patch(Arc(w.p(door_x0, cy0 - 30),
                     w.s(2 * (door_w - 50)), w.s(2 * (door_w - 50)),
                     angle=0, theta1=180, theta2=270,
                     color="#888", lw=0.3, linestyle=(0, (2, 2))))
    # Right side window
    rsw_x0 = door_x0 + door_w + rev
    ax.add_patch(Rectangle(w.p(rsw_x0, cy0 - 80),
                           w.s(sw_w), w.s(40),
                           fc="#a8d5e8", ec="#000", lw=0.4))
    # Annotation
    ax.text(*w.p(door_x0 + door_w / 2, cy0 - 350),
            "Central door + 2 flanking sash windows\n(all under one flat arch)",
            fontsize=5, ha="center", va="top", style="italic", color="#444")

    # Rear-wall downpipe — LEFT inside-corner only (right downpipe removed in Rev B)
    from matplotlib.patches import Circle as _Circle
    rear_dp_l = dims["existing_services"]["downpipe_rear_wall_left"]
    dx = cx0 + rear_dp_l["position_from_east_corner_mm"]
    ax.add_patch(_Circle(w.p(dx, cy0 - ext_wall_t / 2),
                         w.s(rear_dp_l["diameter_mm"] / 2),
                         fc="#000", ec="#000"))
    ax.text(*w.p(dx, cy0 - ext_wall_t - 200),
            "DP\n(L corner)", fontsize=4, ha="center", va="top", color="#333")

    # ---- SIDE WALL openings shown in plan ----
    # Lower-basement: 51 + 60(bricked) + 49 + 123(glass) + 17 = 300 cm sequence
    # from NORTH (top of plan) to SOUTH (bottom of plan)
    seq = dims["side_wall"]["lower_basement"]["sequence_from_north_mm"]
    y_cursor = cy1  # start from north corner
    for seg in seq:
        seg_y0 = y_cursor - seg["length"]
        seg_y1 = y_cursor
        if seg.get("type") == "blocked_window":
            # Ghosted dashed rectangle at the wall plane
            ax.add_patch(Rectangle(w.p(cx1 - 20, seg_y0),
                                   w.s(40), w.s(seg["length"]),
                                   fc="#c6a070", ec="#aa0000", lw=0.6,
                                   linestyle=(0, (3, 2))))
            ax.text(*w.p(cx1 + 100, (seg_y0 + seg_y1) / 2),
                    f"Existing\nbricked-up\n{seg['length']} mm\n(REINSTATE)",
                    fontsize=5, ha="left", va="center", color="#aa0000",
                    style="italic")
        elif seg.get("type") == "window":
            # Show the window opening as a gap in the wall + glass line
            ax.add_patch(Rectangle(w.p(cx1, seg_y0),
                                   w.s(ext_wall_t), w.s(seg["length"]),
                                   fc="#f4ede0", ec="#000", lw=0.4))
            # Glass line down the middle of the opening
            ax.plot([w.x(cx1 + ext_wall_t / 2), w.x(cx1 + ext_wall_t / 2)],
                    [w.y(seg_y0 + 50), w.y(seg_y1 - 50)],
                    color="#3a6e8c", lw=0.8)
            ax.text(*w.p(cx1 + ext_wall_t + 100,
                          (seg_y0 + seg_y1) / 2),
                    f"Existing window\n{seg['length']} mm wide\n(basement, retain)",
                    fontsize=5, ha="left", va="center", color="#333",
                    style="italic")
        y_cursor = seg_y0

    # ---- Indicate the UPPER kitchen-window-to-doorway (overhead, dashed) ----
    upper = dims["side_wall"]["upper_ground"]
    kw_centre_y = cy1 - upper["horizontal_position_from_north_corner_mm"]
    kw_recess = upper["structural_recess_width_mm"]
    ax.add_patch(Rectangle(w.p(cx1 - 5, kw_centre_y - kw_recess / 2),
                           w.s(ext_wall_t + 10), w.s(kw_recess),
                           fill=False, ec="#0066cc", lw=0.6,
                           linestyle=(0, (4, 2))))
    ax.text(*w.p(cx1 + ext_wall_t + 100, kw_centre_y),
            "Kitchen window above\n(GROUND FLOOR) —\nPROPOSED: enlarge to\ndoorway for staircase",
            fontsize=5, ha="left", va="center", color="#0066cc",
            style="italic")

    # ---- Spiral staircase position ----
    sp = dims["spiral_staircase"]
    s_centre_from_side = dims["proposed"]["staircase_installation"]["centre_distance_from_side_wall_mm"]
    s_centre_from_rear = dims["proposed"]["staircase_installation"]["centre_distance_from_rear_wall_mm"]
    sc_x = cx1 - s_centre_from_side  # inside corner is at cx1, cy0
    sc_y = cy0 + s_centre_from_rear

    if show_proposed:
        params = StaircaseParams(
            n_treads=sp["n_treads"],
            tread_rise_mm=sp["tread_rise_mm"],
            central_pole_height_mm=sp["central_pole_height_mm"],
            central_pole_diameter_mm=sp["central_pole_diameter_mm"],
            outer_radius_mm=sp["outer_radius_mm"],
            envelope_radius_mm=sp["envelope_radius_mm"],
            tread_widest_mm=sp["tread_widest_mm"],
            tread_thickness_mm=sp["tread_thickness_mm"],
            rotation_per_tread_deg=sp["rotation_per_tread_deg"],
            start_angle_deg=sp["start_angle_deg"],
            centre_xy_mm=(sc_x, sc_y),
            handrail_height_mm=sp["handrail_height_mm"],
        )
        draw_staircase_plan(ax, w, params)
        # Position label
        ax.text(*w.p(sc_x, sc_y - sp["envelope_radius_mm"] - 250),
                "PROPOSED reclaimed Victorian\ncast-iron spiral staircase",
                fontsize=6, ha="center", va="top", color="#222",
                weight="bold")

    # ---- Compass / north arrow inside drawing area ----
    ax.text(*w.p(cx0 + cw / 2, cy1 + 700), "N ↑",
            fontsize=10, ha="center", va="center", weight="bold")

    # ---- Dimensions ----
    # Courtyard overall width (bottom of plan)
    dim_horizontal(ax, w, cx0, cx1, cy0 - ext_wall_t - 600,
                   label=f"{cw}")
    # Courtyard overall depth (right side, but we have wall there — put on left)
    dim_vertical(ax, w, cy0, cy1, cx0 - ext_wall_t - 600,
                 label=f"{cd}")
    # Rear wall lower breakdown
    yd = cy0 - ext_wall_t - 1200
    x_cursor = cx0
    for label, ln in [("painted\ncheek", cheek_l),
                       ("door recess (185 cm)", recess_w),
                       ("painted\ncheek", cheek_r)]:
        dim_horizontal(ax, w, x_cursor, x_cursor + ln, yd,
                       label=f"{ln}")
        x_cursor += ln
    # Side wall lower breakdown
    xd = cx1 + ext_wall_t + 1500
    y_cursor = cy1
    for seg in seq:
        seg_y0 = y_cursor - seg["length"]
        dim_vertical(ax, w, seg_y0, y_cursor, xd, label=f"{seg['length']}")
        y_cursor = seg_y0

    # ---- Staircase clearance dims (only if proposed shown) ----
    if show_proposed:
        # Distance from staircase centre to side wall
        dim_horizontal(ax, w, sc_x, cx1,
                       sc_y - sp["envelope_radius_mm"] - 100,
                       label=f"{s_centre_from_side}")
        dim_vertical(ax, w, cy0, sc_y,
                     sc_x - sp["envelope_radius_mm"] - 100,
                     label=f"{s_centre_from_rear}")

    return cx0, cy0, cx1, cy1


def render(existing=True, proposed=False, out_dir=None, dwg_no="02-A"):
    dims = load_dims()
    scale = Scale(50)
    title = "PROPOSED REAR COURTYARD PLAN" if proposed else "EXISTING REAR COURTYARD PLAN"
    fig, ax = new_a3_landscape(
        title=title,
        drawing_no=dwg_no,
        scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
        show_north_arrow=True,
        north_rotation_deg=-45,    # plan page-up = NE compass; N is 45° anticlockwise
    )
    # Place courtyard centred in the left ~60% of sheet
    w = World(ax, scale, origin_sheet_xy=(80, 110))
    draw_courtyard_plan(ax, w, dims,
                        show_existing=existing,
                        show_proposed=proposed,
                        ox_world=0, oy_world=0)

    # Notes panel
    notes_x = 280
    notes_y = 200
    notes = [
        "NOTES — REAR COURTYARD PLAN",
        "1. All dimensions in mm at FFL of courtyard slab",
        "   (datum FFL −2820 below kitchen ground-floor level).",
        "2. The L-shape comprises:",
        "   • REAR wall (south, 3250 wide) — to rear reception",
        "     room above; recessed double-door bay at courtyard",
        "     level (185 cm recess between 72 cm painted cheeks).",
        "   • SIDE wall (east, 3000 long) — to kitchen above;",
        "     2 basement-level openings (60 cm bricked-up to",
        "     reinstate + 123 cm existing glass window).",
        "3. PROPOSED spiral staircase in the inside corner of",
        "   the L: reclaimed Victorian cast iron, dark painted",
        "   metal, Ø ≈ 1750 envelope, 14 treads × 201 mm rise.",
        "4. Boundary walls (west + north) retained.",
        "5. External services (downpipe, drainage) to be",
        "   rationalised — see proposed elevations.",
        "6. Dimensions marked TBC require site re-measure",
        "   (see dimension_questions.md).",
    ]
    for i, line in enumerate(notes):
        weight = "bold" if i == 0 else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 4, line,
                fontsize=size, weight=weight, ha="left", va="top")

    out_dir = out_dir or Path(__file__).resolve().parent.parent / "output"
    basename = f"02_courtyard_plan_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(existing=True, proposed=False, dwg_no="02-A")
    render(existing=False, proposed=True, dwg_no="02-B")
