import { v4 as uuidv4 } from 'uuid';
import type { RoomData, DoorData, WindowData, FurnitureItem, FurnitureType } from '../types';

// ─── HELPER: Build a room with walls from bounds ────────

function makeWalls(minX: number, minY: number, maxX: number, maxY: number) {
  return [
    { x1: minX, y1: minY, x2: maxX, y2: minY, thickness: 0.15 }, // top (wall 0)
    { x1: maxX, y1: minY, x2: maxX, y2: maxY, thickness: 0.15 }, // right (wall 1)
    { x1: maxX, y1: maxY, x2: minX, y2: maxY, thickness: 0.15 }, // bottom (wall 2)
    { x1: minX, y1: maxY, x2: minX, y2: minY, thickness: 0.15 }, // left (wall 3)
  ];
}

function door(wallIndex: number, position: number, opts?: Partial<DoorData>): Omit<DoorData, 'id'> & { id: string } {
  return {
    id: uuidv4(),
    wallIndex,
    position,
    width: opts?.width ?? 0.9,
    height: opts?.height ?? 2.1,
    type: opts?.type ?? 'single',
    openDirection: opts?.openDirection ?? 'inward',
  };
}

function win(wallIndex: number, position: number, opts?: Partial<WindowData>): Omit<WindowData, 'id'> & { id: string } {
  return {
    id: uuidv4(),
    wallIndex,
    position,
    width: opts?.width ?? 1.2,
    height: opts?.height ?? 1.0,
    sillHeight: opts?.sillHeight ?? 0.9,
    type: opts?.type ?? 'double',
  };
}

function furniture(type: FurnitureType, x: number, y: number, rotation = 0): FurnitureItem {
  return { id: uuidv4(), type, x, y, rotation, scaleX: 1, scaleY: 1 };
}

function makeRoom(
  name: string,
  minX: number, minY: number, maxX: number, maxY: number,
  opts: {
    wallTexture?: string;
    floorTexture?: string;
    ceilingHeight?: number;
    doors?: (Omit<DoorData, 'id'> & { id: string })[];
    windows?: (Omit<WindowData, 'id'> & { id: string })[];
    furniture?: FurnitureItem[];
  } = {}
): RoomData {
  return {
    name,
    walls: makeWalls(minX, minY, maxX, maxY),
    bounds: { minX, minY, maxX, maxY },
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    ceilingHeight: opts.ceilingHeight ?? 2.7,
    wallTexture: opts.wallTexture ?? 'plaster-white',
    floorTexture: opts.floorTexture ?? 'hardwood-oak',
    ceilingTexture: 'plaster-white',
    showFloor: true,
    showCeiling: true,
    doors: opts.doors ?? [],
    windows: opts.windows ?? [],
    furniture: opts.furniture ?? [],
  };
}

// ─── TEMPLATE: Modern Family Home ───────────────────────
// 6 rooms: Living, Kitchen, Dining, Master Bedroom, Bathroom, Hallway
// All rooms connected with doors, exterior windows on outside walls

