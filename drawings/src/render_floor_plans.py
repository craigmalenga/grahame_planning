"""Whole-floor dimensioned plans — BASEMENT + GROUND, EXISTING + PROPOSED.

Reconciled from the 5-agent OCR of the two hand sketches + the surveyor
plan (job 16873). Plans drawn at 1:75, length vertical (front at bottom,
rear/courtyard at top), to match the hand sketches.

Items still to be confirmed by Grahame are drawn with a red (TBC) tag.
"""
from __future__ import annotations
from pathlib import Path
import sys
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Arc, Polygon

sys.path.insert(0, str(Path(__file__).parent))
from sheet import (new_a3_landscape, Scale, World, save_sheet,
                   dim_horizontal, dim_vertical, auto_origin)

WALL = "#333333"
TBC = "#cc1f1f"
FIT = "#3a6e8c"


def _wall_rect(ax, w, x0, y0, x1, y1, t=150):
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(x1 - x0), w.s(y1 - y0),
                           fill=False, ec=WALL, lw=1.4))


def _zone(ax, w, x0, y0, x1, y1, label, sub="", fc="#f7f3ea"):
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(x1 - x0), w.s(y1 - y0),
                           fc=fc, ec=WALL, lw=0.8))
    ax.text(*w.p((x0 + x1) / 2, (y0 + y1) / 2),
            label + (("\n" + sub) if sub else ""),
            fontsize=6.5, ha="center", va="center", weight="bold",
            color="#333")


def _opening(ax, w, x0, y0, x1, y1, label, color=FIT):
    # draw as a coloured gap marker
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(x1 - x0), w.s(y1 - y0),
                           fc="white", ec=color, lw=1.0))
    if label:
        ax.text(*w.p((x0 + x1) / 2, (y0 + y1) / 2), label,
                fontsize=4.5, ha="center", va="center", color=color)


def _fit(ax, w, x0, y0, x1, y1, label, fc="#dbe8f0"):
    ax.add_patch(Rectangle(w.p(x0, y0), w.s(x1 - x0), w.s(y1 - y0),
                           fc=fc, ec=FIT, lw=0.6))
    ax.text(*w.p((x0 + x1) / 2, (y0 + y1) / 2), label,
            fontsize=4.5, ha="center", va="center", color="#234")


def _tbc(ax, x, y, text):
    ax.text(x, y, "TBC: " + text, fontsize=5.5, ha="left", va="top",
            color=TBC, style="italic")


