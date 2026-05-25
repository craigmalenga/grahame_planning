"""3D rendering sheets — courtyard exterior (with staircase), internal\nopening, bathroom.  Axonometric projection via matplotlib 3D, then composed\nonto A3 sheets with title block.\n"""
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
    door_h = lower["head_height_above_slab_mm"]
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


def _placeholder_sheet(title, dwg_no, body_lines):
    """Render a clean placeholder sheet pointing users to the photoreal prompt\n    file rather than a broken matplotlib 3D."""
    from pathlib import Path
    import yaml
    p = Path(__file__).resolve().parent.parent / "dimensions.yaml"
    dims = yaml.safe_load(open(p))
    fig, ax = new_a3_landscape(
        title=title, drawing_no=dwg_no, scale=Scale(50),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    ax.text(210, 220, title.upper(),
            fontsize=18, weight="bold", ha="center", va="center",
            color="#aa3322")
    ax.text(210, 205, "— 3D PHOTOREAL VIEW —",
            fontsize=10, ha="center", va="center", color="#666",
            style="italic")
    y = 175
    for line in body_lines:
        ax.text(40, y, line, fontsize=9, ha="left", va="top")
        y -= 6
    # Box
    from matplotlib.patches import FancyBboxPatch
    ax.add_patch(FancyBboxPatch((30, 100), 360, 90,
                                boxstyle="round,pad=3",
                                fc="#fff4e0", ec="#aa6600", lw=0.6))
    ax.text(210, 175, "Why a placeholder, not a CGI image?",
            fontsize=10, weight="bold", ha="center")
    notes = [
        "Matplotlib 3D (the toolchain that produced the courtyard view on Sheet 10) cannot",
        "reliably depth-sort interior scenes with multiple overlapping walls + fittings.",
        "Rather than ship a misleading image, we provide a ready-to-paste prompt that you",
        "can run through ChatGPT / Midjourney to generate a photoreal version that respects",
        "every dimension in `dimensions.yaml`.",
        "",
        "See:  Photoreal_Render_Prompt_for_ChatGPT.md  in this pack.",
    ]
    for i, line in enumerate(notes):
        ax.text(40, 165 - i * 5, line, fontsize=7.5, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    return save_sheet(fig, dwg_no, out_dir)


def render_bathroom_3d():
    """Isometric (2D-projected) view of the compact shower-room — uses\n    painter's-algorithm sort to avoid matplotlib 3D depth issues.\n    """
    import math
    from pathlib import Path
    import yaml
    from matplotlib.patches import Polygon, Circle as MPCircle
    p_yaml = Path(__file__).resolve().parent.parent / "dimensions.yaml"
    dims = yaml.safe_load(open(p_yaml))
    sb = dims["proposed_shower_room"]
    kitchen_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]
    L, D, H = 2500, 1500, kitchen_h

    fig, ax = new_a3_landscape(
        title="3D ISOMETRIC — Proposed compact shower-room (cutaway)",
        drawing_no="11", scale=Scale(50),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    iso_x = math.cos(math.radians(30))
    iso_y = math.sin(math.radians(30))
    cscale = 22  # mm/mm divisor for the iso projection

    def iso(x, y, z):
        sx = 120 + (x - y) * iso_x / cscale
        sy = 110 + z / cscale + (x + y) * iso_y / cscale
        return sx, sy

    def darken(c, factor=0.85):
        c = c.lstrip("#")
        r, g, b = (int(c[i:i+2], 16) for i in (0, 2, 4))
        r, g, b = int(r*factor), int(g*factor), int(b*factor)
        return f"#{r:02x}{g:02x}{b:02x}"

    def add_box(x0, y0, z0, w, d, h, color, shade=True):
        c8 = [(x0, y0, z0), (x0+w, y0, z0), (x0+w, y0+d, z0), (x0, y0+d, z0),
              (x0, y0, z0+h), (x0+w, y0, z0+h), (x0+w, y0+d, z0+h), (x0, y0+d, z0+h)]
        # 3 visible faces from iso view (top, front=y=y0, right=x=x0+w)
        for name, idx in [("top",[4,5,6,7]), ("front",[0,1,5,4]), ("right",[1,2,6,5])]:
            pts = [c8[i] for i in idx]
            fc = color
            if shade and name == "front": fc = darken(color, 0.80)
            elif shade and name == "right": fc = darken(color, 0.65)
            poly = Polygon([iso(*p) for p in pts], closed=True,
                           fc=fc, ec="#222", lw=0.4)
            ax.add_patch(poly)

    # Floor slab
    add_box(-50, -50, -30, L+100, D+100, 30, "#cec5b0")
    # Back wall (y = D) — full height
    add_box(0, D, 0, L, 100, H, "#ece4d4")
    # Right boundary wall (x = L) — kitchen-side / external
    add_box(L, 0, 0, 100, D+100, H, "#ece4d4")

    # FITTINGS along back wall
    x = 100
    sw = sb["zones"]["shower_tray_width_mm"]
    add_box(x, D-900-100, 30, sw, 900, 60, "#d5e8f0")
    # Black framed glass shower screen (two panels — back & side)
    add_box(x, D-100, 30, sw, 30, 2000, "#1a1a1a")    # back screen
    add_box(x+sw-30, D-900-100, 30, 30, 900, 2000, "#1a1a1a")  # side hinged
    x += sw + 100
    # WC zone
    wc = sb["zones"]["wc_zone_mm"]
    add_box(x+100, D-200, 350, wc-200, 200, 600, "#ffffff")  # cistern
    add_box(x+50, D-500, 350, wc-100, 400, 250, "#ffffff")   # pan
    x += wc + 100
    # Basin zone
    bn = sb["zones"]["basin_zone_mm"]
    add_box(x+20, D-350-100, 850, bn-40, 350, 80, "#ffffff")
    x += bn + 100
    # Laundry — single front-loader (NOT stacked)
    ld = sb["zones"]["laundry_zone_width_mm"]
    add_box(x+20, D-600-100, 30, ld-40, 600, 850, "#dddddd")
    # Round door of washer
    ax.add_patch(MPCircle(iso(x+ld/2, D-700, 450), 5,
                         fc="#333", ec="#222", lw=0.4, zorder=8))

    # Pocket door cut in left wall (decorative — wall absent in cutaway)
    add_box(0, 100, 0, 30, 800, 2050, "#5a3a22")

    # Title labels
    ax.text(210, 285, "PROPOSED COMPACT SHOWER-ROOM — Isometric cutaway",
            fontsize=11, weight="bold", ha="center", va="top", color="#aa3322")
    ax.text(210, 278, "View: from the (omitted) kitchen-side entry, looking along the 2500 mm run.",
            fontsize=7.5, style="italic", ha="center", va="top", color="#666")

    # Callouts
    callouts = [
        ("1", iso(100 + sw/2, D-500, 1800), 280, 240,
         "Shower 900 × 900 — black-framed\nfull-height glazed hinged door."),
        ("2", iso(100 + sw + 100 + wc/2, D-400, 1100), 280, 200,
         "Wall-hung WC, concealed\ncistern, matt-black flush plate."),
        ("3", iso(100 + sw + 200 + wc + bn/2, D-300, 900), 280, 165,
         "Compact wall-hung basin\n(400 mm) — matt-black tap."),
        ("4", iso(L - 200, D-400, 850), 280, 130,
         "Single front-loader\n(600 mm) — NOT stacked."),
        ("5", iso(15, 500, 1000), 280, 95,
         "Pocket / sliding door from\nkitchen-side (700 mm clear)."),
    ]
    for num, target, sx, sy, text in callouts:
        tx, ty = target
        ax.plot([sx, tx], [sy, ty], color="#cc1f1f", lw=0.5, zorder=10)
        ax.plot(tx, ty, marker=".", markersize=3, color="#cc1f1f", zorder=10)
        ax.add_patch(MPCircle((sx, sy), 3.6, fc="#cc1f1f", ec="white",
                              lw=0.6, zorder=11))
        ax.text(sx, sy, num, color="white", fontsize=7.5, weight="bold",
                ha="center", va="center", zorder=12)
        ax.text(sx + 6, sy, text, fontsize=7, ha="left", va="center", zorder=10)

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "11_bathroom_3d", out_dir)
    print(f"Wrote {pdf}")
    return


def render_internal_opening_3d():
    """Isometric cutaway of the proposed enlarged opening between front\n    lounge and rear reception. Painter's-algorithm sort, no z-fighting."""
    import math
    from pathlib import Path
    import yaml
    from matplotlib.patches import Polygon, Circle as MPCircle
    p_yaml = Path(__file__).resolve().parent.parent / "dimensions.yaml"
    dims = yaml.safe_load(open(p_yaml))
    pr = dims["internal_opening_between_rooms"]["proposed"]
    clear_w = pr["clear_width_mm"]
    nib_l = pr["nib_left_mm"]
    nib_r = pr["nib_right_mm"]
    head_h = pr["height_mm"]
    ceil = dims["front_lounge"]["ceiling_mm"]
    wall_t = dims["rear_reception"]["dividing_wall_thickness_mm"]
    flat_w = dims["front_lounge"]["room_width_mm"]
    room_d = 4500   # show 4.5 m depth each side
    fig, ax = new_a3_landscape(
        title="3D ISOMETRIC — Proposed internal opening between reception rooms",
        drawing_no="12", scale=Scale(50),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    iso_x = math.cos(math.radians(30))
    iso_y = math.sin(math.radians(30))
    cscale = 70
    def iso(x, y, z):
        sx = 80 + (x - y) * iso_x / cscale
        sy = 60 + z / cscale + (x + y) * iso_y / cscale
        return sx, sy
    def darken(c, factor=0.85):
        c = c.lstrip("#")
        r,g,b=(int(c[i:i+2],16) for i in (0,2,4))
        return f"#{int(r*factor):02x}{int(g*factor):02x}{int(b*factor):02x}"
    def add_box(x0, y0, z0, w, d, h, color, shade=True):
        c8 = [(x0,y0,z0),(x0+w,y0,z0),(x0+w,y0+d,z0),(x0,y0+d,z0),
              (x0,y0,z0+h),(x0+w,y0,z0+h),(x0+w,y0+d,z0+h),(x0,y0+d,z0+h)]
        for name, idx in [("top",[4,5,6,7]),("front",[0,1,5,4]),("right",[1,2,6,5])]:
            pts = [c8[i] for i in idx]
            fc = color
            if shade and name == "front": fc = darken(color, 0.80)
            elif shade and name == "right": fc = darken(color, 0.65)
            ax.add_patch(Polygon([iso(*p) for p in pts], closed=True,
                                  fc=fc, ec="#222", lw=0.4))

    # FLOOR — both rooms
    add_box(-100, -100, -50, room_d*2 + wall_t + 200, flat_w + 200, 50,
            "#bda87d")
    # BACK WALL (away from viewer)
    add_box(-100, flat_w, 0, room_d*2 + wall_t + 200, 100, ceil,
            "#f2eadc")
    # CEILING — semi-cutaway (omit so we see inside) — represented by cornice strip
    add_box(-100, flat_w-200, ceil-150, room_d*2 + wall_t + 200, 200, 30,
            "#f5e8d0")

    # DIVIDING WALL — broken into 3 parts around the new opening
    div_x = room_d
    # Left nib (full height)
    add_box(div_x, 0, 0, wall_t, nib_l, ceil, "#c8c0a8")
    # Right nib
    add_box(div_x, nib_l + clear_w, 0, wall_t, nib_r, ceil, "#c8c0a8")
    # Wall above head (lintel zone)
    add_box(div_x, nib_l, head_h, wall_t, clear_w, ceil - head_h, "#c8c0a8")
    # STEEL BEAM (highlighted orange) just above head
    add_box(div_x - 25, nib_l - 25, head_h, wall_t + 50, clear_w + 50, 220,
            "#e89a6a")
    # Skirting on the floor strips
    skirt_h = 150
    add_box(-100, flat_w-30, 0, room_d - 100, 30, skirt_h, "#a37d4a")
    add_box(div_x + wall_t + 100, flat_w-30, 0, room_d - 100, 30, skirt_h, "#a37d4a")

    # ROOM LABELS
    fl_label_pos = iso(room_d * 0.5, flat_w * 0.4, 1400)
    ax.text(fl_label_pos[0], fl_label_pos[1], "FRONT LOUNGE\n(ceiling 3.28 m)",
            fontsize=10, weight="bold", ha="center", va="center", color="#664422",
            bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="#664422", lw=0.4))
    rr_label_pos = iso(div_x + wall_t + room_d * 0.5, flat_w * 0.4, 1400)
    ax.text(rr_label_pos[0], rr_label_pos[1], "REAR RECEPTION\n(ceiling 3.28 m)\n[+350 mm wider]",
            fontsize=10, weight="bold", ha="center", va="center", color="#664422",
            bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="#664422", lw=0.4))

    # Title strip
    ax.text(210, 285, "PROPOSED OPENING — Isometric cutaway",
            fontsize=11, weight="bold", ha="center", va="top", color="#aa3322")
    ax.text(210, 278, "View into the front lounge looking toward the rear reception. Ceiling + side walls omitted.",
            fontsize=7.5, style="italic", ha="center", va="top", color="#666")

    # Callouts
    head_target = iso(div_x + wall_t/2, nib_l + clear_w/2, head_h + 100)
    beam_target = iso(div_x + wall_t/2, nib_l + clear_w/2, head_h + 200)
    nib_l_target = iso(div_x + wall_t/2, nib_l/2, 1500)
    nib_r_target = iso(div_x + wall_t/2, nib_l + clear_w + nib_r/2, 1500)
    callouts = [
        ("1", head_target, 320, 240,
         f"Clear opening:\n{clear_w} mm wide × {head_h} mm high"),
        ("2", beam_target, 320, 200,
         "Steel beam + padstones\n(orange) — by engineer."),
        ("3", nib_l_target, 320, 165,
         f"Retained nib (L) {nib_l} mm —\nmoulded architrave to match."),
        ("4", nib_r_target, 320, 130,
         f"Retained nib (R) {nib_r} mm —\ncornice cut & re-run across head."),
    ]
    for num, target, sx, sy, text in callouts:
        tx, ty = target
        ax.plot([sx, tx], [sy, ty], color="#cc1f1f", lw=0.5, zorder=10)
        ax.plot(tx, ty, marker=".", markersize=3, color="#cc1f1f", zorder=10)
        ax.add_patch(MPCircle((sx, sy), 3.6, fc="#cc1f1f", ec="white",
                              lw=0.6, zorder=11))
        ax.text(sx, sy, num, color="white", fontsize=7.5, weight="bold",
                ha="center", va="center", zorder=12)
        ax.text(sx + 6, sy, text, fontsize=7, ha="left", va="center", zorder=10)

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "12_opening_3d", out_dir)
    print(f"Wrote {pdf}")
    return


def _placeholder_unused():
    pass


if __name__ == "__main__":
    render_courtyard_3d()
    render_bathroom_3d()
    render_internal_opening_3d()
