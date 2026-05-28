import sharp from 'sharp';
import path from 'path';

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
}

export interface ParsedRoom {
  name: string;
  walls: WallSegment[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  center: { x: number; y: number };
}

export interface ParsedFloorPlan {
  width: number;
  height: number;
  scale: number; // pixels per meter
  rooms: ParsedRoom[];
  wallSegments: WallSegment[];
}

/**
 * Parses a floor plan image to extract wall geometry.
 * Uses edge detection and line tracing to find wall segments.
 * The image is converted to grayscale and thresholded to find dark lines (walls).
 */
export async function parseFloorPlanImage(imagePath: string): Promise<ParsedFloorPlan> {
  const fullPath = path.resolve(imagePath);

  // Load image and get raw pixel data
  const image = sharp(fullPath);
  const metadata = await image.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  // Convert to grayscale raw buffer
  const { data: rawData } = await image
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Threshold to binary (walls are dark pixels)
  const threshold = 128;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < rawData.length; i++) {
    binary[i] = rawData[i] < threshold ? 1 : 0;
  }

  // Find wall segments using horizontal and vertical run detection
  const wallSegments: WallSegment[] = [];
  const minWallLength = Math.min(width, height) * 0.03; // Minimum 3% of image dimension
  const wallThicknessRange = { min: 2, max: Math.max(15, Math.min(width, height) * 0.02) };

  // Scan for horizontal walls
  for (let y = 0; y < height; y++) {
    let runStart = -1;
    for (let x = 0; x <= width; x++) {
      const pixel = x < width ? binary[y * width + x] : 0;
      if (pixel === 1 && runStart === -1) {
        runStart = x;
      } else if (pixel === 0 && runStart !== -1) {
        const runLength = x - runStart;
        if (runLength >= minWallLength) {
          // Check thickness by scanning vertically
          let thickness = 0;
          for (let dy = 0; dy < wallThicknessRange.max && y + dy < height; dy++) {
            let solidCount = 0;
            for (let sx = runStart; sx < x; sx++) {
              if (binary[(y + dy) * width + sx] === 1) solidCount++;
            }
            if (solidCount / runLength > 0.6) {
              thickness++;
            } else {
              break;
            }
          }
          if (thickness >= wallThicknessRange.min) {
            wallSegments.push({
              x1: runStart,
              y1: y + thickness / 2,
              x2: x,
              y2: y + thickness / 2,
              thickness,
            });
            // Skip rows we've already accounted for
          }
        }
        runStart = -1;
      }
    }
  }

  // Scan for vertical walls
  for (let x = 0; x < width; x++) {
    let runStart = -1;
    for (let y = 0; y <= height; y++) {
      const pixel = y < height ? binary[y * width + x] : 0;
      if (pixel === 1 && runStart === -1) {
        runStart = y;
      } else if (pixel === 0 && runStart !== -1) {
        const runLength = y - runStart;
        if (runLength >= minWallLength) {
          let thickness = 0;
          for (let dx = 0; dx < wallThicknessRange.max && x + dx < width; dx++) {
            let solidCount = 0;
            for (let sy = runStart; sy < y; sy++) {
              if (binary[sy * width + x + dx] === 1) solidCount++;
            }
            if (solidCount / runLength > 0.6) {
              thickness++;
            } else {
              break;
            }
          }
          if (thickness >= wallThicknessRange.min) {
            wallSegments.push({
              x1: x + thickness / 2,
              y1: runStart,
              x2: x + thickness / 2,
              y2: y,
              thickness,
            });
          }
        }
        runStart = -1;
      }
    }
  }

  // Deduplicate overlapping wall segments
  const deduped = deduplicateWalls(wallSegments);

  // Estimate scale: assume typical room is ~4m, use average room-sized gap
  const scale = Math.max(width, height) / 15; // Rough: entire plan ≈ 15m across

  // Convert pixel coordinates to meters
  const metrifiedWalls = deduped.map(w => ({
    x1: w.x1 / scale,
    y1: w.y1 / scale,
    x2: w.x2 / scale,
    y2: w.y2 / scale,
    thickness: Math.max(0.1, w.thickness / scale),
  }));

  // Detect rooms as enclosed areas (simplified: find rectangular regions)
  const rooms = detectRooms(metrifiedWalls, width / scale, height / scale);