export function createModernHome(): RoomData[] {
  // Layout (top-down, units in meters):
  //  ┌─────────────┬──────────┐
  //  │  Living     │ Kitchen  │
  //  │  0,0 - 5,4  │ 5,0-8,4 │
  //  ├─────────────┤          │
  //  │  Hallway    ├──────────┤
  //  │ 0,4 - 5,5.5 │ Dining  │
  //  ├──────┬──────┤ 5,4-8,7 │
  //  │Bathrm│Master│          │
  //  │0-2.5 │2.5-5 ├──────────┘
  //  │5.5-8 │5.5-8 │
  //  └──────┴──────┘

  return [
    // Living Room (room 0)
    makeRoom('Living Room', 0, 0, 5, 4, {
      floorTexture: 'hardwood-oak',
      doors: [
        door(1, 0.5),   // door on right wall (to kitchen) — shared wall with kitchen wall 3
        door(2, 0.5),   // door on bottom wall (to hallway) — shared wall with hallway wall 0
      ],
      windows: [
        win(0, 0.3, { width: 1.5 }),  // large front window
        win(0, 0.7, { width: 1.5 }),  // large front window
        win(3, 0.5, { width: 1.2 }),  // side window
      ],
      furniture: [
        furniture('sofa', 1.5, 1.5, 0),
        furniture('coffee-table', 1.5, 2.5, 0),
        furniture('tv-unit', 1.5, 3.6, 0),
        furniture('armchair', 3.8, 1.8, -Math.PI / 4),
        furniture('floor-lamp', 0.4, 0.5, 0),
        furniture('bookshelf', 4.5, 2, Math.PI / 2),
        furniture('rug', 1.5, 2.2, 0),
        furniture('pendant-light', 2.5, 2, 0),
      ],
    }),

    // Kitchen (room 1)
    makeRoom('Kitchen', 5, 0, 8, 4, {
      floorTexture: 'tile-white',
      wallTexture: 'tile-subway',
      doors: [
        door(3, 0.5),   // door on left wall (to living room) — shared with room 0 wall 1
        door(2, 0.5),   // door on bottom wall (to dining) — shared with dining wall 0
      ],
      windows: [
        win(0, 0.5, { width: 1.2 }),  // kitchen window
        win(1, 0.4),                   // side window
      ],
      furniture: [
        furniture('countertop', 7.4, 0.5, Math.PI / 2),
        furniture('countertop', 7.4, 1.5, Math.PI / 2),
        furniture('kitchen-sink', 7.4, 2.5, Math.PI / 2),
        furniture('stove', 6.0, 0.4, 0),
        furniture('fridge', 5.5, 0.4, 0),
        furniture('microwave', 6.8, 0.4, 0),
        furniture('oven', 6.0, 3.5, Math.PI),
        furniture('dishwasher', 6.8, 3.5, Math.PI),
        furniture('extractor-hood', 6.0, 0.4, 0),
        furniture('pendant-light', 6.5, 2, 0),
        furniture('downlight-triple', 6.5, 1, 0),
      ],
    }),

    // Hallway (room 2)
    makeRoom('Hallway', 0, 4, 5, 5.5, {
      floorTexture: 'tile-white',
      doors: [
        door(0, 0.5),     // door to living room — shared with room 0 wall 2
        door(2, 0.25),    // door to bathroom — shared with bathroom wall 0
        door(2, 0.75),    // door to master bedroom — shared with master wall 0
      ],
      furniture: [
        furniture('downlight-triple', 2.5, 4.75, 0),
      ],
    }),

    // Dining Room (room 3)
    makeRoom('Dining Room', 5, 4, 8, 7, {
      floorTexture: 'hardwood-oak',
      doors: [
        door(0, 0.5),   // door to kitchen — shared with room 1 wall 2
      ],
      windows: [
        win(1, 0.3, { width: 1.4 }),  // large side window
        win(1, 0.7, { width: 1.4 }),  // large side window
        win(2, 0.5, { width: 1.5 }),  // back window
      ],
      furniture: [
        furniture('dining-table', 6.5, 5.5, 0),
        furniture('dining-chair', 5.8, 5.0, 0),
        furniture('dining-chair', 7.2, 5.0, 0),
        furniture('dining-chair', 5.8, 6.0, Math.PI),
        furniture('dining-chair', 7.2, 6.0, Math.PI),
        furniture('dining-chair', 6.5, 4.8, Math.PI / 2),
        furniture('dining-chair', 6.5, 6.2, -Math.PI / 2),
        furniture('pendant-light', 6.5, 5.5, 0),
        furniture('plant-pot', 7.5, 6.5, 0),
      ],
    }),

    // Bathroom (room 4)
    makeRoom('Bathroom', 0, 5.5, 2.5, 8, {
      floorTexture: 'tile-white',
      wallTexture: 'tile-subway',
      doors: [
        door(0, 0.5),   // door to hallway — shared with hallway wall 2
      ],
      windows: [
        win(2, 0.5, { width: 0.6, height: 0.6, sillHeight: 1.5, type: 'single' }),
      ],
      furniture: [
        furniture('bathtub', 1.25, 7.2, 0),
        furniture('toilet', 0.5, 6.2, Math.PI / 2),
        furniture('bathroom-sink', 2.0, 6.0, -Math.PI / 2),
        furniture('mirror-led', 2.0, 5.8, -Math.PI / 2),
        furniture('downlight-single', 1.25, 6.75, 0),
      ],
    }),

    // Master Bedroom (room 5)
    makeRoom('Master Bedroom', 2.5, 5.5, 5, 8, {
      floorTexture: 'carpet-beige',
      doors: [
        door(0, 0.5),   // door to hallway — shared with hallway wall 2
      ],
      windows: [
        win(2, 0.5, { width: 1.4 }),   // bedroom window
        win(3, 0.6, { width: 1.0 }),   // side window
      ],
      furniture: [
        furniture('bed-double', 3.75, 7.0, 0),
        furniture('nightstand', 2.9, 7.2, 0),
        furniture('nightstand', 4.6, 7.2, 0),
        furniture('wardrobe', 3.0, 5.9, 0),
        furniture('dresser', 4.6, 5.9, 0),
        furniture('table-lamp', 2.9, 7.2, 0),
        furniture('table-lamp', 4.6, 7.2, 0),
        furniture('pendant-light', 3.75, 6.75, 0),
      ],
    }),
  ];
}

