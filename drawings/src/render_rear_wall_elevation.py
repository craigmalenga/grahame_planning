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
                                   flat_arch, ground_line)


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

    # ---- LOWER: recessed double-door bay ----
    lower = rear["lower_basement"]
    cheek_l = lower["left_painted_cheek_mm"]
    recess_w = lower["recess_width_mm"]
    cheek_r = lower["right_painted_cheek_mm"]
    recess_x0 = x0 + cheek_l
    door_h = lower["door_pair_height_mm"]
    head_line = lower["head_to_white_line_mm"]  # 2900

    # Recess shadow (we suggest the recess by a faint inner outline)
    ax.add_patch(Rectangle(w.p(recess_x0, y0),
                           w.s(recess_w), w.s(head_line),
                           fill=False, ec="#aaa", lw=0.4,
                           linestyle=(0, (3, 2))))
    # Double doors
    double_door(ax, w, recess_x0 + 50, y0, recess_w - 100, door_h,
                leaves=2, glazed=True,
                label="Existing double doors\n(lower-basement access)")
    # Red flat arch over door bay
    flat_arch(ax, w, recess_x0, y0 + head_line, recess_w, height=120)
    # Painted cheek labels
    ax.text(*w.p(x0 + cheek_l / 2, y0 + 400),
            "white-painted\nbrick cheek\n720 mm",
            fontsize=5, ha="center", va="center", style="italic", color="#444")
    ax.text(*w.p(x0 + cheek_l + recess_w + cheek_r / 2, y0 + 400),
            "white-painted\nbrick cheek\n720 mm",
            fontsize=5, ha="center", va="center", style="italic", color="#444")

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

    # ---- Ground line ----
    ground_line(ax, w, x0 - 300, x0 + wall_w + 300, y0,
                hatch_depth=180, label="courtyard slab")

    # ---- Proposed annotations ----
    if proposed:
        # Add note that the rear-wall is retained as-existing in v1
        ax.text(*w.p(x0 + wall_w / 2, y0 + parapet + 600),
                "PROPOSED:  REAR WALL RETAINED AS EXISTING (no change in v1).\n"
                "External services (downpipes, SVPs) RATIONALISED — see proposed plan.",
                fontsize=7, ha="center", va="center", color="#aa0000",
                weight="bold",
                bbox=dict(boxstyle="round,pad=0.5", fc="white",
                          ec="#aa0000", lw=0.6))

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
