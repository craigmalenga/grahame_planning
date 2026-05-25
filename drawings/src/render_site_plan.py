"""Sheets 01 (cover/index) and 09 (Site / location plan).

Site plan is constructed schematically based on the OS-style inset in
`job16873-1.pdf` — No. 20 highlighted with adjacent properties shown.
A separate STREET ELEVATION schematic is included as a stylised diagram
constructed from the front-elevation photos of Nos. 24 and 30 + the
character of the No. 20 frontage; clearly marked INDICATIVE.
"""
from __future__ import annotations
from pathlib import Path
import sys
import yaml
from matplotlib.patches import Rectangle, FancyBboxPatch

sys.path.insert(0, str(Path(__file__).parent))
from sheet import new_a3_landscape, Scale, World, save_sheet


def load_dims():
    with open(Path(__file__).resolve().parent.parent / "dimensions.yaml") as f:
        return yaml.safe_load(f)


def render_site_plan():
    dims = load_dims()
    fig, ax = new_a3_landscape(
        title="SITE & STREET-CONTEXT PLAN — No. 20 Hornton Street",
        drawing_no="09",
        scale=Scale(500),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
        show_north_arrow=True,
        north_rotation_deg=-45,    # Hornton St runs ~NE-SW; building rear faces NE
    )

    # We'll draw a schematic strip of terrace properties along Hornton Street.
    # Each property ~6 m frontage. Show Nos 14–34.
    house_frontage = 6.0  # m
    n_houses = 11   # 14 16 18 20 22 24 26 28 30 32 34
    nums = [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34]
    # Convert to sheet mm using a manual scale (1:500)
    sheet_origin_x = 30
    sheet_origin_y = 90
    sheet_per_m = 1000 / 500   # 2 mm per m on sheet at 1:500
    h_w = house_frontage * sheet_per_m   # width of each house on sheet (mm)
    h_d = 25 * sheet_per_m               # depth of each house

    # Draw terrace
    for i, num in enumerate(nums):
        x = sheet_origin_x + i * h_w
        y = sheet_origin_y
        is_subject = (num == 20)
        fc = "#ffe6b3" if is_subject else "#e0d8c4"
        ec = "#aa0000" if is_subject else "#444"
        lw = 1.2 if is_subject else 0.4
        ax.add_patch(Rectangle((x, y), h_w, h_d, fc=fc, ec=ec, lw=lw))
        ax.text(x + h_w / 2, y + h_d - 4, str(num),
                fontsize=7, weight="bold", ha="center", va="top",
                color="#aa0000" if is_subject else "#333")
        # Front lightwell
        ax.add_patch(Rectangle((x + h_w * 0.2, y + h_d * 0.85),
                               h_w * 0.6, h_d * 0.05,
                               fc="#cce4f0", ec="#888", lw=0.3))
        # Rear courtyard
        ax.add_patch(Rectangle((x + h_w * 0.3, y + h_d * 0.1),
                               h_w * 0.45, h_d * 0.15,
                               fc="#cce4f0", ec="#888", lw=0.3))
        # Roof ridge line
        ax.plot([x, x + h_w], [y + h_d * 0.5, y + h_d * 0.5],
                color="#888", lw=0.3, linestyle=(0, (3, 2)))

    # Street label below
    street_y = sheet_origin_y - 8
    ax.add_patch(Rectangle((sheet_origin_x - 5, street_y - 4),
                           n_houses * h_w + 10, 8,
                           fc="#dddddd", ec="#666", lw=0.4))
    ax.text(sheet_origin_x + n_houses * h_w / 2, street_y,
            "HORNTON STREET", fontsize=8, weight="bold",
            ha="center", va="center")

    # Compass north arrow
    ax.text(sheet_origin_x + n_houses * h_w + 15,
            sheet_origin_y + h_d / 2,
            "N\n↑", fontsize=10, ha="left", va="center", weight="bold")

    # Hornton Place / Library label (per the actual OS extract)
    ax.text(sheet_origin_x + h_w * 1.5, sheet_origin_y - 20,
            "↘ Hornton Place / Central Library",
            fontsize=6, ha="left", style="italic", color="#666")

    # Subject highlight callout
    sub_idx = nums.index(20)
    sub_x = sheet_origin_x + sub_idx * h_w
    ax.add_patch(FancyBboxPatch((sub_x - 4, sheet_origin_y - 4),
                                h_w + 8, h_d + 8,
                                boxstyle="round,pad=2",
                                fill=False, ec="#aa0000", lw=1.0,
                                linestyle=(0, (4, 2))))
    ax.text(sub_x + h_w / 2, sheet_origin_y + h_d + 8,
            "SUBJECT — Flat 1\nbasement + ground floor",
            fontsize=7, weight="bold", ha="center",
            color="#aa0000")

    # Add a more zoomed-in plan of No. 20 itself (showing footprint + courtyard)
    zoom_x = sheet_origin_x
    zoom_y = sheet_origin_y + h_d + 40
    zoom_scale = 1500   # 1:200 = 5 mm/m
    z_per_m = 1000 / 200
    flat_gf_w = dims["flat_envelope"]["ground_floor"]["width_mm"] / 1000
    flat_gf_d = dims["flat_envelope"]["ground_floor"]["length_mm"] / 1000
    flat_bs_w = dims["flat_envelope"]["basement"]["width_mm"] / 1000
    flat_bs_d = dims["flat_envelope"]["basement"]["length_mm"] / 1000
    # Basement footprint (wider, longer)
    ax.add_patch(Rectangle((zoom_x, zoom_y),
                           flat_bs_w * z_per_m, flat_bs_d * z_per_m,
                           fc="#e8e4d4", ec="#888", lw=0.5,
                           linestyle=(0, (3, 2))))
    # Ground floor footprint
    ax.add_patch(Rectangle((zoom_x + 1, zoom_y + (flat_bs_d - flat_gf_d) * z_per_m / 2),
                           flat_gf_w * z_per_m, flat_gf_d * z_per_m,
                           fc="#ffe6b3", ec="#aa0000", lw=0.9))
    # Rear courtyard
    cw = dims["courtyard"]["plan_width_mm"] / 1000
    cd_ = dims["courtyard"]["plan_depth_mm"] / 1000
    # The courtyard sits at top-left of the ground-floor footprint (rear-west of plan)
    cz_x = zoom_x + 1
    cz_y = zoom_y + (flat_bs_d - flat_gf_d) * z_per_m / 2 + flat_gf_d * z_per_m - cd_ * z_per_m - 1
    ax.add_patch(Rectangle((cz_x, cz_y),
                           cw * z_per_m, cd_ * z_per_m,
                           fc="#cce4f0", ec="#0066cc", lw=0.5))
    ax.text(cz_x + cw * z_per_m / 2, cz_y + cd_ * z_per_m / 2,
            "Rear courtyard\n(L-shape)",
            fontsize=5, ha="center", va="center", color="#0066cc",
            style="italic")

    ax.text(zoom_x, zoom_y + flat_bs_d * z_per_m + 4,
            f"ZOOM — No. 20 footprint (basement dashed, GF solid)  1:200",
            fontsize=7, weight="bold")

    # Notes
    notes = [
        "SITE & STREET-CONTEXT PLAN — NOTES",
        "• Indicative diagram — Hornton Street terrace shown",
        "  schematically based on:",
        "   - job16873-1.pdf OS inset (1:1250 extract showing",
        "     No. 20 within its row);",
        "   - front-elevation photos of Nos. 24 and 30 from",
        "     the supplied PDFs (similar listed terrace).",
        "• Subject = Flat 1 of No. 20 (basement + ground floor).",
        "• No. 24 is the subject of an LBC consent (Savills",
        "  2007, LB 70979).",
        "• No. 30 is the subject of an LBC consent (Rawspace",
        "  2014, LB/14/03475) — a useful precedent for the",
        "  internal rec-room opening proposed at No. 20.",
        "• Conservation Area: Kensington (TBC list reference).",
        "• Heritage status: terrace Grade II listed (TBC list",
        "  reference per RBKC schedule).",
        "",
        "A street ELEVATION drawing showing No. 20 in the row",
        "does NOT exist in the source set and would need to be",
        "commissioned separately — the present sheet substitutes",
        "a schematic plan-view of the terrace at 1:500.",
    ]
    nx, ny = 220, 260
    for i, line in enumerate(notes):
        weight = "bold" if i == 0 else "normal"
        size = 7 if i == 0 else 6
        ax.text(nx, ny - i * 4, line, fontsize=size, weight=weight,
                ha="left", va="top")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "09_site_plan", out_dir)
    print(f"Wrote {pdf}")


