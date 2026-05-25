"""Reusable elevation primitives: sash windows, doors, brick hatching, etc.

All dimensions in mm (world). Drawn via a World object that maps to sheet mm.
"""
from __future__ import annotations
import math
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle, Polygon, FancyBboxPatch
import numpy as np


def sash_window(ax, w, x0, y0, width, height, panes_horiz=3, panes_vert=4,
                frame_thickness=40, label=None, label_above=True,
                mullion_color="#222222", glass_fill="#e9f1f5"):
    """Multi-pane vertical sliding sash window in elevation.

    (x0,y0) = bottom-left of opening. width, height = opening size.
    panes_horiz x panes_vert = subdivision (each sash separately).
    """
    # Outer frame
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(width), w.s(height),
                           fill=True, fc=glass_fill, ec=mullion_color, lw=0.9))
    # Meeting rail at mid-height (top of lower sash)
    meet = y0 + height / 2
    ax.plot([w.x(x0), w.x(x0 + width)], [w.y(meet), w.y(meet)],
            color=mullion_color, lw=0.9)
    # Glazing bars: subdivide each half-sash
    # Lower sash: vertical bars
    if panes_horiz > 1:
        for i in range(1, panes_horiz):
            x = x0 + width * i / panes_horiz
            ax.plot([w.x(x), w.x(x)], [w.y(y0), w.y(meet)],
                    color=mullion_color, lw=0.4)
            ax.plot([w.x(x), w.x(x)], [w.y(meet), w.y(y0 + height)],
                    color=mullion_color, lw=0.4)
    # Horizontal bars on lower sash
    panes_v_per_sash = max(1, panes_vert // 2)
    for j in range(1, panes_v_per_sash):
        yj = y0 + (height / 2) * j / panes_v_per_sash
        ax.plot([w.x(x0), w.x(x0 + width)], [w.y(yj), w.y(yj)],
                color=mullion_color, lw=0.4)
        yj2 = meet + (height / 2) * j / panes_v_per_sash
        ax.plot([w.x(x0), w.x(x0 + width)], [w.y(yj2), w.y(yj2)],
                color=mullion_color, lw=0.4)
    # Sill — projecting line below
    sill_proj = 30  # mm
    ax.add_patch(Rectangle(w.p(x0 - sill_proj, y0 - 50),
                           w.s(width + 2 * sill_proj), w.s(50),
                           fc="#aaaaaa", ec="#000", lw=0.5))
    # Head / lintel
    ax.add_patch(Rectangle(w.p(x0 - sill_proj * 0.6, y0 + height),
                           w.s(width + 1.2 * sill_proj), w.s(40),
                           fc="#b85a3a", ec="#000", lw=0.5))

    if label:
        ly = y0 + height + 200 if label_above else y0 - 250
        ax.text(*w.p(x0 + width / 2, ly), label,
                fontsize=6, ha="center", va="center", style="italic",
                color="#333")


def blocked_opening(ax, w, x0, y0, width, height, label="Blocked-up opening",
                    show_outline=True, brick_fill="#c6a070"):
    """A previously bricked-up opening: brickwork in the recess, dashed outline of former opening."""
    # Brick fill (we draw a hatch)
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(width), w.s(height),
                           fill=True, fc=brick_fill, ec="none"))
    # Brick coursing
    course_h = 75  # mm typical
    n_courses = int(height / course_h)
    for i in range(1, n_courses + 1):
        y = y0 + i * course_h
        ax.plot([w.x(x0), w.x(x0 + width)], [w.y(y), w.y(y)],
                color="#7a5530", lw=0.25)
    # Perpends — staggered
    for i in range(n_courses):
        y_bot = y0 + i * course_h
        y_top = y_bot + course_h
        offset = (i % 2) * (225 / 2)  # half-brick stagger
        x = x0 + offset
        while x < x0 + width:
            if x > x0:
                ax.plot([w.x(x), w.x(x)], [w.y(y_bot), w.y(y_top)],
                        color="#7a5530", lw=0.25)
            x += 225  # brick length nominal

    # Dashed outline of former opening
    if show_outline:
        ax.add_patch(Rectangle(w.p(x0, y0), w.s(width), w.s(height),
                               fill=False, ec="#aa0000", lw=0.7,
                               linestyle=(0, (4, 2))))
    if label:
        ax.text(*w.p(x0 + width / 2, y0 + height / 2),
                label, fontsize=6, ha="center", va="center",
                style="italic", color="#aa0000",
                bbox=dict(boxstyle="round,pad=0.2", fc="white",
                          ec="#aa0000", lw=0.4))


