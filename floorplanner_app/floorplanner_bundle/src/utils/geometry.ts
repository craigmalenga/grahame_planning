import type { WallSegment, FurnitureItem } from '../types';
import { getCatalogItem } from './furnitureCatalog';

// ─── ROOM AREA (Shoelace formula for any polygon) ──────

export function calcPolygonArea(walls: WallSegment[]): number {
  if (walls.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < walls.length; i++) {
    const j = (i + 1) % walls.length;
    area += walls[i].x1 * walls[j].y1;
    area -= walls[j].x1 * walls[i].y1;
  }
  return Math.abs(area) / 2;
}

// ─── ALIGNMENT GUIDES ──────────────────────────────────

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  label?: string;
}

export function findAlignmentGuides(
  dragX: number,
  dragY: number,
  walls: WallSegment[],
  furniture: FurnitureItem[],
  roomCenters: { x: number; y: number }[],
  snapThreshold: number = 0.15
): { guides: AlignmentGuide[]; snappedX: number; snappedY: number } {
  const candidates: { type: 'vertical' | 'horizontal'; pos: number; label: string }[] = [];

  // Collect all snap-to positions
  for (const wall of walls) {
    candidates.push({ type: 'vertical', pos: wall.x1, label: 'wall' });
    candidates.push({ type: 'vertical', pos: wall.x2, label: 'wall' });
    candidates.push({ type: 'horizontal', pos: wall.y1, label: 'wall' });
    candidates.push({ type: 'horizontal', pos: wall.y2, label: 'wall' });
  }

  for (const f of furniture) {
    const cat = getCatalogItem(f.type);
    candidates.push({ type: 'vertical', pos: f.x, label: cat.name });
    candidates.push({ type: 'horizontal', pos: f.y, label: cat.name });
  }

  for (const c of roomCenters) {
    candidates.push({ type: 'vertical', pos: c.x, label: 'center' });
    candidates.push({ type: 'horizontal', pos: c.y, label: 'center' });
  }

  const guides: AlignmentGuide[] = [];
  let snappedX = dragX;
  let snappedY = dragY;
  let bestDx = snapThreshold;
  let bestDy = snapThreshold;

  for (const c of candidates) {
    if (c.type === 'vertical') {
      const dx = Math.abs(dragX - c.pos);
      if (dx < bestDx) {
        bestDx = dx;
        snappedX = c.pos;
      }
    } else {
      const dy = Math.abs(dragY - c.pos);
      if (dy < bestDy) {
        bestDy = dy;
        snappedY = c.pos;
      }
    }
  }

  // Only emit guides if we actually snapped
  if (bestDx < snapThreshold) {
    guides.push({ type: 'vertical', position: snappedX });
  }
  if (bestDy < snapThreshold) {
    guides.push({ type: 'horizontal', position: snappedY });
  }

  return { guides, snappedX, snappedY };
}

// ─── WALL LENGTH ────────────────────────────────────────

export function wallLength(wall: WallSegment): number {
  return Math.sqrt((wall.x2 - wall.x1) ** 2 + (wall.y2 - wall.y1) ** 2);
}
