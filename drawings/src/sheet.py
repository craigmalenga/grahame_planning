"""A3 architectural sheet framework with title block, scale bar, dimension lines.

All drawing coordinates are in MILLIMETRES (real-world). The sheet layout
itself uses matplotlib figure units; we map world-mm -> sheet-mm via the
chosen scale, then matplotlib renders the sheet at A3 size.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle, FancyArrowPatch
from matplotlib.lines import Line2D
import numpy as np

# A3 = 420 mm x 297 mm (landscape)
A3_W_MM = 420.0
A3_H_MM = 297.0
MM_PER_INCH = 25.4

# Standard drawing zone — every drawing is placed inside this rectangle.
# Notes column lives to the right of the drawing zone.
DRAWING_ZONE = dict(x0=15, y0=85, x1=255, y1=283)   # 240 x 198 mm
NOTES_ZONE   = dict(x0=262, y0=85, x1=410, y1=283)  # right margin 148 wide
# Drawing zone is well clear of the title block (bottom-right at y<80).

# Drafting conventions
DIM_LINE_COLOR = "#222222"
DIM_TEXT_SIZE = 7
LINE_HEAVY = 1.2     # walls, structural
LINE_MEDIUM = 0.7    # openings, fixtures
LINE_LIGHT = 0.35    # hatching, secondary
LINE_DASHED = (0, (5, 3))
LINE_DASHDOT = (0, (5, 2, 1, 2))


@dataclass
class Scale:
    """Drawing scale, e.g. 1:50 means 50mm real = 1mm on paper."""
    denominator: int

    @property
    def factor(self) -> float:
        # multiply world-mm by this to get sheet-mm
        return 1.0 / self.denominator


def auto_origin(world_w_mm: float, world_h_mm: float, scale: Scale,
                 zone: dict = None) -> tuple:
    """Compute a sheet-mm origin (bottom-left of drawing) that centres a
    world-mm bounding box of (world_w × world_h) inside the given drawing
    zone (or the standard DRAWING_ZONE)."""
    zone = zone or DRAWING_ZONE
    zone_w = zone["x1"] - zone["x0"]
    zone_h = zone["y1"] - zone["y0"]
    drawn_w = world_w_mm * scale.factor
    drawn_h = world_h_mm * scale.factor
    pad_x = max(0, (zone_w - drawn_w) / 2)
    pad_y = max(0, (zone_h - drawn_h) / 2)
    return (zone["x0"] + pad_x, zone["y0"] + pad_y)


def wrap_text(text: str, max_chars: int) -> str:
    """Word-wrap a string at word boundaries to a max line length."""
    if len(text) <= max_chars:
        return text
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if not cur:
            cur = w
        elif len(cur) + 1 + len(w) <= max_chars:
            cur += " " + w
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def new_a3_landscape(title: str, drawing_no: str, scale: Scale,
                     project: str = "Flat 1, 20 Hornton Street, London W8 4NR",
                     client: str = "Grahame McGirr", rev: str = "B",
                     show_north_arrow: bool = False,
                     north_rotation_deg: float = 0.0):
    """Create an A3 landscape figure with title block and border.

    Returns (fig, ax_drawing) where ax_drawing's data coords are in SHEET MM
    (0..420 horizontally, 0..297 vertically). The caller draws into the
    'drawing area' region (typically left/centre of the sheet).
    """
    fig = plt.figure(figsize=(A3_W_MM / MM_PER_INCH, A3_H_MM / MM_PER_INCH),
                     dpi=200, facecolor="white")
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, A3_W_MM)
    ax.set_ylim(0, A3_H_MM)
    ax.set_aspect("equal")
    ax.axis("off")

    # Outer border
    ax.add_patch(Rectangle((10, 10), A3_W_MM - 20, A3_H_MM - 20,
                           fill=False, ec="black", lw=1.2))
    # Inner trim
    ax.add_patch(Rectangle((12, 12), A3_W_MM - 24, A3_H_MM - 24,
                           fill=False, ec="black", lw=0.4))

    # Title block bottom-right — cleaner grid
    # 5 rows, 2 columns (left=wide, right=narrow)
    tb_w, tb_h = 150, 70
    tb_x, tb_y = A3_W_MM - 10 - tb_w, 10
    row_h = tb_h / 5  # 14
    col_split = 95
    ax.add_patch(Rectangle((tb_x, tb_y), tb_w, tb_h, fill=False,
                           ec="black", lw=0.9))
    # Horizontal dividers between the 5 rows
    for i in range(1, 5):
        y = tb_y + i * row_h
        ax.plot([tb_x, tb_x + tb_w], [y, y], color="black", lw=0.4)
    # Vertical divider (full height)
    ax.plot([tb_x + col_split, tb_x + col_split],
            [tb_y, tb_y + tb_h], color="black", lw=0.4)

    def cell(col_x, col_w, row_i, label, value, label_size=5,
             value_size=8, value_weight="bold"):
        # row_i: 0 = bottom, 4 = top
        y_bot = tb_y + row_i * row_h
        # Label in top-left corner of cell
        ax.text(col_x + 2, y_bot + row_h - 1.5, label,
                fontsize=label_size, weight="bold",
                ha="left", va="top", color="#444")
        # Value centred lower in cell
        ax.text(col_x + col_w / 2, y_bot + row_h * 0.35, value,
                fontsize=value_size, weight=value_weight,
                ha="center", va="center")

    # Left column (wide): project, drawing title, client/rev
    cell(tb_x, col_split, 4, "PROJECT", project,
         value_size=8, value_weight="bold")
    # Wrap long titles so they fit the cell (col_split ≈ 95 mm wide)
    wrapped_title = wrap_text(title, max_chars=50)
    cell(tb_x, col_split, 3, "DRAWING TITLE", wrapped_title,
         value_size=7 if "\n" in wrapped_title else 8, value_weight="bold")
    cell(tb_x, col_split, 2, "CLIENT", client,
         value_size=8, value_weight="normal")
    cell(tb_x, col_split, 1, "REVISION", rev,
         value_size=8, value_weight="normal")
    cell(tb_x, col_split, 0, "UNITS", "All dimensions in millimetres (mm)",
         value_size=7, value_weight="normal")

    # Right column (narrow): scale, dwg no, date, sheet, status
    right_x = tb_x + col_split
    right_w = tb_w - col_split
    from datetime import date
    cell(right_x, right_w, 4, "SCALE", f"1:{scale.denominator} @ A3",
         value_size=9, value_weight="bold")
    cell(right_x, right_w, 3, "DRAWING NO.", drawing_no,
         value_size=10, value_weight="bold")
    cell(right_x, right_w, 2, "DATE", date.today().strftime("%Y-%m-%d"),
         value_size=8)
    cell(right_x, right_w, 1, "SHEET SIZE", "A3 (420 x 297)",
         value_size=7)
    cell(right_x, right_w, 0, "STATUS", "FOR PLANNING",
         value_size=8, value_weight="bold")

    # North arrow / orientation marker (top right inside drawing area)
    # Rev B: only shown on plan/site drawings (set show_north_arrow=True).
    if show_north_arrow:
        import numpy as _np
        nx, ny = A3_W_MM - 30, A3_H_MM - 30
        ax.add_patch(plt.Circle((nx, ny), 9, fill=False, ec="black", lw=0.5))
        # arrow rotated by north_rotation_deg (0 = up; +ve = clockwise)
        a = _np.deg2rad(north_rotation_deg)
        dx = _np.sin(a)
        dy = _np.cos(a)
        ax.annotate("N",
                    xy=(nx + 6 * dx, ny + 6 * dy),
                    xytext=(nx - 6 * dx, ny - 6 * dy),
                    arrowprops=dict(arrowstyle="-|>", color="black", lw=1.2),
                    ha="center", va="center", fontsize=10, weight="bold")

    # Scale bar bottom-left — only if scale is a proper drawing scale (denom > 1).
    # At 1:1 the bar bars run wider than the sheet and turn into a thick black
    # line obscuring the title block.
    if scale.denominator > 1:
        sb_x, sb_y = 20, 6
        bar_lengths_mm_world = [0, 1000, 2000, 3000, 4000, 5000]  # in world mm
        bar_lengths_sheet = [v * scale.factor for v in bar_lengths_mm_world]
        # If the 5m bar overflows the available horizontal space (260mm before
        # title block at ~270mm), reduce the number of segments.
        max_len = 250
        while bar_lengths_sheet and bar_lengths_sheet[-1] > max_len:
            bar_lengths_mm_world.pop()
            bar_lengths_sheet.pop()
        bar_h = 2
        for i in range(len(bar_lengths_sheet) - 1):
            x0 = sb_x + bar_lengths_sheet[i]
            x1 = sb_x + bar_lengths_sheet[i + 1]
            fill = "black" if i % 2 == 0 else "white"
            ax.add_patch(Rectangle((x0, sb_y), x1 - x0, bar_h,
                                   fill=True, fc=fill, ec="black", lw=0.4))
        for i, v in enumerate(bar_lengths_mm_world):
            x = sb_x + bar_lengths_sheet[i]
            ax.plot([x, x], [sb_y, sb_y - 1.2], color="black", lw=0.4)
            ax.text(x, sb_y - 2.3, f"{v/1000:g}m", fontsize=5,
                    ha="center", va="top")
        if bar_lengths_sheet:
            ax.text(sb_x + bar_lengths_sheet[-1] / 2, sb_y + bar_h + 1.5,
                    f"Scale 1:{scale.denominator}",
                    fontsize=6, ha="center", va="bottom")

    return fig, ax


# ---------- World-to-sheet helpers ----------

class World:
    """Maps real-world mm to sheet mm at a given scale, anchored on the sheet."""
    def __init__(self, ax, scale: Scale, origin_sheet_xy=(30, 60)):
        self.ax = ax
        self.scale = scale
        self.ox, self.oy = origin_sheet_xy

    def x(self, x_mm):
        return self.ox + x_mm * self.scale.factor

    def y(self, y_mm):
        return self.oy + y_mm * self.scale.factor

    def p(self, x_mm, y_mm):
        return (self.x(x_mm), self.y(y_mm))

    def s(self, length_mm):
        """Scale a length only."""
        return length_mm * self.scale.factor


# ---------- Drawing primitives ----------

def wall(ax, w: World, x0, y0, x1, y1, lw=LINE_HEAVY):
    ax.plot([w.x(x0), w.x(x1)], [w.y(y0), w.y(y1)],
            color="black", lw=lw, solid_capstyle="butt")


def wall_thick(ax, w: World, x0, y0, x1, y1, thickness_mm, lw=LINE_HEAVY,
               hatch=False, fill=True):
    """Draw a wall as a filled rectangle of given thickness, axis-aligned.
    The wall centreline goes from (x0,y0) to (x1,y1). Thickness perpendicular.
    """
    import math
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    if L == 0:
        return
    nx, ny = -dy / L, dx / L  # normal
    t = thickness_mm / 2
    pts = [
        (x0 + nx * t, y0 + ny * t),
        (x1 + nx * t, y1 + ny * t),
        (x1 - nx * t, y1 - ny * t),
        (x0 - nx * t, y0 - ny * t),
    ]
    pts_sheet = [w.p(px, py) for px, py in pts]
    poly = plt.Polygon(pts_sheet, closed=True, fill=fill,
                       fc="#333333" if fill else "white",
                       ec="black", lw=lw)
    ax.add_patch(poly)


def dim_horizontal(ax, w: World, x0, x1, y_offset_world,
                   label=None, extension=200, side="below"):
    """Horizontal dimension line between x0 and x1 at world y_offset.

    side: 'below' (offset is below) or 'above'.
    extension: how far the witness lines extend past the dim line, in world mm.
    """
    y = y_offset_world
    sx0, sx1 = w.x(x0), w.x(x1)
    sy = w.y(y)
    # Dimension line with terminators
    ax.plot([sx0, sx1], [sy, sy], color=DIM_LINE_COLOR, lw=0.4)
    tick = 1.2  # sheet mm
    ax.plot([sx0, sx0], [sy - tick, sy + tick], color=DIM_LINE_COLOR, lw=0.6)
    ax.plot([sx1, sx1], [sy - tick, sy + tick], color=DIM_LINE_COLOR, lw=0.6)
    # Witness lines
    ext_sheet = w.s(extension)
    direction = -1 if side == "below" else 1
    for sx in (sx0, sx1):
        ax.plot([sx, sx], [sy, sy - direction * ext_sheet * 0.4],
                color=DIM_LINE_COLOR, lw=0.3)
    # Label
    val = abs(x1 - x0)
    txt = label if label else f"{val:.0f}"
    ax.text((sx0 + sx1) / 2, sy + 1.2, txt,
            fontsize=DIM_TEXT_SIZE, ha="center", va="bottom",
            color=DIM_LINE_COLOR)


def dim_vertical(ax, w: World, y0, y1, x_offset_world,
                 label=None, side="left"):
    sx = w.x(x_offset_world)
    sy0, sy1 = w.y(y0), w.y(y1)
    ax.plot([sx, sx], [sy0, sy1], color=DIM_LINE_COLOR, lw=0.4)
    tick = 1.2
    ax.plot([sx - tick, sx + tick], [sy0, sy0], color=DIM_LINE_COLOR, lw=0.6)
    ax.plot([sx - tick, sx + tick], [sy1, sy1], color=DIM_LINE_COLOR, lw=0.6)
    val = abs(y1 - y0)
    txt = label if label else f"{val:.0f}"
    ax.text(sx - 1.5, (sy0 + sy1) / 2, txt,
            fontsize=DIM_TEXT_SIZE, ha="right", va="center",
            color=DIM_LINE_COLOR, rotation=90)


def opening(ax, w: World, x0, y0, x1, y1, label=None, lw=LINE_MEDIUM):
    """Rectangular opening (window/door) outline."""
    sx, sy = w.x(x0), w.y(y0)
    sw, sh = w.s(x1 - x0), w.s(y1 - y0)
    ax.add_patch(Rectangle((sx, sy), sw, sh, fill=False,
                           ec="black", lw=lw))
    if label:
        ax.text(sx + sw / 2, sy + sh / 2, label,
                fontsize=6, ha="center", va="center", style="italic")


def hatch_area(ax, w: World, x0, y0, x1, y1, pattern="///", color="#888"):
    sx, sy = w.x(x0), w.y(y0)
    sw, sh = w.s(x1 - x0), w.s(y1 - y0)
    ax.add_patch(Rectangle((sx, sy), sw, sh, fill=False,
                           hatch=pattern, ec=color, lw=0.3))


def annotation(ax, w: World, x, y, text, leader_to=None, size=7,
               weight="normal"):
    sx, sy = w.x(x), w.y(y)
    ax.text(sx, sy, text, fontsize=size, weight=weight,
            ha="left", va="bottom")
    if leader_to:
        tx, ty = w.p(*leader_to)
        ax.plot([sx, tx], [sy, ty], color="black", lw=0.3)
        ax.plot(tx, ty, marker="o", markersize=1.2, color="black")


def save_sheet(fig, basename: str, out_dir: Path):
    out_dir = Path(out_dir)
    pdf_dir = out_dir / "pdf"
    png_dir = out_dir / "png"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    png_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = pdf_dir / f"{basename}.pdf"
    png_path = png_dir / f"{basename}.png"
    fig.savefig(pdf_path, format="pdf", bbox_inches=None, pad_inches=0)
    fig.savefig(png_path, format="png", dpi=200, bbox_inches=None, pad_inches=0)
    plt.close(fig)
    return pdf_path, png_path