// ─── TEMPLATE: Studio Apartment ─────────────────────────

export function createStudioApartment(): RoomData[] {
  return [
    // Main living/sleeping area
    makeRoom('Studio', 0, 0, 6, 5, {
      floorTexture: 'hardwood-oak',
      doors: [
        door(2, 0.85),  // front door on bottom wall
      ],
      windows: [
        win(0, 0.3, { width: 1.5 }),
        win(0, 0.7, { width: 1.5 }),
        win(1, 0.5),
      ],
      furniture: [
        furniture('bed-double', 1.5, 1.2, 0),
        furniture('nightstand', 0.4, 1.5, 0),
        furniture('wardrobe', 0.5, 4.2, Math.PI),
        furniture('sofa', 4.5, 1.5, -Math.PI / 2),
        furniture('coffee-table', 3.5, 1.5, 0),
        furniture('tv-unit', 4.5, 3.5, -Math.PI / 2),
        furniture('desk', 3, 4.2, Math.PI),
        furniture('rug', 3.5, 2, 0),
        furniture('floor-lamp', 5.3, 0.5, 0),
        furniture('pendant-light', 3, 2.5, 0),
      ],
    }),

    // Kitchenette
    makeRoom('Kitchen', 0, 5, 3.5, 7, {
      floorTexture: 'tile-white',
      wallTexture: 'tile-subway',
      doors: [
        door(0, 0.7),
      ],
      windows: [
        win(2, 0.5, { width: 1.0 }),
      ],
      furniture: [
        furniture('countertop', 0.4, 5.5, Math.PI / 2),
        furniture('kitchen-sink', 0.4, 6.2, Math.PI / 2),
        furniture('stove', 1.5, 5.4, 0),
        furniture('fridge', 2.8, 5.4, 0),
        furniture('microwave', 1.5, 6.5, Math.PI),
        furniture('downlight-triple', 1.75, 6, 0),
      ],
    }),

    // Bathroom
    makeRoom('Bathroom', 3.5, 5, 6, 7, {
      floorTexture: 'tile-white',
      wallTexture: 'tile-subway',
      doors: [
        door(0, 0.3),
      ],
      windows: [
        win(1, 0.5, { width: 0.5, height: 0.5, sillHeight: 1.6, type: 'single' }),
      ],
      furniture: [
        furniture('shower', 5.3, 5.5, -Math.PI / 2),
        furniture('toilet', 4.2, 6.5, Math.PI),
        furniture('bathroom-sink', 5.3, 6.5, -Math.PI / 2),
        furniture('mirror-led', 5.3, 6.3, -Math.PI / 2),
        furniture('downlight-single', 4.75, 6, 0),
      ],
    }),
  ];
}

// ─── TEMPLATE: Luxury Villa ─────────────────────────────

