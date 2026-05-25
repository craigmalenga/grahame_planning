"""Sheet 06 — Spiral staircase detail.  Plan, elevation, dimensional schedule."""
from __future__ import annotations
from pathlib import Path
import sys, math
import yaml
from matplotlib.patches import Rectangle, Circle, Wedge

sys.path.insert(0, str(Path(__file__).parent))
from sheet import new_a3_landscape, Scale, World, save_sheet, dim_horizontal, dim_vertical
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
    # PLAN (left half)
    w_plan = World(ax, Scale(20), origin_sheet_xy=(45, 100))
    draw_plan(ax, w_plan, params, show_envelope=True)
    # Plan dims
    cx, cy = 0, 0
    dim_horizontal(ax, w_plan,
                   cx - params.envelope_radius_mm,
                   cx + params.envelope_radius_mm,
                   cy - params.envelope_radius_mm - 250,
                   label=f"{int(2 * params.envelope_radius_mm)} (envelope Ø)")
    ax.text(45 + 35, 195, "PLAN VIEW", fontsize=8, weight="bold")
    ax.text(45 + 35, 192, "(viewed from above, dwg @ 1:20)",
            fontsize=6, style="italic")

    # ELEVATION (right half) — at 1:20
    w_elev = World(ax, Scale(20), origin_sheet_xy=(230, 70))
    draw_elevation(ax, w_elev, params, base_x_mm=400, base_y_mm=0)
    ax.text(230 + 60, 240, "ELEVATION (developed)", fontsize=8, weight="bold")
    ax.text(230 + 60, 237, "Treads laid out side-projected from centre pole",
            fontsize=6, style="italic")
    # Elev dims
    dim_vertical(ax, w_elev, 0, params.total_rise_mm,
                 -250, label=f"{params.total_rise_mm}\ntotal rise\n(14 × 201)")
    dim_vertical(ax, w_elev, 0, params.central_pole_height_mm,
                 -550, label=f"{params.central_pole_height_mm}\ncentre pole")

    # Schedule
    notes = [
        "RECLAIMED VICTORIAN CAST-IRON SPIRAL STAIRCASE",
        f"• Number of treads / pads:   {params.n_treads + 1} ({params.n_treads} risers + landing pad)",
        f"• Rise per tread:           {params.tread_rise_mm} mm  (200-210 mm verified on artefact)",
        f"• Total rise:               {params.total_rise_mm} mm",
        f"• Central pole height:      {params.central_pole_height_mm} mm",
        f"• Central pole diameter:    {params.central_pole_diameter_mm} mm",
        f"• Outer radius (tread):     {params.outer_radius_mm} mm",
        f"• Installation envelope Ø:  {2*params.envelope_radius_mm} mm (allow ~175 cm clear)",
        f"• Tread widest dim:         {params.tread_widest_mm} mm",
        f"• Tread thickness:          {params.tread_thickness_mm} mm",
        f"• Rotation per tread:       {params.rotation_per_tread_deg}°",
        f"• Handrail height:          {params.handrail_height_mm} mm above tread",
        f"• Finish:                   dark painted cast iron / black ironwork",
        "",
        "INSTALLATION NOTES",
        "• Base plate bolted to courtyard slab (engineered fixing).",
        "• Top tread / landing pad meets new kitchen-window doorway",
        "  threshold at +2820 above courtyard slab (= GF FFL).",
        "• Pole top extends to +3300 — terminates above handrail",
        "  level; cap to be matched to existing handrail Newel detail.",
        "• Side-fixed to side wall via 2 lateral brackets + propped",
        "  off centre pole.",
        "• Final structural detail by engineer; installer to verify",
        "  achievable rise matches measured site dimension and to",
        "  fit a small landing-pad spacer if dim varies by > ±25 mm.",
    ]
    nx, ny = 45, 90
    for i, line in enumerate(notes):
        if not line.strip():
            ny -= 2; continue
        weight = "bold" if (i == 0 or line in ("INSTALLATION NOTES",)) else "normal"
        size = 7 if (i == 0) else 6
        ax.text(nx, ny - i * 3.2, line, fontsize=size,
                weight=weight, ha="left", va="top", family="DejaVu Sans")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "06_staircase_detail", out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render()
