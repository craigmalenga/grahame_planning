"""Sheet 07 — Internal opening between front lounge and rear reception.

Existing + proposed. Shows the wall in elevation with the existing ~1120 mm
opening (faintly dashed) and the proposed enlarged opening with 700/600 mm
nibs and ~2950 mm head height, plus an enlarged plan inset.
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml
from matplotlib.patches import Rectangle

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet)


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_internal_elevation(ax, w, dims, proposed=True, ox=0, oy=0):
    """Internal elevation looking at the dividing wall from the front lounge."""
    # The wall extends across the flat width
    wall_w = dims["front_lounge"]["room_width_mm"]  # 2650 (Rev B — was 4340 envelope)
    ceil = dims["front_lounge"]["ceiling_mm"]              # 3280
    skirt_h = 200
    cornice_h = 200

    # Wall (filled plaster)
    ax.add_patch(Rectangle(w.p(ox, oy), w.s(wall_w), w.s(ceil),
                           fc="#f5f0e8", ec="#000", lw=1.0))
    # Skirting
    ax.add_patch(Rectangle(w.p(ox, oy), w.s(wall_w), w.s(skirt_h),
                           fc="#e0d8c6", ec="#000", lw=0.5))
    # Cornice
    ax.add_patch(Rectangle(w.p(ox, oy + ceil - cornice_h),
                           w.s(wall_w), w.s(cornice_h),
                           fc="#e0d8c6", ec="#000", lw=0.5))
    # Floor + ceiling lines (extended)
    ax.plot([w.x(ox - 200), w.x(ox + wall_w + 200)],
            [w.y(oy), w.y(oy)], color="#000", lw=1.0)
    ax.plot([w.x(ox - 200), w.x(ox + wall_w + 200)],
            [w.y(oy + ceil), w.y(oy + ceil)], color="#000", lw=1.0)

    # Existing opening (faintly dashed in either view)
    ex = dims["internal_opening_between_rooms"]["existing"]
    ex_w = ex["approx_width_mm"]
    ex_h = ex["approx_height_mm"]
    ex_x0 = ox + (wall_w - ex_w) / 2
    ex_y0 = oy
    ax.add_patch(Rectangle(w.p(ex_x0, ex_y0), w.s(ex_w), w.s(ex_h),
                           fill=False, ec="#888", lw=0.6,
                           linestyle=(0, (3, 2))))
    if not proposed:
        ax.text(*w.p(ex_x0 + ex_w / 2, ex_y0 + ex_h / 2),
                f"EXISTING\nopening\n~{ex_w} × {ex_h}",
                fontsize=7, ha="center", va="center", color="#444",
                style="italic")

    if proposed:
        # Proposed: full-height enlargement, with nibs left/right
        pr = dims["internal_opening_between_rooms"]["proposed"]
        nib_l = pr["nib_left_mm"]
        nib_r = pr["nib_right_mm"]
        head_h = pr["height_mm"]
        clear_w = pr["clear_width_mm"]
        # Place the opening with nib_l from the left of the wall (approx)
        op_x0 = ox + nib_l
        op_y0 = oy
        # Show the new opening as a punched white rectangle (taking down to floor)
        ax.add_patch(Rectangle(w.p(op_x0, op_y0),
                               w.s(clear_w), w.s(head_h),
                               fc="#ffffff", ec="#aa0000", lw=1.0))
        # Beam zone (indicative)
        beam_h = 250
        ax.add_patch(Rectangle(w.p(op_x0 - 150, op_y0 + head_h),
                               w.s(clear_w + 300), w.s(beam_h),
                               fc="#ddd6c6", ec="#aa0000", lw=0.7,
                               hatch="\\\\\\"))
        ax.text(*w.p(op_x0 + clear_w / 2, op_y0 + head_h + beam_h / 2),
                "STEEL BEAM ZONE — by engineer",
                fontsize=6, ha="center", va="center", weight="bold",
                color="#aa0000")
        # Nib labels
        ax.add_patch(Rectangle(w.p(ox, oy), w.s(nib_l), w.s(ceil),
                               fill=False, ec="#0066cc", lw=0.7,
                               linestyle=(0, (4, 2))))
        ax.add_patch(Rectangle(w.p(ox + nib_l + clear_w, oy),
                               w.s(nib_r), w.s(ceil),
                               fill=False, ec="#0066cc", lw=0.7,
                               linestyle=(0, (4, 2))))
        # Annotation
        ax.text(*w.p(op_x0 + clear_w / 2, op_y0 + head_h / 2),
                "PROPOSED enlarged opening\n"
                f"clear {clear_w} × {head_h}\n"
                "(subject to structural engineer)",
                fontsize=7, ha="center", va="center",
                color="#aa0000", weight="bold")

    # DIMENSIONS
    # Overall wall width
    dim_horizontal(ax, w, ox, ox + wall_w, oy - 600,
                   label=f"{wall_w}  (overall wall width)")
    if proposed:
        pr = dims["internal_opening_between_rooms"]["proposed"]
        x_cursor = ox
        for label, ln in [("nib L", pr["nib_left_mm"]),
                          (f"clear opening", pr["clear_width_mm"]),
                          ("nib R", pr["nib_right_mm"])]:
            dim_horizontal(ax, w, x_cursor, x_cursor + ln, oy - 200,
                           label=f"{ln}")
            x_cursor += ln
        dim_vertical(ax, w, oy, oy + pr["height_mm"], ox - 400,
                     label=f"{pr['height_mm']}\nclear")
    dim_vertical(ax, w, oy, oy + ceil, ox - 800,
                 label=f"{ceil}\nceiling")

    # Side labels
    ax.text(*w.p(ox + 100, oy + ceil + 400),
            "FRONT LOUNGE side", fontsize=7, ha="left", va="center",
            weight="bold", color="#333")
    ax.text(*w.p(ox + wall_w - 100, oy + ceil + 400),
            "(viewer's side)\n[Rear reception is behind]",
            fontsize=6, ha="right", va="center", style="italic", color="#666")


def draw_internal_plan(ax, w, dims, proposed=True, ox=0, oy=0):
    """Plan view (top-down) of the two reception rooms either side of the
    dividing wall, with the proposed enlarged opening."""
    # Use rough dimensions
    # Rev B: use room widths (not flat envelope) so opening fits inside lounge
    flat_w = dims["front_lounge"]["room_width_mm"]  # 2650
    # Rooms are along the depth of the flat — let's show ~5m of each
    room_depth = 5000
    wall_t_ext = 350
    wall_t_int = dims["rear_reception"]["dividing_wall_thickness_mm"]

    # Front lounge (left of plan)
    fr_x0 = ox
    fr_x1 = fr_x0 + room_depth
    fr_y0 = oy
    fr_y1 = oy + flat_w
    # Rear reception (right of plan)
    rr_x0 = fr_x1 + wall_t_int
    rr_x1 = rr_x0 + room_depth
    rr_y0 = oy
    rr_y1 = oy + flat_w
    # Slight width difference (35 cm wider rear)
    rr_y1 = oy + flat_w + dims["rear_reception"]["width_difference_from_front_mm"]

    # Walls (external — show as filled)
    # Outer perimeter walls
    for x0_, y0_, w_, h_ in [
        (fr_x0 - wall_t_ext, fr_y0 - wall_t_ext,
         (rr_x1 - fr_x0) + 2 * wall_t_ext, wall_t_ext),  # bottom
        (fr_x0 - wall_t_ext, max(fr_y1, rr_y1),
         (rr_x1 - fr_x0) + 2 * wall_t_ext, wall_t_ext),  # top
        (fr_x0 - wall_t_ext, fr_y0 - wall_t_ext,
         wall_t_ext, (max(fr_y1, rr_y1) - fr_y0) + 2 * wall_t_ext),  # left
        (rr_x1, fr_y0 - wall_t_ext,
         wall_t_ext, (max(fr_y1, rr_y1) - fr_y0) + 2 * wall_t_ext),  # right
    ]:
        ax.add_patch(Rectangle(w.p(x0_, y0_), w.s(w_), w.s(h_),
                               fc="#333", ec="#000", lw=0.4))

    # Internal dividing wall
    ax.add_patch(Rectangle(w.p(fr_x1, fr_y0), w.s(wall_t_int), w.s(flat_w),
                           fc="#666", ec="#000", lw=0.5))

    # Room fills
    ax.add_patch(Rectangle(w.p(fr_x0, fr_y0), w.s(room_depth), w.s(flat_w),
                           fc="#f8f3e8", ec="none"))
    ax.add_patch(Rectangle(w.p(rr_x0, rr_y0), w.s(room_depth), w.s(rr_y1 - rr_y0),
                           fc="#f8f3e8", ec="none"))

    # Existing opening in dividing wall (centred)
    ex_w = dims["internal_opening_between_rooms"]["existing"]["approx_width_mm"]
    ex_y0 = (fr_y0 + fr_y1) / 2 - ex_w / 2
    ax.add_patch(Rectangle(w.p(fr_x1, ex_y0),
                           w.s(wall_t_int), w.s(ex_w),
                           fc="#f8f3e8", ec="#888", lw=0.5,
                           linestyle=(0, (3, 2))))

    if proposed:
        pr = dims["internal_opening_between_rooms"]["proposed"]
        clear_w = pr["clear_width_mm"]
        nib_l = pr["nib_left_mm"]
        nib_r = pr["nib_right_mm"]
        op_y0 = fr_y0 + nib_l
        op_y1 = op_y0 + clear_w
        ax.add_patch(Rectangle(w.p(fr_x1 - 30, op_y0),
                               w.s(wall_t_int + 60), w.s(clear_w),
                               fc="#fff", ec="#aa0000", lw=0.9))
        # Beam line indicated by dashed
        ax.add_patch(Rectangle(w.p(fr_x1, op_y0),
                               w.s(wall_t_int), w.s(clear_w),
                               fill=False, ec="#aa0000", lw=0.6,
                               linestyle=(0, (4, 2))))
        # Dims
        dim_vertical(ax, w, fr_y0, op_y0, fr_x1 + wall_t_int + 200,
                     label=f"{nib_l}\nnib L")
        dim_vertical(ax, w, op_y0, op_y1, fr_x1 + wall_t_int + 200,
                     label=f"{clear_w}\nclear")
        dim_vertical(ax, w, op_y1, fr_y1, fr_x1 + wall_t_int + 200,
                     label=f"{nib_r}\nnib R")

    # Labels
    ax.text(*w.p(fr_x0 + room_depth / 2, (fr_y0 + fr_y1) / 2),
            "FRONT LOUNGE\n(ceiling 3.28 m)",
            fontsize=8, ha="center", va="center", weight="bold", color="#444")
    ax.text(*w.p(rr_x0 + room_depth / 2, (rr_y0 + rr_y1) / 2),
            "REAR RECEPTION\n(ceiling 3.28 m)\n[+35 cm wider]",
            fontsize=8, ha="center", va="center", weight="bold", color="#444")

    # Overall dim
    dim_horizontal(ax, w, fr_x0, rr_x1, fr_y0 - wall_t_ext - 400,
                   label=f"{rr_x1 - fr_x0}  (both rooms)")
    dim_vertical(ax, w, fr_y0, fr_y1, fr_x0 - wall_t_ext - 400,
                 label=f"{flat_w}\nfront")


def render(proposed=True, dwg_no="07-A"):
    dims = load_dims()
    scale = Scale(50)
    title = ("PROPOSED INTERNAL OPENING — front lounge / rear reception"
             if proposed else "EXISTING INTERNAL OPENING — front lounge / rear reception")
    fig, ax = new_a3_landscape(
        title=title, drawing_no=dwg_no, scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
    )
    # Elevation on the left half
    w_elev = World(ax, scale, origin_sheet_xy=(45, 130))
    draw_internal_elevation(ax, w_elev, dims, proposed=proposed)
    # Plan on the right half (scale 1:75)
    scale_plan = Scale(75)
    w_plan = World(ax, scale_plan, origin_sheet_xy=(245, 130))
    draw_internal_plan(ax, w_plan, dims, proposed=proposed)
    ax.text(245 + 60, 230, "PLAN VIEW (1:75)",
            fontsize=8, weight="bold", ha="left", va="bottom")
    ax.text(45 + 50, 230, "INTERNAL ELEVATION (1:50)",
            fontsize=8, weight="bold", ha="left", va="bottom")

    # Notes panel at bottom
    notes = [
        "NOTES — INTERNAL OPENING (between reception rooms)",
        "• Existing opening (faintly dashed): ~1120 mm wide × ~2100 mm",
        "  high (as-found; site re-measure to confirm).",
        "• PROPOSED enlargement: retained nibs L/R = 700 / 600 mm;",
        "  clear opening 2400 mm wide × 2950 mm head height.",
        "• Period detail (skirting, cornice) made good both sides.",
        "• Steel beam + end padstones above — final size by structural",
        "  engineer. Building Control sign-off required.",
    ]
    for i, line in enumerate(notes):
        weight = "bold" if i == 0 else "normal"
        ax.text(45, 95 - i * 4.5, line,
                fontsize=7 if i == 0 else 6, weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    basename = f"07_internal_opening_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(proposed=True, dwg_no="07-B")
    render(proposed=False, dwg_no="07-A")
