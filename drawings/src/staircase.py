"""Parametric spiral staircase — reclaimed Victorian cast iron.

Renders the staircase in plan, in elevation, and in 3D, all from the
same set of parameters. Change one number, regenerate every drawing.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Tuple
import math
import numpy as np
import matplotlib.patches as mpatches
from matplotlib.patches import Wedge, Circle


@dataclass
class StaircaseParams:
    """All dimensions in mm. Defaults from read_me brief."""
    n_treads: int = 15
    tread_rise_mm: float = 205.0          # per-tread rise (200-210 in brief)
    central_pole_height_mm: float = 3300.0
    central_pole_diameter_mm: float = 90.0  # typical for Victorian reclaim
    outer_radius_mm: float = 800.0         # 80cm from centre to outer edge
    envelope_radius_mm: float = 875.0      # allow ~170cm overall diameter
    tread_widest_mm: float = 340.0         # widest point of tread (34cm)
    tread_thickness_mm: float = 30.0
    rotation_per_tread_deg: float = 30.0   # 12 treads = 360°; 30° gives a steady wind
    start_angle_deg: float = 180.0         # azimuth of tread 0 (entry from below)
    centre_xy_mm: Tuple[float, float] = (0.0, 0.0)  # in courtyard coords
    finish: str = "dark painted cast iron / black ironwork"
    handrail_height_mm: float = 900.0

    @property
    def total_rise_mm(self) -> float:
        return self.n_treads * self.tread_rise_mm

    @property
    def envelope_diameter_mm(self) -> float:
        return 2 * self.envelope_radius_mm


# ---------- Plan view ----------

def draw_plan(ax, w, params: StaircaseParams, show_envelope=True,
              tread_fill="#cccccc", tread_edge="#222222"):
    """Draw spiral staircase in plan view onto an existing World-mapped axes.

    Trends shown as wedges fanning around the central pole.
    """
    cx, cy = params.centre_xy_mm
    # Envelope circle (the installation footprint)
    if show_envelope:
        ax.add_patch(Circle(w.p(cx, cy), w.s(params.envelope_radius_mm),
                            fill=False, ec="#888", lw=0.5, ls=(0, (3, 2))))
    # Treads (wedges)
    sweep = params.rotation_per_tread_deg
    for i in range(params.n_treads):
        start = params.start_angle_deg + i * sweep
        wedge = Wedge(w.p(cx, cy),
                      r=w.s(params.outer_radius_mm),
                      theta1=start, theta2=start + sweep,
                      width=w.s(params.outer_radius_mm
                                - params.central_pole_diameter_mm / 2),
                      facecolor=tread_fill, edgecolor=tread_edge, lw=0.4)
        ax.add_patch(wedge)
        # tread number label (small) near outer edge midway
        mid = math.radians(start + sweep / 2)
        lx = cx + math.cos(mid) * params.outer_radius_mm * 0.78
        ly = cy + math.sin(mid) * params.outer_radius_mm * 0.78
        ax.text(*w.p(lx, ly), str(i + 1), fontsize=5,
                ha="center", va="center", color="#222")
    # Central pole (solid)
    ax.add_patch(Circle(w.p(cx, cy),
                        w.s(params.central_pole_diameter_mm / 2),
                        fc="#222", ec="#000", lw=0.6))
    # Up-arrow conventional symbol
    arrow_start = (cx + params.outer_radius_mm * 0.9, cy)
    arrow_end = (cx + math.cos(math.radians(params.start_angle_deg
                                             + sweep * params.n_treads * 0.5))
                   * params.outer_radius_mm * 0.9,
                 cy + math.sin(math.radians(params.start_angle_deg
                                             + sweep * params.n_treads * 0.5))
                   * params.outer_radius_mm * 0.9)
    # simple "UP" label
    ax.text(*w.p(cx, cy - params.outer_radius_mm * 1.05),
            "UP →", fontsize=6, ha="center", va="top", style="italic")


# ---------- Elevation / section view ----------

def draw_elevation(ax, w, params: StaircaseParams,
                   base_x_mm: float, base_y_mm: float,
                   view_direction: str = "front"):
    """Draw spiral staircase in elevation (i.e. from a wall, looking at it).

    base_(x,y): position of the centre-pole base in world coords on the
    elevation drawing. base_y is the lower-ground/lightwell floor level.
    """
    cx, cy = base_x_mm, base_y_mm
    pole_top = cy + params.central_pole_height_mm
    # Central pole
    pole_w = params.central_pole_diameter_mm
    ax.add_patch(mpatches.Rectangle(
        w.p(cx - pole_w / 2, cy), w.s(pole_w),
        w.s(params.central_pole_height_mm),
        fc="#222", ec="#000", lw=0.6))

    # Treads — shown as projections at their rise heights, alternating
    # left/right of the pole (since spiral winds around).
    for i in range(params.n_treads):
        rise_y = cy + (i + 1) * params.tread_rise_mm  # top of tread
        angle = math.radians(params.start_angle_deg
                              + i * params.rotation_per_tread_deg)
        # Project tread radial extent onto elevation plane
        # The visible projection is outer_radius * sin(angle from view axis)
        proj = math.sin(angle) * params.outer_radius_mm
        if abs(proj) < 50:
            continue  # tread is edge-on, draw narrow
        side = 1 if proj > 0 else -1
        # tread as a thin slab from pole to projected outer edge
        slab_x0 = cx
        slab_x1 = cx + proj
        slab_y0 = rise_y - params.tread_thickness_mm
        slab_y1 = rise_y
        ax.add_patch(mpatches.Rectangle(
            w.p(min(slab_x0, slab_x1), slab_y0),
            w.s(abs(slab_x1 - slab_x0)),
            w.s(params.tread_thickness_mm),
            fc="#444", ec="#000", lw=0.4))
        # Handrail dots above (decorative)
        ax.plot(*w.p(slab_x1, rise_y + params.handrail_height_mm),
                marker=".", color="#000", markersize=1.5)

    # Handrail line — a sine curve traced around as the spiral rises
    n_samples = 200
    handrail_x = []
    handrail_y = []
    for s in range(n_samples + 1):
        t = s / n_samples
        rise_y = cy + t * params.total_rise_mm + params.handrail_height_mm
        angle = math.radians(params.start_angle_deg
                              + t * params.n_treads
                                * params.rotation_per_tread_deg)
        x = cx + math.sin(angle) * params.outer_radius_mm
        handrail_x.append(w.x(x))
        handrail_y.append(w.y(rise_y))
    ax.plot(handrail_x, handrail_y, color="#222", lw=0.6, alpha=0.8)

    # Pole top cap
    ax.plot([w.x(cx - pole_w), w.x(cx + pole_w)],
            [w.y(pole_top), w.y(pole_top)],
            color="#000", lw=0.8)


# ---------- 3D representation (returns geometry, caller plots) ----------

def make_3d_geometry(params: StaircaseParams):
    """Return a list of polygon faces (each a Nx3 array of [x,y,z] mm)
    suitable for matplotlib Poly3DCollection or similar.
    """
    faces = []
    cx, cy, cz = params.centre_xy_mm[0], params.centre_xy_mm[1], 0.0

    # Central pole (approx as 12-sided prism)
    sides = 16
    r_pole = params.central_pole_diameter_mm / 2
    top_z = params.central_pole_height_mm
    for i in range(sides):
        a0 = i * 2 * math.pi / sides
        a1 = (i + 1) * 2 * math.pi / sides
        x0, y0 = cx + r_pole * math.cos(a0), cy + r_pole * math.sin(a0)
        x1, y1 = cx + r_pole * math.cos(a1), cy + r_pole * math.sin(a1)
        faces.append(("pole",
                      np.array([[x0, y0, 0], [x1, y1, 0],
                                [x1, y1, top_z], [x0, y0, top_z]])))

    # Treads
    for i in range(params.n_treads):
        rise_z = (i + 1) * params.tread_rise_mm  # top of tread
        a_start = math.radians(params.start_angle_deg
                               + i * params.rotation_per_tread_deg)
        a_end = math.radians(params.start_angle_deg
                              + (i + 1) * params.rotation_per_tread_deg)
        r_in = r_pole
        r_out = params.outer_radius_mm
        z_top = rise_z
        z_bot = rise_z - params.tread_thickness_mm
        # 4 corners
        corners_top = []
        corners_bot = []
        for a in (a_start, a_end):
            for r in (r_in, r_out):
                pass
        # build top face
        n_segs = 4
        for s in range(n_segs):
            a0 = a_start + (a_end - a_start) * s / n_segs
            a1 = a_start + (a_end - a_start) * (s + 1) / n_segs
            p00 = [cx + r_in * math.cos(a0), cy + r_in * math.sin(a0), z_top]
            p01 = [cx + r_out * math.cos(a0), cy + r_out * math.sin(a0), z_top]
            p11 = [cx + r_out * math.cos(a1), cy + r_out * math.sin(a1), z_top]
            p10 = [cx + r_in * math.cos(a1), cy + r_in * math.sin(a1), z_top]
            faces.append(("tread_top", np.array([p00, p01, p11, p10])))
            # outer skirt
            p01b = [p01[0], p01[1], z_bot]
            p11b = [p11[0], p11[1], z_bot]
            faces.append(("tread_edge",
                          np.array([p01, p11, p11b, p01b])))
        # underside (single face)
        p00b = [cx + r_in * math.cos(a_start),
                cy + r_in * math.sin(a_start), z_bot]
        p01b = [cx + r_out * math.cos(a_start),
                cy + r_out * math.sin(a_start), z_bot]
        p11b = [cx + r_out * math.cos(a_end),
                cy + r_out * math.sin(a_end), z_bot]
        p10b = [cx + r_in * math.cos(a_end),
                cy + r_in * math.sin(a_end), z_bot]
        faces.append(("tread_bot",
                      np.array([p00b, p10b, p11b, p01b])))

    # Handrail as a tube of small radius (approximate as a polyline)
    n_pts = 120
    hr_pts = []
    for s in range(n_pts + 1):
        t = s / n_pts
        z = t * params.total_rise_mm + params.handrail_height_mm
        a = math.radians(params.start_angle_deg
                         + t * params.n_treads
                           * params.rotation_per_tread_deg)
        x = cx + params.outer_radius_mm * math.cos(a)
        y = cy + params.outer_radius_mm * math.sin(a)
        hr_pts.append([x, y, z])
    faces.append(("handrail_polyline", np.array(hr_pts)))

    return faces