def double_door(ax, w, x0, y0, width, height, leaves=2, glazed=True,
                label=None, frame_color="#222222", glass_fill="#e9f1f5"):
    """Pair of timber doors with optional glazing."""
    leaf_w = width / leaves
    # Frame
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(width), w.s(height),
                           fill=True, fc="#3d2a1a", ec=frame_color, lw=0.9))
    # Each leaf — inset slightly for stile/rail
    inset = 60  # mm
    for i in range(leaves):
        lx = x0 + i * leaf_w + inset
        ly = y0 + inset
        lw_ = leaf_w - 2 * inset
        lh_ = height - 2 * inset
        if glazed:
            # Top half glazed
            split = ly + lh_ * 0.55
            ax.add_patch(Rectangle(w.p(lx, split), w.s(lw_), w.s(ly + lh_ - split),
                                   fc=glass_fill, ec=frame_color, lw=0.5))
            # Mullion vertical
            ax.plot([w.x(lx + lw_ / 2), w.x(lx + lw_ / 2)],
                    [w.y(split), w.y(ly + lh_)],
                    color=frame_color, lw=0.4)
            # Horizontal glazing bar
            mid_g = (split + ly + lh_) / 2
            ax.plot([w.x(lx), w.x(lx + lw_)], [w.y(mid_g), w.y(mid_g)],
                    color=frame_color, lw=0.4)
            # Bottom panel
            ax.add_patch(Rectangle(w.p(lx, ly), w.s(lw_), w.s(split - ly),
                                   fc="#5a3a22", ec=frame_color, lw=0.5))
        else:
            ax.add_patch(Rectangle(w.p(lx, ly), w.s(lw_), w.s(lh_),
                                   fc="#5a3a22", ec=frame_color, lw=0.5))
        # Door handle indication
        if i == 0:
            ax.plot(*w.p(lx + lw_ - 80, ly + lh_ * 0.45),
                    marker="o", markersize=2, color="#cc9900")
        else:
            ax.plot(*w.p(lx + 80, ly + lh_ * 0.45),
                    marker="o", markersize=2, color="#cc9900")
    # Threshold
    ax.plot([w.x(x0), w.x(x0 + width)], [w.y(y0), w.y(y0)],
            color="#000", lw=0.8)
    # Lintel / arch over (simplified flat arch)
    ax.add_patch(Rectangle(w.p(x0 - 30, y0 + height),
                           w.s(width + 60), w.s(80),
                           fc="#b85a3a", ec="#000", lw=0.5))
    if label:
        ax.text(*w.p(x0 + width / 2, y0 - 250), label,
                fontsize=6, ha="center", va="center", style="italic")


def brick_wall(ax, w, x0, y0, width, height, course_height=75,
               brick_color="#c6a070", mortar_color="#7a5530",
               painted=False, paint_color="#ffffff"):
    """Brick-coursed wall section as a flat infill, with optional white paint."""
    fc = paint_color if painted else brick_color
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(width), w.s(height),
                           fill=True, fc=fc, ec="none"))
    if not painted:
        n_courses = int(height / course_height)
        for i in range(1, n_courses + 1):
            y = y0 + i * course_height
            ax.plot([w.x(x0), w.x(x0 + width)], [w.y(y), w.y(y)],
                    color=mortar_color, lw=0.2, alpha=0.6)


def downpipe(ax, w, x_centre, y_bot, y_top, diameter=90, color="#111111",
             swan_neck_at=None, offset_to_x=None):
    """Black cast-iron rainwater downpipe.

    swan_neck_at: y-height where the pipe offsets horizontally to offset_to_x.
    """
    r = diameter / 2
    if swan_neck_at is None:
        ax.add_patch(Rectangle(w.p(x_centre - r, y_bot),
                               w.s(diameter), w.s(y_top - y_bot),
                               fc=color, ec="#000", lw=0.4))
    else:
        # Lower vertical segment
        ax.add_patch(Rectangle(w.p(x_centre - r, y_bot),
                               w.s(diameter), w.s(swan_neck_at - y_bot),
                               fc=color, ec="#000", lw=0.4))
        # Swan-neck offset (diagonal)
        x2 = offset_to_x if offset_to_x is not None else x_centre
        offset_h = 180  # mm vertical span of the offset
        pts = [
            (x_centre - r, swan_neck_at),
            (x_centre + r, swan_neck_at),
            (x2 + r, swan_neck_at + offset_h),
            (x2 - r, swan_neck_at + offset_h),
        ]
        ax.add_patch(Polygon([w.p(p[0], p[1]) for p in pts],
                              closed=True, fc=color, ec="#000", lw=0.4))
        # Upper vertical segment
        ax.add_patch(Rectangle(w.p(x2 - r, swan_neck_at + offset_h),
                               w.s(diameter),
                               w.s(y_top - swan_neck_at - offset_h),
                               fc=color, ec="#000", lw=0.4))
    # Banding (decorative collars typical of Victorian cast iron)
    band_y = y_bot + 600
    while band_y < y_top:
        ax.plot([w.x(x_centre - r * 1.4), w.x(x_centre + r * 1.4)],
                [w.y(band_y), w.y(band_y)],
                color="#000", lw=0.8)
        band_y += 1500


def flat_arch(ax, w, x0, y0, width, height=140, color="#b85a3a"):
    """Red-brick flat arch over an opening."""
    pts = [
        (x0 - 20, y0),
        (x0 + width + 20, y0),
        (x0 + width + 50, y0 + height),
        (x0 - 50, y0 + height),
    ]
    ax.add_patch(Polygon([w.p(p[0], p[1]) for p in pts],
                          closed=True, fc=color, ec="#000", lw=0.5))


def ground_line(ax, w, x0, x1, y, hatch_depth=200, label=None):
    """Hatched ground/floor line below datum y."""
    ax.plot([w.x(x0), w.x(x1)], [w.y(y), w.y(y)],
            color="#000", lw=1.0)
    # Hatching
    n = int((x1 - x0) / 120)
    for i in range(n + 1):
        x = x0 + i * 120
        ax.plot([w.x(x), w.x(x - 80)],
                [w.y(y), w.y(y - hatch_depth)],
                color="#000", lw=0.25)
    if label:
        ax.text(*w.p(x0 + 100, y - hatch_depth - 100), label,
                fontsize=6, ha="left", va="top", style="italic")