export function createLuxuryVilla(): RoomData[] {
  return [
    // Grand entrance hall
    makeRoom('Entrance Hall', 3, 0, 7, 3, {
      floorTexture: 'marble-white',
      ceilingHeight: 3.2,
      doors: [
        door(0, 0.5, { width: 1.4, type: 'french' }),  // front door
        door(2, 0.3),   // to living
        door(2, 0.7),   // to dining
        door(3, 0.5),   // to study
      ],
      windows: [
        win(1, 0.5, { width: 0.8, height: 1.8, sillHeight: 0.5 }),
      ],
      furniture: [
        furniture('pendant-light', 5, 1.5, 0),
        furniture('plant-pot', 3.5, 0.5, 0),
        furniture('plant-pot', 6.5, 0.5, 0),
      ],
    }),

    // Living Room — large
    makeRoom('Living Room', 0, 3, 5, 8, {
      floorTexture: 'hardwood-oak',
      ceilingHeight: 3.2,
      doors: [
        door(0, 0.7),  // to entrance
      ],
      windows: [
        win(2, 0.3, { width: 1.8, height: 1.5 }),
        win(2, 0.7, { width: 1.8, height: 1.5 }),
        win(3, 0.5, { width: 1.5, height: 1.5 }),
      ],
      furniture: [
        furniture('sofa', 2.5, 5, 0),
        furniture('sofa', 1, 6, Math.PI / 2),
        furniture('armchair', 4, 6, -Math.PI / 4),
        furniture('coffee-table', 2.5, 6, 0),
        furniture('tv-unit', 2.5, 7.5, 0),
        furniture('bookshelf', 4.5, 4, Math.PI / 2),
        furniture('floor-lamp', 0.5, 3.5, 0),
        furniture('rug', 2.5, 5.8, 0),
        furniture('pendant-light', 2.5, 5.5, 0),
        furniture('plant-pot', 0.5, 7.5, 0),
      ],
    }),

    // Dining Room
    makeRoom('Dining Room', 5, 3, 10, 8, {
      floorTexture: 'hardwood-walnut',
      ceilingHeight: 3.2,
      doors: [
        door(0, 0.3),  // to entrance
        door(0, 0.8),  // to kitchen
      ],
      windows: [
        win(1, 0.3, { width: 1.5, height: 1.5 }),
        win(1, 0.7, { width: 1.5, height: 1.5 }),
        win(2, 0.5, { width: 2.0, height: 1.5 }),
      ],
      furniture: [
        furniture('dining-table', 7.5, 5.5, 0),
        furniture('dining-chair', 6.5, 5.0, 0),
        furniture('dining-chair', 8.5, 5.0, 0),
        furniture('dining-chair', 6.5, 6.0, Math.PI),
        furniture('dining-chair', 8.5, 6.0, Math.PI),
        furniture('dining-chair', 7.5, 4.5, Math.PI / 2),
        furniture('dining-chair', 7.5, 6.5, -Math.PI / 2),
        furniture('pendant-light', 7.5, 5.5, 0),
        furniture('plant-pot', 9.3, 3.5, 0),
      ],
    }),

    // Study
    makeRoom('Study', 0, 0, 3, 3, {
      floorTexture: 'hardwood-walnut',
      doors: [
        door(1, 0.5),  // to entrance
      ],
      windows: [
        win(0, 0.5, { width: 1.2 }),
        win(3, 0.5, { width: 1.0 }),
      ],
      furniture: [
        furniture('desk', 1.5, 0.5, 0),
        furniture('bookshelf', 0.4, 1.5, Math.PI / 2),
        furniture('armchair', 2.2, 2.0, -Math.PI / 3),
        furniture('floor-lamp', 2.5, 0.4, 0),
        furniture('table-lamp', 1.5, 0.5, 0),
        furniture('pendant-light', 1.5, 1.5, 0),
      ],
    }),

    // Kitchen (connected to dining)
    makeRoom('Kitchen', 7, 0, 10, 3, {
      floorTexture: 'tile-white',
      wallTexture: 'tile-subway',
      doors: [
        door(2, 0.6),  // to dining
      ],
      windows: [
        win(0, 0.5, { width: 1.5 }),
        win(1, 0.5, { width: 1.0 }),
      ],
      furniture: [
        furniture('countertop', 9.5, 0.4, 0),
        furniture('countertop', 9.5, 1.4, 0),
        furniture('kitchen-sink', 9.5, 2.2, 0),
        furniture('stove', 8.0, 0.4, 0),
        furniture('oven', 8.0, 0.4, 0),
        furniture('fridge', 7.5, 2.5, Math.PI),
        furniture('microwave', 8.5, 2.5, Math.PI),
        furniture('extractor-hood', 8.0, 0.4, 0),
        furniture('dishwasher', 9.0, 2.5, Math.PI),
        furniture('pendant-light', 8.5, 1.5, 0),
      ],
    }),
  ];
}

