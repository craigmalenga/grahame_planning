import { create } from 'zustand';
import type { FloorPlanData, RoomData, SceneConfig, ViewMode, ControlMode, DoorData, WindowData, FurnitureItem, FurnitureType, TextureInfo, WallSubSegment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getCatalogItem } from '../utils/furnitureCatalog';
import { autoSave } from '../utils/projectStorage';

// ─── UNDO/REDO HISTORY ──────────────────────────────────

const MAX_HISTORY = 50;

interface HistoryEntry {
  floorPlan: FloorPlanData;
  label: string;
}

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  controlMode: ControlMode;
  setControlMode: (mode: ControlMode) => void;

  floorPlan: FloorPlanData | null;
  setFloorPlan: (data: FloorPlanData) => void;

  selectedRoomIndex: number | null;
  setSelectedRoomIndex: (index: number | null) => void;

  updateRoomTexture: (roomIndex: number, field: 'wallTexture' | 'floorTexture' | 'ceilingTexture', value: string) => void;
  updateRoomHeight: (roomIndex: number, height: number) => void;
  updateRoomName: (roomIndex: number, name: string) => void;

  toggleRoomFloor: (roomIndex: number) => void;
  toggleRoomCeiling: (roomIndex: number) => void;

  // Room CRUD
  addRoom: (minX: number, minY: number, maxX: number, maxY: number) => void;
  removeRoom: (roomIndex: number) => void;
  updateRoomBounds: (roomIndex: number, bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;

  // Wall vertex editing — move individual wall endpoints
  updateWallVertex: (roomIndex: number, wallIndex: number, vertex: 'start' | 'end', x: number, y: number) => void;

  // ─── MULTI-FLOOR (named storeys) ────────────────────────
  // Low-churn model: the active storey's plan stays in `floorPlan` (all
  // existing room/wall actions keep working). Other storeys are parked in
  // `floors[]` and swapped in on switch.
  floors: { id: string; name: string; height: number; data: FloorPlanData }[];
  activeFloorIndex: number;
  addFloor: (name?: string, height?: number) => void;
  duplicateActiveFloor: (name?: string) => void;
  setActiveFloor: (index: number) => void;
  renameFloor: (index: number, name: string) => void;
  setFloorHeight: (index: number, height: number) => void;   // default storey height (metres)
  removeFloor: (index: number) => void;

  // ─── FREE-STANDING ANGLED WALLS ─────────────────────────
  // Stored on the active floorPlan.wallSegments — independent of rooms,
  // any angle. This is the non-rectangular drawing capability.
  defaultWallThickness: number;                              // metres
  setDefaultWallThickness: (t: number) => void;
  addFreeWall: (x1: number, y1: number, x2: number, y2: number, thickness?: number, height?: number) => void;
  updateFreeWall: (index: number, updates: Partial<{ x1: number; y1: number; x2: number; y2: number; thickness: number; height: number }>) => void;
  removeFreeWall: (index: number) => void;
  selectedFreeWallIndex: number | null;
  setSelectedFreeWallIndex: (i: number | null) => void;

  // Doors & windows
  addDoor: (roomIndex: number, door: Omit<DoorData, 'id'>) => void;
  updateDoor: (roomIndex: number, doorId: string, updates: Partial<DoorData>) => void;
  removeDoor: (roomIndex: number, doorId: string) => void;
  addWindow: (roomIndex: number, win: Omit<WindowData, 'id'>) => void;
  updateWindow: (roomIndex: number, winId: string, updates: Partial<WindowData>) => void;
  removeWindow: (roomIndex: number, winId: string) => void;

  // Furniture
  addFurniture: (roomIndex: number, type: FurnitureType, x: number, y: number) => void;
  updateFurniture: (roomIndex: number, itemId: string, updates: Partial<FurnitureItem>) => void;
  removeFurniture: (roomIndex: number, itemId: string) => void;
  selectedFurnitureId: string | null;
  setSelectedFurnitureId: (id: string | null) => void;

  selectedDoorId: string | null;
  setSelectedDoorId: (id: string | null) => void;
  selectedWindowId: string | null;
  setSelectedWindowId: (id: string | null) => void;

  // Selected wall for editing
  selectedWallIndex: number | null;
  setSelectedWallIndex: (index: number | null) => void;

  customTextures: TextureInfo[];
  addCustomTexture: (texture: TextureInfo) => void;

  sceneConfig: SceneConfig;
  updateSceneConfig: (config: Partial<SceneConfig>) => void;

  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;

  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Templates
  loadTemplate: (rooms: RoomData[]) => void;

  // Camera reset counter
  cameraResetKey: number;

  // Day/night mode
  isNightMode: boolean;
  setIsNightMode: (v: boolean) => void;

  // Zombie mode — separate from FPS walkthrough
  zombieMode: boolean;
  setZombieMode: (v: boolean) => void;

  // ─── UNDO / REDO ────────────────────────────────────
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Duplicate room
  duplicateRoom: (roomIndex: number) => void;

  // Wall split/gap system
  splitWall: (roomIndex: number, wallIndex: number, splitFraction: number) => void;
  toggleWallGap: (roomIndex: number, wallIndex: number, segmentId: string) => void;
  deleteWallSegment: (roomIndex: number, wallIndex: number, segmentId: string) => void;

  // Per-wall texture
  updateWallTexture: (roomIndex: number, wallIndex: number, texture: string) => void;

  // 3D edit mode
  editMode3D: boolean;
  setEditMode3D: (v: boolean) => void;
  contextMenu3D: { x: number; y: number; objectType: string; objectId: string; roomIndex: number } | null;
  showContextMenu3D: (data: { x: number; y: number; objectType: string; objectId: string; roomIndex: number }) => void;
  hideContextMenu3D: () => void;

  // Current project ID for save/load
  savedProjectId: string | null;
  setSavedProjectId: (id: string | null) => void;
}

