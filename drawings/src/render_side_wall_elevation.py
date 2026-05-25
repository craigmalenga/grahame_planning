"""Sheet 03 — SIDE WALL elevation (east wall of courtyard / kitchen-side)

Existing and proposed elevations of the wall that contains:
  - LOWER (basement): 60 cm bricked-up opening + 123 cm glass window
    (with 51 / 49 / 17 cm solid sections)
  - UPPER (ground floor): kitchen window (existing) / doorway (proposed)
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml
from matplotlib.patches import Rectangle

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet, annotation)
from elevation_primitives import (sash_window, blocked_opening, brick_wall,
                                   downpipe, flat_arch, ground_line)


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_side_wall_elevation(ax, w, dims, proposed=False,
                              ox_world=0, oy_world=0):
    """Draw side wall elevation from courtyard side.

    World coords:
      x axis = horizontal along wall, 0 = north end (rear boundary corner),
               x increases SOUTH (toward inside corner of L)
      y axis = vertical, 0 = courtyard slab level (datum)
    """
    side = dims["side_wall"]
    wall_length = side["total_length_mm"]   # 3000

    # Wall extends vertically from courtyard slab (y=0) up to parapet
    # Total height shown = courtyard slab to roof/parapet — we'll show up to
    # the kitchen ceiling level which is at ~5270 (2820 FFL + 2450 ceiling)
    courtyard_floor = 0
    gf_ffl = dims["courtyard"]["slab_to_gf_ffl_mm"]   # 2820
    white_line = dims["courtyard"]["white_paint_datum_mm"]  # 2900
    gf_ceiling = gf_ffl + dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]
    parapet = gf_ceiling + 800   # estimate of parapet height above ceiling
    wall_height = parapet

    x0, y0 = ox_world, oy_world

    # ---- Yellow stock brick field above white line ----
    brick_wall(ax, w, x0, y0 + white_line,
               wall_length, wall_height - white_line,
               painted=False)
    # ---- White painted brickwork below white line ----
    brick_wall(ax, w, x0, y0,
               wall_length, white_line,
               painted=True, paint_color="#f8f4ec")
    # Add wall outline
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(wall_length), w.s(wall_height),
                           fill=False, ec="#000", lw=1.1))

    # White-line datum
    ax.plot([w.x(x0), w.x(x0 + wall_length)],
            [w.y(y0 + white_line), w.y(y0 + white_line)],
            color="#bbb", lw=0.3)

    # FFL (ground floor) line
    ax.plot([w.x(x0), w.x(x0 + wall_length)],
            [w.y(y0 + gf_ffl), w.y(y0 + gf_ffl)],
            color="#888", lw=0.3, linestyle=(0, (4, 2)))
    ax.text(*w.p(x0 - 80, y0 + gf_ffl),
            "GF FFL\n+2820", fontsize=5, ha="right", va="center", color="#888")

    # Courtyard slab line
    ax.text(*w.p(x0 - 80, y0),
            "Courtyard\nslab ±0", fontsize=5, ha="right", va="center", color="#888")

    # ---- LOWER LEVEL OPENINGS ----
    # x increases southward; sequence_from_north describes left-to-right
    # if we plot with north on the left of the elevation. So x=0 is north end.
    lower = side["lower_basement"]
    sill_low = lower["both_openings_sill_height_above_slab_mm"]
    h_low = lower["both_openings_height_mm"]
    x_cursor = x0
    for seg in lower["sequence_from_north_mm"]:
        seg_w = seg["length"]
        if seg.get("type") == "blocked_window":
            blocked_opening(ax, w, x_cursor, y0 + sill_low,
                            seg_w, h_low,
                            label="Existing\nbricked-up\nopening")
        elif seg.get("type") == "window":
            sash_window(ax, w, x_cursor, y0 + sill_low,
                        seg_w, h_low,
                        panes_horiz=3, panes_vert=4,
                        label=f"Existing basement\nsash {seg_w} × {h_low}",
                        label_above=False)
            flat_arch(ax, w, x_cursor, y0 + sill_low + h_low, seg_w)
        x_cursor += seg_w

    # ---- UPPER LEVEL: kitchen window OR doorway ----
    upper = side["upper_ground"]
    kw_centre_x = upper["horizontal_position_from_north_corner_mm"]
    kw_recess = upper["structural_recess_width_mm"]
    kw_x0 = kw_centre_x - kw_recess / 2

    if not proposed:
        # EXISTING: kitchen window
        sill_up = upper["sill_height_above_courtyard_slab_mm"]
        head_up = upper["head_height_above_courtyard_slab_mm"]
        sash_window(ax, w, kw_x0, y0 + sill_up,
                    kw_recess, head_up - sill_up,
                    panes_horiz=2, panes_vert=4,
                    label=f"Existing kitchen window\n(structural recess\n{kw_recess} mm;\nglass gap 660 mm)",
                    label_above=False)
        flat_arch(ax, w, kw_x0, y0 + head_up, kw_recess)
    else:
        # PROPOSED: doorway extends down to FFL — sill drops 720 mm
        # New aperture: from y=gf_ffl to head_height_above_courtyard_slab_mm
        prop_threshold = y0 + gf_ffl
        prop_head = y0 + upper["head_height_above_courtyard_slab_mm"]
        prop_w = dims["proposed"]["side_wall_upper_doorway"]["clear_width_mm"]
        prop_x0 = kw_centre_x - prop_w / 2
        # Door (timber-framed glazed)
        ax.add_patch(Rectangle(w.p(prop_x0, prop_threshold),
                               w.s(prop_w), w.s(prop_head - prop_threshold),
                               fill=True, fc="#e9f1f5", ec="#222", lw=0.9))
        # Door stiles / rails (simplified glazed door)
        # Top fanlight 1/3, lower glazed 2/3 with timber kick-plate
        kick_h = 250
        ax.add_patch(Rectangle(w.p(prop_x0, prop_threshold),
                               w.s(prop_w), w.s(kick_h),
                               fc="#5a3a22", ec="#222", lw=0.5))
        # Vertical mullion
        ax.plot([w.x(prop_x0 + prop_w / 2), w.x(prop_x0 + prop_w / 2)],
                [w.y(prop_threshold + kick_h), w.y(prop_head)],
                color="#222", lw=0.5)
        # Horizontal glazing bar
        gb_y = prop_threshold + (prop_head - prop_threshold) * 0.55
        ax.plot([w.x(prop_x0), w.x(prop_x0 + prop_w)],
                [w.y(gb_y), w.y(gb_y)],
                color="#222", lw=0.5)
        flat_arch(ax, w, prop_x0, prop_head, prop_w)
        # Label
        ax.text(*w.p(prop_x0 + prop_w / 2, prop_head + 400),
                "PROPOSED:\nKitchen window\nconverted to\nglazed doorway\n(top of staircase)",
                fontsize=6, ha="center", va="bottom",
                color="#aa0000", weight="bold",
                bbox=dict(boxstyle="round,pad=0.3",
                          fc="white", ec="#aa0000", lw=0.5))
        # Dashed outline of existing window position
        ex_sill = upper["sill_height_above_courtyard_slab_mm"]
        ex_head = upper["head_height_above_courtyard_slab_mm"]
        ax.add_patch(Rectangle(w.p(kw_x0, y0 + ex_sill),
                               w.s(kw_recess), w.s(ex_head - ex_sill),
                               fill=False, ec="#666", lw=0.5,
                               linestyle=(0, (3, 2))))

    # ---- Downpipe (left wall, runs vertically) ----
    pipe_x = dims["existing_services"]["downpipe_side_wall"]["position_from_north_corner_mm"]
    if not proposed:
        downpipe(ax, w, x0 + pipe_x, y0, y0 + parapet,
                 diameter=90, swan_neck_at=None)
        ax.text(*w.p(x0 + pipe_x + 200, y0 + parapet - 600),
                "Existing\ncast-iron\ndownpipe",
                fontsize=5, ha="left", va="top",
                color="#333", style="italic")
    else:
        # Rerouted downpipe (new position further south, away from doorway)
        new_pipe_x = dims["proposed"]["downpipe"]["new_position_from_north_corner_mm"]
        downpipe(ax, w, x0 + new_pipe_x, y0, y0 + parapet, diameter=90)
        ax.text(*w.p(x0 + new_pipe_x + 200, y0 + parapet - 600),
                "Downpipe\nRATIONALISED:\nrerouted clear\nof new doorway\n& staircase",
                fontsize=5, ha="left", va="top",
                color="#aa0000", style="italic", weight="bold")

    # ---- Ground line below courtyard slab ----
    ground_line(ax, w, x0 - 200, x0 + wall_length + 200, y0,
                hatch_depth=180, label="courtyard slab")

    # ---- DIMENSIONS ----
    # Wall length top breakdown (lower level openings) — bottom of drawing
    yd = y0 - 600
    x_cursor = x0
    for seg in lower["sequence_from_north_mm"]:
        dim_horizontal(ax, w, x_cursor, x_cursor + seg["length"],
                       yd, label=f"{seg['length']}")
        x_cursor += seg["length"]
    # Overall wall length
    dim_horizontal(ax, w, x0, x0 + wall_length, yd - 400,
                   label=f"{wall_length}  (overall wall length)")

    # Heights (left side)
    xd = x0 - 700
    dim_vertical(ax, w, y0, y0 + sill_low, xd, label="900")
    dim_vertical(ax, w, y0 + sill_low, y0 + sill_low + h_low, xd, label="1600")
    dim_vertical(ax, w, y0 + sill_low + h_low, y0 + white_line, xd,
                 label=f"{white_line - sill_low - h_low}")
    dim_vertical(ax, w, y0 + white_line, y0 + gf_ffl, xd - 400,
                 label="white-line\nto FFL")
    dim_vertical(ax, w, y0 + gf_ffl, y0 + parapet, xd - 400,
                 label=f"{parapet - gf_ffl}")
    # Overall height
    dim_vertical(ax, w, y0, y0 + parapet, xd - 900,
                 label=f"{parapet} (overall)")

    # ---- Compass direction marker ----
    ax.text(*w.p(x0 - 50, y0 + parapet + 400),
            "← N", fontsize=8, ha="right", va="center", color="#555")
    ax.text(*w.p(x0 + wall_length + 50, y0 + parapet + 400),
            "S →", fontsize=8, ha="left", va="center", color="#555")
    ax.text(*w.p(x0 + wall_length / 2, y0 + parapet + 400),
            "Viewed FROM the courtyard, looking EAST at the kitchen-side wall",
            fontsize=6, ha="center", va="center", style="italic")


def render(proposed=False, dwg_no="03-A"):
    dims = load_dims()
    scale = Scale(50)
    title = "PROPOSED SIDE WALL ELEVATION" if proposed else "EXISTING SIDE WALL ELEVATION"
    title += " — kitchen-side, east wall of courtyard"
    fig, ax = new_a3_landscape(
        title=title,
        drawing_no=dwg_no,
        scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
    )
    w = World(ax, scale, origin_sheet_xy=(70, 90))
    draw_side_wall_elevation(ax, w, dims, proposed=proposed,
                              ox_world=0, oy_world=0)

    # Notes panel (top-right area of sheet)
    notes_x, notes_y = 250, 270
    notes = [
        "NOTES — SIDE WALL ELEVATION",
        "1. View: FROM the courtyard looking EAST",
        "   at the wall between courtyard and kitchen.",
        "2. The wall is ~3000 mm long (N→S).",
        "3. LOWER (basement) — 2 windows side-by-side:",
        "   • 600 mm bricked-up former opening (LEFT)",
        "   • 1230 mm existing basement sash (RIGHT)",
        "4. UPPER (ground floor) — kitchen window,",
        "   structural recess ~900 mm, glass gap 660.",
        "5. Datums: courtyard slab = 0; GF FFL +2820;",
        "   white-painted brick to +2900 (white-line).",
        "6. Existing cast-iron downpipe currently crosses",
        "   line of proposed new doorway — RATIONALISE.",
        "" if not proposed else "PROPOSED:",
        "" if not proposed else "• Reinstate bricked-up opening as basement",
        "" if not proposed else "  sash to match adjacent existing window.",
        "" if not proposed else "• Kitchen window enlarged downward to GF FFL",
        "" if not proposed else "  to form glazed timber doorway as top",
        "" if not proposed else "  of new spiral-staircase landing.",
        "" if not proposed else "• Downpipe rerouted south of doorway.",
        "" if not proposed else "• Match white sash, red flat-arch lintels,",
        "" if not proposed else "  yellow-stock brick infill.",
    ]
    for i, line in enumerate(notes):
        if not line.strip():
            continue
        weight = "bold" if (i == 0 or line.startswith("PROPOSED")) else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 4, line,
                fontsize=size, weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    basename = f"03_side_wall_elevation_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(proposed=False, dwg_no="03-A")
    render(proposed=True, dwg_no="03-B")