# ============================================================
# GROUND FLOOR
# ============================================================
def ground_floor(proposed: bool):
    W = 4340
    L = 13770
    scale = Scale(75)
    title = ("PROPOSED GROUND FLOOR PLAN" if proposed
             else "EXISTING GROUND FLOOR PLAN")
    fig, ax = new_a3_landscape(
        title=title + " — Flat 1, 20 Hornton Street",
        drawing_no=("GF-P" if proposed else "GF-E"),
        scale=scale,
        show_north_arrow=True, north_rotation_deg=-45)
    ox, oy = auto_origin(W + 2200, L + 1200, scale)
    ox += 1600 * scale.factor
    w = World(ax, scale, origin_sheet_xy=(ox, oy))

    _wall_rect(ax, w, 0, 0, W, L)

    if not proposed:
        # EXISTING — faithfully traced from RES survey job 16873.
        # Demise ~4.34 wide. Communal staircase runs down the RIGHT side
        # OUTSIDE the demise. Lightwells are offset, NOT full-width bands.
        # Front (bottom) -> rear (top):
        #   front lightwell (steps) / front lounge / rear reception /
        #   rear lightwell (LEFT) + kitchen 2.45 (RIGHT)
        FL_LW = 1500       # front lightwell depth
        LOUNGE = 5200
        RECEP = 4400
        REAR = L - (FL_LW + LOUNGE + RECEP)   # rear band depth (~2670)
        y0 = 0
        # Front lightwell
        _zone(ax, w, 0, y0, W, FL_LW, "FRONT LIGHTWELL", "(open, steps down)", fc="#dfeef5")
        ax.add_patch(Rectangle(w.p(400, 300), w.s(1500), w.s(700),
                               fill=False, ec=WALL, lw=0.5))
        ax.text(*w.p(1150, 650), "steps", fontsize=4.5, ha="center", va="center", color="#555")
        y0 += FL_LW
        # Front lounge
        _zone(ax, w, 0, y0, W, y0 + LOUNGE, "FRONT LOUNGE", "ceiling 3.28 m")
        _opening(ax, w, 2600, y0, 3300, y0 + 80, "front door (to hall/stair)")
        y0 += LOUNGE
        # existing opening between lounge and reception
        _opening(ax, w, 1500, y0 - 40, 2600, y0 + 40, "existing opening", color=FIT)
        # Rear reception
        _zone(ax, w, 0, y0, W, y0 + RECEP, "REAR RECEPTION", "ceiling 3.28 m")
        y0 += RECEP
        # Rear band: rear lightwell (left) + kitchen (right)
        _zone(ax, w, 0, y0, 2050, L, "REAR\nLIGHTWELL", "(open)", fc="#dfeef5")
        _zone(ax, w, 2050, y0, W, L, "KITCHEN", "ceiling 2.45 m", fc="#eee7d6")
        _opening(ax, w, 2050, y0 + 900, 2130, y0 + 900 + 660, "kitchen\nwindow", color=FIT)
        # Communal staircase OUTSIDE demise, right side
        ax.add_patch(Rectangle(w.p(W + 80, 6600), w.s(1100), w.s(L - 6600),
                               fc="#ece7da", ec=WALL, lw=0.6, hatch="////"))
        ax.text(*w.p(W + 630, 6600 + (L - 6600)/2), "COMMUNAL\nSTAIR\n(outside\ndemise)",
                fontsize=5, ha="center", va="center", color="#666", rotation=90)
        ax.text(*w.p(W/2, -1100),
                "EXISTING — traced from RES survey job 16873. Demise 4.34 m wide × 13.77 m long. "
                "Communal stair is outside the demise (right). Lightwells front + rear-left; kitchen rear-right.",
                fontsize=5.5, ha="center", va="top", style="italic", color="#555")
    else:
        # PROPOSED (from hand sketch image 19)
        # Front lounge
        _zone(ax, w, 0, 0, W, 5700, "FRONT LOUNGE", "ceiling 3.28 m")
        # Fireplace on left wall
        _fit(ax, w, 0, 2850 - 900, 250, 2850 + 900, "fire\nplace", fc="#e8ddc8")
        ax.text(*w.p(-150, 2850), "1800", fontsize=5, ha="right", va="center", rotation=90, color="#555")
        # Front door bottom
        _opening(ax, w, 2600, 0, 3500, 120, "front door")
        # Open staircase (existing) right strip
        _fit(ax, w, W - 950, 600, W - 80, 5000, "OPEN\nSTAIR\n(exist.)", fc="#e6e0d0")
        ax.text(*w.p(W - 1050, 5200), "35 cm clr", fontsize=4.5, ha="right", color=TBC)

        # Dividing wall + NEW OPENINGS + Crittall door
        ax.plot([w.x(0), w.x(W)], [w.y(5700), w.y(5700)], color=WALL, lw=1.4)
        _opening(ax, w, 700, 5640, 700 + 1245, 5760, "Crittall door 1245w × 2450h", color=TBC)
        ax.text(*w.p(350, 5700), "nib\n700", fontsize=4.5, ha="center", va="center", color="#555")
        ax.text(*w.p(700 + 1245 + (W - 700 - 1245)/2, 5700), "nib\n~600+", fontsize=4.5, ha="center", va="center", color="#555")

        # Rear reception
        _zone(ax, w, 0, 5800, W, 12400, "REAR RECEPTION", "ceiling 3.28 m")
        # Window on left wall
        _opening(ax, w, 0, 8000, 120, 8000 + 2100, "window 2100", color=FIT)
        ax.text(*w.p(-150, 8000 + 1050), "210", fontsize=5, ha="right", va="center", rotation=90, color="#555")
        # left wall segment chain
        for yy, seg in [(5800, "60"), (6400, "143"), (7830, "181"), (9640, "146")]:
            ax.text(*w.p(60, yy + 200), seg, fontsize=4, ha="left", color="#888")

        # Rear zone: spiral access (left) + back door (mid) + wet room (right)
        _zone(ax, w, 0, 12500, 1600, L, "SPIRAL\nACCESS", "new door ↓ to lightwell", fc="#dfeef5")
        # spiral indicated
        ax.add_patch(Circle(w.p(800, 13100), w.s(780), fill=False, ec=TBC, lw=0.6, ls=(0,(3,2))))
        ax.text(*w.p(800, 13100), "spiral\nbelow", fontsize=4.5, ha="center", va="center", color=TBC)
        _opening(ax, w, 1900, L - 120, 2800, L, "back door")
        # wet room (right)
        _zone(ax, w, 2900, 12500, W, L, "SHOWER /\nBATH ROOM", "", fc="#dbe8f0")
        _fit(ax, w, 2950, L - 950, 3550, L - 100, "shower")
        _fit(ax, w, 3600, L - 950, 4000, L - 500, "basin")
        _fit(ax, w, 2950, 12550, 3900, 13050, "bath")
        _fit(ax, w, 3950, 12550, W - 60, 13050, "washer\n1.2m")

        ax.text(*w.p(W/2, -700),
                "PROPOSED layout traced from Grahame's hand sketch (image 19). "
                "Red = to be confirmed. Crittall door, bath + washer (1.2 m), spiral access new.",
                fontsize=6, ha="center", va="top", style="italic", color="#555")

    # overall dimensions
    dim_vertical(ax, w, 0, L, -900, label=f"{L}  (overall length)")
    dim_horizontal(ax, w, 0, W, -500, label=f"{W}  (width)")
    if proposed:
        dim_vertical(ax, w, 0, 5700, W + 500, label="5700\nlounge")
        dim_vertical(ax, w, 5800, 12400, W + 500, label="6700\nreception")
        dim_vertical(ax, w, 12500, L, W + 500, label="~1370\nwet/access")

    out = Path(__file__).resolve().parent.parent / "output"
    base = f"GF_{'proposed' if proposed else 'existing'}_plan"
    pdf, png = save_sheet(fig, base, out)
    print(f"Wrote {pdf}")


