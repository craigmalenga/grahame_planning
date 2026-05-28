import { useRef, useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FURNITURE_CATALOG, FURNITURE_CATEGORIES, getCatalogItem } from '../utils/furnitureCatalog';
import { calcPolygonArea, findAlignmentGuides } from '../utils/geometry';
import { saveProject as saveProjectToStorage } from '../utils/projectStorage';
import type { DoorData, DoorStyle, WindowData, FurnitureType } from '../types';

const GRID_SIZE = 40;
const SNAP = 0.25; // snap to 0.25m grid
const COLORS = {
  wall: '#374151', wallSelected: '#4c6ef5', floor: '#f3f4f6', floorSelected: '#EEF2FF',
  door: '#D97706', doorSelected: '#F59E0B', window: '#3B82F6', windowSelected: '#60A5FA',
  grid: '#e5e7eb', gridMajor: '#d1d5db', text: '#6b7280', roomLabel: '#1f2937',
  furniture: '#10B981', furnitureSelected: '#34D399',
  drawPreview: 'rgba(76, 110, 245, 0.15)', drawBorder: '#4c6ef5',
  handle: '#EF4444', handleHover: '#F87171',
};

type DesignTool = 'select' | 'room' | 'wall' | 'door' | 'window' | 'furniture' | 'wall-split';

