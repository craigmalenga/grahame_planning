"""Sheet 08 — Kitchen + proposed compact shower-room plan.

The kitchen is the rear room on the ground floor (240 cm wide; ceiling 2.45 m).
The proposed shower-room slots into the slightly angled ~250 cm run.
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch
from matplotlib.lines import Line2D

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet)


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_kitchen_plan(ax, w, dims, proposed=True, ox=0, oy=0):
    k = dims["kitchen"]
    sb = dims["proposed_shower_room"]
    kw = k["width_mm"]                          # 2400
    k_len_window = k["length_window_side_mm"]   # 2900 (window side)
    k_len_door = k["length_door_side_mm"]       # 2750 (opposite)
    k_len_opp = k["length_opposite_side_mm"]    # 2500 (angled)
    wall_t = 350
    int_t = 100  # internal partition

    # Plan: place kitchen with window side along south (bottom of plan)
    # so window faces SOUTH-onto-courtyard.  Actually the kitchen window
    # is on the side wall (east) facing courtyard. So in plan, courtyard
    # is to the WEST (left) of the kitchen. Let's lay out:
    #
    #   +-------------------------------------+
    #   |  KITCHEN                            |
    #   |   .                                 |
    #   |   .  (240 cm wide N-S)              |
    #   |   .                                 |
    #   +-------+   +---+   +---+   +-------+
    #   |       |   |   |   |   |   |       |
    #   |shower |   |WC |   |basn|  |laundry|
    #   |       |   |   |   |   |   |       |
    #   +-------+   +---+   +---+   +-------+
    #
    # That's a long thin shower room along south wall of kitchen.
    # Alternative: shower room takes one end of kitchen and full depth.
    # Per Grahame: "Within the approximately 250 cm angled wall run, I would
    # like to create a compact shower room/utility arrangement."
    # So shower room occupies the angled south wall run.

    # Kitchen outer envelope (south-facing onto courtyard at the LEFT/west side)
    kx0, ky0 = ox, oy
    kx1, ky1 = ox + k_len_window, oy + kw
    # External walls
    ax.add_patch(Rectangle(w.p(kx0 - wall_t, ky0 - wall_t),
                           w.s(k_len_window + 2 * wall_t),
                           w.s(wall_t),
                           fc="#333", ec="#000", lw=0.4))
    ax.add_patch(Rectangle(w.p(kx0 - wall_t, ky1),
                           w.s(k_len_window + 2 * wall_t),
                           w.s(wall_t),
                           fc="#333", ec="#000", lw=0.4))
    ax.add_patch(Rectangle(w.p(kx0 - wall_t, ky0 - wall_t),
                           w.s(wall_t),
                           w.s(kw + 2 * wall_t),
                           fc="#333", ec="#000", lw=0.4))
    ax.add_patch(Rectangle(w.p(kx1, ky0 - wall_t),
                           w.s(wall_t),
                           w.s(kw + 2 * wall_t),
                           fc="#333", ec="#000", lw=0.4))

    # Kitchen window on the west external wall (onto courtyard)
    # Position: place ~1000 mm from south (Grahame: the kitchen window
    # exists on the courtyard side, near the inside corner of the L)
    kw_recess = dims["side_wall"]["upper_ground"]["structural_recess_width_mm"]
    kw_y = ky0 + 800
    if proposed:
        # New doorway aperture (full height drop, ~800mm wide door)
        door_w = dims["proposed"]["side_wall_upper_doorway"]["clear_width_mm"]
        ax.add_patch(Rectangle(w.p(kx0 - 10, kw_y),
                               w.s(wall_t + 20), w.s(door_w),
                               fc="#fff", ec="#aa0000", lw=0.9))
        # Door swing
        from matplotlib.patches import Arc
        ax.add_patch(Arc(w.p(kx0, kw_y), w.s(2 * door_w), w.s(2 * door_w),
                         angle=0, theta1=0, theta2=90,
                         color="#aa0000", lw=0.5,
                         linestyle=(0, (3, 2))))
        ax.text(*w.p(kx0 - 100, kw_y + door_w / 2),
                "New doorway\n(to staircase)",
                fontsize=5, ha="right", va="center", color="#aa0000",
                style="italic", weight="bold")
    else:
        # Existing kitchen window
        ax.add_patch(Rectangle(w.p(kx0 - 10, kw_y),
                               w.s(wall_t + 20), w.s(kw_recess),
                               fc="#e9f1f5", ec="#000", lw=0.5))
        ax.text(*w.p(kx0 - 100, kw_y + kw_recess / 2),
                "Existing\nkitchen window",
                fontsize=5, ha="right", va="center", color="#444",
                style="italic")

    # Rear door (north end, leading to outside)
    rd_w = k["rear_door_to_external_width_mm"]
    ax.add_patch(Rectangle(w.p(kx1 - 200, ky1 - rd_w),
                           w.s(wall_t + 200), w.s(rd_w),
                           fc="#fff", ec="#000", lw=0.5))
    ax.text(*w.p(kx1 + wall_t + 100, ky1 - rd_w / 2),
            "Existing rear\ndoor",
            fontsize=5, ha="left", va="center", color="#444", style="italic")

    # Rear small window
    rsw_w = k["rear_small_window"]["width_mm"]
    ax.add_patch(Rectangle(w.p(kx1 - 10, ky0 + 200),
                           w.s(wall_t + 20), w.s(rsw_w),
                           fc="#e9f1f5", ec="#000", lw=0.5))

    if proposed:
        # Proposed shower room — occupies south end of kitchen along
        # the south wall run (where Grahame mentions ~250 cm).
        # We'll place it along the EAST end of the kitchen (the wall opposite
        # the courtyard) since the angled 250 cm run is interior.
        # Layout: from south wall, divide:
        #   • shower 1000  • WC 600  • basin 500  • laundry 600
        # Place along the south side of the kitchen, as a strip.
        sr_y0 = ky0
        sr_y1 = ky0 + 1500  # depth into the kitchen
        sr_x0 = kx0 + 600  # leave 600 mm clear at courtyard end for door swing
        # partition wall along sr_y1
        ax.add_patch(Rectangle(w.p(sr_x0, sr_y1),
                               w.s(k_len_window - 600), w.s(int_t),
                               fc="#666", ec="#000", lw=0.4))
        # internal divisions (shower / wc / basin / laundry)
        zones = [
            ("SHOWER\n1000×900", sb["zones"]["shower_tray_width_mm"], "#b8e0f0"),
            ("WC", sb["zones"]["wc_zone_mm"], "#f0f0e8"),
            ("BASIN", sb["zones"]["basin_zone_mm"], "#f0f0e8"),
            ("LAUNDRY\n(W/D stack)", sb["zones"]["laundry_zone_width_mm"], "#eee5d5"),
        ]
        x_cursor = sr_x0
        for label, width, color in zones:
            ax.add_patch(Rectangle(w.p(x_cursor, sr_y0),
                                   w.s(width), w.s(sr_y1 - sr_y0),
                                   fc=color, ec="#000", lw=0.4))
            ax.text(*w.p(x_cursor + width / 2,
                          (sr_y0 + sr_y1) / 2),
                    label, fontsize=5, ha="center", va="center",
                    weight="bold")
            x_cursor += width
            if x_cursor < sr_x0 + sum(z[1] for z in zones):
                ax.add_patch(Rectangle(w.p(x_cursor - 10, sr_y0),
                                       w.s(int_t), w.s(sr_y1 - sr_y0),
                                       fc="#666", ec="#000", lw=0.3))
                x_cursor += int_t

        # Pocket / sliding door access at top of shower-room (north side)
        door_x = sr_x0 + 500
        ax.plot([w.x(door_x), w.x(door_x + 700)],
                [w.y(sr_y1), w.y(sr_y1)],
                color="#aa0000", lw=1.0)
        ax.text(*w.p(door_x + 350, sr_y1 + 100),
                "Pocket /\nsliding door",
                fontsize=4.5, ha="center", va="bottom",
                color="#aa0000", style="italic")

        # Kitchen residual zone
        ax.text(*w.p(kx0 + k_len_window / 2,
                      ky0 + (sr_y1 + ky1) / 2 - ky0 - 600),
                "KITCHEN (residual)\n— retain hob/sink/fridge layout —",
                fontsize=7, ha="center", va="center", color="#444",
                style="italic")
    else:
        # Existing: just kitchen, full size
        ax.text(*w.p(kx0 + k_len_window / 2, (ky0 + ky1) / 2),
                "EXISTING KITCHEN\n(2400 × 2900)\nceiling 2450",
                fontsize=8, ha="center", va="center", color="#444",
                weight="bold", style="italic")

    # Compass
    ax.text(*w.p(kx0 + k_len_window / 2, ky1 + wall_t + 600),
            "N ↑", fontsize=10, ha="center", va="center", weight="bold")
    ax.text(*w.p(kx0 - wall_t - 800, (ky0 + ky1) / 2),
            "COURTYARD\n(to west)", fontsize=6, ha="center", va="center",
            color="#666", style="italic")

    # Dimensions
    dim_horizontal(ax, w, kx0, kx1, ky0 - wall_t - 400,
                   label=f"{k_len_window} (N kitchen run)")
    dim_vertical(ax, w, ky0, ky1, kx0 - wall_t - 400,
                 label=f"{kw}\n(kitchen width)")
    if proposed:
        # Zone breakdown
        x_cursor = kx0 + 600
        for label, width in [
            ("shower", sb["zones"]["shower_tray_width_mm"]),
            ("WC", sb["zones"]["wc_zone_mm"]),
            ("basin", sb["zones"]["basin_zone_mm"]),
            ("laundry", sb["zones"]["laundry_zone_width_mm"]),
        ]:
            dim_horizontal(ax, w, x_cursor, x_cursor + width,
                           ky0 - 200, label=f"{width}")
            x_cursor += width + int_t


def render(proposed=True, dwg_no="08-A"):
    dims = load_dims()
    scale = Scale(50)
    title = ("PROPOSED KITCHEN + COMPACT SHOWER-ROOM PLAN"
             if proposed else "EXISTING KITCHEN PLAN")
    fig, ax = new_a3_landscape(
        title=title, drawing_no=dwg_no, scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
    )
    w = World(ax, scale, origin_sheet_xy=(90, 110))
    draw_kitchen_plan(ax, w, dims, proposed=proposed)

    notes = [
        "NOTES — KITCHEN + SHOWER ROOM",
        "1. Kitchen 2400 × 2900; ceiling 2450 mm.",
        "2. PROPOSED compact shower-room arrangement:",
        "   • Shower tray 1000 mm",
        "   • WC zone 600 mm",
        "   • Basin zone 500 mm",
        "   • Laundry (W/D) 600 mm",
        "   • New 100 mm partition wall — pocket door.",
        "3. Crystal/glazed doors on hand (1245 × 2245 mm)",
        "   may be reused — check fit on site.",
        "4. New kitchen-window-to-doorway opening on west",
        "   side connects to spiral staircase below.",
        "5. Existing rear external door retained.",
        "6. All plumbing routes subject to detailed design.",
    ]
    notes_x, notes_y = 280, 260
    for i, line in enumerate(notes):
        weight = "bold" if i == 0 else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 4, line,
                fontsize=size, weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    basename = f"08_kitchen_bathroom_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(proposed=True, dwg_no="08-B")
    render(proposed=False, dwg_no="08-A")
