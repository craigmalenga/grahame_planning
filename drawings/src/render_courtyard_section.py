"""Sheet 05 — Section through the rear courtyard showing the spiral staircase.

Section cut runs E-W through the centre of the staircase, viewed toward
the rear (south) wall, so you see:
  - the cut SIDE wall on the LEFT with kitchen above and basement below
  - the cut REAR wall behind
  - the spiral staircase in elevation between the courtyard slab and the
    new kitchen doorway
"""
from __future__ import annotations
from pathlib import Path
import sys, math
import yaml
from matplotlib.patches import Rectangle

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World,
                   dim_horizontal, dim_vertical, save_sheet)
from elevation_primitives import brick_wall, ground_line, sash_window
from staircase import StaircaseParams, draw_elevation as draw_staircase_elev


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def draw_section(ax, w, dims, proposed=True, ox=0, oy=0):
    # Datums
    courtyard_slab = oy
    gf_ffl = oy + dims["courtyard"]["slab_to_gf_ffl_mm"]
    rec_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["rear_reception"]
    kitchen_h = dims["flat_envelope"]["ground_floor"]["ceiling_heights_mm"]["kitchen"]
    gf_ceil_rec = gf_ffl + rec_h            # reception ceiling
    gf_ceil_kit = gf_ffl + kitchen_h         # kitchen ceiling
    parapet = gf_ceil_rec + 600
    bas_floor = gf_ffl - dims["flat_envelope"]["basement"]["ceiling_heights_mm"]["rear_room"]
    # ^ basement floor = GF FFL minus basement ceiling height (basement under reception)

    # Courtyard is open between x=courtyard_x0 and x=courtyard_x1
    courtyard_w = dims["courtyard"]["plan_width_mm"]   # 3250 — but section cut is N-S not E-W
    # We're cutting N-S so we see depth of courtyard = 2950 in section
    courtyard_depth = dims["courtyard"]["plan_depth_mm"]
    cx0 = ox + 0
    cx1 = cx0 + courtyard_depth

    # ext wall thickness
    ext_t = 350

    # ---- Building masses ----
    # SOUTH side (right of section, the rear-reception side):
    #   - Rear-reception room above courtyard slab? No — the reception sits
    #     to the south, not above the courtyard. The courtyard is open.
    #   - So south of courtyard: rear-reception room at ground floor
    #     and basement room below.
    south_x0 = cx1
    south_x1 = cx1 + ext_t + 4000  # show 4m of reception depth
    # GF reception
    ax.add_patch(Rectangle(w.p(south_x0, gf_ffl),
                           w.s(south_x1 - south_x0),
                           w.s(rec_h),
                           fc="#f5e8d5", ec="#000", lw=0.5))
    ax.text(*w.p((south_x0 + south_x1) / 2, gf_ffl + rec_h / 2),
            "REAR RECEPTION\n(ground floor)\nFFL ±0 (GF)  ceiling 3.28 m",
            fontsize=6, ha="center", va="center", style="italic", color="#444")
    # Basement under
    ax.add_patch(Rectangle(w.p(south_x0, bas_floor),
                           w.s(south_x1 - south_x0),
                           w.s(gf_ffl - bas_floor),
                           fc="#ede0c8", ec="#000", lw=0.5))
    ax.text(*w.p((south_x0 + south_x1) / 2, (bas_floor + gf_ffl) / 2),
            "BASEMENT\n(rear room)\nceiling 2.76 m",
            fontsize=6, ha="center", va="center", style="italic", color="#444")
    # Roof / parapet above
    ax.add_patch(Rectangle(w.p(south_x0, gf_ceil_rec),
                           w.s(south_x1 - south_x0),
                           w.s(parapet - gf_ceil_rec),
                           fc="#cccccc", ec="#000", lw=0.5,
                           hatch="//"))
    # The cut south wall
    ax.add_patch(Rectangle(w.p(cx1, bas_floor - 400),
                           w.s(ext_t),
                           w.s(parapet - bas_floor + 400),
                           fc="#333", ec="#000", lw=0.6))

    # ---- NORTH side (left of section, the rear boundary wall) ----
    north_x = cx0
    bw_top = courtyard_slab + dims["courtyard"]["rear_boundary_wall_height_mm"]
    ax.add_patch(Rectangle(w.p(north_x - ext_t, bas_floor - 400),
                           w.s(ext_t),
                           w.s(bw_top - bas_floor + 400),
                           fc="#888", ec="#000", lw=0.5, hatch="////"))
    ax.text(*w.p(north_x - ext_t / 2, bw_top - 300),
            "Rear\nboundary\nwall",
            fontsize=5, ha="center", va="top", style="italic")

    # ---- Courtyard slab ----
    ax.add_patch(Rectangle(w.p(cx0, courtyard_slab - 250),
                           w.s(courtyard_depth),
                           w.s(250),
                           fc="#cfc4ad", ec="#000", lw=0.4, hatch="..."))
    # Ground below courtyard
    ax.add_patch(Rectangle(w.p(cx0 - ext_t, bas_floor - 400),
                           w.s(courtyard_depth + 2 * ext_t),
                           w.s(courtyard_slab - bas_floor + 150),
                           fc="#bba88c", ec="none", alpha=0.4))
    ax.plot([w.x(cx0 - ext_t), w.x(cx1 + ext_t)],
            [w.y(bas_floor - 400), w.y(bas_floor - 400)],
            color="#000", lw=0.4)

    # ---- Existing rear-reception sash on south wall (cut visible) ----
    rear_up = dims["rear_wall"]["upper_ground"]
    sash_w = rear_up["sash_width_mm"]
    sash_h = rear_up["sash_height_mm"]
    sill_up = oy + rear_up["sill_height_above_courtyard_slab_mm"]
    # Project sash onto the section plane (the south wall face)
    # We show the opening as a punched rectangle in the wall
    ax.add_patch(Rectangle(w.p(cx1, sill_up),
                           w.s(ext_t), w.s(sash_h),
                           fc="#e9f1f5", ec="#000", lw=0.5))
    ax.text(*w.p(cx1 + ext_t / 2, sill_up + sash_h / 2),
            "rear\nsash\n(behind)",
            fontsize=4, ha="center", va="center", color="#444", style="italic")

    # ---- Existing basement double-doors on south wall ----
    lower = dims["rear_wall"]["lower_basement"]
    door_h = lower["head_height_above_slab_mm"]
    ax.add_patch(Rectangle(w.p(cx1, courtyard_slab),
                           w.s(ext_t), w.s(door_h),
                           fc="#3d2a1a", ec="#000", lw=0.5))
    ax.text(*w.p(cx1 + ext_t + 100, courtyard_slab + door_h / 2),
            "Lower-basement\ndouble doors\n(visible in section)",
            fontsize=5, ha="left", va="center", style="italic", color="#444")

    # ---- SPIRAL STAIRCASE in elevation (PROPOSED only) ----
    if not proposed:
        # Existing section: courtyard is empty (no staircase yet)
        ax.text(*w.p((cx0 + cx1) / 2, courtyard_slab + 1500),
                "Existing courtyard\n(no staircase)",
                fontsize=7, ha="center", va="center",
                style="italic", color="#666")
        return
    sp = dims["spiral_staircase"]
    # In section the staircase is cut roughly through its centre
    # Place staircase centre on the section plane at:
    stair_cx = cx1 - dims["proposed"]["staircase_installation"]["centre_distance_from_rear_wall_mm"]
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
    )
    draw_staircase_elev(ax, w, params, base_x_mm=stair_cx,
                        base_y_mm=courtyard_slab)

    # Landing at top of staircase meeting the kitchen doorway
    landing_top = courtyard_slab + params.total_rise_mm
    ax.add_patch(Rectangle(w.p(stair_cx - 400, landing_top - 40),
                           w.s(800), w.s(40),
                           fc="#444", ec="#000", lw=0.4))
    ax.text(*w.p(stair_cx, landing_top + 200),
            "Top landing pad",
            fontsize=5, ha="center", va="bottom", style="italic", color="#444")

    # ---- Doorway in the side wall (seen in section as a punched opening behind) ----
    # The side wall is BEHIND the section cut (we are looking westward / into the
    # page). We indicate its presence faintly behind the staircase.
    # (Simplified — we don't draw the whole wall, just show the doorway dashed)
    if proposed:
        ax.add_patch(Rectangle(w.p(stair_cx - 400, gf_ffl),
                               w.s(800), w.s(2050),
                               fill=False, ec="#0066cc", lw=0.7,
                               linestyle=(0, (4, 2))))
        ax.text(*w.p(stair_cx + 700, gf_ffl + 1000),
                "New doorway in side wall\n(behind, dashed): kitchen\nwindow converted to\nglazed timber door",
                fontsize=5, ha="left", va="center", color="#0066cc",
                style="italic", weight="bold")

    # ---- DIMENSIONS ----
    # Vertical: rise from courtyard slab to landing
    dim_vertical(ax, w, courtyard_slab, landing_top,
                 cx0 - ext_t - 1200,
                 label=f"{params.total_rise_mm}\nstaircase\ntotal rise\n(14 × 201)")
    # GF FFL to courtyard slab
    dim_vertical(ax, w, courtyard_slab, gf_ffl,
                 cx0 - ext_t - 700,
                 label=f"{gf_ffl - courtyard_slab}\n(slab→FFL)")
    # Basement floor to slab
    dim_vertical(ax, w, bas_floor, courtyard_slab,
                 cx0 - ext_t - 700,
                 label="basement\nfloor below")
    # Reception room ceiling
    dim_vertical(ax, w, gf_ffl, gf_ceil_rec,
                 south_x1 + 200, label=f"{rec_h}\nreception\nceiling")

    # Horizontal: courtyard depth
    dim_horizontal(ax, w, cx0, cx1, courtyard_slab - 1200,
                   label=f"{courtyard_depth}\n(courtyard depth N-S)")
    # Distance from staircase centre to rear wall
    dim_horizontal(ax, w, stair_cx, cx1, courtyard_slab + 200,
                   label=f"{cx1 - stair_cx} mm staircase centre to rear wall")

    # Datum labels (text)
    for label, y_val, color in [("courtyard slab  ±0", courtyard_slab, "#000"),
                                 ("GF FFL  +2820", gf_ffl, "#666"),
                                 ("white-line  +2900",
                                  oy + dims["courtyard"]["white_paint_datum_mm"], "#999"),
                                 ("kitchen ceiling  +5270", gf_ceil_kit, "#666"),
                                 ("reception ceiling  +6100", gf_ceil_rec, "#666"),
                                 ("basement floor  −2760", bas_floor, "#666")]:
        ax.plot([w.x(cx0 - ext_t - 100), w.x(south_x1 + 200)],
                [w.y(y_val), w.y(y_val)],
                color=color, lw=0.2, linestyle=(0, (1, 3)), alpha=0.6)
        ax.text(*w.p(south_x1 + 250, y_val),
                label, fontsize=5, ha="left", va="center", color=color)

    # Orientation: cut is N-S, we are looking WEST (east is in front of viewer)
    ax.text(*w.p((cx0 + cx1) / 2, parapet + 800),
            "SECTION A-A — through centre of spiral staircase, looking WEST",
            fontsize=8, ha="center", va="center", weight="bold")
    ax.text(*w.p(cx0, parapet + 400),
            "N  (rear boundary →)", fontsize=6, ha="left", color="#555")
    ax.text(*w.p(cx1, parapet + 400),
            "(← dwelling)  S", fontsize=6, ha="right", color="#555")