export function DesignMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    floorPlan, selectedRoomIndex, setSelectedRoomIndex,
    addRoom, removeRoom, updateRoomBounds,
    addDoor, addWindow,
    addFurniture,
    selectedDoorId, setSelectedDoorId,
    selectedWindowId, setSelectedWindowId,
    selectedFurnitureId, setSelectedFurnitureId,
    setViewMode, updateWallVertex,
    undo, redo, canUndo, canRedo, duplicateRoom,
    selectedWallIndex, setSelectedWallIndex,
    // multi-floor
    floors, activeFloorIndex, addFloor, duplicateActiveFloor, setActiveFloor,
    renameFloor, setFloorHeight, removeFloor,
    // free walls
    defaultWallThickness, setDefaultWallThickness, addFreeWall, updateFreeWall, removeFreeWall,
    selectedFreeWallIndex, setSelectedFreeWallIndex,
  } = useStore();

  const [offset, setOffset] = useState({ x: 120, y: 120 });
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<DesignTool>('select');
  const [furnitureToPlace, setFurnitureToPlace] = useState<FurnitureType | null>(null);

  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 });
  // Reset transient drawing state when the active floor changes (store
  // can't touch component-local state) so no phantom preview carries over.
  useEffect(() => { setIsDrawing(false); }, [activeFloorIndex]);
  const [dragHandle, setDragHandle] = useState<{ roomIndex: number; handle: string } | null>(null);
  const [dragFurniture, setDragFurniture] = useState<{ roomIndex: number; itemId: string } | null>(null);
  const [dragDoor, setDragDoor] = useState<{ roomIndex: number; doorId: string; wallIndex: number } | null>(null);
  const [dragWindow, setDragWindow] = useState<{ roomIndex: number; winId: string; wallIndex: number } | null>(null);
  const [dragWallVertex, setDragWallVertex] = useState<{ roomIndex: number; wallIndex: number; vertex: 'start' | 'end' } | null>(null);
  const [alignGuides, setAlignGuides] = useState<{ type: 'vertical' | 'horizontal'; position: number }[]>([]);

  const scale = GRID_SIZE * zoom;

  const snap = (v: number) => Math.round(v / SNAP) * SNAP;
  const worldToScreen = (wx: number, wy: number) => ({ x: wx * scale + offset.x, y: wy * scale + offset.y });
  const screenToWorld = (sx: number, sy: number) => ({ x: (sx - offset.x) / scale, y: (sy - offset.y) / scale });

  // ─── AUTO-CENTER on floor plan load ─────────────────
  const hasAutocentered = useRef(false);
  useEffect(() => {
    if (!floorPlan || floorPlan.rooms.length === 0 || !containerRef.current) {
      hasAutocentered.current = false;
      return;
    }
    if (hasAutocentered.current) return;
    hasAutocentered.current = true;

    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const allBounds = floorPlan.rooms.map(r => r.bounds);
    const minX = Math.min(...allBounds.map(b => b.minX));
    const minY = Math.min(...allBounds.map(b => b.minY));
    const maxX = Math.max(...allBounds.map(b => b.maxX));
    const maxY = Math.max(...allBounds.map(b => b.maxY));

    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const padding = 80;
    const fitZoom = Math.min(
      (cw - padding * 2) / (worldW * GRID_SIZE),
      (ch - padding * 2) / (worldH * GRID_SIZE),
      3
    );
    const newScale = GRID_SIZE * fitZoom;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    setZoom(fitZoom);
    setOffset({
      x: cw / 2 - cx * newScale,
      y: ch / 2 - cy * newScale,
    });
  }, [floorPlan]);

  // ─── DRAWING ──────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !floorPlan) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Grid
    const gridSpacing = scale;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = offset.x % gridSpacing; x < w; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = offset.y % gridSpacing; y < h; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Major grid
    ctx.strokeStyle = COLORS.gridMajor;
    ctx.lineWidth = 1;
    const major = scale * 5;
    for (let x = offset.x % major; x < w; x += major) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = offset.y % major; y < h; y += major) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Rooms
    floorPlan.rooms.forEach((room, ri) => {
      const isSel = selectedRoomIndex === ri;
      const { minX, minY, maxX, maxY } = room.bounds;
      const tl = worldToScreen(minX, minY);
      const sw = (maxX - minX) * scale;
      const sh = (maxY - minY) * scale;

      // Floor fill
      ctx.fillStyle = isSel ? COLORS.floorSelected : COLORS.floor;
      ctx.fillRect(tl.x, tl.y, sw, sh);

      // Walls (with sub-segment support)
      room.walls.forEach((wall, wi) => {
        const p1 = worldToScreen(wall.x1, wall.y1);
        const p2 = worldToScreen(wall.x2, wall.y2);

        if (wall.subSegments && wall.subSegments.length > 0) {
          // Render each sub-segment independently
          for (const seg of wall.subSegments) {
            const sx1 = wall.x1 + (wall.x2 - wall.x1) * seg.startFraction;
            const sy1 = wall.y1 + (wall.y2 - wall.y1) * seg.startFraction;
            const sx2 = wall.x1 + (wall.x2 - wall.x1) * seg.endFraction;
            const sy2 = wall.y1 + (wall.y2 - wall.y1) * seg.endFraction;
            const sp1 = worldToScreen(sx1, sy1);
            const sp2 = worldToScreen(sx2, sy2);

            if (seg.isGap) {
              // Gap: dashed light line
              ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)';
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(sp1.x, sp1.y); ctx.lineTo(sp2.x, sp2.y); ctx.stroke();
              ctx.setLineDash([]);
              // Gap label
              if (zoom > 0.4) {
                const mid = worldToScreen((sx1 + sx2) / 2, (sy1 + sy2) / 2);
                ctx.fillStyle = '#999';
                ctx.font = `${Math.max(8, 9 * zoom)}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('GAP', mid.x, mid.y - 6);
              }
            } else {
              // Solid wall segment
              ctx.strokeStyle = isSel ? COLORS.wallSelected : COLORS.wall;
              ctx.lineWidth = Math.max(3, wall.thickness * scale);
              ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(sp1.x, sp1.y); ctx.lineTo(sp2.x, sp2.y); ctx.stroke();
            }
          }
        } else {
          // Normal single wall
          ctx.strokeStyle = isSel ? COLORS.wallSelected : COLORS.wall;
          ctx.lineWidth = Math.max(3, wall.thickness * scale);
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }

        // Doors on this wall
        const wAngle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
        const wLen = Math.sqrt((wall.x2 - wall.x1) ** 2 + (wall.y2 - wall.y1) ** 2);

        (room.doors || []).filter(d => d.wallIndex === wi).forEach(door => {
          const dx = wall.x1 + (wall.x2 - wall.x1) * door.position;
          const dy = wall.y1 + (wall.y2 - wall.y1) * door.position;
          const p = worldToScreen(dx, dy);
          const halfW = (door.width / 2) * scale;
          const isSD = selectedDoorId === door.id;
          const doorColor = isSD ? COLORS.doorSelected : COLORS.door;

          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(wAngle);
          // Gap in wall — clear the wall line
          ctx.strokeStyle = isSel ? COLORS.floorSelected : COLORS.floor;
          ctx.lineWidth = Math.max(8, wall.thickness * scale + 4);
          ctx.beginPath(); ctx.moveTo(-halfW, 0); ctx.lineTo(halfW, 0); ctx.stroke();

          // Door opening arc — large and visible
          const arcRadius = door.width * scale * 0.5;
          ctx.strokeStyle = doorColor;
          ctx.lineWidth = Math.max(2, 2.5 * zoom);
          ctx.setLineDash([4, 3]);
          ctx.beginPath(); ctx.arc(-halfW, 0, arcRadius, -Math.PI / 2, 0); ctx.stroke();
          ctx.setLineDash([]);

          // Swing line
          ctx.beginPath(); ctx.moveTo(-halfW, 0); ctx.lineTo(-halfW, -arcRadius); ctx.stroke();

          // Door panel — thick colored bar
          ctx.fillStyle = doorColor;
          ctx.globalAlpha = isSD ? 1.0 : 0.85;
          ctx.fillRect(-halfW, -Math.max(3, 3 * zoom), door.width * scale, Math.max(6, 6 * zoom));
          ctx.globalAlpha = 1.0;

          // Door end markers
          ctx.fillStyle = doorColor;
          ctx.beginPath(); ctx.arc(-halfW, 0, Math.max(3, 3 * zoom), 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(halfW, 0, Math.max(3, 3 * zoom), 0, Math.PI * 2); ctx.fill();

          // Label
          if (zoom > 0.5) {
            ctx.fillStyle = doorColor;
            ctx.font = `bold ${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`D ${door.width.toFixed(1)}m`, 0, Math.max(12, 14 * zoom));
          }

          // Selection ring
          if (isSD) {
            ctx.strokeStyle = COLORS.doorSelected;
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, halfW + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.restore();
        });

        // Windows on this wall — triple-line with fill
        (room.windows || []).filter(wn => wn.wallIndex === wi).forEach(win => {
          const wx = wall.x1 + (wall.x2 - wall.x1) * win.position;
          const wy = wall.y1 + (wall.y2 - wall.y1) * win.position;
          const p = worldToScreen(wx, wy);
          const halfW = (win.width / 2) * scale;
          const isSW = selectedWindowId === win.id;
          const winColor = isSW ? COLORS.windowSelected : COLORS.window;
          const barH = Math.max(4, 5 * zoom);

          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(wAngle);
          // Clear wall behind window
          ctx.strokeStyle = isSel ? COLORS.floorSelected : COLORS.floor;
          ctx.lineWidth = Math.max(8, wall.thickness * scale + 4);
          ctx.beginPath(); ctx.moveTo(-halfW, 0); ctx.lineTo(halfW, 0); ctx.stroke();

          // Window fill — light blue
          ctx.fillStyle = isSW ? '#BFDBFE' : '#DBEAFE';
          ctx.fillRect(-halfW, -barH, win.width * scale, barH * 2);

          // Window frame lines
          ctx.strokeStyle = winColor;
          ctx.lineWidth = Math.max(2, 2 * zoom);
          ctx.strokeRect(-halfW, -barH, win.width * scale, barH * 2);

          // Cross bars
          ctx.beginPath();
          ctx.moveTo(0, -barH); ctx.lineTo(0, barH);
          ctx.moveTo(-halfW, 0); ctx.lineTo(halfW, 0);
          ctx.stroke();

          // End markers
          ctx.fillStyle = winColor;
          ctx.beginPath(); ctx.arc(-halfW, 0, Math.max(3, 3 * zoom), 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(halfW, 0, Math.max(3, 3 * zoom), 0, Math.PI * 2); ctx.fill();

          // Label
          if (zoom > 0.5) {
            ctx.fillStyle = winColor;
            ctx.font = `bold ${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`W ${win.width.toFixed(1)}m`, 0, barH + Math.max(11, 13 * zoom));
          }

          // Selection ring
          if (isSW) {
            ctx.strokeStyle = COLORS.windowSelected;
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, halfW + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.restore();
        });
      });

      // Furniture
      (room.furniture || []).forEach(item => {
        const catalog = getCatalogItem(item.type);
        const fw = catalog.defaultWidth * item.scaleX;
        const fd = catalog.defaultDepth * item.scaleY;
        const center = worldToScreen(item.x, item.y);
        const isSF = selectedFurnitureId === item.id;

        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(item.rotation);

        const pw = fw * scale;
        const pd = fd * scale;

        ctx.fillStyle = isSF ? COLORS.furnitureSelected + '40' : COLORS.furniture + '25';
        ctx.strokeStyle = isSF ? COLORS.furnitureSelected : COLORS.furniture;
        ctx.lineWidth = 1.5;
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        ctx.fillStyle = isSF ? COLORS.furnitureSelected : COLORS.furniture;
        ctx.font = `${Math.max(8, 10 * zoom)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(catalog.icon, 0, 0);

        ctx.restore();
      });

      // Room label with area
      const area = calcPolygonArea(room.walls);
      ctx.fillStyle = COLORS.roomLabel;
      ctx.font = `bold ${Math.max(11, 13 * zoom)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cx = tl.x + sw / 2, cy = tl.y + sh / 2;
      ctx.fillText(room.name, cx, cy - 12 * zoom);
      ctx.fillStyle = COLORS.text;
      ctx.font = `${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
      ctx.fillText(`${(maxX - minX).toFixed(1)}m x ${(maxY - minY).toFixed(1)}m`, cx, cy + 4 * zoom);
      ctx.fillStyle = '#4c6ef5';
      ctx.font = `bold ${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
      ctx.fillText(`${area.toFixed(1)} m²`, cx, cy + 18 * zoom);

      // Wall measurements (always show for selected room)
      if (isSel) {
        room.walls.forEach((wall) => {
          const len = Math.sqrt((wall.x2 - wall.x1) ** 2 + (wall.y2 - wall.y1) ** 2);
          if (len < 0.3) return;
          const midX = (wall.x1 + wall.x2) / 2;
          const midY = (wall.y1 + wall.y2) / 2;
          const mp = worldToScreen(midX, midY);
          const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
          // Offset label perpendicular to wall
          const nx = -Math.sin(angle) * 14;
          const ny = Math.cos(angle) * 14;

          ctx.fillStyle = '#4c6ef5';
          ctx.font = `bold ${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Background pill
          const label = `${len.toFixed(2)}m`;
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(mp.x + nx - tw / 2 - 3, mp.y + ny - 7, tw + 6, 14);
          ctx.fillStyle = '#4c6ef5';
          ctx.fillText(label, mp.x + nx, mp.y + ny);
        });
      }

      // Wall vertex handles (selected room) — drag to create diagonal walls
      if (isSel && tool === 'select') {
        room.walls.forEach((wall, wi) => {
          const p1 = worldToScreen(wall.x1, wall.y1);
          // Orange circles at each wall vertex
          ctx.fillStyle = '#F97316';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });
      }
    });

    // ─── FREE-STANDING ANGLED WALLS ───────────────────────
    (floorPlan.wallSegments ?? []).forEach((seg, si) => {
      const a = worldToScreen(seg.x1, seg.y1);
      const b = worldToScreen(seg.x2, seg.y2);
      const sel = si === selectedFreeWallIndex;
      const thpx = Math.max(3, (seg.thickness || 0.1) * scale);
      ctx.strokeStyle = sel ? '#2563EB' : '#374151';
      ctx.lineWidth = thpx;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // endpoints
      ctx.fillStyle = sel ? '#2563EB' : '#6B7280';
      [a, b].forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
      // length label in cm at midpoint
      const lenM = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
      const mid = worldToScreen((seg.x1 + seg.x2) / 2, (seg.y1 + seg.y2) / 2);
      ctx.fillStyle = sel ? '#1D4ED8' : '#111827';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(lenM * 100)} cm`, mid.x, mid.y - thpx / 2 - 4);
    });
    ctx.lineCap = 'butt';

    // Live preview while drawing a wall — length cm + angle
    if (isDrawing && tool === 'wall') {
      const a = worldToScreen(drawStart.x, drawStart.y);
      const b = worldToScreen(drawEnd.x, drawEnd.y);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = Math.max(3, defaultWallThickness * scale);
      ctx.lineCap = 'round';
      ctx.setLineDash([8, 5]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineCap = 'butt';
      const dx = drawEnd.x - drawStart.x, dy = drawEnd.y - drawStart.y;
      const lenCm = Math.round(Math.hypot(dx, dy) * 100);
      let deg = Math.atan2(-dy, dx) * 180 / Math.PI; // screen y is down
      if (deg < 0) deg += 360;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      const label = `${lenCm} cm  ∠${deg.toFixed(0)}°`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(mid.x + 8, mid.y - 22, tw + 10, 18);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillText(label, mid.x + 13, mid.y - 9);
    }

    // Draw preview (room creation)
    if (isDrawing && tool === 'room') {
      const s1 = worldToScreen(Math.min(drawStart.x, drawEnd.x), Math.min(drawStart.y, drawEnd.y));
      const s2 = worldToScreen(Math.max(drawStart.x, drawEnd.x), Math.max(drawStart.y, drawEnd.y));
      ctx.fillStyle = COLORS.drawPreview;
      ctx.strokeStyle = COLORS.drawBorder;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.fillRect(s1.x, s1.y, s2.x - s1.x, s2.y - s1.y);
      ctx.strokeRect(s1.x, s1.y, s2.x - s1.x, s2.y - s1.y);
      ctx.setLineDash([]);

      // Dimension labels
      const dw = Math.abs(drawEnd.x - drawStart.x).toFixed(1);
      const dh = Math.abs(drawEnd.y - drawStart.y).toFixed(1);
      ctx.fillStyle = COLORS.drawBorder;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${dw}m x ${dh}m`, (s1.x + s2.x) / 2, (s1.y + s2.y) / 2);
    }

    // Scale
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, 10, h - 10);

    // Alignment guides
    if (alignGuides.length > 0 && (dragFurniture || dragWallVertex)) {
      ctx.strokeStyle = '#4c6ef5';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.6;
      for (const guide of alignGuides) {
        if (guide.type === 'vertical') {
          const sx = worldToScreen(guide.position, 0).x;
          ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
        } else {
          const sy = worldToScreen(0, guide.position).y;
          ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }

    // Property summary in bottom-right
    if (floorPlan.rooms.length > 0) {
      const totalArea = floorPlan.rooms.reduce((s, r) => s + calcPolygonArea(r.walls), 0);
      const totalDoors = floorPlan.rooms.reduce((s, r) => s + (r.doors?.length ?? 0), 0);
      const totalWindows = floorPlan.rooms.reduce((s, r) => s + (r.windows?.length ?? 0), 0);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${floorPlan.rooms.length} rooms | ${totalArea.toFixed(0)} m² | ${totalDoors} doors | ${totalWindows} windows`, w - 10, h - 10);
    }
  }, [floorPlan, selectedRoomIndex, offset, zoom, scale, selectedDoorId, selectedWindowId, selectedFurnitureId, isDrawing, drawStart, drawEnd, tool, alignGuides, dragFurniture, dragWallVertex, selectedFreeWallIndex, defaultWallThickness]);

  // Canvas resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setTool('select'); setFurnitureToPlace(null); setIsDrawing(false); }

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const { floorPlan: fp, sceneConfig: sc, customTextures: ct, setSavedProjectId } = useStore.getState();
        if (fp) {
          const id = saveProjectToStorage({
            version: '1.0', name: fp.name || 'Untitled',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            floorPlan: fp, sceneConfig: sc, customTextures: ct,
          });
          setSavedProjectId(id);
        }
        return;
      }
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedRoomIndex !== null) duplicateRoom(selectedRoomIndex);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedRoomIndex !== null && floorPlan) {
          if (selectedFurnitureId) {
            const { removeFurniture } = useStore.getState();
            removeFurniture(selectedRoomIndex, selectedFurnitureId);
          } else if (selectedDoorId) {
            const { removeDoor } = useStore.getState();
            removeDoor(selectedRoomIndex, selectedDoorId);
          } else if (selectedWindowId) {
            const { removeWindow } = useStore.getState();
            removeWindow(selectedRoomIndex, selectedWindowId);
          }
        }
      }
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        if (selectedFurnitureId && selectedRoomIndex !== null) {
          const { updateFurniture } = useStore.getState();
          const room = floorPlan?.rooms[selectedRoomIndex];
          const item = room?.furniture.find(f => f.id === selectedFurnitureId);
          if (item) updateFurniture(selectedRoomIndex, selectedFurnitureId, { rotation: item.rotation + Math.PI / 4 });
        }
      }
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) { setTool('wall'); setIsDrawing(false); }
      // Delete a selected free wall
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFreeWallIndex !== null) {
        removeFreeWall(selectedFreeWallIndex);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [floorPlan, selectedRoomIndex, selectedFurnitureId, selectedDoorId, selectedWindowId, selectedFreeWallIndex]);

  // Handle positions for room resize
  function getHandlePositions(bounds: { minX: number; minY: number; maxX: number; maxY: number }) {
    const { minX, minY, maxX, maxY } = bounds;
    const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    return [
      { x: minX, y: minY, handle: 'nw' }, { x: mx, y: minY, handle: 'n' }, { x: maxX, y: minY, handle: 'ne' },
      { x: minX, y: my, handle: 'w' }, { x: maxX, y: my, handle: 'e' },
      { x: minX, y: maxY, handle: 'sw' }, { x: mx, y: maxY, handle: 's' }, { x: maxX, y: maxY, handle: 'se' },
    ];
  }

  function hitTestHandle(wx: number, wy: number) {
    if (selectedRoomIndex === null || !floorPlan) return null;
    const room = floorPlan.rooms[selectedRoomIndex];
    const handles = getHandlePositions(room.bounds);
    const threshold = 0.3;
    for (const h of handles) {
      if (Math.abs(wx - h.x) < threshold && Math.abs(wy - h.y) < threshold) {
        return { roomIndex: selectedRoomIndex, handle: h.handle };
      }
    }
    return null;
  }

  function hitTestWallVertex(wx: number, wy: number) {
    if (selectedRoomIndex === null || !floorPlan) return null;
    const room = floorPlan.rooms[selectedRoomIndex];
    const threshold = Math.max(0.3, 0.6 / zoom);
    for (let wi = 0; wi < room.walls.length; wi++) {
      const wall = room.walls[wi];
      if (Math.abs(wx - wall.x1) < threshold && Math.abs(wy - wall.y1) < threshold) {
        return { roomIndex: selectedRoomIndex, wallIndex: wi, vertex: 'start' as const };
      }
    }
    return null;
  }

  function hitTestFurniture(wx: number, wy: number) {
    if (!floorPlan) return null;
    for (let ri = floorPlan.rooms.length - 1; ri >= 0; ri--) {
      const room = floorPlan.rooms[ri];
      for (let fi = room.furniture.length - 1; fi >= 0; fi--) {
        const item = room.furniture[fi];
        const catalog = getCatalogItem(item.type);
        const fw = catalog.defaultWidth * item.scaleX / 2;
        const fd = catalog.defaultDepth * item.scaleY / 2;
        // Simple AABB (ignoring rotation for hit test)
        const maxR = Math.max(fw, fd);
        if (Math.abs(wx - item.x) < maxR && Math.abs(wy - item.y) < maxR) {
          return { roomIndex: ri, itemId: item.id };
        }
      }
    }
    return null;
  }

  // Nearest free-standing wall to a world point (within ~0.25 m). Returns index or null.
  function findNearestFreeWall(wx: number, wy: number): number | null {
    if (!floorPlan?.wallSegments?.length) return null;
    let bestIdx: number | null = null;
    let bestDist = 12 / scale; // ~12 px tolerance, zoom-independent
    floorPlan.wallSegments.forEach((s, i) => {
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return;
      let t = ((wx - s.x1) * dx + (wy - s.y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = s.x1 + t * dx, py = s.y1 + t * dy;
      const d = Math.hypot(wx - px, wy - py);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return bestIdx;
  }

  function findNearestWall(wx: number, wy: number) {
    if (!floorPlan) return null;
    let best: { roomIndex: number; wallIndex: number; position: number; dist: number } | null = null;
    floorPlan.rooms.forEach((room, ri) => {
      room.walls.forEach((wall, wi) => {
        const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;
        const t = Math.max(0, Math.min(1, ((wx - wall.x1) * dx + (wy - wall.y1) * dy) / (len * len)));
        const px = wall.x1 + t * dx, py = wall.y1 + t * dy;
        const dist = Math.sqrt((wx - px) ** 2 + (wy - py) ** 2);
        if (!best || dist < best.dist) best = { roomIndex: ri, wallIndex: wi, position: t, dist };
      });
    });
    // Scale threshold inversely with zoom so it's easier to click walls when zoomed out
    const threshold = Math.max(0.8, 2.0 / zoom);
    return best && best.dist < threshold ? best : null;
  }

  // ─── MOUSE HANDLERS ──────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy);

    // Pan with middle or alt+click
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    if (tool === 'room') {
      setIsDrawing(true);
      const snapped = { x: snap(world.x), y: snap(world.y) };
      setDrawStart(snapped);
      setDrawEnd(snapped);
      return;
    }

    if (tool === 'wall') {
      // Click-to-place polyline: 1st click sets the anchor, each subsequent
      // click commits a wall from the anchor to the click and re-anchors
      // there (true chaining). Shift = 45-deg lock. Double-click / ESC ends.
      const lockShift = e.shiftKey && isDrawing;
      let p = { x: snap(world.x), y: snap(world.y) };
      if (lockShift) {
        const dx = world.x - drawStart.x, dy = world.y - drawStart.y;
        const step = Math.PI / 4;
        const ang = Math.round(Math.atan2(dy, dx) / step) * step;
        const len = Math.hypot(dx, dy);
        p = { x: drawStart.x + Math.cos(ang) * len, y: drawStart.y + Math.sin(ang) * len };
      }
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawStart(p);
        setDrawEnd(p);
      } else if (Math.hypot(p.x - drawStart.x, p.y - drawStart.y) > 0.05) {
        addFreeWall(drawStart.x, drawStart.y, p.x, p.y, defaultWallThickness);
        setDrawStart(p);
        setDrawEnd(p);
      }
      return;
    }

    if (tool === 'door' || tool === 'window') {
      const hit = findNearestWall(world.x, world.y);
      if (hit) {
        const pos = Math.max(0.15, Math.min(0.85, hit.position));
        if (tool === 'door') {
          addDoor(hit.roomIndex, { wallIndex: hit.wallIndex, position: pos, width: 0.9, height: 2.1, type: 'single', openDirection: 'inward' });
        } else {
          addWindow(hit.roomIndex, { wallIndex: hit.wallIndex, position: pos, width: 1.2, height: 1.0, sillHeight: 0.9, type: 'double' });
        }
        setSelectedRoomIndex(hit.roomIndex);
        setTool('select');
      }
      return;
    }

    if (tool === 'wall-split') {
      const hit = findNearestWall(world.x, world.y);
      if (hit) {
        const { splitWall } = useStore.getState();
        splitWall(hit.roomIndex, hit.wallIndex, hit.position);
        setSelectedRoomIndex(hit.roomIndex);
      }
      return;
    }

    if (tool === 'furniture' && furnitureToPlace) {
      // Find which room the click is in
      if (floorPlan) {
        for (let i = 0; i < floorPlan.rooms.length; i++) {
          const r = floorPlan.rooms[i];
          if (world.x >= r.bounds.minX && world.x <= r.bounds.maxX &&
              world.y >= r.bounds.minY && world.y <= r.bounds.maxY) {
            addFurniture(i, furnitureToPlace, snap(world.x), snap(world.y));
            setSelectedRoomIndex(i);
            setTool('select');
            setFurnitureToPlace(null);
            return;
          }
        }
      }
      return;
    }

    // Select tool
    // Check wall vertex handles first (for diagonal walls)
    const vertexHit = hitTestWallVertex(world.x, world.y);
    if (vertexHit) {
      setDragWallVertex(vertexHit);
      return;
    }

    // Check resize handles
    const handleHit = hitTestHandle(world.x, world.y);
    if (handleHit) {
      setDragHandle(handleHit);
      return;
    }

    // Free-standing wall selection — AFTER room vertex/handle tests so an
    // overlapping free wall can't block selecting a room's handles.
    const fwHit = findNearestFreeWall(world.x, world.y);
    if (fwHit != null) {
      setSelectedFreeWallIndex(fwHit);
      setSelectedRoomIndex(null);
      return;
    } else if (selectedFreeWallIndex !== null) {
      setSelectedFreeWallIndex(null);
    }

    // Check doors/windows first (click near a door/window to select it and start drag)
    const hitThreshold = Math.max(0.5, 1.5 / zoom);
    if (floorPlan) {
      for (let ri = 0; ri < floorPlan.rooms.length; ri++) {
        const room = floorPlan.rooms[ri];
        for (const d of room.doors) {
          const wall = room.walls[d.wallIndex];
          if (!wall) continue;
          const dx = wall.x1 + (wall.x2 - wall.x1) * d.position;
          const dy = wall.y1 + (wall.y2 - wall.y1) * d.position;
          if (Math.abs(world.x - dx) < hitThreshold && Math.abs(world.y - dy) < hitThreshold) {
            setSelectedRoomIndex(ri);
            setSelectedDoorId(d.id);
            setSelectedWindowId(null);
            setSelectedFurnitureId(null);
            setDragDoor({ roomIndex: ri, doorId: d.id, wallIndex: d.wallIndex });
            return;
          }
        }
        for (const w of room.windows) {
          const wall = room.walls[w.wallIndex];
          if (!wall) continue;
          const wx = wall.x1 + (wall.x2 - wall.x1) * w.position;
          const wy = wall.y1 + (wall.y2 - wall.y1) * w.position;
          if (Math.abs(world.x - wx) < hitThreshold && Math.abs(world.y - wy) < hitThreshold) {
            setSelectedRoomIndex(ri);
            setSelectedWindowId(w.id);
            setSelectedDoorId(null);
            setSelectedFurnitureId(null);
            setDragWindow({ roomIndex: ri, winId: w.id, wallIndex: w.wallIndex });
            return;
          }
        }
      }
    }

    // Check furniture
    const furnHit = hitTestFurniture(world.x, world.y);
    if (furnHit) {
      setSelectedRoomIndex(furnHit.roomIndex);
      setSelectedFurnitureId(furnHit.itemId);
      setSelectedDoorId(null);
      setSelectedWindowId(null);
      setDragFurniture(furnHit);
      return;
    }

    // Check rooms
    if (floorPlan) {
      let found = false;
      for (let i = floorPlan.rooms.length - 1; i >= 0; i--) {
        const r = floorPlan.rooms[i];
        if (world.x >= r.bounds.minX && world.x <= r.bounds.maxX &&
            world.y >= r.bounds.minY && world.y <= r.bounds.maxY) {
          setSelectedRoomIndex(i);
          setSelectedDoorId(null);
          setSelectedWindowId(null);
          setSelectedFurnitureId(null);
          found = true;
          break;
        }
      }
      if (!found) {
        setSelectedRoomIndex(null);
        setSelectedDoorId(null);
        setSelectedWindowId(null);
        setSelectedFurnitureId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    if (isDrawing && tool === 'room') {
      setDrawEnd({ x: snap(world.x), y: snap(world.y) });
      return;
    }

    if (isDrawing && tool === 'wall') {
      // Free angle. Shift = ortho-lock to 0/45/90 deg from the start point.
      let p = { x: world.x, y: world.y };
      if (e.shiftKey) {
        const dx = world.x - drawStart.x, dy = world.y - drawStart.y;
        const ang = Math.atan2(dy, dx);
        const step = Math.PI / 4; // 45-degree magnets
        const snapAng = Math.round(ang / step) * step;
        const len = Math.hypot(dx, dy);
        p = { x: drawStart.x + Math.cos(snapAng) * len, y: drawStart.y + Math.sin(snapAng) * len };
      } else {
        p = { x: snap(world.x), y: snap(world.y) };
      }
      setDrawEnd(p);
      return;
    }

    if (dragHandle && selectedRoomIndex !== null && floorPlan) {
      const room = floorPlan.rooms[selectedRoomIndex];
      let { minX, minY, maxX, maxY } = room.bounds;
      const sw = snap(world.x), sy = snap(world.y);
      const h = dragHandle.handle;

      if (h.includes('w')) minX = Math.min(sw, maxX - 0.5);
      if (h.includes('e')) maxX = Math.max(sw, minX + 0.5);
      if (h.includes('n')) minY = Math.min(sy, maxY - 0.5);
      if (h.includes('s')) maxY = Math.max(sy, minY + 0.5);

      updateRoomBounds(selectedRoomIndex, { minX, minY, maxX, maxY });
      return;
    }

    // Wall vertex dragging — create diagonal walls
    if (dragWallVertex && floorPlan) {
      updateWallVertex(dragWallVertex.roomIndex, dragWallVertex.wallIndex, dragWallVertex.vertex, snap(world.x), snap(world.y));
      return;
    }

    // Door dragging — slide along wall
    if (dragDoor && floorPlan) {
      const room = floorPlan.rooms[dragDoor.roomIndex];
      const wall = room?.walls[dragDoor.wallIndex];
      if (wall) {
        const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1;
        const len2 = dx * dx + dy * dy;
        if (len2 > 0) {
          const t = ((world.x - wall.x1) * dx + (world.y - wall.y1) * dy) / len2;
          const clamped = Math.max(0.1, Math.min(0.9, t));
          const { updateDoor } = useStore.getState();
          updateDoor(dragDoor.roomIndex, dragDoor.doorId, { position: clamped });
        }
      }
      return;
    }

    // Window dragging — slide along wall
    if (dragWindow && floorPlan) {
      const room = floorPlan.rooms[dragWindow.roomIndex];
      const wall = room?.walls[dragWindow.wallIndex];
      if (wall) {
        const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1;
        const len2 = dx * dx + dy * dy;
        if (len2 > 0) {
          const t = ((world.x - wall.x1) * dx + (world.y - wall.y1) * dy) / len2;
          const clamped = Math.max(0.1, Math.min(0.9, t));
          const { updateWindow } = useStore.getState();
          updateWindow(dragWindow.roomIndex, dragWindow.winId, { position: clamped });
        }
      }
      return;
    }

    if (dragFurniture && floorPlan) {
      const { updateFurniture } = useStore.getState();
      const room = floorPlan.rooms[dragFurniture.roomIndex];
      const allWalls = floorPlan.rooms.flatMap(r => r.walls);
      const otherFurniture = room.furniture.filter(f => f.id !== dragFurniture.itemId);
      const roomCenters = floorPlan.rooms.map(r => r.center);
      const { guides, snappedX, snappedY } = findAlignmentGuides(
        snap(world.x), snap(world.y), allWalls, otherFurniture, roomCenters
      );
      setAlignGuides(guides);
      updateFurniture(dragFurniture.roomIndex, dragFurniture.itemId, {
        x: snappedX, y: snappedY,
      });
      return;
    }
  };

  const handleMouseUp = () => {
    if (isPanning) { setIsPanning(false); return; }

    if (isDrawing && tool === 'room') {
      setIsDrawing(false);
      const minX = Math.min(drawStart.x, drawEnd.x);
      const minY = Math.min(drawStart.y, drawEnd.y);
      const maxX = Math.max(drawStart.x, drawEnd.x);
      const maxY = Math.max(drawStart.y, drawEnd.y);
      if (maxX - minX > 0.5 && maxY - minY > 0.5) {
        addRoom(minX, minY, maxX, maxY);
      }
      setTool('select');
      return;
    }

    if (isDrawing && tool === 'wall') {
      // Polyline commits on mousedown (click-to-place); mouseup is a no-op
      // so a click doesn't double-add. Double-click / ESC ends the chain.
      return;
    }

    setDragHandle(null);
    setDragFurniture(null);
    setDragDoor(null);
    setDragWindow(null);
    setDragWallVertex(null);
    setAlignGuides([]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.2, Math.min(4, z - e.deltaY * 0.001)));
  };

  const selectFurnitureTool = (type: FurnitureType) => {
    setTool('furniture');
    setFurnitureToPlace(type);
  };

  const cursorStyle = tool === 'room' || tool === 'wall' ? 'crosshair' :
    tool === 'door' || tool === 'window' || tool === 'furniture' ? 'copy' :
    dragHandle ? 'nwse-resize' : dragWallVertex ? 'move' :
    (dragFurniture || dragDoor || dragWindow) ? 'grabbing' : 'default';

  return (
    <div className="flex-1 flex">
      <div
        ref={containerRef}
        className="flex-1 relative"
        style={{ cursor: cursorStyle }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={() => { if (tool === 'wall') setIsDrawing(false); }}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!floorPlan) return;
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

          // Right-click a FREE WALL → inline numeric editor (length/thickness/height/angle)
          const fwi = findNearestFreeWall(world.x, world.y);
          if (fwi != null) {
            const seg = floorPlan.wallSegments[fwi];
            setSelectedFreeWallIndex(fwi);
            const curLen = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
            const lenStr = window.prompt('Wall LENGTH in cm:', String(Math.round(curLen * 100)));
            if (lenStr == null) return;
            const newLen = parseFloat(lenStr) / 100;
            const thStr = window.prompt('Wall THICKNESS in cm:', String(Math.round((seg.thickness || 0.1) * 100)));
            const htStr = window.prompt('Wall HEIGHT in cm (blank = floor default):',
              seg.height != null ? String(Math.round(seg.height * 100)) : '');
            const updates: any = {};
            if (!isNaN(newLen) && newLen > 0) {
              const ang = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
              updates.x2 = seg.x1 + Math.cos(ang) * newLen;
              updates.y2 = seg.y1 + Math.sin(ang) * newLen;
            }
            if (thStr != null && thStr !== '' && !isNaN(parseFloat(thStr))) updates.thickness = parseFloat(thStr) / 100;
            if (htStr != null && htStr !== '') updates.height = parseFloat(htStr) / 100;
            if (Object.keys(updates).length) updateFreeWall(fwi, updates);
            return;
          }

          // Check if right-click is on a wall segment — toggle gap
          const hit = findNearestWall(world.x, world.y);
          if (hit) {
            const room = floorPlan.rooms[hit.roomIndex];
            const wall = room.walls[hit.wallIndex];
            if (wall.subSegments && wall.subSegments.length > 1) {
              // Find which sub-segment was clicked
              for (const seg of wall.subSegments) {
                if (hit.position >= seg.startFraction && hit.position <= seg.endFraction) {
                  const { toggleWallGap } = useStore.getState();
                  toggleWallGap(hit.roomIndex, hit.wallIndex, seg.id);
                  break;
                }
              }
            }
          }
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Floor bar (named storeys) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-xl shadow-lg p-1.5 border border-gray-200 z-10">
          <span className="text-[10px] font-semibold text-gray-400 px-1">FLOORS</span>
          {(floors ?? []).map((fl, i) => (
            <button key={fl.id}
              onClick={() => setActiveFloor(i)}
              onDoubleClick={() => {
                const n = window.prompt('Floor name:', fl.name);
                if (n != null && n.trim()) renameFloor(i, n.trim());
              }}
              title={`${fl.name} — height ${(fl.height * 100).toFixed(0)} cm. Double-click to rename.`}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${i === activeFloorIndex ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {fl.name}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-0.5 self-stretch" />
          <button onClick={() => { const n = window.prompt('New floor name:', `Floor ${(floors?.length ?? 0) + 1}`); const h = window.prompt('Default storey height in cm:', '270'); addFloor(n || undefined, h ? parseFloat(h) / 100 : undefined); }}
            title="Add a new floor" className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50">+ Floor</button>
          <button onClick={() => duplicateActiveFloor()}
            title="Duplicate this floor (e.g. Existing → Proposed)" className="px-2 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">Duplicate</button>
          <button onClick={() => { const fl = floors?.[activeFloorIndex]; const h = window.prompt(`Default storey height for "${fl?.name}" in cm:`, String(Math.round((fl?.height ?? 2.7) * 100))); if (h) setFloorHeight(activeFloorIndex, parseFloat(h) / 100); }}
            title="Set this floor's default storey height" className="px-2 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">Height</button>
          {(floors?.length ?? 0) > 1 && (
            <button onClick={() => { if (window.confirm(`Delete floor "${floors[activeFloorIndex]?.name}"?`)) removeFloor(activeFloorIndex); }}
              title="Delete this floor" className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
          )}
        </div>

        {/* Top toolbar */}
        <div className="absolute top-4 left-4 flex gap-2 bg-white rounded-xl shadow-lg p-2 border border-gray-200">
          <ToolBtn active={tool === 'select'} onClick={() => { setTool('select'); setFurnitureToPlace(null); }} label="Select" kbd="V" />
          <ToolBtn active={tool === 'room'} onClick={() => setTool('room')} label="New Room" kbd="R" />
          <ToolBtn active={tool === 'wall'} onClick={() => { setTool('wall'); setIsDrawing(false); }} label="Draw Wall" kbd="A" />
          {tool === 'wall' && (
            <label className="flex items-center gap-1 text-[11px] text-gray-600 px-1" title="Default thickness for new walls (cm)">
              thick
              <input type="number" min={2} max={60} step={1}
                value={Math.round(defaultWallThickness * 100)}
                onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setDefaultWallThickness(v / 100); }}
                className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs" />
              cm
            </label>
          )}
          <div className="w-px bg-gray-200" />
          <ToolBtn active={tool === 'door'} onClick={() => setTool('door')} label="Door" kbd="D" />
          <ToolBtn active={tool === 'window'} onClick={() => setTool('window')} label="Window" kbd="W" />
          <ToolBtn active={tool === 'wall-split'} onClick={() => setTool('wall-split')} label="Split Wall" kbd="S" />
          <div className="w-px bg-gray-200" />
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
            className={`px-2 py-1.5 rounded-lg text-xs font-medium ${canUndo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}>
            Undo
          </button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"
            className={`px-2 py-1.5 rounded-lg text-xs font-medium ${canRedo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}>
            Redo
          </button>
          <div className="w-px bg-gray-200" />
          <button onClick={() => setViewMode('3d-view')}
            className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700">
            View 3D
          </button>
        </div>

        {/* Tool hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs shadow-lg flex gap-3">
          {tool === 'select' && <>
            <span>Click to select</span>
            <span>Drag orange dots to reshape walls</span>
            <span>Drag doors/windows along walls</span>
            <span>R: rotate</span>
            <span>Del: remove</span>
            <span>Ctrl+Z: undo</span>
            <span>Ctrl+D: duplicate room</span>
          </>}
          {tool === 'room' && <span>Click and drag to draw a new room. ESC to cancel.</span>}
          {tool === 'wall' && <span>Click to drop the start point, click again for each corner — walls chain at any angle and the live length shows in cm. Shift = 45° lock. Double-click or ESC to finish. Right-click a wall to edit length/thickness/height; click then Delete to remove.</span>}
          {tool === 'door' && <span>Click on any wall to place a door. The closer to the wall, the better.</span>}
          {tool === 'window' && <span>Click on any wall to place a window.</span>}
          {tool === 'furniture' && furnitureToPlace && <span>Click inside a room to place {getCatalogItem(furnitureToPlace).name}.</span>}
          {tool === 'wall-split' && <span>Click on a wall to split it. Then right-click a segment to toggle gap/solid.</span>}
        </div>

        {/* Zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <button onClick={() => setZoom(z => Math.min(4, z + 0.2))} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-t-lg text-lg">+</button>
          <div className="text-center text-xs text-gray-500 px-2">{(zoom * 100).toFixed(0)}%</div>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-b-lg text-lg">-</button>
        </div>
      </div>

      {/* Right panel */}
      <DesignPanel tool={tool} setTool={setTool} selectFurnitureTool={selectFurnitureTool} />
    </div>
  );
}

function ToolBtn({ active, onClick, label, kbd }: { active: boolean; onClick: () => void; label: string; kbd: string }) {
  return (
    <button onClick={onClick} title={`${label} (${kbd})`}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
      }`}>
      {label}
    </button>
  );
}

const DOOR_STYLES: { value: DoorStyle; label: string; color: string }[] = [
  { value: 'wood-natural', label: 'Natural Wood', color: '#A0845C' },
  { value: 'wood-dark', label: 'Dark Wood', color: '#5C3A1E' },
  { value: 'wood-white', label: 'White Wood', color: '#F0EDE8' },
  { value: 'painted-white', label: 'Painted White', color: '#FAFAFA' },
  { value: 'painted-blue', label: 'Painted Blue', color: '#4A7AB5' },
  { value: 'painted-red', label: 'Painted Red', color: '#A63030' },
  { value: 'painted-green', label: 'Painted Green', color: '#3A7A4A' },
  { value: 'glass-clear', label: 'Glass Clear', color: '#B0D8F0' },
  { value: 'glass-frosted', label: 'Glass Frosted', color: '#D8E8F0' },
  { value: 'metal-steel', label: 'Steel', color: '#B8B8B8' },
  { value: 'metal-black', label: 'Black Metal', color: '#2A2A2A' },
];

const DOOR_TYPES: { value: DoorData['type']; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'sliding', label: 'Sliding' },
  { value: 'french', label: 'French' },
  { value: 'glass', label: 'Glass' },
];

const WINDOW_TYPES: { value: WindowData['type']; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'bay', label: 'Bay' },
  { value: 'skylight', label: 'Skylight' },
];

function DesignPanel({ tool, setTool, selectFurnitureTool }: {
  tool: string; setTool: (t: DesignTool) => void;
  selectFurnitureTool: (type: FurnitureType) => void;
}) {
  const {
    floorPlan, selectedRoomIndex, removeRoom,
    updateRoomName, updateRoomHeight, toggleRoomFloor, toggleRoomCeiling,
    selectedDoorId, updateDoor, removeDoor,
    selectedWindowId, updateWindow, removeWindow,
    selectedFurnitureId, updateFurniture, removeFurniture,
  } = useStore();

  const [furnitureTab, setFurnitureTab] = useState<string>('bathroom');
  const room = selectedRoomIndex !== null && floorPlan ? floorPlan.rooms[selectedRoomIndex] : null;
  const selDoor = room?.doors.find(d => d.id === selectedDoorId);
  const selWin = room?.windows.find(w => w.id === selectedWindowId);
  const selFurn = room?.furniture.find(f => f.id === selectedFurnitureId);

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-900">Design Mode</h2>
        <p className="text-xs text-gray-500 mt-1">
          Draw rooms, place doors/windows/furniture. Alt+drag to pan. R to rotate. Del to remove.
        </p>
      </div>

      {room && selectedRoomIndex !== null && (
        <div className="p-4 space-y-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <input type="text" value={room.name} onChange={(e) => updateRoomName(selectedRoomIndex, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none" />
            <button onClick={() => removeRoom(selectedRoomIndex)}
              className="ml-2 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
              Delete
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Height: {room.ceilingHeight.toFixed(1)}m</label>
            <input type="range" min="2" max="6" step="0.1" value={room.ceilingHeight}
              onChange={(e) => updateRoomHeight(selectedRoomIndex, parseFloat(e.target.value))}
              className="w-full accent-brand-600" />
          </div>

          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={room.showFloor} onChange={() => toggleRoomFloor(selectedRoomIndex)} className="accent-brand-600" />
              Floor
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={room.showCeiling} onChange={() => toggleRoomCeiling(selectedRoomIndex)} className="accent-brand-600" />
              Ceiling
            </label>
          </div>

          <div className="text-xs text-gray-500">
            {room.doors.length} door{room.doors.length !== 1 ? 's' : ''} · {room.windows.length} window{room.windows.length !== 1 ? 's' : ''} · {room.furniture.length} item{room.furniture.length !== 1 ? 's' : ''}
          </div>

          {/* ─── SELECTED DOOR EDITOR ─── */}
          {selDoor && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800">Door</span>
                <button onClick={() => removeDoor(selectedRoomIndex, selDoor.id)}
                  className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Type</label>
                <div className="flex gap-1 flex-wrap">
                  {DOOR_TYPES.map(dt => (
                    <button key={dt.value} onClick={() => updateDoor(selectedRoomIndex, selDoor.id, { type: dt.value })}
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        selDoor.type === dt.value ? 'bg-amber-200 border-amber-400 font-bold' : 'border-gray-200 hover:bg-gray-50'
                      }`}>{dt.label}</button>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div>
                <label className="text-[10px] text-gray-500">Width: {selDoor.width.toFixed(2)}m</label>
                <input type="range" min="0.6" max="2.0" step="0.05" value={selDoor.width}
                  onChange={(e) => updateDoor(selectedRoomIndex, selDoor.id, { width: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500" />
              </div>

              {/* Height */}
              <div>
                <label className="text-[10px] text-gray-500">Height: {selDoor.height.toFixed(2)}m</label>
                <input type="range" min="1.8" max="2.8" step="0.05" value={selDoor.height}
                  onChange={(e) => updateDoor(selectedRoomIndex, selDoor.id, { height: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500" />
              </div>

              {/* Position along wall */}
              <div>
                <label className="text-[10px] text-gray-500">Position: {(selDoor.position * 100).toFixed(0)}%</label>
                <input type="range" min="0.1" max="0.9" step="0.01" value={selDoor.position}
                  onChange={(e) => updateDoor(selectedRoomIndex, selDoor.id, { position: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500" />
              </div>

              {/* Open direction */}
              <div className="flex gap-2">
                <button onClick={() => updateDoor(selectedRoomIndex, selDoor.id, { openDirection: 'inward' })}
                  className={`flex-1 py-1 text-[10px] rounded border ${selDoor.openDirection === 'inward' ? 'bg-amber-200 border-amber-400' : 'border-gray-200'}`}>
                  Inward
                </button>
                <button onClick={() => updateDoor(selectedRoomIndex, selDoor.id, { openDirection: 'outward' })}
                  className={`flex-1 py-1 text-[10px] rounded border ${selDoor.openDirection === 'outward' ? 'bg-amber-200 border-amber-400' : 'border-gray-200'}`}>
                  Outward
                </button>
              </div>

              {/* Style / Material */}
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Style / Material</label>
                <div className="grid grid-cols-4 gap-1">
                  {DOOR_STYLES.map(ds => (
                    <button key={ds.value} onClick={() => updateDoor(selectedRoomIndex, selDoor.id, { style: ds.value } as any)}
                      className={`p-1 rounded border text-center ${
                        (selDoor as any).style === ds.value ? 'ring-2 ring-amber-400 border-amber-400' : 'border-gray-200 hover:border-amber-300'
                      }`}
                      title={ds.label}
                    >
                      <div className="w-full h-4 rounded" style={{ backgroundColor: ds.color }} />
                      <div className="text-[8px] text-gray-600 mt-0.5 truncate">{ds.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-400">Click door in 2D or 3D to select. Delete to remove.</p>
            </div>
          )}

          {/* ─── SELECTED WINDOW EDITOR ─── */}
          {selWin && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Window</span>
                <button onClick={() => removeWindow(selectedRoomIndex, selWin.id)}
                  className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Type</label>
                <div className="flex gap-1 flex-wrap">
                  {WINDOW_TYPES.map(wt => (
                    <button key={wt.value} onClick={() => updateWindow(selectedRoomIndex, selWin.id, { type: wt.value })}
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        selWin.type === wt.value ? 'bg-blue-200 border-blue-400 font-bold' : 'border-gray-200 hover:bg-gray-50'
                      }`}>{wt.label}</button>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div>
                <label className="text-[10px] text-gray-500">Width: {selWin.width.toFixed(2)}m</label>
                <input type="range" min="0.3" max="3.0" step="0.05" value={selWin.width}
                  onChange={(e) => updateWindow(selectedRoomIndex, selWin.id, { width: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500" />
              </div>

              {/* Height */}
              <div>
                <label className="text-[10px] text-gray-500">Height: {selWin.height.toFixed(2)}m</label>
                <input type="range" min="0.3" max="2.5" step="0.05" value={selWin.height}
                  onChange={(e) => updateWindow(selectedRoomIndex, selWin.id, { height: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500" />
              </div>

              {/* Sill height */}
              <div>
                <label className="text-[10px] text-gray-500">Sill height: {selWin.sillHeight.toFixed(2)}m</label>
                <input type="range" min="0" max="2.0" step="0.05" value={selWin.sillHeight}
                  onChange={(e) => updateWindow(selectedRoomIndex, selWin.id, { sillHeight: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500" />
              </div>

              {/* Position along wall */}
              <div>
                <label className="text-[10px] text-gray-500">Position: {(selWin.position * 100).toFixed(0)}%</label>
                <input type="range" min="0.1" max="0.9" step="0.01" value={selWin.position}
                  onChange={(e) => updateWindow(selectedRoomIndex, selWin.id, { position: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500" />
              </div>

              <p className="text-[10px] text-gray-400">Click window in 2D to select. Delete to remove.</p>
            </div>
          )}

          {/* ─── SELECTED FURNITURE EDITOR ─── */}
          {selFurn && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">{getCatalogItem(selFurn.type).name}</span>
                <button onClick={() => removeFurniture(selectedRoomIndex, selFurn.id)}
                  className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500">Scale W</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={selFurn.scaleX}
                    onChange={(e) => updateFurniture(selectedRoomIndex, selFurn.id, { scaleX: parseFloat(e.target.value) })}
                    className="w-full accent-green-500" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500">Scale D</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={selFurn.scaleY}
                    onChange={(e) => updateFurniture(selectedRoomIndex, selFurn.id, { scaleY: parseFloat(e.target.value) })}
                    className="w-full accent-green-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Rotation</label>
                <input type="range" min="0" max={Math.PI * 2} step={Math.PI / 8} value={selFurn.rotation}
                  onChange={(e) => updateFurniture(selectedRoomIndex, selFurn.id, { rotation: parseFloat(e.target.value) })}
                  className="w-full accent-green-500" />
              </div>
              <p className="text-[10px] text-gray-400">Press R to rotate 45°. Drag to move. Delete to remove.</p>
            </div>
          )}
        </div>
      )}

      {/* Furniture Catalog */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Furniture & Fixtures</h3>

        <div className="flex gap-1 mb-3 flex-wrap">
          {FURNITURE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFurnitureTab(cat)}
              className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition-all ${
                furnitureTab === cat ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {FURNITURE_CATALOG.filter(f => f.category === furnitureTab).map(item => (
            <button key={item.type} onClick={() => selectFurnitureTool(item.type)}
              className="p-2 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all text-left">
              <div className="text-xs font-medium text-gray-800">{item.name}</div>
              <div className="text-[10px] text-gray-400">{item.defaultWidth}m x {item.defaultDepth}m</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