def render_cover_sheet():
    """Sheet 01 — Cover / drawing index."""
    dims = load_dims()
    fig, ax = new_a3_landscape(
        title="DRAWING INDEX — Planning Application Drawings",
        drawing_no="01",
        scale=Scale(1),
        project=dims["project"]["title"],
        client=dims["project"]["client"], rev=dims["project"]["rev"],
    )

    ax.text(30, 270,
            "FLAT 1, 20 HORNTON STREET, LONDON  W8 4NR",
            fontsize=16, weight="bold", ha="left", va="top")
    ax.text(30, 263,
            "Proposed rear-courtyard alterations, internal opening and shower-room",
            fontsize=10, style="italic", ha="left", va="top", color="#444")

    # Drawing index table
    rows = [
        ("01", "DRAWING INDEX (this sheet)", "this sheet"),
        ("02-A / 02-B", "Rear Courtyard Plan — Existing / Proposed", "1:50"),
        ("03-A / 03-B", "Side Wall Elevation (east) — Existing / Proposed", "1:50"),
        ("04-A / 04-B", "Rear Wall Elevation (south) — Existing / Proposed", "1:50"),
        ("05-A / 05-B", "Courtyard Section A-A — Existing / Proposed", "1:50"),
        ("06", "Spiral Staircase Detail (plan + elevation)", "1:20"),
        ("07-A / 07-B", "Internal Opening — Existing / Proposed (elev + plan)", "1:50 / 1:75"),
        ("08-A / 08-B", "Kitchen + Shower Room Plan — Existing / Proposed", "1:50"),
        ("09", "Site & Street-Context Plan", "1:500 / 1:200"),
        ("10", "3D Axonometric — Rear courtyard with staircase", "n/s"),
        ("11", "3D Axonometric — Compact shower-room", "n/s"),
        ("12", "3D Axonometric — Internal opening", "n/s"),
    ]
    y_start = 230
    row_h = 8
    col_x = [30, 70, 230, 360]
    ax.text(col_x[0], y_start, "DWG NO.", fontsize=7, weight="bold")
    ax.text(col_x[1], y_start, "TITLE", fontsize=7, weight="bold")
    ax.text(col_x[3], y_start, "SCALE", fontsize=7, weight="bold")
    ax.plot([28, 392], [y_start - 2, y_start - 2], color="#000", lw=0.5)
    for i, (dno, title, sc) in enumerate(rows):
        y = y_start - 6 - i * row_h
        ax.text(col_x[0], y, dno, fontsize=8, ha="left")
        ax.text(col_x[1], y, title, fontsize=8, ha="left")
        ax.text(col_x[3], y, sc, fontsize=8, ha="left")

    # Methodology block
    method_y = y_start - 6 - len(rows) * row_h - 10
    ax.text(30, method_y,
            "REPLICABILITY  — every drawing is generated from a single",
            fontsize=8, weight="bold")
    method_lines = [
        "parametric source (`drawings/dimensions.yaml`). To revise any",
        "dimension: edit the YAML, re-run `python3 drawings/src/render_all.py`,",
        "and a fresh PDF + PNG set is produced. Source files are kept in",
        "the repository for full version control.",
        "",
        "STATUS  —  FOR PLANNING (DRAFT).  Several dimensions are marked",
        "'TBC' in the YAML pending Grahame's site re-measure (see",
        "`dimension_questions.md`).  Items flagged TBC are clearly noted",
        "on the drawings where they appear.",
    ]
    for i, ln in enumerate(method_lines):
        ax.text(30, method_y - 5 - i * 4, ln, fontsize=7, ha="left")

    # Status box — top-right of sheet, well clear of the index table + title block
    ax.add_patch(FancyBboxPatch((290, 240), 100, 35,
                                boxstyle="round,pad=2",
                                fc="#fff4e0", ec="#aa6600", lw=0.6))
    ax.text(340, 268, "STATUS", fontsize=8, weight="bold", ha="center")
    ax.text(340, 258, "FOR PLANNING — DRAFT", fontsize=10, weight="bold",
            ha="center", color="#aa6600")
    ax.text(340, 248, "Rev. B — 2026-05-25", fontsize=7, ha="center")

    out_dir = Path(__file__).resolve().parent.parent / "output"
    pdf, png = save_sheet(fig, "01_cover_index", out_dir)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    render_site_plan()
    render_cover_sheet()