  return {
    width,
    height,
    scale,
    rooms,
    wallSegments: metrifiedWalls,
  };
}

function deduplicateWalls(walls: WallSegment[]): WallSegment[] {
  const result: WallSegment[] = [];
  const used = new Set<number>();

  for (let i = 0; i < walls.length; i++) {
    if (used.has(i)) continue;
    let merged = { ...walls[i] };

    for (let j = i + 1; j < walls.length; j++) {
      if (used.has(j)) continue;
      if (wallsOverlap(merged, walls[j])) {
        merged = mergeWalls(merged, walls[j]);
        used.add(j);
      }
    }

    result.push(merged);
    used.add(i);
  }

  return result;
}

function wallsOverlap(a: WallSegment, b: WallSegment): boolean {
  const isHorizA = Math.abs(a.y1 - a.y2) < Math.abs(a.x1 - a.x2) * 0.1;
  const isHorizB = Math.abs(b.y1 - b.y2) < Math.abs(b.x1 - b.x2) * 0.1;

  if (isHorizA !== isHorizB) return false;

  if (isHorizA) {
    return Math.abs(a.y1 - b.y1) < (a.thickness + b.thickness) &&
      Math.max(a.x1, b.x1) < Math.min(a.x2, b.x2);
  } else {
    return Math.abs(a.x1 - b.x1) < (a.thickness + b.thickness) &&
      Math.max(a.y1, b.y1) < Math.min(a.y2, b.y2);
  }
}

function mergeWalls(a: WallSegment, b: WallSegment): WallSegment {
  return {
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
    x2: Math.max(a.x2, b.x2),
    y2: Math.max(a.y2, b.y2),
    thickness: Math.max(a.thickness, b.thickness),
  };
}

function detectRooms(walls: WallSegment[], totalWidth: number, totalHeight: number): ParsedRoom[] {
  // Simple room detection: find enclosed rectangular areas from wall intersections
  // For v1, create a default room that encompasses the entire plan if we can't detect individual rooms
  const rooms: ParsedRoom[] = [];

  // Find horizontal and vertical walls
  const hWalls = walls.filter(w => Math.abs(w.y1 - w.y2) < 0.3);
  const vWalls = walls.filter(w => Math.abs(w.x1 - w.x2) < 0.3);

  if (hWalls.length < 2 || vWalls.length < 2) {
    // Fallback: create one room from all walls
    rooms.push({
      name: 'Room 1',
      walls,
      bounds: { minX: 0, minY: 0, maxX: totalWidth, maxY: totalHeight },
      center: { x: totalWidth / 2, y: totalHeight / 2 },
    });
    return rooms;
  }

  // Sort walls by position
  hWalls.sort((a, b) => a.y1 - b.y1);
  vWalls.sort((a, b) => a.x1 - b.x1);

  // Create rooms from grid intersections
  let roomCount = 0;
  for (let hi = 0; hi < hWalls.length - 1; hi++) {
    for (let vi = 0; vi < vWalls.length - 1; vi++) {
      const top = hWalls[hi].y1;
      const bottom = hWalls[hi + 1].y1;
      const left = vWalls[vi].x1;
      const right = vWalls[vi + 1].x1;

      const roomWidth = right - left;
      const roomHeight = bottom - top;

      // Only create room if it's reasonably sized (> 1.5m in each dimension)
      if (roomWidth > 1.5 && roomHeight > 1.5) {
        roomCount++;
        const roomWalls: WallSegment[] = [
          { x1: left, y1: top, x2: right, y2: top, thickness: 0.15 },
          { x1: right, y1: top, x2: right, y2: bottom, thickness: 0.15 },
          { x1: right, y1: bottom, x2: left, y2: bottom, thickness: 0.15 },
          { x1: left, y1: bottom, x2: left, y2: top, thickness: 0.15 },
        ];

        rooms.push({
          name: `Room ${roomCount}`,
          walls: roomWalls,
          bounds: { minX: left, minY: top, maxX: right, maxY: bottom },
          center: { x: (left + right) / 2, y: (top + bottom) / 2 },
        });
      }
    }
  }

  if (rooms.length === 0) {
    rooms.push({
      name: 'Room 1',
      walls,
      bounds: { minX: 0, minY: 0, maxX: totalWidth, maxY: totalHeight },
      center: { x: totalWidth / 2, y: totalHeight / 2 },
    });
  }

  return rooms;
}