const defaultSceneConfig: SceneConfig = {
  ambientLightIntensity: 0.4,
  ambientLightColor: '#ffffff',
  directionalLightIntensity: 0.8,
  directionalLightColor: '#fff5e6',
  directionalLightPosition: [5, 8, 5],
  pointLights: [
    { position: [0, 2.5, 0], intensity: 0.6, color: '#fff8e7', distance: 10 },
  ],
  backgroundColor: '#87CEEB',
  fogEnabled: false,
  fogColor: '#e0e0e0',
  fogNear: 10,
  fogFar: 50,
};

function updateRoom(state: AppState, roomIndex: number, updater: (room: RoomData) => RoomData): Partial<AppState> {
  if (!state.floorPlan) return state;
  const rooms = [...state.floorPlan.rooms];
  rooms[roomIndex] = updater(rooms[roomIndex]);
  return { floorPlan: { ...state.floorPlan, rooms } };
}

function makeRoomWalls(minX: number, minY: number, maxX: number, maxY: number) {
  return [
    { x1: minX, y1: minY, x2: maxX, y2: minY, thickness: 0.15 },
    { x1: maxX, y1: minY, x2: maxX, y2: maxY, thickness: 0.15 },
    { x1: maxX, y1: maxY, x2: minX, y2: maxY, thickness: 0.15 },
    { x1: minX, y1: maxY, x2: minX, y2: minY, thickness: 0.15 },
  ];
}

// Push current floor plan to undo stack
function pushHistory(state: AppState, label: string): Partial<AppState> {
  if (!state.floorPlan) return {};
  const entry: HistoryEntry = {
    floorPlan: JSON.parse(JSON.stringify(state.floorPlan)),
    label,
  };
  const stack = [...state.undoStack, entry].slice(-MAX_HISTORY);
  return { undoStack: stack, redoStack: [], canUndo: true, canRedo: false };
}

// Wrap a mutation: push history, apply mutation, return combined state
function withHistory(state: AppState, label: string, mutation: Partial<AppState>): Partial<AppState> {
  return { ...pushHistory(state, label), ...mutation };
}

