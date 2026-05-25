"""Render every drawing in the application set.

Edit `dimensions.yaml` then run `python3 drawings/src/render_all.py` to
regenerate the full output bundle in `drawings/output/{pdf,png}/`.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from render_site_plan import render_cover_sheet, render_site_plan
from render_courtyard_plan import render as render_courtyard_plan
from render_side_wall_elevation import render as render_side_wall
from render_rear_wall_elevation import render as render_rear_wall
from render_courtyard_section import render as render_section
from render_staircase_detail import render as render_staircase
from render_internal_opening import render as render_opening
from render_kitchen_bathroom import render as render_kitchen
from render_3d import render_courtyard_3d, render_bathroom_3d, render_internal_opening_3d


def render_all():
    # Cover + index
    render_cover_sheet()
    # Courtyard plan
    render_courtyard_plan(existing=True, proposed=False, dwg_no="02-A")
    render_courtyard_plan(existing=False, proposed=True, dwg_no="02-B")
    # Side wall elevation
    render_side_wall(proposed=False, dwg_no="03-A")
    render_side_wall(proposed=True, dwg_no="03-B")
    # Rear wall elevation
    render_rear_wall(proposed=False, dwg_no="04-A")
    render_rear_wall(proposed=True, dwg_no="04-B")
    # Section
    render_section(proposed=False, dwg_no="05-A")
    render_section(proposed=True, dwg_no="05-B")
    # Staircase detail
    render_staircase(dwg_no="06")
    # Internal opening
    render_opening(proposed=False, dwg_no="07-A")
    render_opening(proposed=True, dwg_no="07-B")
    # Kitchen + bathroom
    render_kitchen(proposed=False, dwg_no="08-A")
    render_kitchen(proposed=True, dwg_no="08-B")
    # Site plan
    render_site_plan()
    # 3D
    render_courtyard_3d()
    render_bathroom_3d()
    render_internal_opening_3d()
    print("\n=== All sheets rendered to drawings/output/{pdf,png}/ ===")


if __name__ == "__main__":
    render_all()