def render(proposed=True, dwg_no="05-A"):
    dims = load_dims()
    scale = Scale(50)
    title = ("PROPOSED COURTYARD SECTION A-A (showing spiral staircase)"
             if proposed else "EXISTING COURTYARD SECTION A-A")
    fig, ax = new_a3_landscape(
        title=title, drawing_no=dwg_no, scale=scale,
        project=dims["project"]["title"],
        client=dims["project"]["client"],
        rev=dims["project"]["rev"],
    )
    w = World(ax, scale, origin_sheet_xy=(95, 110))
    draw_section(ax, w, dims, proposed=proposed, ox=0, oy=0)

    notes_x, notes_y = 290, 270
    notes = [
        "NOTES — COURTYARD SECTION A-A",
        "1. Cut: N-S through centre of proposed spiral",
        "   staircase, viewer looking WEST.",
        "2. Rear-reception room (south) and basement",
        "   room shown to the right of section.",
        "3. Rear boundary wall (north) shown to the left.",
        "4. Datums:",
        "   • Courtyard slab = ±0",
        "   • Basement floor = −2760",
        "   • Ground floor FFL = +2820",
        "   • Kitchen ceiling = +5270",
        "   • Reception ceiling = +6100",
        "5. Spiral staircase: 14 treads × 201 mm rise =",
        "   2814 mm total → meets new doorway at GF FFL.",
        "6. Central pole 3300 mm — extends above landing",
        "   as terminating post / handrail.",
        "7. Base-plate fixed to courtyard slab; top fixed to",
        "   side wall + propped from pole. Final detail by",
        "   structural engineer.",
        "8. The side wall (and the new doorway through it)",
        "   sits BEHIND the section plane — shown dashed.",
    ]
    for i, line in enumerate(notes):
        weight = "bold" if i == 0 else "normal"
        size = 7 if i == 0 else 6
        ax.text(notes_x, notes_y - i * 4, line,
                fontsize=size, weight=weight, ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    basename = f"05_courtyard_section_{'proposed' if proposed else 'existing'}"
    pdf, png = save_sheet(fig, basename, out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render(proposed=True, dwg_no="05-B")
    render(proposed=False, dwg_no="05-A")
