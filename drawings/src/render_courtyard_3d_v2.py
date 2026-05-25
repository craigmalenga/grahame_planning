"""Sheet 10 — Improved 3D axonometric of the rear courtyard.

Principles:
  * Walls bordering the courtyard from the dwelling side (south, east) are
    drawn semi-transparent so the viewer SEES through them onto the courtyard
    surfaces with the openings/staircase.
  * Boundary walls (west party, north rear-boundary) are drawn almost
    invisibly (alpha ≈ 0.05) — they would otherwise occlude the courtyard.
  * Higher polygon count, faithful materials palette, opening detail
    matching the 2D elevations.
  * Numbered callouts overlaid in red, ChatGPT-style.
"""
from __future__ import annotations
from pathlib import Path
import sys, math
import yaml
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection, Line3DCollection
import matplotlib.image as mpimg

sys.path.insert(0, str(Path(__file__).parent))
from sheet import new_a3_landscape, Scale, save_sheet, A3_W_MM, A3_H_MM


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def add_box(polys, colors, alphas, x, y, z, w, d, h, color, alpha=1.0,
            faces_to_skip=()):
    """Append the 6 faces of an axis-aligned box. faces_to_skip suppresses
    specific faces to avoid drawing redundant inner surfaces.
    """
    p = [[x,     y,     z],
         [x + w, y,     z],
         [x + w, y + d, z],
         [x,     y + d, z],
         [x,     y,     z + h],
         [x + w, y,     z + h],
         [x + w, y + d, z + h],
         [x,     y + d, z + h]]
    faces = {
        "south":  [p[0], p[1], p[5], p[4]],
        "north":  [p[2], p[3], p[7], p[6]],
        "east":   [p[1], p[2], p[6], p[5]],
        "west":   [p[0], p[3], p[7], p[4]],
        "top":    [p[4], p[5], p[6], p[7]],
        "bottom": [p[0], p[1], p[2], p[3]],
    }
    for name, f in faces.items():
        if name in faces_to_skip:
            continue
        polys.append(f); colors.append(color); alphas.append(alpha)


def brick_coursing_pattern(polys, colors, alphas, x, y, z, w, h,
                            face="south", course_h=75, brick_w=225,
                            base_color="#c6a070", joint_color="#7a5530",
                            alpha=1.0):
    """Approximate brick coursing on a plane by drawing thin horizontal +
    vertical 'joints' as dark polygons just above the wall face."""
    # Just darken the courses faintly — too many polys = slow render.
    # Add 1 horizontal stripe every 4 courses (= ~300 mm) for visual rhythm.
    n_courses = int(h / (course_h * 4))
    eps = 5
    for i in range(1, n_courses + 1):
        cy = z + i * course_h * 4
        if face == "south":
            pts = [[x, y - eps, cy], [x + w, y - eps, cy],
                   [x + w, y - eps, cy + 2], [x, y - eps, cy + 2]]
        elif face == "west":
            pts = [[x - eps, y, cy], [x - eps, y + h, cy],
                   [x - eps, y + h, cy + 2], [x - eps, y, cy + 2]]
        else:
            continue
        polys.append(pts); colors.append(joint_color); alphas.append(alpha * 0.5)