// ─── TEMPLATE: Doom-Style Dungeon Labyrinth ─────────────
// Massive sprawling level: corridors, chambers, arenas, dead ends
// Perfect for zombie survival — dark stone walls, torch lighting

export function createDungeonLabyrinth(): RoomData[] {
  const stoneWall = 'concrete-raw';
  const stoneFloor = 'concrete-raw';
  const darkFloor = 'tile-dark';

  return [
    // ══════ ENTRANCE ZONE ══════

    // Entry corridor (long narrow approach)
    makeRoom('Entry Corridor', 0, 0, 2.5, 8, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 3.5,
      doors: [
        door(0, 0.5, { width: 1.4 }),  // entrance from outside
        door(2, 0.5),                    // to gatehouse
      ],
      furniture: [
        furniture('downlight-single', 1.25, 2, 0),
        furniture('downlight-single', 1.25, 6, 0),
      ],
    }),

    // Gatehouse (first chamber)
    makeRoom('Gatehouse', 0, 8, 5, 13, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 4.0,
      doors: [
        door(0, 0.25),  // from entry corridor
        door(1, 0.5),   // east to corridor E1
        door(2, 0.5),   // south to great hall
        door(3, 0.5),   // west to guard room
      ],
      furniture: [
        furniture('pendant-light', 2.5, 10.5, 0),
        furniture('bookshelf', 4.3, 9, Math.PI / 2),
      ],
    }),

    // Guard Room (west of gatehouse)
    makeRoom('Guard Room', -5, 8, 0, 13, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 3.0,
      doors: [
        door(1, 0.5),  // to gatehouse
      ],
      windows: [
        win(3, 0.5, { width: 0.5, height: 0.5, sillHeight: 1.5, type: 'single' }),
      ],
      furniture: [
        furniture('desk', -2.5, 9, 0),
        furniture('bookshelf', -4.3, 10.5, Math.PI / 2),
        furniture('table-lamp', -2.5, 9, 0),
        furniture('downlight-single', -2.5, 10.5, 0),
      ],
    }),

    // ══════ EAST WING — CORRIDOR & CELLS ══════

    // East Corridor 1
    makeRoom('East Corridor', 5, 9, 8, 16, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 3.0,
      doors: [
        door(3, 0.28),  // to gatehouse
        door(1, 0.3),   // to cell 1
        door(1, 0.7),   // to cell 2
        door(2, 0.5),   // to torture chamber
      ],
      furniture: [
        furniture('downlight-single', 6.5, 11, 0),
        furniture('downlight-single', 6.5, 14, 0),
      ],
    }),

    // Prison Cell 1
    makeRoom('Cell 1', 8, 9, 11, 12, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.5,
      doors: [
        door(3, 0.5),  // to east corridor
      ],
      furniture: [
        furniture('downlight-single', 9.5, 10.5, 0),
      ],
    }),

    // Prison Cell 2
    makeRoom('Cell 2', 8, 13, 11, 16, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.5,
      doors: [
        door(3, 0.5),  // to east corridor
      ],
      furniture: [
        furniture('downlight-single', 9.5, 14.5, 0),
      ],
    }),

    // Torture Chamber
    makeRoom('Torture Chamber', 5, 16, 11, 21, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 3.5,
      doors: [
        door(0, 0.2),  // to east corridor
        door(3, 0.7),  // to connecting passage south
      ],
      furniture: [
        furniture('pendant-light', 8, 18.5, 0),
        furniture('downlight-single', 6, 17.5, 0),
        furniture('downlight-single', 10, 19.5, 0),
      ],
    }),

    // ══════ GREAT HALL (CENTRAL ARENA) ══════

    // Great Hall — large open arena for big fights
    makeRoom('Great Hall', -3, 13, 5, 22, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 5.0,
      doors: [
        door(0, 0.5),   // from gatehouse
        door(1, 0.3),   // to east corridor area (connecting passage)
        door(2, 0.3),   // south to catacombs
        door(2, 0.7),   // south to west passage
        door(3, 0.5),   // west to library
      ],
      furniture: [
        furniture('pendant-light', 1, 15, 0),
        furniture('pendant-light', 1, 19, 0),
        furniture('dining-table', 1, 17.5, 0),
        furniture('dining-chair', 0, 17, 0),
        furniture('dining-chair', 2, 17, Math.PI),
        furniture('dining-chair', 0, 18, 0),
        furniture('dining-chair', 2, 18, Math.PI),
        furniture('floor-lamp', -2, 14, 0),
        furniture('floor-lamp', 4, 14, 0),
        furniture('floor-lamp', -2, 21, 0),
        furniture('floor-lamp', 4, 21, 0),
      ],
    }),

    // ══════ WEST WING — LIBRARY & SECRET ROOM ══════

    // Library
    makeRoom('Library', -9, 13, -3, 19, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 4.0,
      doors: [
        door(1, 0.5),   // to great hall
        door(2, 0.8),   // to secret passage
      ],
      furniture: [
        furniture('bookshelf', -8.3, 14.5, Math.PI / 2),
        furniture('bookshelf', -8.3, 16.5, Math.PI / 2),
        furniture('bookshelf', -3.7, 14.5, -Math.PI / 2),
        furniture('bookshelf', -3.7, 16.5, -Math.PI / 2),
        furniture('desk', -6, 17.5, Math.PI),
        furniture('armchair', -6, 18, Math.PI),
        furniture('table-lamp', -6, 17.5, 0),
        furniture('pendant-light', -6, 16, 0),
      ],
    }),

    // Secret Passage
    makeRoom('Secret Passage', -7, 19, -4, 23, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.5,
      doors: [
        door(0, 0.6),   // to library
        door(2, 0.5),   // to treasure room
      ],
      furniture: [
        furniture('downlight-single', -5.5, 21, 0),
      ],
    }),

    // Treasure Room
    makeRoom('Treasure Room', -8, 23, -3, 27, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 3.0,
      doors: [
        door(0, 0.5),  // from secret passage
      ],
      furniture: [
        furniture('pendant-light', -5.5, 25, 0),
        furniture('floor-lamp', -7, 24, 0),
        furniture('floor-lamp', -4, 24, 0),
        furniture('coffee-table', -5.5, 25, 0),
      ],
    }),

    // ══════ SOUTH — CATACOMBS ══════

    // Catacomb Entry Corridor
    makeRoom('Catacomb Entry', -1, 22, 2, 28, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.8,
      doors: [
        door(0, 0.5),  // from great hall south
        door(2, 0.5),  // to crypt
        door(1, 0.5),  // to ossuary
      ],
      furniture: [
        furniture('downlight-single', 0.5, 24, 0),
        furniture('downlight-single', 0.5, 27, 0),
      ],
    }),

    // Ossuary (east of catacomb entry)
    makeRoom('Ossuary', 2, 24, 7, 28, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.5,
      doors: [
        door(3, 0.5),  // to catacomb entry
      ],
      furniture: [
        furniture('bookshelf', 6.3, 25.5, -Math.PI / 2),
        furniture('bookshelf', 6.3, 27, -Math.PI / 2),
        furniture('downlight-single', 4.5, 26, 0),
      ],
    }),

    // Crypt — large room
    makeRoom('Crypt', -3, 28, 4, 34, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 4.0,
      doors: [
        door(0, 0.4),   // from catacomb entry
        door(1, 0.5),   // to underground arena
        door(3, 0.5),   // to pit
      ],
      furniture: [
        furniture('pendant-light', 0.5, 31, 0),
        furniture('floor-lamp', -2, 29, 0),
        furniture('floor-lamp', 3, 29, 0),
        furniture('coffee-table', 0.5, 31, 0),
      ],
    }),

    // The Pit (west dead-end)
    makeRoom('The Pit', -7, 29, -3, 33, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 5.0,
      doors: [
        door(1, 0.5),  // to crypt
      ],
      furniture: [
        furniture('pendant-light', -5, 31, 0),
      ],
    }),

    // ══════ UNDERGROUND ARENA (BOSS ROOM) ══════

    // Underground Arena — massive room for final battles
    makeRoom('Underground Arena', 4, 28, 16, 38, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 6.0,
      doors: [
        door(3, 0.35),  // from crypt
        door(0, 0.3),   // to armory
        door(1, 0.5),   // to escape tunnel
      ],
      furniture: [
        furniture('pendant-light', 7, 31, 0),
        furniture('pendant-light', 13, 31, 0),
        furniture('pendant-light', 10, 35, 0),
        furniture('pendant-light', 7, 35, 0),
        furniture('pendant-light', 13, 35, 0),
        furniture('floor-lamp', 5, 29, 0),
        furniture('floor-lamp', 15, 29, 0),
        furniture('floor-lamp', 5, 37, 0),
        furniture('floor-lamp', 15, 37, 0),
      ],
    }),

    // Armory (north of arena)
    makeRoom('Armory', 7, 25, 12, 28, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 3.0,
      doors: [
        door(2, 0.5),  // to arena
      ],
      furniture: [
        furniture('bookshelf', 7.7, 26.5, Math.PI / 2),
        furniture('bookshelf', 11.3, 26.5, -Math.PI / 2),
        furniture('pendant-light', 9.5, 26.5, 0),
      ],
    }),

    // Escape Tunnel
    makeRoom('Escape Tunnel', 16, 31, 19, 38, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 2.5,
      doors: [
        door(3, 0.5),  // from arena
        door(2, 0.5),  // to surface exit
      ],
      furniture: [
        furniture('downlight-single', 17.5, 33, 0),
        furniture('downlight-single', 17.5, 36, 0),
      ],
    }),

    // Surface Exit
    makeRoom('Surface Exit', 15, 38, 20, 42, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 3.5,
      doors: [
        door(0, 0.5),   // from escape tunnel
        door(2, 0.5, { width: 1.4 }),  // exit to outside
      ],
      windows: [
        win(1, 0.5, { width: 1.0, height: 0.8, sillHeight: 1.5, type: 'single' }),
        win(3, 0.5, { width: 1.0, height: 0.8, sillHeight: 1.5, type: 'single' }),
      ],
      furniture: [
        furniture('pendant-light', 17.5, 40, 0),
      ],
    }),

    // ══════ WEST PASSAGE — CONNECTS GREAT HALL TO DEEP DUNGEON ══════

    // West Passage
    makeRoom('West Passage', -6, 19, -3, 29, {
      wallTexture: stoneWall, floorTexture: stoneFloor, ceilingHeight: 2.8,
      doors: [
        door(0, 0.5),  // from great hall south-west
        door(1, 0.8),  // to crypt area
        door(2, 0.5),  // to dungeon depths
      ],
      furniture: [
        furniture('downlight-single', -4.5, 22, 0),
        furniture('downlight-single', -4.5, 26, 0),
      ],
    }),

    // Dungeon Depths
    makeRoom('Dungeon Depths', -10, 29, -3, 35, {
      wallTexture: stoneWall, floorTexture: darkFloor, ceilingHeight: 3.5,
      doors: [
        door(0, 0.6),  // from west passage
        door(1, 0.5),  // connects toward crypt/pit
      ],
      furniture: [
        furniture('pendant-light', -6.5, 32, 0),
        furniture('floor-lamp', -9, 30, 0),
        furniture('floor-lamp', -4, 34, 0),
      ],
    }),
  ];
}