# ============================================================
# BASEMENT / LOWER GROUND
# ============================================================
def basement(proposed: bool):
    W = 5700
    L = 19060
    scale = Scale(100)
    title = ("PROPOSED LOWER-GROUND PLAN" if proposed
             else "EXISTING LOWER-GROUND (BASEMENT) PLAN")
    fig, ax = new_a3_landscape(
        title=title + " — Flat 1, 20 Hornton Street",
        drawing_no=("LG-P" if proposed else "LG-E"),
        scale=scale,
        show_north_arrow=True, north_rotation_deg=-45)
    ox, oy = auto_origin(W + 2400, L + 1200, scale)
    ox += 1700 * scale.factor
    w = World(ax, scale, origin_sheet_xy=(ox, oy))

    _wall_rect(ax, w, 0, 0, W, L)

    if not proposed:
        # EXISTING — faithfully traced from RES survey job 16873.
        # Front (bottom) -> rear (top): under-pavement vaults + WC room (1.89),
        # front patio (offset left, steps), room 2.76, bathroom (bath+WC+basin),
        # room 2.76, rear room 2.82, rear patio (left).
        y0 = 0
        # Vaults under pavement + WC room (right)
        _zone(ax, w, 0, y0, 2850, 2000, "VAULT", "h 1.89 m", fc="#e6e0d0")
        _zone(ax, w, 2850, y0, 4400, 2000, "VAULT", "h 1.89 m", fc="#e6e0d0")
        _zone(ax, w, 4400, y0, W, 2200, "WC", "h 1.89 m", fc="#eee7d6")
        ax.annotate("(under\npavement)", xy=w.p(1400, 1000), xytext=(w.x(1400), w.y(1000)),
                    fontsize=4.5, ha="center", va="center", color="#777")
        y0 = 2200
        # Front patio (offset left, steps)
        _zone(ax, w, 0, y0, 3500, y0 + 1800, "FRONT PATIO", "(open, steps)", fc="#dfeef5")
        _zone(ax, w, 3500, y0, W, y0 + 1800, "store", "", fc="#eee7d6")
        y0 += 1800
        # Room 2.76
        _zone(ax, w, 0, y0, W, y0 + 4200, "ROOM", "h 2.76 m")
        y0 += 4200
        # Bathroom (bath + WC + basin), offset left; circulation right
        _zone(ax, w, 0, y0, 3500, y0 + 2500, "BATHROOM", "bath+WC+basin", fc="#dbe8f0")
        _fit(ax, w, 150, y0 + 250, 1100, y0 + 2100, "bath")
        _fit(ax, w, 1300, y0 + 1600, 2000, y0 + 2300, "WC")
        _fit(ax, w, 2100, y0 + 1700, 2900, y0 + 2300, "basin")
        _zone(ax, w, 3500, y0, W, y0 + 2500, "hall", "", fc="#f2eee4")
        y0 += 2500
        # Room 2.76
        _zone(ax, w, 0, y0, W, y0 + 5000, "ROOM", "h 2.76 m")
        y0 += 5000
        # Rear room 2.82 + rear patio (left)
        rear_room_top = min(y0 + 1800, L)
        _zone(ax, w, 0, y0, W, rear_room_top, "REAR ROOM", "h 2.82 m")
        y0 = rear_room_top
        if y0 < L:
            _zone(ax, w, 0, y0, 3250, L, "REAR PATIO /\nLIGHTWELL", "(open)", fc="#dfeef5")
            _zone(ax, w, 3250, y0, W, L, "store", "", fc="#eee7d6")
        ax.text(*w.p(W/2, -1300),
                "EXISTING — traced from RES survey job 16873. 5.70 m wide × 19.06 m long "
                "(incl. under-pavement vaults). Patios front + rear (offset); bathroom mid.",
                fontsize=5.5, ha="center", va="top", style="italic", color="#555")
    else:
        # PROPOSED (hand sketch image 18) — front (bottom) → rear (top)
        # Vaults + toilet + to-tank
        _zone(ax, w, 0, 0, 3150, 2000, "VAULT", "3150 wide", fc="#e6e0d0")
        _zone(ax, w, 3150, 0, W, 2000, "VAULT 2", "~2280 deep", fc="#e6e0d0")
        _fit(ax, w, 200, 200, 1200, 900, "toilet")
        ax.annotate("TO TANK", xy=w.p(0, 1000), xytext=(w.x(0) - 18, w.y(1000)),
                    fontsize=5, color=TBC, ha="right", va="center",
                    arrowprops=dict(arrowstyle="->", color=TBC, lw=0.6))
        # Front room
        _zone(ax, w, 0, 2000, 4400, 6500, "FRONT ROOM", "4500 × 4400", fc="#f7f3ea")
        # Bathroom band with pocket sliding door
        _zone(ax, w, 0, 6500, W, 9500, "BATHROOM BAND", "", fc="#dbe8f0")
        _fit(ax, w, 60, 6600, 2020, 8560, "closet\n1960×1960", fc="#e8ddc8")
        _fit(ax, w, 2100, 6600, 3900, 9450, "WC / centre\n1800×3000")
        _fit(ax, w, 3960, 6600, W - 60, 8800, "WC 2200×2000")
        _opening(ax, w, 2020, 8560, 2820, 8680, "pocket sliding door", color=TBC)
        ax.text(*w.p(W - 200, 9100), "130 cm corridor", fontsize=4.5, ha="right", color="#555")
        # Central hall
        _zone(ax, w, 0, 9500, W, 15600, "CENTRAL HALL", "4.8 m clear / 6.1 m gross", fc="#f7f3ea")
        _tbc(ax, w.x(0) + 4, w.y(12500), "is 4.8 m and 6.1 m\ncumulative or same run?")
        # Wood-terrace lightwell (our courtyard) with spiral + drains
        _zone(ax, w, (W - 3250)/2, 15600, (W - 3250)/2 + 3250, L,
              "WOOD-DECKED LIGHTWELL", "courtyard 3250 × 2950 — OPEN, no roof", fc="#dfeef5")
        cx, cyc = W/2, 15600 + 1475
        ax.add_patch(Circle(w.p(cx, cyc), w.s(875), fill=False, ec=WALL, lw=0.8))
        # spiral treads hint
        import math
        for i in range(15):
            a = math.radians(i * 24)
            ax.plot([w.x(cx), w.x(cx + 800*math.cos(a))],
                    [w.y(cyc), w.y(cyc + 800*math.sin(a))], color=WALL, lw=0.3)
        ax.add_patch(Circle(w.p(cx, cyc), w.s(45), fc="#111", ec="#000"))
        ax.text(*w.p(cx, cyc - 1150), "reclaimed spiral\n(15×200)", fontsize=4.5, ha="center", va="top", color="#333")
        # cupboards rear-right
        _fit(ax, w, (W - 3250)/2 + 3250 + 30, 16000, W - 60, L - 200, "cupboards", fc="#e8ddc8")

        ax.text(*w.p(W/2, -900),
                "PROPOSED layout traced from Grahame's hand sketch (image 18). "
                "Wood-decked lightwell = the courtyard already modelled (spiral + drains, open). Red = TBC.",
                fontsize=6, ha="center", va="top", style="italic", color="#555")

    dim_vertical(ax, w, 0, L, -1000, label=f"{L}  (overall length)")
    dim_horizontal(ax, w, 0, W, -600, label=f"{W}  (width)")

    out = Path(__file__).resolve().parent.parent / "output"
    base = f"LG_{'proposed' if proposed else 'existing'}_plan"
    pdf, png = save_sheet(fig, base, out)
    print(f"Wrote {pdf}")


if __name__ == "__main__":
    ground_floor(False)
    ground_floor(True)
    basement(False)
    basement(True)