export const useStore = create<AppState>((set) => ({
  viewMode: 'upload',
  setViewMode: (mode) => set({ viewMode: mode }),
  controlMode: 'orbit',
  setControlMode: (mode) => set({ controlMode: mode }),

  floorPlan: null,
  setFloorPlan: (data) => {
    const rooms = data.rooms.map(r => ({
      ...r,
      showFloor: r.showFloor ?? true,
      showCeiling: r.showCeiling ?? true,
      doors: r.doors ?? [],
      windows: r.windows ?? [],
      furniture: r.furniture ?? [],
    }));
    const fp = { ...data, rooms, wallSegments: data.wallSegments ?? [] };
    set((state) => ({
      floorPlan: fp,
      // Seed the active storey if floors haven't been set up yet.
      floors: state.floors && state.floors.length
        ? state.floors
        : [{ id: uuidv4(), name: data.name || 'Ground Floor', height: 2.7, data: fp }],
      activeFloorIndex: state.floors && state.floors.length ? state.activeFloorIndex : 0,
    }));
  },

  // ─── MULTI-FLOOR ──────────────────────────────────────
  floors: [],
  activeFloorIndex: 0,
  defaultWallThickness: 0.1,                 // 100 mm internal default
  selectedFreeWallIndex: null,
  setSelectedFreeWallIndex: (i) => set({ selectedFreeWallIndex: i }),
  setDefaultWallThickness: (t) => set({ defaultWallThickness: Math.max(0.02, t) }),

  // Save the live floorPlan back into floors[active] before any switch.
  setActiveFloor: (index) =>
    set((state) => {
      if (!state.floorPlan || index === state.activeFloorIndex) return state;
      const floors = [...state.floors];
      if (floors[state.activeFloorIndex]) {
        floors[state.activeFloorIndex] = { ...floors[state.activeFloorIndex], data: state.floorPlan };
      }
      const target = floors[index];
      if (!target) return state;
      return {
        floors,
        activeFloorIndex: index,
        floorPlan: target.data,
        selectedRoomIndex: null,
        selectedWallIndex: null,
        selectedFreeWallIndex: null,
      };
    }),

  addFloor: (name, height) =>
    set((state) => {
      const floors = [...state.floors];
      // park current
      if (state.floorPlan && floors[state.activeFloorIndex]) {
        floors[state.activeFloorIndex] = { ...floors[state.activeFloorIndex], data: state.floorPlan };
      }
      const h = height ?? 2.7;
      const blank: FloorPlanData = {
        name: name || `Floor ${floors.length + 1}`,
        originalImageUrl: '', width: state.floorPlan?.width ?? 1200,
        height: state.floorPlan?.height ?? 1200, scale: state.floorPlan?.scale ?? 100,
        rooms: [], wallSegments: [],
      };
      floors.push({ id: uuidv4(), name: blank.name, height: h, data: blank });
      return {
        floors, activeFloorIndex: floors.length - 1, floorPlan: blank,
        selectedRoomIndex: null, selectedWallIndex: null, selectedFreeWallIndex: null,
      };
    }),

  duplicateActiveFloor: (name) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const floors = [...state.floors];
      floors[state.activeFloorIndex] = { ...floors[state.activeFloorIndex], data: state.floorPlan };
      const copy: FloorPlanData = JSON.parse(JSON.stringify(state.floorPlan));
      copy.name = name || `${floors[state.activeFloorIndex].name} (copy)`;
      const h = floors[state.activeFloorIndex]?.height ?? 2.7;
      floors.push({ id: uuidv4(), name: copy.name, height: h, data: copy });
      return {
        floors, activeFloorIndex: floors.length - 1, floorPlan: copy,
        selectedRoomIndex: null, selectedWallIndex: null, selectedFreeWallIndex: null,
      };
    }),

  renameFloor: (index, name) =>
    set((state) => {
      const floors = [...state.floors];
      if (!floors[index]) return state;
      floors[index] = { ...floors[index], name };
      return { floors };
    }),

  setFloorHeight: (index, height) =>
    set((state) => {
      const floors = [...state.floors];
      if (!floors[index]) return state;
      floors[index] = { ...floors[index], height: Math.max(1.5, height) };
      return { floors };
    }),

  removeFloor: (index) =>
    set((state) => {
      if (state.floors.length <= 1) return state;   // keep at least one
      const floors = state.floors.filter((_, i) => i !== index);
      const newActive = Math.max(0, Math.min(index, floors.length - 1));
      return {
        floors, activeFloorIndex: newActive, floorPlan: floors[newActive].data,
        selectedRoomIndex: null, selectedWallIndex: null, selectedFreeWallIndex: null,
      };
    }),

  // ─── FREE-STANDING ANGLED WALLS ───────────────────────
  addFreeWall: (x1, y1, x2, y2, thickness, height) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const seg = {
        x1, y1, x2, y2,
        thickness: thickness ?? state.defaultWallThickness,
        ...(height != null ? { height } : {}),
      };
      const wallSegments = [...(state.floorPlan.wallSegments ?? []), seg];
      return withHistory(state, 'Add wall', {
        floorPlan: { ...state.floorPlan, wallSegments },
        selectedFreeWallIndex: wallSegments.length - 1,
      });
    }),

  updateFreeWall: (index, updates) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const wallSegments = [...(state.floorPlan.wallSegments ?? [])];
      if (!wallSegments[index]) return state;
      wallSegments[index] = { ...wallSegments[index], ...updates };
      return withHistory(state, 'Edit wall', {
        floorPlan: { ...state.floorPlan, wallSegments },
      });
    }),

  removeFreeWall: (index) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const wallSegments = (state.floorPlan.wallSegments ?? []).filter((_, i) => i !== index);
      return withHistory(state, 'Delete wall', {
        floorPlan: { ...state.floorPlan, wallSegments },
        selectedFreeWallIndex: null,
      });
    }),

  selectedRoomIndex: null,
  setSelectedRoomIndex: (index) => set({ selectedRoomIndex: index }),

  updateRoomTexture: (roomIndex, field, value) =>
    set((state) => withHistory(state, `Change ${field}`, updateRoom(state, roomIndex, (r) => ({ ...r, [field]: value })))),

  updateRoomHeight: (roomIndex, height) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({ ...r, ceilingHeight: height }))),

  updateRoomName: (roomIndex, name) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({ ...r, name }))),

  toggleRoomFloor: (roomIndex) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({ ...r, showFloor: !r.showFloor }))),

  toggleRoomCeiling: (roomIndex) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({ ...r, showCeiling: !r.showCeiling }))),

  // Room CRUD
  addRoom: (minX, minY, maxX, maxY) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const roomNum = state.floorPlan.rooms.length + 1;
      const newRoom: RoomData = {
        name: `Room ${roomNum}`,
        walls: makeRoomWalls(minX, minY, maxX, maxY),
        bounds: { minX, minY, maxX, maxY },
        center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
        ceilingHeight: 2.7,
        wallTexture: 'plaster-white',
        floorTexture: 'hardwood-oak',
        ceilingTexture: 'plaster-white',
        showFloor: true,
        showCeiling: true,
        doors: [],
        windows: [],
        furniture: [],
      };
      return withHistory(state, 'Add room', {
        floorPlan: { ...state.floorPlan, rooms: [...state.floorPlan.rooms, newRoom] },
        selectedRoomIndex: state.floorPlan.rooms.length,
      });
    }),

  removeRoom: (roomIndex) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const rooms = state.floorPlan.rooms.filter((_, i) => i !== roomIndex);
      return withHistory(state, 'Remove room', {
        floorPlan: { ...state.floorPlan, rooms },
        selectedRoomIndex: null,
      });
    }),

  updateRoomBounds: (roomIndex, bounds) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({
      ...r,
      bounds,
      walls: makeRoomWalls(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY),
      center: { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 },
    }))),

  // Wall vertex editing — move individual wall endpoints for non-rectangular rooms
  updateWallVertex: (roomIndex, wallIndex, vertex, x, y) =>
    set((state) => updateRoom(state, roomIndex, (r) => {
      const walls = [...r.walls];
      const wall = { ...walls[wallIndex] };
      if (vertex === 'start') {
        wall.x1 = x;
        wall.y1 = y;
      } else {
        wall.x2 = x;
        wall.y2 = y;
      }
      walls[wallIndex] = wall;

      // Also update the connected wall's matching endpoint
      const numWalls = walls.length;
      if (vertex === 'start') {
        // Previous wall's end should match this wall's start
        const prevIdx = (wallIndex - 1 + numWalls) % numWalls;
        walls[prevIdx] = { ...walls[prevIdx], x2: x, y2: y };
      } else {
        // Next wall's start should match this wall's end
        const nextIdx = (wallIndex + 1) % numWalls;
        walls[nextIdx] = { ...walls[nextIdx], x1: x, y1: y };
      }

      // Recalculate bounds from wall vertices
      const xs = walls.map(w => w.x1).concat(walls.map(w => w.x2));
      const ys = walls.map(w => w.y1).concat(walls.map(w => w.y2));
      const bounds = {
        minX: Math.min(...xs), minY: Math.min(...ys),
        maxX: Math.max(...xs), maxY: Math.max(...ys),
      };

      return {
        ...r,
        walls,
        bounds,
        center: { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 },
      };
    })),

  // Doors
  addDoor: (roomIndex, door) =>
    set((state) => withHistory(state, 'Add door', updateRoom(state, roomIndex, (r) => ({
      ...r, doors: [...r.doors, { ...door, id: uuidv4() }],
    })))),
  updateDoor: (roomIndex, doorId, updates) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({
      ...r, doors: r.doors.map(d => d.id === doorId ? { ...d, ...updates } : d),
    }))),
  removeDoor: (roomIndex, doorId) =>
    set((state) => {
      const result = updateRoom(state, roomIndex, (r) => ({
        ...r, doors: r.doors.filter(d => d.id !== doorId),
      }));
      return withHistory(state, 'Remove door', { ...result, selectedDoorId: state.selectedDoorId === doorId ? null : state.selectedDoorId });
    }),

  // Windows
  addWindow: (roomIndex, win) =>
    set((state) => withHistory(state, 'Add window', updateRoom(state, roomIndex, (r) => ({
      ...r, windows: [...r.windows, { ...win, id: uuidv4() }],
    })))),
  updateWindow: (roomIndex, winId, updates) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({
      ...r, windows: r.windows.map(w => w.id === winId ? { ...w, ...updates } : w),
    }))),
  removeWindow: (roomIndex, winId) =>
    set((state) => {
      const result = updateRoom(state, roomIndex, (r) => ({
        ...r, windows: r.windows.filter(w => w.id !== winId),
      }));
      return withHistory(state, 'Remove window', { ...result, selectedWindowId: state.selectedWindowId === winId ? null : state.selectedWindowId });
    }),

  // Furniture
  addFurniture: (roomIndex, type, x, y) =>
    set((state) => {
      const catalog = getCatalogItem(type);
      const item: FurnitureItem = {
        id: uuidv4(),
        type,
        x, y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };
      return withHistory(state, `Add ${catalog.name}`, updateRoom(state, roomIndex, (r) => ({
        ...r, furniture: [...r.furniture, item],
      })));
    }),

  updateFurniture: (roomIndex, itemId, updates) =>
    set((state) => updateRoom(state, roomIndex, (r) => ({
      ...r, furniture: r.furniture.map(f => f.id === itemId ? { ...f, ...updates } : f),
    }))),

  removeFurniture: (roomIndex, itemId) =>
    set((state) => {
      const result = updateRoom(state, roomIndex, (r) => ({
        ...r, furniture: r.furniture.filter(f => f.id !== itemId),
      }));
      return withHistory(state, 'Remove furniture', { ...result, selectedFurnitureId: state.selectedFurnitureId === itemId ? null : state.selectedFurnitureId });
    }),

  selectedFurnitureId: null,
  setSelectedFurnitureId: (id) => set({ selectedFurnitureId: id }),

  selectedDoorId: null,
  setSelectedDoorId: (id) => set({ selectedDoorId: id }),
  selectedWindowId: null,
  setSelectedWindowId: (id) => set({ selectedWindowId: id }),

  selectedWallIndex: null,
  setSelectedWallIndex: (index) => set({ selectedWallIndex: index }),

  customTextures: [],
  addCustomTexture: (texture) =>
    set((state) => ({ customTextures: [...state.customTextures, texture] })),

  sceneConfig: defaultSceneConfig,
  updateSceneConfig: (config) =>
    set((state) => ({ sceneConfig: { ...state.sceneConfig, ...config } })),

  uploadedImageUrl: null,
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),
  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),

  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  cameraResetKey: 0,

  loadTemplate: (rooms) => set((state) => {
    const allBounds = rooms.length > 0 ? rooms.map(r => r.bounds) : [{ minX: 0, minY: 0, maxX: 10, maxY: 10 }];
    const minX = Math.min(...allBounds.map(b => b.minX));
    const minY = Math.min(...allBounds.map(b => b.minY));
    const maxX = Math.max(...allBounds.map(b => b.maxX));
    const maxY = Math.max(...allBounds.map(b => b.maxY));

    const fp: FloorPlanData = {
      name: 'Template',
      originalImageUrl: '',
      width: maxX - minX,
      height: maxY - minY,
      scale: 1,
      rooms,
      wallSegments: [],
    };
    return {
      floorPlan: fp, viewMode: 'design', selectedRoomIndex: null,
      floors: [{ id: uuidv4(), name: 'Ground Floor', height: 2.7, data: fp }],
      activeFloorIndex: 0, selectedFreeWallIndex: null,
      undoStack: [], redoStack: [], canUndo: false, canRedo: false,
    };
  }),

  isNightMode: false,
  setIsNightMode: (v) => set({ isNightMode: v }),

  zombieMode: false,
  setZombieMode: (v) => set({ zombieMode: v }),

  // ─── UNDO / REDO ────────────────────────────────────
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  undo: () => set((state) => {
    if (state.undoStack.length === 0 || !state.floorPlan) return state;
    const stack = [...state.undoStack];
    const entry = stack.pop()!;
    const redoEntry: HistoryEntry = {
      floorPlan: JSON.parse(JSON.stringify(state.floorPlan)),
      label: entry.label,
    };
    return {
      undoStack: stack,
      redoStack: [...state.redoStack, redoEntry],
      floorPlan: JSON.parse(JSON.stringify(entry.floorPlan)),
      canUndo: stack.length > 0,
      canRedo: true,
    };
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0 || !state.floorPlan) return state;
    const stack = [...state.redoStack];
    const entry = stack.pop()!;
    const undoEntry: HistoryEntry = {
      floorPlan: JSON.parse(JSON.stringify(state.floorPlan)),
      label: entry.label,
    };
    return {
      redoStack: stack,
      undoStack: [...state.undoStack, undoEntry],
      floorPlan: JSON.parse(JSON.stringify(entry.floorPlan)),
      canUndo: true,
      canRedo: stack.length > 0,
    };
  }),

  // Duplicate room
  duplicateRoom: (roomIndex) =>
    set((state) => {
      if (!state.floorPlan) return state;
      const src = state.floorPlan.rooms[roomIndex];
      const offsetX = (src.bounds.maxX - src.bounds.minX) + 1;
      const newRoom: RoomData = {
        ...JSON.parse(JSON.stringify(src)),
        name: `${src.name} (copy)`,
        bounds: {
          minX: src.bounds.minX + offsetX,
          minY: src.bounds.minY,
          maxX: src.bounds.maxX + offsetX,
          maxY: src.bounds.maxY,
        },
        walls: makeRoomWalls(
          src.bounds.minX + offsetX, src.bounds.minY,
          src.bounds.maxX + offsetX, src.bounds.maxY,
        ),
        center: { x: src.center.x + offsetX, y: src.center.y },
        doors: src.doors.map(d => ({ ...d, id: uuidv4() })),
        windows: src.windows.map(w => ({ ...w, id: uuidv4() })),
        furniture: src.furniture.map(f => ({ ...f, id: uuidv4(), x: f.x + offsetX })),
      };
      return withHistory(state, 'Duplicate room', {
        floorPlan: { ...state.floorPlan, rooms: [...state.floorPlan.rooms, newRoom] },
        selectedRoomIndex: state.floorPlan.rooms.length,
      });
    }),

  // ─── WALL SPLIT / GAP SYSTEM ─────────────────────────

  splitWall: (roomIndex, wallIndex, splitFraction) =>
    set((state) => {
      if (!state.floorPlan) return state;
      return withHistory(state, 'Split wall', updateRoom(state, roomIndex, (r) => {
        const walls = [...r.walls];
        const wall = { ...walls[wallIndex] };
        const existing = wall.subSegments || [
          { id: uuidv4(), startFraction: 0, endFraction: 1, isGap: false },
        ];

        // Find the segment containing the split point and split it
        const newSegs: WallSubSegment[] = [];
        for (const seg of existing) {
          if (splitFraction > seg.startFraction && splitFraction < seg.endFraction) {
            newSegs.push({ id: seg.id, startFraction: seg.startFraction, endFraction: splitFraction, isGap: seg.isGap });
            newSegs.push({ id: uuidv4(), startFraction: splitFraction, endFraction: seg.endFraction, isGap: seg.isGap });
          } else {
            newSegs.push(seg);
          }
        }

        wall.subSegments = newSegs;
        walls[wallIndex] = wall;
        return { ...r, walls };
      }));
    }),

  toggleWallGap: (roomIndex, wallIndex, segmentId) =>
    set((state) => updateRoom(state, roomIndex, (r) => {
      const walls = [...r.walls];
      const wall = { ...walls[wallIndex] };
      if (!wall.subSegments) return r;
      wall.subSegments = wall.subSegments.map(s =>
        s.id === segmentId ? { ...s, isGap: !s.isGap } : s
      );
      walls[wallIndex] = wall;
      return { ...r, walls };
    })),

  deleteWallSegment: (roomIndex, wallIndex, segmentId) =>
    set((state) => withHistory(state, 'Delete wall segment', updateRoom(state, roomIndex, (r) => {
      const walls = [...r.walls];
      const wall = { ...walls[wallIndex] };
      if (!wall.subSegments) return r;
      wall.subSegments = wall.subSegments.map(s =>
        s.id === segmentId ? { ...s, isGap: true } : s
      );
      walls[wallIndex] = wall;
      return { ...r, walls };
    }))),

  // Per-wall texture
  updateWallTexture: (roomIndex, wallIndex, texture) =>
    set((state) => withHistory(state, 'Paint wall', updateRoom(state, roomIndex, (r) => {
      const walls = [...r.walls];
      walls[wallIndex] = { ...walls[wallIndex], texture };
      return { ...r, walls };
    }))),

  // 3D edit mode
  editMode3D: false,
  setEditMode3D: (v) => set({ editMode3D: v }),

  contextMenu3D: null,
  showContextMenu3D: (data) => set({ contextMenu3D: data }),
  hideContextMenu3D: () => set({ contextMenu3D: null }),

  savedProjectId: null,
  setSavedProjectId: (id) => set({ savedProjectId: id }),
}));

// ─── AUTO-SAVE SUBSCRIBER ──────────────────────────────
// Debounced auto-save: saves to localStorage 1.5s after last change

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
useStore.subscribe((state) => {
  if (state.floorPlan) {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      autoSave(state.floorPlan!, state.sceneConfig, state.customTextures);
    }, 1500);
  }
});
