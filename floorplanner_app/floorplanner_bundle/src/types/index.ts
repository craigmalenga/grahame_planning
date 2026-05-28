// ─── WALL SUB-SEGMENTS (gaps/openings) ─────────────────

export interface WallSubSegment {
  id: string;
  startFraction: number;  // 0-1 along wall
  endFraction: number;    // 0-1 along wall
  isGap: boolean;         // true = open space, false = solid wall
}

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  height?: number;
  texture?: string;       // per-wall texture override
  subSegments?: WallSubSegment[];  // split segments
}

export type DoorStyle = 'wood-natural' | 'wood-dark' | 'wood-white' | 'painted-white' | 'painted-blue' | 'painted-red' | 'painted-green' | 'glass-clear' | 'glass-frosted' | 'metal-steel' | 'metal-black';

export interface DoorData {
  id: string;
  wallIndex: number;
  position: number; // 0-1 along the wall
  width: number;
  height: number;
  type: 'single' | 'double' | 'sliding' | 'french' | 'glass';
  openDirection: 'inward' | 'outward';
  style?: DoorStyle;
}

export interface WindowData {
  id: string;
  wallIndex: number;
  position: number;
  width: number;
  height: number;
  sillHeight: number;
  type: 'single' | 'double' | 'bay' | 'skylight';
}

export type FurnitureType =
  // Bathroom
  | 'bathtub' | 'shower' | 'toilet' | 'bathroom-sink'
  // Kitchen
  | 'kitchen-sink' | 'countertop' | 'stove' | 'fridge'
  | 'microwave' | 'oven' | 'dishwasher' | 'extractor-hood'
  // Living
  | 'sofa' | 'armchair' | 'coffee-table' | 'tv-unit' | 'bookshelf'
  | 'rug' | 'plant-pot'
  // Bedroom
  | 'bed-single' | 'bed-double' | 'wardrobe' | 'nightstand' | 'desk'
  | 'dresser'
  // Dining
  | 'dining-table' | 'dining-chair'
  // Lighting
  | 'pendant-light' | 'downlight-single' | 'downlight-triple'
  | 'wall-uplight' | 'wall-downlight' | 'floor-lamp' | 'table-lamp'
  // Mirrors
  | 'mirror-plain' | 'mirror-led'
  // Stairs
  | 'staircase-straight' | 'staircase-spiral';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  x: number; // world position
  y: number;
  rotation: number; // radians
  scaleX: number;
  scaleY: number;
  color?: string;
}

export interface RoomData {
  id?: string;
  name: string;
  walls: WallSegment[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  center: { x: number; y: number };
  ceilingHeight: number;
  wallTexture: string;
  floorTexture: string;
  ceilingTexture: string;
  showFloor: boolean;
  showCeiling: boolean;
  doors: DoorData[];
  windows: WindowData[];
  furniture: FurnitureItem[];
}

export interface FloorPlanData {
  id?: string;
  projectId?: string;
  name: string;
  originalImageUrl: string;
  width: number;
  height: number;
  scale: number;
  rooms: RoomData[];
  wallSegments: WallSegment[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  floorPlans: FloorPlanData[];
}

export interface TextureInfo {
  id: string;
  name: string;
  category: 'wall' | 'floor' | 'ceiling';
  imageUrl: string;
  tileSize: number;
  isCustom?: boolean;
}

export interface SceneConfig {
  ambientLightIntensity: number;
  ambientLightColor: string;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: [number, number, number];
  pointLights: Array<{
    position: [number, number, number];
    intensity: number;
    color: string;
    distance: number;
  }>;
  backgroundColor: string;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export type ViewMode = 'upload' | 'design' | '3d-view';
export type ControlMode = 'orbit' | 'firstperson';

// Furniture catalog metadata
export interface FurnitureCatalogItem {
  type: FurnitureType;
  name: string;
  category: 'bathroom' | 'kitchen' | 'living' | 'bedroom' | 'dining' | 'lighting' | 'stairs';
  defaultWidth: number; // meters
  defaultDepth: number; // meters
  defaultHeight: number; // meters
  icon: string; // simple label for 2D view
}

// ─── SAVED PROJECT FORMAT ──────────────────────────────

export interface SavedProject {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  floorPlan: FloorPlanData;                 // active storey (back-compat)
  // v1.1+: full multi-floor stack. Optional so v1.0 files still load.
  floors?: { id: string; name: string; height: number; data: FloorPlanData }[];
  activeFloorIndex?: number;
  sceneConfig: SceneConfig;
  customTextures: TextureInfo[];
}

export interface StoredProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  roomCount: number;
}
