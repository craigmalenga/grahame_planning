"""Smoke test: render a blank A3 sheet with title block and a sample wall."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from sheet import (new_a3_landscape, Scale, World, wall_thick, opening,
                   dim_horizontal, dim_vertical, annotation, save_sheet)

if __name__ == "__main__":
    scale = Scale(50)
    fig, ax = new_a3_landscape(
        title="SMOKE TEST — REAR ELEVATION (sample)",
        drawing_no="TEST-001",
        scale=scale,
    )
    w = World(ax, scale, origin_sheet_xy=(40, 80))
    # Sample: a 4m wide x 3m tall wall with one window
    wall_thick(ax, w, 0, 0, 4000, 0, thickness_mm=215)  # ground line proxy
    # Wall outline (elevation)
    import matplotlib.patches as mpatches
    ax.add_patch(mpatches.Rectangle(w.p(0, 0), w.s(4000), w.s(3000),
                                    fill=False, ec="black", lw=1.0))
    opening(ax, w, 1000, 800, 2300, 2400, label="Window")
    dim_horizontal(ax, w, 0, 4000, -400)
    dim_horizontal(ax, w, 1000, 2300, -200)
    dim_vertical(ax, w, 0, 3000, -300)
    annotation(ax, w, 2700, 1500, "Sample annotation",
               leader_to=(2200, 1600))

    out = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "00_smoke_test", out)
    print(f"Wrote {pdf}\nWrote {png}")
