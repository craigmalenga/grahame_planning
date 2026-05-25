"""Sheet 06 — Spiral staircase detail.

Layout:
  LEFT half:           ELEVATION (tall, full height)
  TOP-RIGHT quadrant:  PLAN (top-down footprint)
  BOTTOM-RIGHT zone:   Schedule + installation notes (below the plan)
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World, save_sheet,
                   dim_horizontal, dim_vertical, A3_W_MM, A3_H_MM)
from staircase import StaircaseParams, draw_plan, draw_elevation


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def render(dwg_no="06"):
    dims = load_dims()
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
    )

    fig, ax = new_a3_landscape(
        title="SPIRAL STAIRCASE — Plan & Elevation Detail (1:20)",
        drawing_no=dwg_no, scale=Scale(20),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )

    # =========================================================================
    # SHEET ZONES (in sheet-mm, A3 = 420 x 297)
    # =========================================================================
    # LEFT HALF (elevation):  x 30..180, y 30..280
    # TOP-RIGHT (plan):       x 200..360, y 165..280
    # BOTTOM-RIGHT (notes):   x 200..395, y 30..160
    # =========================================================================

    # ---- ELEVATION (left half) ----
    # Scale 1:20.  Total rise + handrail ~3700 mm -> on sheet that's 185 mm at 1:20.
    # Available height in left zone: 250 mm. Plenty of room.
    scale_el = Scale(20)
    w_elev = World(ax, scale_el, origin_sheet_xy=(75, 50))
    # Draw elevation centred (base x = 0)
    draw_elevation(ax, w_elev, params, base_x_mm=0, base_y_mm=0)

    # Elevation dimensions
    dim_vertical(ax, w_elev, 0, params.total_rise_mm,
                 -params.envelope_radius_mm - 250,
                 label=f"{params.total_rise_mm}\ntotal rise\n(14 x 201)")
    dim_vertical(ax, w_elev, 0, params.central_pole_height_mm,
                 -params.envelope_radius_mm - 600,
                 label=f"{params.central_pole_height_mm}\ncentre\npole")
    # Handrail height callout
    dim_vertical(ax, w_elev, params.total_rise_mm,
                 params.total_rise_mm + params.handrail_height_mm,
                 -params.envelope_radius_mm - 250,
                 label=f"{params.handrail_height_mm}\nhandrail")
    # Title for elevation zone
    ax.text(40, 275, "ELEVATION (developed)",
            fontsize=10, weight="bold", ha="left", va="top")
    ax.text(40, 270, "Treads side-projected from centre pole.",
            fontsize=6.5, style="italic", ha="left", va="top", color="#555")

    # ---- PLAN (top-right) ----
    scale_pl = Scale(20)
    plan_centre_sheet_x = 290   # middle of x 220..360
    plan_centre_sheet_y = 230   # within y 195..280
    w_plan = World(ax, scale_pl, origin_sheet_xy=(plan_centre_sheet_x,
                                                   plan_centre_sheet_y))
    draw_plan(ax, w_plan, params, show_envelope=True)
    dim_horizontal(ax, w_plan,
                   -params.envelope_radius_mm,
                   params.envelope_radius_mm,
                   -params.envelope_radius_mm - 250,
                   label=f"{int(2 * params.envelope_radius_mm)}  envelope dia.")
    ax.text(220, 270, "PLAN (top-down footprint)",
            fontsize=9, weight="bold", ha="left", va="top")
    ax.text(220, 266, "Viewed from above; tread numbers shown.",
            fontsize=6, style="italic", ha="left", va="top", color="#555")

    # ---- SCHEDULE + NOTES (between plan and title block) ----
    # Confined to x 215..395, y 88..185 (above the title block which ends ~y=85)
    from matplotlib.patches import Rectangle as _R
    ax.add_patch(_R((215, 88), 180, 95, fill=False,
                    ec="#bbb", lw=0.3, linestyle=(0, (2, 2))))

    schedule_lines = [
        ("SCHEDULE", True, 8),
        (f"Treads / pads:        {params.n_treads + 1}  (14 risers + landing pad)", False, 7),
        (f"Rise per tread:       {params.tread_rise_mm} mm  (200-210 verified)", False, 7),
        (f"Total rise:           {params.total_rise_mm} mm", False, 7),
        (f"Central pole height:  {params.central_pole_height_mm} mm", False, 7),
        (f"Pole diameter:        {params.central_pole_diameter_mm} mm", False, 7),
        (f"Outer radius (tread): {params.outer_radius_mm} mm", False, 7),
        (f"Envelope diameter:    {int(2*params.envelope_radius_mm)} mm  (~175 cm)", False, 7),
        (f"Tread widest dim:     {params.tread_widest_mm} mm", False, 7),
        (f"Tread thickness:      {params.tread_thickness_mm} mm", False, 7),
        (f"Rotation/tread:       {params.rotation_per_tread_deg}°", False, 7),
        (f"Handrail height:      {params.handrail_height_mm} mm above tread", False, 7),
        (f"Finish:               dark painted cast iron", False, 7),
        ("", False, 4),
        ("INSTALLATION", True, 8),
        ("• Base plate bolted to courtyard slab (engineer-designed).", False, 6.5),
        ("• Top tread / landing-pad lands at new kitchen-doorway", False, 6.5),
        ("  threshold (= GF FFL above courtyard slab).", False, 6.5),
        ("• Pole top above handrail — cap to match Victorian newel.", False, 6.5),
        ("• Side-fixed to side wall via 2 brackets + propped off pole.", False, 6.5),
        ("• Final structural detail by engineer; installer to verify", False, 6.5),
        ("  achievable rise vs. measured site dim; landing-pad spacer", False, 6.5),
        ("  to take up tolerance up to ±25 mm.", False, 6.5),
    ]
    y_cursor = 180
    for text, bold, sz in schedule_lines:
        if not text:
            y_cursor -= 2
            continue
        # smaller font to fit in the narrower height available
        size_eff = sz if sz <= 7 else 7
        ax.text(220, y_cursor, text,
                fontsize=size_eff, weight=("bold" if bold else "normal"),
                family="DejaVu Sans Mono" if (not bold and ":" in text) else "DejaVu Sans",
                ha="left", va="top",
                color=("#aa3322" if bold else "#222"))
        y_cursor -= size_eff * 0.42 + 1.0

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "06_staircase_detail", out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render()
