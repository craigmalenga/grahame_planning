"""3D rendering sheets — courtyard exterior (with staircase), internal
opening, bathroom.  Axonometric projection via matplotlib 3D, then composed
onto A3 sheets with title block.
"""
from __future__ import annotations
from pathlib import Path
import sys, math
import yaml
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection, Line3DCollection
from mpl_toolkits.mplot3d import Axes3D  # noqa: needed
import matplotlib.image as mpimg

sys.path.insert(0, str(Path(__file__).parent))
from sheet import new_a3_landscape, Scale, save_sheet
from staircase import StaircaseParams, make_3d_geometry


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def add_wall(faces, x0, y0, z0, dx, dy, dz, color="#d8c8a8", kind="wall"):
    """Add a box wall to the faces list. dx/dy/dz are extents."""
    p = lambda x, y, z: [x, y, z]
    x1, y1, z1 = x0 + dx, y0 + dy, z0 + dz
    f = [
        ("bottom", [p(x0, y0, z0), p(x1, y0, z0), p(x1, y1, z0), p(x0, y1, z0)]),
        ("top",    [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)]),
        ("n",      [p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)]),
        ("s",      [p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1)]),
        ("e",      [p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)]),
        ("w",      [p(x0, y0, z0), p(x0, y1, z0), p(x0, y1, z1), p(x0, y0, z1)]),
    ]
    for side, pts in f:
        faces.append((kind + "_" + side, np.array(pts), color))


def add_opening_panel(faces, x0, y0, z0, dx, dy, dz, color="#7fb0d0"):
    """Add a thin panel (window/door)."""
    add_wall(faces, x0, y0, z0, dx, dy, dz, color=color, kind="opening")


def project_axonometric(pt, angle_deg=30, scale=1.0):
    """Simple axonometric projection: rotate around z, then squash y."""
    x, y, z = pt
    a = math.radians(angle_deg)
    px = (x * math.cos(a) - y * math.sin(a)) * scale
    py = (x * math.sin(a) + y * math.cos(a)) * 0.5 * scale + z * scale
    return px, py


