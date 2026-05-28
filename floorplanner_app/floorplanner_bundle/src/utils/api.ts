const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Projects
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (data: { name: string; description?: string }) =>
    request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<any>(`/projects/${id}`, { method: 'DELETE' }),

  // Floor plans
  getFloorPlan: (id: string) => request<any>(`/floorplans/${id}`),
  createFloorPlan: (data: any) =>
    request<any>('/floorplans', { method: 'POST', body: JSON.stringify(data) }),
  updateFloorPlan: (id: string, data: any) =>
    request<any>(`/floorplans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Rooms
  updateRoom: (roomId: string, data: any) =>
    request<any>(`/floorplans/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Upload
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('floorplan', file);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Process floor plan (client-side for now, could be moved to server)
  processFloorPlan: async (imageUrl: string): Promise<any> => {
    // This loads the image and processes it client-side using canvas
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const result = extractWallsFromImage(img);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  },
};

/**
 * Client-side floor plan image processing.
 * Analyzes the image to detect walls (dark lines) and extract room geometry.
 */
function extractWallsFromImage(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Convert to binary (walls = dark pixels)
  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const brightness = (r + g + b) / 3;
    binary[i] = brightness < 128 ? 1 : 0;
  }

  const scale = Math.max(w, h) / 15; // ~15 meters across
  const minWallLen = Math.min(w, h) * 0.04;

  interface Seg {
    x1: number; y1: number; x2: number; y2: number; thickness: number;
  }

  const segments: Seg[] = [];

  // Detect horizontal walls
  for (let y = 0; y < h; y += 2) {
    let runStart = -1;
    for (let x = 0; x <= w; x++) {
      const px = x < w ? binary[y * w + x] : 0;
      if (px === 1 && runStart === -1) runStart = x;
      else if (px === 0 && runStart !== -1) {
        if (x - runStart >= minWallLen) {
          let thick = 1;
          for (let dy = 1; dy < 30 && y + dy < h; dy++) {
            let count = 0;
            for (let sx = runStart; sx < x; sx += 3) {
              if (binary[(y + dy) * w + sx] === 1) count++;
            }
            if (count / ((x - runStart) / 3) > 0.5) thick++;
            else break;
          }
          if (thick >= 2) {
            segments.push({
              x1: runStart / scale,
              y1: (y + thick / 2) / scale,
              x2: x / scale,
              y2: (y + thick / 2) / scale,
              thickness: Math.max(0.1, thick / scale),
            });
          }
        }
        runStart = -1;
      }
    }
  }

  // Detect vertical walls
  for (let x = 0; x < w; x += 2) {
    let runStart = -1;
    for (let y = 0; y <= h; y++) {
      const px = y < h ? binary[y * w + x] : 0;
      if (px === 1 && runStart === -1) runStart = y;
      else if (px === 0 && runStart !== -1) {
        if (y - runStart >= minWallLen) {
          let thick = 1;
          for (let dx = 1; dx < 30 && x + dx < w; dx++) {
            let count = 0;
            for (let sy = runStart; sy < y; sy += 3) {
              if (binary[sy * w + x + dx] === 1) count++;
            }
            if (count / ((y - runStart) / 3) > 0.5) thick++;
            else break;
          }
          if (thick >= 2) {
            segments.push({
              x1: (x + thick / 2) / scale,
              y1: runStart / scale,
              x2: (x + thick / 2) / scale,
              y2: y / scale,
              thickness: Math.max(0.1, thick / scale),
            });
          }
        }
        runStart = -1;
      }
    }
  }

  // Deduplicate
  const deduped = deduplicateSegments(segments);

  // Detect rooms from wall grid
  const hWalls = deduped.filter(s => Math.abs(s.y1 - s.y2) < 0.3);
  const vWalls = deduped.filter(s => Math.abs(s.x1 - s.x2) < 0.3);
  hWalls.sort((a, b) => a.y1 - b.y1);
  vWalls.sort((a, b) => a.x1 - b.x1);

  const totalW = w / scale;
  const totalH = h / scale;
  const rooms: any[] = [];

  if (hWalls.length >= 2 && vWalls.length >= 2) {
    let roomNum = 0;
    for (let hi = 0; hi < hWalls.length - 1; hi++) {
      for (let vi = 0; vi < vWalls.length - 1; vi++) {
        const top = hWalls[hi].y1;
        const bottom = hWalls[hi + 1].y1;
        const left = vWalls[vi].x1;
        const right = vWalls[vi + 1].x1;
        if (right - left > 1.5 && bottom - top > 1.5) {
          roomNum++;
          rooms.push({
            name: `Room ${roomNum}`,
            walls: [
              { x1: left, y1: top, x2: right, y2: top, thickness: 0.15 },
              { x1: right, y1: top, x2: right, y2: bottom, thickness: 0.15 },
              { x1: right, y1: bottom, x2: left, y2: bottom, thickness: 0.15 },
              { x1: left, y1: bottom, x2: left, y2: top, thickness: 0.15 },
            ],
            bounds: { minX: left, minY: top, maxX: right, maxY: bottom },
            center: { x: (left + right) / 2, y: (top + bottom) / 2 },
            ceilingHeight: 2.7,
            wallTexture: 'plaster-white',
            floorTexture: 'hardwood-oak',
            ceilingTexture: 'plaster-white',
          });
        }
      }
    }
  }

  if (rooms.length === 0) {
    rooms.push({
      name: 'Room 1',
      walls: deduped.length > 0 ? deduped.map(s => ({ ...s, height: 2.7 })) : [
        { x1: 1, y1: 1, x2: totalW - 1, y2: 1, thickness: 0.15 },
        { x1: totalW - 1, y1: 1, x2: totalW - 1, y2: totalH - 1, thickness: 0.15 },
        { x1: totalW - 1, y1: totalH - 1, x2: 1, y2: totalH - 1, thickness: 0.15 },
        { x1: 1, y1: totalH - 1, x2: 1, y2: 1, thickness: 0.15 },
      ],
      bounds: { minX: 1, minY: 1, maxX: totalW - 1, maxY: totalH - 1 },
      center: { x: totalW / 2, y: totalH / 2 },
      ceilingHeight: 2.7,
      wallTexture: 'plaster-white',
      floorTexture: 'hardwood-oak',
      ceilingTexture: 'plaster-white',
    });
  }

  return {
    width: w,
    height: h,
    scale,
    rooms,
    wallSegments: deduped,
  };
}