// ─── EXPORT TEMPLATE LIST ───────────────────────────────

export interface HouseTemplate {
  id: string;
  name: string;
  description: string;
  roomCount: number;
  generator: () => RoomData[];
}

export const HOUSE_TEMPLATES: HouseTemplate[] = [
  {
    id: 'modern-home',
    name: 'Modern Family Home',
    description: '6 rooms: Living, Kitchen, Dining, Hallway, Bathroom, Master Bedroom. All connected with doors.',
    roomCount: 6,
    generator: createModernHome,
  },
  {
    id: 'studio',
    name: 'Studio Apartment',
    description: '3 rooms: Open-plan studio with kitchenette and bathroom.',
    roomCount: 3,
    generator: createStudioApartment,
  },
  {
    id: 'luxury-villa',
    name: 'Luxury Villa',
    description: '5 rooms: Grand entrance, large living room, dining room, study, kitchen. 3.2m ceilings.',
    roomCount: 5,
    generator: createLuxuryVilla,
  },
  {
    id: 'dungeon-labyrinth',
    name: 'Doom Dungeon Labyrinth',
    description: '22 rooms: Massive dungeon with corridors, prison cells, great hall, catacombs, underground arena, escape tunnel. Built for zombie survival!',
    roomCount: 22,
    generator: createDungeonLabyrinth,
  },
];