def render_courtyard_3d():
    dims = load_dims()
    cw = dims["courtyard"]["plan_width_mm"]
    cd = dims["courtyard"]["plan_depth_mm"]
    slab_to_ffl = dims["courtyard"]["slab_to_gf_ffl_mm"]
    kitchen_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]
    rec_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["rear_reception"]
    ext_t = 350
    parapet = slab_to_ffl + rec_h + 600

    # Setup matplotlib 3D
    fig3d = plt.figure(figsize=(12, 9), dpi=180)
    ax3d = fig3d.add_subplot(111, projection="3d")

    # World axes: x = east-west across courtyard (0..3250)
    #             y = north-south depth (0..2950)
    #             z = up (0..parapet)

    polys = []
    colors = []
    edges = []

    def add_box(x, y, z, w, d, h, color, edge=True, alpha=1.0):
        p = [
            [x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z],
            [x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]
        ]
        faces = [
            [p[0], p[1], p[5], p[4]],  # south
            [p[2], p[3], p[7], p[6]],  # north
            [p[1], p[2], p[6], p[5]],  # east
            [p[0], p[3], p[7], p[4]],  # west
            [p[4], p[5], p[6], p[7]],  # top
            [p[0], p[1], p[2], p[3]],  # bot
        ]
        for f in faces:
            polys.append(f); colors.append(color)

    # Courtyard slab (light tan)
    add_box(0, 0, -50, cw, cd, 50, "#cfc4ad")

    # SOUTH wall (rear wall) — between courtyard and rear reception
    # Door bay recess: leave a notch at lower level
    lower = dims["rear_wall"]["lower_basement"]
    rec_w = lower["recess_width_mm"]
    cheek_l = lower["left_painted_cheek_mm"]
    cheek_r = lower["right_painted_cheek_mm"]
    rec_x0 = cheek_l
    door_h = lower["door_pair_height_mm"]
    # Lower portion: split into 3 pieces (left cheek, recess [door], right cheek)
    add_box(0, -ext_t, 0, cheek_l, ext_t, dims["courtyard"]["white_paint_datum_mm"], "#f0e8d8")
    add_box(rec_x0 + rec_w, -ext_t, 0, cheek_r, ext_t, dims["courtyard"]["white_paint_datum_mm"], "#f0e8d8")
    # Above doors but below white-line
    add_box(rec_x0, -ext_t, door_h, rec_w, ext_t,
            dims["courtyard"]["white_paint_datum_mm"] - door_h,
            "#c8a07e")  # red-brick arch zone
    # Double doors (in recess)
    add_box(rec_x0 + 50, -ext_t + 50, 0, rec_w - 100, 80, door_h, "#3d2a1a")
    # Above white-line (yellow brick)
    add_box(0, -ext_t, dims["courtyard"]["white_paint_datum_mm"],
            cw, ext_t,
            parapet - dims["courtyard"]["white_paint_datum_mm"], "#d8b97a")
    # Rear-reception sash on south wall
    rear_up = dims["rear_wall"]["upper_ground"]
    sx0 = rear_up["horizontal_position_from_east_corner_mm"]
    sw = rear_up["sash_width_mm"]
    sh = rear_up["sash_height_mm"]
    ssill = rear_up["sill_height_above_courtyard_slab_mm"]
    add_box(sx0, -ext_t - 5, ssill, sw, 10, sh, "#a8d5e8")

    # EAST wall (side wall) — between courtyard and kitchen
    # Lower openings: 51 + 60 + 49 + 123 + 17 (from north → south = from cd → 0)
    # Build the wall in pieces along Y
    seq = dims["side_wall"]["lower_basement"]["sequence_from_north_mm"]
    sill_low = dims["side_wall"]["lower_basement"]["both_openings_sill_height_above_slab_mm"]
    h_low = dims["side_wall"]["lower_basement"]["both_openings_height_mm"]
    y_cursor = cd  # start at north end
    for seg in seq:
        seg_y0 = y_cursor - seg["length"]
        seg_y1 = y_cursor
        if seg.get("type") == "window":
            # split this segment vertically: brick below sill, glass at window, brick above head
            add_box(cw, seg_y0, 0, ext_t, seg["length"], sill_low, "#f0e8d8")
            add_box(cw, seg_y0, sill_low, ext_t, seg["length"], h_low, "#a8d5e8")
            add_box(cw, seg_y0, sill_low + h_low, ext_t, seg["length"],
                    dims["courtyard"]["white_paint_datum_mm"] - sill_low - h_low,
                    "#f0e8d8")
        elif seg.get("type") == "blocked_window":
            # All brick (with dashed marker handled below)
            add_box(cw, seg_y0, 0, ext_t, seg["length"],
                    dims["courtyard"]["white_paint_datum_mm"], "#c8a07e")
        else:
            add_box(cw, seg_y0, 0, ext_t, seg["length"],
                    dims["courtyard"]["white_paint_datum_mm"], "#f0e8d8")
        y_cursor = seg_y0
    # Above white-line on east wall
    add_box(cw, 0, dims["courtyard"]["white_paint_datum_mm"], ext_t, cd,
            parapet - dims["courtyard"]["white_paint_datum_mm"], "#d8b97a")
    # Kitchen window upper / new doorway (PROPOSED)
    upper = dims["side_wall"]["upper_ground"]
    kwx_centre = upper["horizontal_position_from_north_corner_mm"]
    kw_y0 = cd - kwx_centre - 400  # 800-wide opening centred
    kw_h = 2050
    # Punch through the upper wall: replace with door (showing aperture in red)
    add_box(cw, kw_y0, slab_to_ffl, ext_t, 800, kw_h, "#ffd0d0")  # doorway aperture (highlighted)
    add_box(cw - 5, kw_y0 + 100, slab_to_ffl + 200, 10, 600, kw_h - 200, "#a8d5e8")  # door glazing

    # NORTH boundary wall
    add_box(0, cd, 0, cw, ext_t, dims["courtyard"]["rear_boundary_wall_height_mm"], "#a08560")
    # WEST boundary wall (party with No.22)
    add_box(-ext_t, 0, 0, ext_t, cd, dims["courtyard"]["rear_boundary_wall_height_mm"], "#a08560")

    # SPIRAL STAIRCASE
    sp = dims["spiral_staircase"]
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
        handrail_height_mm=sp["handrail_height_mm"],
        centre_xy_mm=(cw - 950, 950),  # 950 from east wall, 950 from south wall
    )
    stair_faces = make_3d_geometry(params)
    for kind, pts in stair_faces:
        if kind == "handrail_polyline":
            ax3d.plot(pts[:, 0], pts[:, 1], pts[:, 2], color="#111", lw=1.2)
        elif kind == "pole":
            polys.append(pts.tolist()); colors.append("#111111")
        elif kind.startswith("tread"):
            color = "#222222" if "edge" in kind else ("#333333" if "top" in kind else "#181818")
            polys.append(pts.tolist()); colors.append(color)

    # Render
    # Reduce wall heights for visibility (cut walls down to ~ceiling level)
    # We make the parapet portion semi-transparent. Build polys list with
    # alpha-based colours where appropriate.
    # For simplicity render full walls but with reduced alpha; staircase opaque.
    pc = Poly3DCollection(polys, facecolors=colors, edgecolors="#222",
                          linewidths=0.2, alpha=0.65)
    ax3d.add_collection3d(pc)

    # Axis limits + view — looking from NORTHWEST (above the rear boundary)
    # down into the courtyard inside corner at (cw, 0).
    ax3d.set_xlim(-ext_t - 200, cw + ext_t + 200)
    ax3d.set_ylim(-ext_t - 200, cd + ext_t + 1500)
    ax3d.set_zlim(0, parapet + 200)
    ax3d.set_box_aspect([cw + 700, cd + 1700, parapet + 200])
    ax3d.view_init(elev=28, azim=140)   # NW camera looking SE into L corner
    ax3d.set_axis_off()

    # Save 3D figure as a PNG, then composite onto A3 sheet
    tmp_png = Path("/tmp/courtyard_3d.png")
    fig3d.savefig(tmp_png, dpi=180, bbox_inches="tight", pad_inches=0.05,
                  facecolor="white")
    plt.close(fig3d)

    # Compose onto A3 sheet
    fig, ax = new_a3_landscape(
        title="3D AXONOMETRIC — Rear courtyard with proposed spiral staircase",
        drawing_no="10",
        scale=Scale(1),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    img = mpimg.imread(tmp_png)
    # Place image in a region of the sheet
    ax.imshow(img, extent=[20, 280, 30, 270], aspect="auto", zorder=2)
    # Notes
    notes_x, notes_y = 290, 260
    notes = [
        "VIEWING NOTES",
        "• Axonometric (NOT perspective).",
        "• Looking SOUTH-EAST into courtyard.",
        "• Slab grey-tan; party walls hatched warmer brown;",
        "  yellow-stock brick above 2900 mm white-line;",
        "  white-painted brick below.",
        "• Red-brick flat arches over door bay.",
        "• Reclaimed cast-iron spiral staircase in dark",
        "  painted ironwork shown in inside corner.",
        "• New kitchen-window-to-doorway shown in pink",
        "  on east wall at ground-floor level.",
        "",
        "PALETTE (existing → proposed)",
        "• Yellow stock brick — retained",
        "• Red brick flat arches — retained",
        "• White-painted lower brick — retained",
        "• Black painted cast iron — staircase + downpipes",
        "• White-painted timber — sashes + new doorway",
        "",
        "Image is rendered from `dimensions.yaml`;",
        "adjust YAML → regenerate.",
    ]
    for i, line in enumerate(notes):
        weight = "bold" if (i == 0 or line in ("PALETTE (existing → proposed)",)) else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 3.6, line, fontsize=size,
                weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "10_courtyard_3d", out_dir)
    print(f"Wrote {pdf}")