def render_courtyard_3d():
    dims = load_dims()
    cw = dims["courtyard"]["plan_width_mm"]      # east-west 3250
    cd = dims["courtyard"]["plan_depth_mm"]      # north-south 2950
    slab_to_ffl = dims["courtyard"]["slab_to_gf_ffl_mm"]   # 3000 (Rev B)
    white_line = dims["courtyard"]["white_paint_datum_mm"]  # 2900
    kitchen_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]
    rec_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["rear_reception"]
    ext_t = 350
    parapet = slab_to_ffl + rec_h + 400

    polys, colors, alphas = [], [], []

    # ============================================================
    # WORLD coords:
    #   x: east-west across courtyard (0..cw, with 0 = west boundary)
    #   y: north-south depth          (0..cd, with 0 = south = dwelling side)
    #   z: up
    # The INSIDE CORNER of the L is at (cw, 0).
    # ============================================================

    # ---- Courtyard slab (paving) ----
    add_box(polys, colors, alphas, 0, 0, -50, cw, cd, 50,
            color="#c8b89a", alpha=1.0)

    # ---- BOUNDARY WALLS (west party + north rear) — nearly invisible ----
    # West (left) party wall with No. 22
    add_box(polys, colors, alphas, -ext_t, 0, 0, ext_t, cd,
            dims["courtyard"]["rear_boundary_wall_height_mm"],
            color="#a08560", alpha=0.06)
    # North (back) rear boundary
    add_box(polys, colors, alphas, -ext_t, cd, 0, cw + 2 * ext_t, ext_t,
            dims["courtyard"]["rear_boundary_wall_height_mm"],
            color="#a08560", alpha=0.06)

    # ---- DWELLING WALLS (south = rear wall, east = side wall) ----
    # Semi-transparent so we see the staircase + interior detail through them.
    # We render each wall as a separate "skin" so we can punch the openings.
    wall_alpha_low = 0.92   # below white-line — white-painted brick
    wall_alpha_up  = 0.55   # above white-line — see-through yellow brick

    # ---- SOUTH WALL (rear wall) — between courtyard and rear reception ----
    # Lower (below white-line) = white-painted brick except recessed bay
    lower_low = dims["rear_wall"]["lower_basement"]
    cheek_l = lower_low["left_painted_cheek_mm"]
    recess_w = lower_low["recess_width_mm"]
    cheek_r = lower_low["right_painted_cheek_mm"]
    door_w = lower_low["central_door_width_mm"]
    sw_w = lower_low["side_window_width_mm"]
    rev = lower_low["inner_reveal_mm"]
    sw_sill = lower_low["side_window_raised_sill_height_mm"]
    door_head = lower_low["head_height_above_slab_mm"]
    # Painted brick cheeks (full white-line height)
    add_box(polys, colors, alphas, 0, -ext_t, 0, cheek_l, ext_t, white_line,
            color="#f7f2e6", alpha=wall_alpha_low)
    add_box(polys, colors, alphas, cheek_l + recess_w, -ext_t, 0,
            cheek_r, ext_t, white_line,
            color="#f7f2e6", alpha=wall_alpha_low)
    # Recess outer plane (painted brick face at the wall plane)
    # Within the recess we punch out 3 openings: 2 side sashes + central door
    # Bottom strip: the assembly is centred; place the L sash, door, R sash
    asm_w = rev + sw_w + rev + door_w + rev + sw_w + rev
    asm_x0 = cheek_l + (recess_w - asm_w) / 2
    # Brick between cheek and assembly (left + right margins inside recess)
    add_box(polys, colors, alphas, cheek_l, -ext_t, 0,
            asm_x0 - cheek_l, ext_t, white_line,
            color="#f7f2e6", alpha=wall_alpha_low)
    add_box(polys, colors, alphas, asm_x0 + asm_w, -ext_t, 0,
            cheek_l + recess_w - (asm_x0 + asm_w), ext_t, white_line,
            color="#f7f2e6", alpha=wall_alpha_low)
    # Left side sash with raised brick sill panel below
    lsw_x = asm_x0 + rev
    add_box(polys, colors, alphas, lsw_x, -ext_t, 0,
            sw_w, ext_t, sw_sill,
            color="#f7f2e6", alpha=wall_alpha_low)
    # Glass for left sash
    add_box(polys, colors, alphas, lsw_x, -ext_t - 5, sw_sill,
            sw_w, 10, door_head - sw_sill,
            color="#b8d4e0", alpha=0.85)
    # White stone sill projection
    add_box(polys, colors, alphas, lsw_x - 30, -ext_t - 40, sw_sill - 30,
            sw_w + 60, 40, 30,
            color="#e8e4dc", alpha=1.0)
    # Central door
    door_x = lsw_x + sw_w + rev
    # Door panel (dark timber bottom + glazing top)
    add_box(polys, colors, alphas, door_x, -ext_t - 20, 0,
            door_w, 20, door_head * 0.55,
            color="#3d2a1a", alpha=1.0)
    add_box(polys, colors, alphas, door_x, -ext_t - 20, door_head * 0.55,
            door_w, 20, door_head * 0.45,
            color="#b8d4e0", alpha=0.85)
    # Door threshold (slate)
    add_box(polys, colors, alphas, door_x - 30, -ext_t - 60, 0,
            door_w + 60, 60, 40,
            color="#4a4a4a", alpha=1.0)
    # Right side sash mirror
    rsw_x = door_x + door_w + rev
    add_box(polys, colors, alphas, rsw_x, -ext_t, 0,
            sw_w, ext_t, sw_sill,
            color="#f7f2e6", alpha=wall_alpha_low)
    add_box(polys, colors, alphas, rsw_x, -ext_t - 5, sw_sill,
            sw_w, 10, door_head - sw_sill,
            color="#b8d4e0", alpha=0.85)
    add_box(polys, colors, alphas, rsw_x - 30, -ext_t - 40, sw_sill - 30,
            sw_w + 60, 40, 30,
            color="#e8e4dc", alpha=1.0)
    # Wall above door/window head but below white-line (red-brick arch zone)
    add_box(polys, colors, alphas, asm_x0, -ext_t, door_head,
            asm_w, ext_t, white_line - door_head,
            color="#c8754a", alpha=wall_alpha_low)
    # Brick coursing on the painted-brick cheeks (very subtle)
    # Above white-line = yellow-stock brick
    add_box(polys, colors, alphas, 0, -ext_t, white_line,
            cw, ext_t, parapet - white_line,
            color="#d2b06e", alpha=wall_alpha_up)
    # Upper rear-reception sash (~2100 × 2200, sill at 3800 above slab)
    up = dims["rear_wall"]["upper_ground"]
    sash_w = up["sash_width_mm"]
    sash_h = up["sash_height_mm"]
    ssill = up["sill_height_above_courtyard_slab_mm"]
    sash_x = up["horizontal_position_from_east_corner_mm"]
    add_box(polys, colors, alphas, sash_x, -ext_t - 5, ssill,
            sash_w, 10, sash_h,
            color="#b8d4e0", alpha=0.9)
    # Red-brick flat arch over upper sash
    add_box(polys, colors, alphas, sash_x - 30, -ext_t - 6,
            ssill + sash_h,
            sash_w + 60, 12, 120,
            color="#b85a3a", alpha=1.0)
    # Upper sash stone sill
    add_box(polys, colors, alphas, sash_x - 30, -ext_t - 40,
            ssill - 30,
            sash_w + 60, 40, 30,
            color="#e8e4dc", alpha=1.0)
    # Red-brick flat arch over the door/window assembly (lower)
    add_box(polys, colors, alphas, asm_x0 - 30, -ext_t - 6,
            white_line - 80,
            asm_w + 60, 12, 80,
            color="#b85a3a", alpha=1.0)

    # ---- EAST WALL (side wall) — between courtyard and kitchen ----
    # Lower (below white-line) = white-painted brick
    side = dims["side_wall"]
    seq = side["lower_basement"]["sequence_from_north_mm"]
    sill_low = side["lower_basement"]["both_openings_sill_height_above_slab_mm"]
    h_low = side["lower_basement"]["both_openings_height_mm"]
    y_cur = cd  # north end of side wall
    for seg in seq:
        seg_y0 = y_cur - seg["length"]
        seg_y1 = y_cur
        if seg.get("type") == "window":
            # Brick below sill
            add_box(polys, colors, alphas, cw, seg_y0, 0,
                    ext_t, seg["length"], sill_low,
                    color="#f7f2e6", alpha=wall_alpha_low)
            # Glass
            add_box(polys, colors, alphas, cw + ext_t - 5, seg_y0, sill_low,
                    10, seg["length"], h_low,
                    color="#b8d4e0", alpha=0.85)
            # Brick above head up to white-line
            add_box(polys, colors, alphas, cw, seg_y0, sill_low + h_low,
                    ext_t, seg["length"], white_line - sill_low - h_low,
                    color="#f7f2e6", alpha=wall_alpha_low)
            # Red flat arch
            add_box(polys, colors, alphas, cw + ext_t - 8, seg_y0 - 30,
                    sill_low + h_low,
                    16, seg["length"] + 60, 100,
                    color="#b85a3a", alpha=1.0)
        elif seg.get("type") == "blocked_window":
            # Currently bricked-up: same colour as wall (slight tonal shift)
            add_box(polys, colors, alphas, cw, seg_y0, 0,
                    ext_t, seg["length"], white_line,
                    color="#e2cfae", alpha=wall_alpha_low)
        else:
            add_box(polys, colors, alphas, cw, seg_y0, 0,
                    ext_t, seg["length"], white_line,
                    color="#f7f2e6", alpha=wall_alpha_low)
        y_cur = seg_y0
    # Above white-line: yellow stock brick
    add_box(polys, colors, alphas, cw, 0, white_line,
            ext_t, cd, parapet - white_line,
            color="#d2b06e", alpha=wall_alpha_up)
    # Upper kitchen window — PROPOSED doorway (extends down to GF FFL)
    upper = side["upper_ground"]
    kwx_centre_y = cd - upper["horizontal_position_from_north_corner_mm"]
    door_clear = dims["proposed"]["side_wall_upper_doorway"]["clear_width_mm"]
    door_thresh = slab_to_ffl
    door_head = slab_to_ffl + dims["proposed"]["side_wall_upper_doorway"]["head_height_above_kitchen_ffl_mm"]
    # Glass door panel
    add_box(polys, colors, alphas, cw + ext_t - 5,
            kwx_centre_y - door_clear / 2, door_thresh,
            10, door_clear, door_head - door_thresh,
            color="#b8d4e0", alpha=0.9)
    # Red flat arch over the new doorway
    add_box(polys, colors, alphas, cw + ext_t - 8,
            kwx_centre_y - door_clear / 2 - 30, door_head,
            16, door_clear + 60, 100,
            color="#b85a3a", alpha=1.0)
    # Pink highlight rectangle for the new doorway aperture (planning-callout colour)
    add_box(polys, colors, alphas, cw + ext_t - 2,
            kwx_centre_y - door_clear / 2, door_thresh,
            4, door_clear, door_head - door_thresh,
            color="#ff80a0", alpha=0.4)

    # ---- L-CORNER DOWNPIPE on east wall (PROPOSED: straight down in corner) ----
    pipe_x = cw + ext_t + 30
    pipe_y = 50   # close to south end (inside L corner)
    add_box(polys, colors, alphas, pipe_x, pipe_y, 0,
            45, 45, parapet,
            color="#1a1a1a", alpha=1.0)
    # Hopper at top
    add_box(polys, colors, alphas, pipe_x - 40, pipe_y - 30, parapet - 200,
            130, 90, 180,
            color="#1a1a1a", alpha=1.0)

    # ---- SPIRAL STAIRCASE in the inside corner ----
    sp = dims["spiral_staircase"]
    stair_cx = cw - 950
    stair_cy = 950
    stair_cz = 0
    r_pole = sp["central_pole_diameter_mm"] / 2
    r_out = sp["outer_radius_mm"]
    n_treads = sp["n_treads"]
    rise = sp["tread_rise_mm"]
    rot = sp["rotation_per_tread_deg"]
    start_a = sp["start_angle_deg"]
    pole_top = sp["central_pole_height_mm"]
    handrail_h = sp["handrail_height_mm"]
    # Central pole — finer (24-sided)
    pole_sides = 24
    for i in range(pole_sides):
        a0 = i * 2 * math.pi / pole_sides
        a1 = (i + 1) * 2 * math.pi / pole_sides
        x0p, y0p = stair_cx + r_pole * math.cos(a0), stair_cy + r_pole * math.sin(a0)
        x1p, y1p = stair_cx + r_pole * math.cos(a1), stair_cy + r_pole * math.sin(a1)
        polys.append([[x0p, y0p, stair_cz], [x1p, y1p, stair_cz],
                      [x1p, y1p, pole_top], [x0p, y0p, pole_top]])
        colors.append("#181818"); alphas.append(1.0)
    # Treads — wedges
    n_segs = 6  # subdivide each tread wedge for smoother curve
    for i in range(n_treads):
        z_top = (i + 1) * rise
        z_bot = z_top - sp["tread_thickness_mm"]
        a_start = math.radians(start_a + i * rot)
        a_end = math.radians(start_a + (i + 1) * rot)
        for s in range(n_segs):
            a0 = a_start + (a_end - a_start) * s / n_segs
            a1 = a_start + (a_end - a_start) * (s + 1) / n_segs
            # Top
            p00 = [stair_cx + r_pole * math.cos(a0), stair_cy + r_pole * math.sin(a0), z_top]
            p01 = [stair_cx + r_out * math.cos(a0), stair_cy + r_out * math.sin(a0), z_top]
            p11 = [stair_cx + r_out * math.cos(a1), stair_cy + r_out * math.sin(a1), z_top]
            p10 = [stair_cx + r_pole * math.cos(a1), stair_cy + r_pole * math.sin(a1), z_top]
            polys.append([p00, p01, p11, p10]); colors.append("#2a2a2a"); alphas.append(1.0)
            # Outer skirt
            p01b = [p01[0], p01[1], z_bot]
            p11b = [p11[0], p11[1], z_bot]
            polys.append([p01, p11, p11b, p01b]); colors.append("#1a1a1a"); alphas.append(1.0)
            # Bottom
            p00b = [p00[0], p00[1], z_bot]
            p10b = [p10[0], p10[1], z_bot]
            polys.append([p00b, p10b, p11b, p01b]); colors.append("#222"); alphas.append(0.95)
    # Handrail tube — sequence of small cylinders along the spiral
    hr_n = 80
    for s in range(hr_n):
        t = s / hr_n
        t2 = (s + 1) / hr_n
        z = t * (n_treads * rise) + handrail_h
        z2 = t2 * (n_treads * rise) + handrail_h
        a = math.radians(start_a + t * n_treads * rot)
        a2 = math.radians(start_a + t2 * n_treads * rot)
        x0p = stair_cx + r_out * math.cos(a); y0p = stair_cy + r_out * math.sin(a)
        x1p = stair_cx + r_out * math.cos(a2); y1p = stair_cy + r_out * math.sin(a2)
        # Draw as a thin quad
        polys.append([[x0p - 15, y0p, z], [x0p + 15, y0p, z],
                      [x1p + 15, y1p, z2], [x1p - 15, y1p, z2]])
        colors.append("#0e0e0e"); alphas.append(1.0)
    # Landing pad at top tread
    z_land = n_treads * rise
    a_land = math.radians(start_a + n_treads * rot)
    # The landing extends from staircase edge to the wall doorway
    polys.append([
        [stair_cx + r_pole, stair_cy, z_land],
        [stair_cx + r_out, stair_cy + 100, z_land],
        [cw - 50, kwx_centre_y + door_clear / 2 - 50, z_land],
        [cw - 50, kwx_centre_y - door_clear / 2 + 50, z_land],
    ])
    colors.append("#222"); alphas.append(1.0)
    # Landing handrail post (vertical)
    polys.append([[cw - 80, kwx_centre_y - door_clear / 2,  z_land],
                  [cw - 80, kwx_centre_y - door_clear / 2 + 60, z_land],
                  [cw - 80, kwx_centre_y - door_clear / 2 + 60, z_land + handrail_h],
                  [cw - 80, kwx_centre_y - door_clear / 2,  z_land + handrail_h]])
    colors.append("#0e0e0e"); alphas.append(1.0)

    # ============================================================
    # RENDER
    # ============================================================
    fig3d = plt.figure(figsize=(14, 10), dpi=200)
    ax3d = fig3d.add_subplot(111, projection="3d")
    # Group polygons by alpha for cleaner Poly3DCollection batches
    # (matplotlib applies a single facecolor list but we vary alpha via RGBA)
    rgba_colors = []
    for c, a in zip(colors, alphas):
        c0 = c.lstrip("#")
        if len(c0) == 3:
            c0 = "".join(ch * 2 for ch in c0)
        if len(c0) != 6:
            r, g, b = 0.5, 0.5, 0.5
        else:
            r = int(c0[0:2], 16) / 255
            g = int(c0[2:4], 16) / 255
            b = int(c0[4:6], 16) / 255
        rgba_colors.append((r, g, b, a))
    pc = Poly3DCollection(polys, facecolors=rgba_colors,
                          edgecolors=(0, 0, 0, 0.25),
                          linewidths=0.18)
    ax3d.add_collection3d(pc)

    # Camera: from NW above looking SE into the inside L corner
    ax3d.set_xlim(-ext_t - 100, cw + ext_t + 200)
    ax3d.set_ylim(-ext_t - 400, cd + ext_t + 100)
    ax3d.set_zlim(0, parapet + 200)
    ax3d.set_box_aspect([cw + 700, cd + 700, parapet + 200])
    ax3d.view_init(elev=22, azim=125)
    ax3d.set_proj_type('persp')
    ax3d.set_axis_off()

    tmp_png = Path("/tmp/courtyard_3d_v2.png")
    fig3d.savefig(tmp_png, dpi=200, bbox_inches="tight", pad_inches=0.05,
                  facecolor="white")
    plt.close(fig3d)

    # ============================================================
    # Compose onto A3 sheet with numbered callouts
    # ============================================================
    fig, ax = new_a3_landscape(
        title="3D AXONOMETRIC — Rear courtyard with proposed spiral staircase",
        drawing_no="10",
        scale=Scale(50),   # nominal; the 3D is not scaled
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )
    img = mpimg.imread(tmp_png)
    img_l, img_r = 18, 280
    img_b, img_t = 18, 280
    ax.imshow(img, extent=[img_l, img_r, img_b, img_t], aspect="auto", zorder=2)

    # Numbered callouts (red, ChatGPT-style) overlaid in sheet-mm space.
    # Each callout: a red filled circle with number, a leader line, and a
    # short text on the right margin.
    callouts = [
        # (number, sheet_x, sheet_y, target_x, target_y, text)
        ("1", 290, 250,  235, 218,
         "Kitchen window lowered to floor\n"
         "level and enlarged to form\n"
         "new glazed timber doorway."),
        ("2", 290, 218,  220, 175,
         "Reclaimed Victorian cast-iron\n"
         "spiral staircase in inside corner\n"
         "of the L (15 risers × 200 mm)."),
        ("3", 290, 186,  175, 230,
         "Existing rear-reception sash\n"
         "(2100 × 2200) retained."),
        ("4", 290, 154,  155, 178,
         "Red-brick flat arches over\n"
         "openings — retained / matched."),
        ("5", 290, 122,  165, 115,
         "Existing rear-access bay:\n"
         "central door + 2 flanking\n"
         "sash windows under one arch."),
        ("6", 290, 90,   255, 200,
         "Existing C.I. downpipe in\n"
         "L corner — rerouted straight\n"
         "down clear of staircase."),
        ("7", 290, 58,   90,  130,
         "Boundary walls shown\n"
         "near-transparent so the\n"
         "L-shape reads clearly."),
    ]
    for num, sx, sy, tx, ty, text in callouts:
        # Red leader line
        ax.plot([sx, tx], [sy, ty], color="#cc1f1f", lw=0.6, zorder=4)
        # Target dot
        ax.plot(tx, ty, marker=".", markersize=3, color="#cc1f1f", zorder=4)
        # Numbered circle
        ax.add_patch(plt.Circle((sx, sy), 3.6, fc="#cc1f1f", ec="white",
                                lw=0.6, zorder=5))
        ax.text(sx, sy, num, color="white", fontsize=8, weight="bold",
                ha="center", va="center", zorder=6)
        # Text
        ax.text(sx + 6, sy, text, fontsize=7, ha="left", va="center",
                color="#222", zorder=5)

    # Caption
    ax.text(img_l, img_t + 2,
            "View: NW → SE into the inside corner of the L. Boundary walls "
            "(west party + north rear) shown at α≈0.06 so the staircase and "
            "openings are visible. Dwelling walls semi-transparent (α≈0.55 "
            "upper / 0.92 lower).",
            fontsize=6, style="italic", ha="left", va="bottom", color="#444")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "10_courtyard_3d", out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render_courtyard_3d()