function deduplicateSegments(segs: any[]): any[] {
  const result: any[] = [];
  const used = new Set<number>();
  for (let i = 0; i < segs.length; i++) {
    if (used.has(i)) continue;
    let merged = { ...segs[i] };
    for (let j = i + 1; j < segs.length; j++) {
      if (used.has(j)) continue;
      const a = merged, b = segs[j];
      const isHA = Math.abs(a.y1 - a.y2) < 0.3;
      const isHB = Math.abs(b.y1 - b.y2) < 0.3;
      if (isHA !== isHB) continue;
      if (isHA) {
        if (Math.abs(a.y1 - b.y1) < 0.5 && Math.max(a.x1, b.x1) < Math.min(a.x2, b.x2) + 0.5) {
          merged = { x1: Math.min(a.x1, b.x1), y1: (a.y1 + b.y1) / 2, x2: Math.max(a.x2, b.x2), y2: (a.y2 + b.y2) / 2, thickness: Math.max(a.thickness, b.thickness) };
          used.add(j);
        }
      } else {
        if (Math.abs(a.x1 - b.x1) < 0.5 && Math.max(a.y1, b.y1) < Math.min(a.y2, b.y2) + 0.5) {
          merged = { x1: (a.x1 + b.x1) / 2, y1: Math.min(a.y1, b.y1), x2: (a.x2 + b.x2) / 2, y2: Math.max(a.y2, b.y2), thickness: Math.max(a.thickness, b.thickness) };
          used.add(j);
        }
      }
    }
    result.push(merged);
    used.add(i);
  }
  return result;
}