def render_bathroom_3d():
    dims = load_dims()
    sb = dims["proposed_shower_room"]
    kitchen_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]

    fig3d = plt.figure(figsize=(12, 9), dpi=180)
    ax3d = fig3d.add_subplot(111, projection="3d")
    polys = []
    colors = []

    def add_box(x, y, z, w, d, h, color):
        p = [
            [x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z],
            [x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]
        ]
        for f in [[p[0], p[1], p[5], p[4]], [p[2], p[3], p[7], p[6]],
                  [p[1], p[2], p[6], p[5]], [p[0], p[3], p[7], p[4]],
                  [p[4], p[5], p[6], p[7]], [p[0], p[1], p[2], p[3]]]:
            polys.append(f); colors.append(color)

    sr_total = 1000 + 600 + 500 + 600 + 3 * 100  # shower+wc+basin+laundry + partitions
    sr_d = 1500

    # Floor
    add_box(0, 0, 0, sr_total, sr_d, 30, "#e0d8c8")
    # Walls
    add_box(0, sr_d, 0, sr_total, 100, kitchen_h, "#f8f4ec")  # rear wall
    add_box(-100, 0, 0, 100, sr_d + 100, kitchen_h, "#f8f4ec")  # left wall
    add_box(sr_total, 0, 0, 100, sr_d + 100, kitchen_h, "#f8f4ec")  # right wall

    x = 0
    # Shower
    add_box(x, 0, 30, 1000, 900, 50, "#d5e8f0")    # shower tray
    add_box(x + 1000 - 80, 0, 80, 80, 900, 1800, "#444")  # shower head wall
    add_box(x + 1000 - 80, 0, 0, 80, 900, kitchen_h, "#222")  # black hinged panel
    x += 1000 + 100
    # WC
    add_box(x + 100, sr_d - 700, 30, 400, 600, 400, "#ffffff")  # cistern
    add_box(x + 150, sr_d - 300, 30, 300, 600, 400, "#ffffff")  # pan
    x += 600 + 100
    # Basin
    add_box(x, sr_d - 500, 800, 500, 400, 100, "#ffffff")       # basin
    add_box(x + 100, sr_d - 400, 0, 300, 100, 800, "#444")      # pedestal
    x += 500 + 100
    # Laundry
    add_box(x, 0, 30, 600, 600, 850, "#cccccc")    # washer
    add_box(x, 0, 900, 600, 600, 800, "#cccccc")    # dryer stacked

    pc = Poly3DCollection(polys, facecolors=colors, edgecolors="#000",
                          linewidths=0.25, alpha=0.95)
    ax3d.add_collection3d(pc)

    ax3d.set_xlim(-200, sr_total + 200)
    ax3d.set_ylim(-200, sr_d + 200)
    ax3d.set_zlim(0, kitchen_h + 100)
    ax3d.set_box_aspect([sr_total + 400, sr_d + 400, kitchen_h])
    ax3d.view_init(elev=20, azim=-65)
    ax3d.set_axis_off()

    tmp_png = Path("/tmp/bathroom_3d.png")
    fig3d.savefig(tmp_png, dpi=180, bbox_inches="tight", pad_inches=0.05,
                  facecolor="white")
    plt.close(fig3d)

    fig, ax = new_a3_landscape(
        title="3D AXONOMETRIC — Proposed compact shower-room",
        drawing_no="11",
        scale=Scale(1),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    img = mpimg.imread(tmp_png)
    ax.imshow(img, extent=[20, 280, 30, 270], aspect="auto", zorder=2)
    notes = [
        "FITTINGS (left → right)",
        "• Shower 1000 × 900 with full-height black",
        "  hinged glazed panel (Merlyn Ionic Essence",
        "  Black 940 × 2000 OR equivalent).",
        "• WC: low-level cistern with concealed",
        "  service voids where possible.",
        "• Compact basin on pedestal (450-500 mm).",
        "• Stacked washer/dryer 600 × 600.",
        "",
        "ACCESS",
        "• Pocket / sliding door from kitchen side.",
        "• Clear floor space maintained between",
        "  fittings (regs 700 mm activity zones).",
        "",
        "FINISHES",
        "• Tile floor with falls to gully under shower.",
        "• Tile walls to shower zone full height; rest",
        "  painted plaster to match adjacent kitchen.",
        "• Concealed cistern; chrome-finish fittings.",
    ]
    nx, ny = 290, 260
    for i, line in enumerate(notes):
        weight = "bold" if line in ("FITTINGS (left → right)", "ACCESS",
                                     "FINISHES") else "normal"
        ax.text(nx, ny - i * 3.6, line, fontsize=6 if i else 6.5,
                weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "11_bathroom_3d", out_dir)
    print(f"Wrote {pdf}")


def render_internal_opening_3d():
    dims = load_dims()
    pr = dims["internal_opening_between_rooms"]["proposed"]
    clear_w = pr["clear_width_mm"]
    nib_l = pr["nib_left_mm"]
    nib_r = pr["nib_right_mm"]
    head_h = pr["height_mm"]
    ceil = dims["front_lounge"]["ceiling_mm"]
    wall_t = dims["rear_reception"]["dividing_wall_thickness_mm"]
    flat_w = dims["flat_envelope"]["ground_floor"]["width_mm"]
    room_d = 5000

    fig3d = plt.figure(figsize=(12, 9), dpi=180)
    ax3d = fig3d.add_subplot(111, projection="3d")
    polys = []
    colors = []
    def add_box(x, y, z, w, d, h, color):
        p = [
            [x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z],
            [x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]
        ]
        for f in [[p[0], p[1], p[5], p[4]], [p[2], p[3], p[7], p[6]],
                  [p[1], p[2], p[6], p[5]], [p[0], p[3], p[7], p[4]],
                  [p[4], p[5], p[6], p[7]], [p[0], p[1], p[2], p[3]]]:
            polys.append(f); colors.append(color)

    # Floor
    add_box(0, 0, 0, room_d * 2 + wall_t, flat_w, 50, "#e0d8c8")
    # Ceiling
    add_box(0, 0, ceil, room_d * 2 + wall_t, flat_w, 50, "#f8f4ec")
    # Front lounge walls (left half)
    # Back wall (away from viewer)
    add_box(0, flat_w - 100, 0, room_d * 2 + wall_t, 100, ceil, "#f0e6d4")
    # Floor walls etc - just the dividing wall in detail
    # Dividing wall — split around opening
    div_x = room_d
    # Left nib (full height)
    add_box(div_x, 0, 0, wall_t, nib_l, ceil, "#aaa")
    # Above opening (lintel / wall above)
    add_box(div_x, nib_l, head_h, wall_t, clear_w, ceil - head_h, "#aaa")
    # Right nib (full height)
    add_box(div_x, nib_l + clear_w, 0, wall_t, nib_r, ceil, "#aaa")
    # Beam zone (highlighted)
    add_box(div_x - 30, nib_l - 30, head_h, wall_t + 60, clear_w + 60, 250, "#f0c5a8")

    # Cornice strip suggestion (just visual)
    add_box(0, flat_w - 100, ceil - 100, room_d * 2 + wall_t, 100, 100, "#f5e8d0")

    pc = Poly3DCollection(polys, facecolors=colors, edgecolors="#222",
                          linewidths=0.2, alpha=0.92)
    ax3d.add_collection3d(pc)
    ax3d.set_xlim(0, room_d * 2 + wall_t)
    ax3d.set_ylim(0, flat_w)
    ax3d.set_zlim(0, ceil + 100)
    ax3d.set_box_aspect([room_d * 2, flat_w, ceil])
    ax3d.view_init(elev=18, azim=-60)
    ax3d.set_axis_off()

    tmp_png = Path("/tmp/opening_3d.png")
    fig3d.savefig(tmp_png, dpi=180, bbox_inches="tight", pad_inches=0.05,
                  facecolor="white")
    plt.close(fig3d)

    fig, ax = new_a3_landscape(
        title="3D AXONOMETRIC — Proposed internal opening (rec rooms)",
        drawing_no="12",
        scale=Scale(1),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    img = mpimg.imread(tmp_png)
    ax.imshow(img, extent=[20, 280, 30, 270], aspect="auto", zorder=2)
    notes = [
        "OPENING — between front lounge & rear reception",
        f"• Clear width:    {clear_w} mm",
        f"• Clear height:   {head_h} mm",
        f"• Nib L / nib R:  {nib_l} / {nib_r} mm",
        f"• Beam zone (orange):  ~250 mm deep",
        "  (final size by engineer)",
        "",
        "MAKING GOOD",
        "• Plaster reveal both sides — match existing",
        "  finishes.",
        "• Skirting returns into nibs.",
        "• Cornice cut & profiled at heads — re-run",
        "  matching profile across the new opening.",
    ]
    nx, ny = 290, 260
    for i, line in enumerate(notes):
        weight = "bold" if line in ("OPENING — between front lounge & rear reception",
                                     "MAKING GOOD") else "normal"
        ax.text(nx, ny - i * 3.6, line, fontsize=6 if i else 7,
                weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "12_opening_3d", out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render_courtyard_3d()
    render_bathroom_3d()
    render_internal_opening_3d()
