"""Sheet 04 — REAR WALL elevation (south wall of courtyard)

Existing + proposed. Lower: recessed double-door bay between painted cheeks.
Upper: large multi-pane rear-reception sash window.
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml
from matplotlib.patches import Rectangle

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet)
from elevation_primitives import (sash_window, double_door, brick_wall,
                                   flat_arch, ground_line, downpipe)
from matplotlib.patches import Rectangle


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_rear_wall_elevation(ax, w, dims, proposed=False,
                              ox_world=0, oy_world=0):
    rear = dims["rear_wall"]
    wall_w = rear["total_width_mm"]   # 3250
    gf_ffl = dims["courtyard"]["slab_to_gf_ffl_mm"]
    white_line = dims["courtyard"]["white_paint_datum_mm"]
    rec_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["rear_reception"]
    gf_ceiling = gf_ffl + rec_h
    parapet = gf_ceiling + 800
    wall_h = parapet

    x0, y0 = ox_world, oy_world

    # Brick field
    brick_wall(ax, w, x0, y0 + white_line, wall_w, wall_h - white_line,
               painted=False)
    brick_wall(ax, w, x0, y0, wall_w, white_line,
               painted=True, paint_color="#f8f4ec")
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(wall_w), w.s(wall_h),
                           fill=False, ec="#000", lw=1.1))

    # White-line and FFL datums
    ax.plot([w.x(x0), w.x(x0 + wall_w)],
            [w.y(y0 + white_line), w.y(y0 + white_line)],
            color="#bbb", lw=0.3)
    ax.plot([w.x(x0), w.x(x0 + wall_w)],
            [w.y(y0 + gf_ffl), w.y(y0 + gf_ffl)],
            color="#888", lw=0.3, linestyle=(0, (4, 2)))
    ax.text(*w.p(x0 - 80, y0 + gf_ffl),
            "GF FFL\n+2820", fontsize=5, ha="right", va="center", color="#888")
    ax.text(*w.p(x0 - 80, y0),
            "Courtyard\nslab ±0", fontsize=5, ha="right", va="center", color="#888")

    # ---- LOWER: recessed bay with CENTRAL DOOR + 2 FLANKING SASH WINDOWS ----
    lower = rear["lower_basement"]
    cheek_l = lower["left_painted_cheek_mm"]
    recess_w = lower["recess_width_mm"]
    cheek_r = lower["right_painted_cheek_mm"]
    recess_x0 = x0 + cheek_l
    head_h = lower["head_height_above_slab_mm"]    # 2300 — head of door & side-window
    head_line = lower["head_to_white_line_mm"]      # 2900 — white-line above arch
    sw_w = lower["side_window_width_mm"]            # 450 each
    sw_sill = lower["side_window_raised_sill_height_mm"]   # 600
    door_w = lower["central_door_width_mm"]          # 900
    rev = lower["inner_reveal_mm"]                   # 25

    # Recess outline (faint dashed)
    ax.add_patch(Rectangle(w.p(recess_x0, y0),
                           w.s(recess_w), w.s(head_line),
                           fill=False, ec="#aaa", lw=0.4,
                           linestyle=(0, (3, 2))))

    # Position the 3-part assembly within the 1850 mm recess, centred
    asm_w = rev + sw_w + rev + door_w + rev + sw_w + rev
    asm_x0 = recess_x0 + (recess_w - asm_w) / 2
    # LEFT side window
    lsw_x0 = asm_x0 + rev
    # Brick infill below the raised sill
    ax.add_patch(Rectangle(w.p(lsw_x0, y0),
                           w.s(sw_w), w.s(sw_sill),
                           fc="#f0e8d8", ec="#000", lw=0.3))
    # The sash itself
    sash_window(ax, w, lsw_x0, y0 + sw_sill,
                sw_w, head_h - sw_sill,
                panes_horiz=1, panes_vert=2,
                label=None)
    # CENTRAL DOOR
    door_x0 = lsw_x0 + sw_w + rev
    ax.add_patch(Rectangle(w.p(door_x0, y0),
                           w.s(door_w), w.s(head_h),
                           fc="#3d2a1a", ec="#000", lw=0.8))
    # Door panel detail
    # Upper glazed half
    glaz_split = y0 + head_h * 0.55
    ax.add_patch(Rectangle(w.p(door_x0 + 60, glaz_split),
                           w.s(door_w - 120), w.s(head_h * 0.45 - 60),
                           fc="#e9f1f5", ec="#222", lw=0.4))
    ax.plot([w.x(door_x0 + door_w / 2), w.x(door_x0 + door_w / 2)],
            [w.y(glaz_split), w.y(y0 + head_h - 60)],
            color="#222", lw=0.3)
    # Lower panel — simple two-rail timber
    ax.add_patch(Rectangle(w.p(door_x0 + 60, y0 + 60),
                           w.s(door_w - 120), w.s(glaz_split - y0 - 120),
                           fc="#5a3a22", ec="#222", lw=0.4))
    # Handle
    ax.plot(*w.p(door_x0 + door_w - 120, y0 + head_h * 0.45),
            marker="o", markersize=2, color="#cc9900")
    # Threshold line under door
    ax.plot([w.x(door_x0), w.x(door_x0 + door_w)],
            [w.y(y0), w.y(y0)], color="#000", lw=0.7)

    # RIGHT side window — symmetrical
    rsw_x0 = door_x0 + door_w + rev
    ax.add_patch(Rectangle(w.p(rsw_x0, y0),
                           w.s(sw_w), w.s(sw_sill),
                           fc="#f0e8d8", ec="#000", lw=0.3))
    sash_window(ax, w, rsw_x0, y0 + sw_sill,
                sw_w, head_h - sw_sill,
                panes_horiz=1, panes_vert=2,
                label=None)

    # Red flat arch over the entire 3-part assembly (single arch)
    flat_arch(ax, w, asm_x0, y0 + head_h, asm_w, height=120)

    # White stone sill projecting under the door + 2 windows
    ax.add_patch(Rectangle(w.p(asm_x0 - 30, y0 + sw_sill - 30),
                           w.s(sw_w + 2 * rev + 60),
                           w.s(30),
                           fc="#dddddd", ec="#000", lw=0.3))
    ax.add_patch(Rectangle(w.p(rsw_x0 - 30, y0 + sw_sill - 30),
                           w.s(sw_w + 60),
                           w.s(30),
                           fc="#dddddd", ec="#000", lw=0.3))

    # Painted cheek labels
    ax.text(*w.p(x0 + cheek_l / 2, y0 + 400),
            "white-painted\nbrick cheek\n720 mm",
            fontsize=5, ha="center", va="center", style="italic", color="#444")
    ax.text(*w.p(x0 + cheek_l + recess_w + cheek_r / 2, y0 + 400),
            "white-painted\nbrick cheek\n720 mm",
            fontsize=5, ha="center", va="center", style="italic", color="#444")

    # Assembly labels
    ax.text(*w.p(lsw_x0 + sw_w / 2, y0 + sw_sill / 2),
            "Brick\nsill\ninfill", fontsize=4, ha="center", va="center",
            color="#444", style="italic")
    ax.text(*w.p(rsw_x0 + sw_w / 2, y0 + sw_sill / 2),
            "Brick\nsill\ninfill", fontsize=4, ha="center", va="center",
            color="#444", style="italic")
    ax.text(*w.p(lsw_x0 + sw_w / 2, y0 + (sw_sill + head_h) / 2),
            f"Side\nsash\n{sw_w}", fontsize=4.5, ha="center", va="center",
            color="#444", style="italic")
    ax.text(*w.p(rsw_x0 + sw_w / 2, y0 + (sw_sill + head_h) / 2),
            f"Side\nsash\n{sw_w}", fontsize=4.5, ha="center", va="center",
            color="#444", style="italic")
    ax.text(*w.p(door_x0 + door_w / 2, y0 + head_h + 250),
            f"Central\ndoor\n{door_w}",
            fontsize=5, ha="center", va="bottom", color="#444", style="italic")

    # ---- UPPER: large rear-reception sash window ----
    up = rear["upper_ground"]
    sash_w = up["sash_width_mm"]
    sash_h = up["sash_height_mm"]
    sill_up = up["sill_height_above_courtyard_slab_mm"]
    sash_x0 = x0 + up["horizontal_position_from_east_corner_mm"]
    sash_window(ax, w, sash_x0, y0 + sill_up, sash_w, sash_h,
                panes_horiz=3, panes_vert=6,
                label=f"Existing rear reception\nmulti-pane sash\n{sash_w} × {sash_h}",
                label_above=False)
    flat_arch(ax, w, sash_x0, y0 + sill_up + sash_h, sash_w)

    # ---- Existing downpipe on rear wall — LEFT inside-corner only ----
    # (Rev B: removed the "right" downpipe — it was not visible in any photo.)
    # The L-corner downpipe is conventionally shown on the SIDE-wall
    # elevation (since it sits AT the corner), so we represent it only as a
    # small dashed indicator on the rear wall.
    dp_left_x = x0 + dims["existing_services"]["downpipe_rear_wall_left"]["position_from_east_corner_mm"]
    ax.plot([w.x(dp_left_x), w.x(dp_left_x)], [w.y(y0), w.y(y0 + parapet)],
            color="#000", lw=0.4, linestyle=(0, (3, 2)), alpha=0.5)
    ax.text(*w.p(dp_left_x + 50, y0 + 800),
            "Existing C.I. downpipe at L corner\n(see SIDE-wall elevation, dwg 03)",
            fontsize=4.5, ha="left", va="center", color="#666", style="italic")
    dp_right_x = None  # not used downstream

    # ---- PROPOSED: superimpose the spiral staircase as it appears when
    # viewing the rear wall square-on (i.e. you see through the courtyard,
    # the staircase visually covers part of the wall composition).
    if proposed:
        # The staircase centre sits 950 mm in from each of the rear wall
        # and the side wall.  Viewed at the REAR wall elevation, the
        # staircase's centre projects horizontally onto the wall at:
        #   x = side wall - centre_distance_from_side_wall
        #     = wall_w - 950  (i.e. very close to the east end, in the L corner)
        # (Drawing the rear wall with east at LEFT or RIGHT?  The drawing
        #  conventionally shows the wall as seen FROM the courtyard, i.e.
        #  west on the LEFT and east on the RIGHT.  So x increases eastward
        #  and the inside corner of the L is at the RIGHT end of the wall.)
        # Inside corner of L is at the EAST end of the rear wall.
        # In this elevation, viewer faces SOUTH so EAST is on viewer's LEFT,
        # which in drawing coords is x = 0 (the LEFT end of the wall).
        # Staircase centre is 950 mm in from the side wall = 950 mm from
        # the EAST end of the rear wall, so at x = 950 (LEFT side of drawing).
        stair_cx_on_wall = dims["proposed"]["staircase_installation"]["centre_distance_from_side_wall_mm"]
        # The staircase is 950 mm in front of the rear wall (depth into courtyard).
        # We draw it as a SEMI-TRANSPARENT silhouette overlay on the rear-wall
        # elevation: a circle (envelope) + the central pole rising the full
        # height, with the rising tread spiral hinted at.
        sp = dims["spiral_staircase"]
        env_r = sp["envelope_radius_mm"]
        pole_r = sp["central_pole_diameter_mm"] / 2
        # Envelope circle (showing extents on the wall projection)
        from matplotlib.patches import Circle
        # We project the staircase silhouette: a "shadow" of the cylinder
        # of envelope radius covers the wall between x=cx-env_r and x=cx+env_r,
        # and y=0..2820 (top tread level + 900 handrail).
        total_rise = sp["n_treads"] * sp["tread_rise_mm"]
        handrail_top = total_rise + sp["handrail_height_mm"]
        # Semi-transparent silhouette
        ax.add_patch(Rectangle(w.p(stair_cx_on_wall - env_r, y0),
                               w.s(2 * env_r), w.s(handrail_top),
                               fc="#222222", ec="#111", lw=0.4,
                               alpha=0.18))
        # Central pole — opaque (visible "through" the silhouette)
        ax.add_patch(Rectangle(w.p(stair_cx_on_wall - pole_r, y0),
                               w.s(2 * pole_r), w.s(sp["central_pole_height_mm"]),
                               fc="#111111", ec="#000", lw=0.5))
        # Spiral of treads visible — draw alternating dashes around the pole
        import math
        for i in range(sp["n_treads"]):
            rise_y = y0 + (i + 1) * sp["tread_rise_mm"]
            angle = math.radians(sp["start_angle_deg"]
                                  + i * sp["rotation_per_tread_deg"])
            proj = math.cos(angle) * sp["outer_radius_mm"]
            slab_x0 = stair_cx_on_wall - 30
            slab_x1 = stair_cx_on_wall + proj
            ax.add_patch(Rectangle(
                w.p(min(slab_x0, slab_x1),
                    rise_y - sp["tread_thickness_mm"]),
                w.s(abs(slab_x1 - slab_x0)),
                w.s(sp["tread_thickness_mm"]),
                fc="#333", ec="#000", lw=0.3, alpha=0.85))
        # Handrail line (a sinuous curve)
        n_samples = 80
        rxs, rys = [], []
        for s in range(n_samples + 1):
            t = s / n_samples
            ry = y0 + t * total_rise + sp["handrail_height_mm"]
            a = math.radians(sp["start_angle_deg"]
                              + t * sp["n_treads"] * sp["rotation_per_tread_deg"])
            rx = stair_cx_on_wall + math.cos(a) * sp["outer_radius_mm"]
            rxs.append(w.x(rx)); rys.append(w.y(ry))
        ax.plot(rxs, rys, color="#111", lw=0.7, alpha=0.85)

        # Annotation — explain the superimposition
        ax.text(*w.p(stair_cx_on_wall, y0 + parapet + 600),
                "PROPOSED spiral staircase\n"
                "shown superimposed (semi-transparent)\n"
                "— this is the silhouette that visually obscures\n"
                "part of the rear wall when viewed square-on.",
                fontsize=6, ha="center", va="center", color="#aa0000",
                style="italic", weight="bold",
                bbox=dict(boxstyle="round,pad=0.4", fc="white",
                          ec="#aa0000", lw=0.5))
        # Indicate that the LEFT-corner downpipe will need rerouting
        ax.text(*w.p(dp_left_x - 50, y0 + 600),
                "↑ relocate\n(in staircase\nzone)", fontsize=5,
                ha="right", va="bottom", color="#aa0000",
                weight="bold", style="italic")

    # ---- Ground line ----
    ground_line(ax, w, x0 - 300, x0 + wall_w + 300, y0,
                hatch_depth=180, label="courtyard slab")

    # ---- DIMENSIONS ----
    yd = y0 - 600
    x_cursor = x0
    for label, ln in [("cheek", cheek_l),
                      ("recessed double-door bay", recess_w),
                      ("cheek", cheek_r)]:
        dim_horizontal(ax, w, x_cursor, x_cursor + ln, yd, label=f"{ln}")
        x_cursor += ln
    dim_horizontal(ax, w, x0, x0 + wall_w, yd - 400,
                   label=f"{wall_w}  (overall rear wall width)")

    # Upper sash width
    dim_horizontal(ax, w, sash_x0, sash_x0 + sash_w, y0 + sill_up + sash_h + 700,
                   label=f"{sash_w}")

    # Vertical dimensions
    xd = x0 - 700
    dim_vertical(ax, w, y0, y0 + head_line, xd, label=f"{head_line}")
    dim_vertical(ax, w, y0 + head_line, y0 + sill_up, xd - 400,
                 label=f"{sill_up - head_line}")
    dim_vertical(ax, w, y0 + sill_up, y0 + sill_up + sash_h, xd,
                 label=f"{sash_h}")
    dim_vertical(ax, w, y0, y0 + parapet, xd - 800,
                 label=f"{parapet} (overall)")
    # Sill to FFL inside
    ax.text(*w.p(sash_x0 - 250, y0 + sill_up - 200), "Sill +80\nfrom GF FFL\n(=80 cm)",
            fontsize=5, ha="right", va="top", color="#444", style="italic")

    # Orientation note
    ax.text(*w.p(x0 + wall_w / 2, y0 + parapet + 200),
            "Viewed FROM the courtyard, looking SOUTH at the rear-reception wall",
            fontsize=6, ha="center", va="center", style="italic")
    ax.text(*w.p(x0 - 50, y0 + parapet + 400),
            "← E", fontsize=8, ha="right", va="center", color="#555")
    ax.text(*w.p(x0 + wall_w + 50, y0 + parapet + 400),
            "W →", fontsize=8, ha="left", va="center", color="#555")


def render(proposed=False, dwg_no="04-A"):
    dims = load_dims()
    scale = Scale(50)
    title = ("PROPOSED REAR WALL ELEVATION — south wall of courtyard"
             if proposed else
             "EXISTING REAR WALL ELEVATION — south wall of courtyard")
    fig, ax = new_a3_landscape(
        title=title, drawing_no=dwg_no, scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
    )
    w = World(ax, scale, origin_sheet_xy=(75, 90))
    draw_rear_wall_elevation(ax, w, dims, proposed=proposed)

    # Notes
    notes_x, notes_y = 270, 270
    notes = [
        "NOTES — REAR WALL ELEVATION",
        "1. View: FROM the courtyard looking SOUTH at",
        "   the rear wall of the dwelling.",
        "2. The wall is 3250 mm wide (E-W).",
        "3. LOWER (basement) — recessed double-door bay:",
        "   • 720 mm painted-brick cheek (LEFT)",
        "   • 1850 mm recess containing 2 timber leaves",
        "   • 720 mm painted-brick cheek (RIGHT)",
        "   • Recess head at 2900 mm (white-line).",
        "4. UPPER (ground floor) — large multi-pane sash:",
        "   • 2100 mm wide × 2400 mm tall (existing).",
        "   • Sill at 3800 mm above courtyard slab",
        "     (= 80 cm above interior GF FFL).",
        "5. Red flat-brick arches over openings (existing).",
        "6. PROPOSED: rear wall is RETAINED AS EXISTING",
        "   in v1.  External services rerouted clear of",
        "   the new doorway / staircase landing.",
        "7. Re-pointing / make-good where required.",
    ]
    for i, line in enumerate(notes):
        if not line.strip():
            continue
        weight = "bold" if (i == 0 or line.startswith("PROPOSED")) else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 4, line,
                fontsize=size, weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    basename = f"04_rear_wall_elevation_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(proposed=False, dwg_no="04-A")
    render(proposed=True, dwg_no="04-B")
