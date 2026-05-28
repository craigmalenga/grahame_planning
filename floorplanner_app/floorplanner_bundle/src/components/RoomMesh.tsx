import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { getTexture, loadCustomTexture } from '../utils/textures';
import { FurnitureModel } from './FurnitureModels';
import { LightFixtureModel } from './LightingModels';
import type { RoomData, DoorData, DoorStyle, WindowData, WallSegment } from '../types';

const LIGHT_FIXTURE_TYPES = new Set([
  'pendant-light', 'downlight-single', 'downlight-triple',
  'wall-uplight', 'wall-downlight', 'floor-lamp', 'table-lamp',
  'mirror-led', 'mirror-plain',
]);

interface RoomMeshProps {
  room: RoomData;
  roomIndex: number;
  allRooms: RoomData[];
}

// ─── SHARED WALL DETECTION ──────────────────────────────

function wallsOverlap(w1: WallSegment, w2: WallSegment, tol: number): boolean {
  const sameDir =
    Math.abs(w1.x1 - w2.x1) < tol && Math.abs(w1.y1 - w2.y1) < tol &&
    Math.abs(w1.x2 - w2.x2) < tol && Math.abs(w1.y2 - w2.y2) < tol;
  const revDir =
    Math.abs(w1.x1 - w2.x2) < tol && Math.abs(w1.y1 - w2.y2) < tol &&
    Math.abs(w1.x2 - w2.x1) < tol && Math.abs(w1.y2 - w2.y1) < tol;
  if (sameDir || revDir) return true;

  const dx1 = w1.x2 - w1.x1, dy1 = w1.y2 - w1.y1;
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  if (len1 < 0.01) return false;

  const nx = -dy1 / len1, ny = dx1 / len1;
  const dist1 = Math.abs(nx * (w2.x1 - w1.x1) + ny * (w2.y1 - w1.y1));
  const dist2 = Math.abs(nx * (w2.x2 - w1.x1) + ny * (w2.y2 - w1.y1));
  if (dist1 > tol || dist2 > tol) return false;

  const ux = dx1 / len1, uy = dy1 / len1;
  const proj2a = ux * (w2.x1 - w1.x1) + uy * (w2.y1 - w1.y1);
  const proj2b = ux * (w2.x2 - w1.x1) + uy * (w2.y2 - w1.y1);
  const min2 = Math.min(proj2a, proj2b);
  const max2 = Math.max(proj2a, proj2b);
  return max2 > tol && min2 < len1 - tol;
}

function findSharedWall(wall: WallSegment, roomIndex: number, allRooms: RoomData[]): {
  shared: boolean;
  otherRoomIndex: number;
  otherWallIndex: number;
  otherDoors: DoorData[];
  otherWindows: WindowData[];
} {
  const tol = 0.15;
  for (let ri = 0; ri < allRooms.length; ri++) {
    if (ri === roomIndex) continue;
    const other = allRooms[ri];
    for (let wi = 0; wi < other.walls.length; wi++) {
      if (wallsOverlap(wall, other.walls[wi], tol)) {
        return {
          shared: true,
          otherRoomIndex: ri,
          otherWallIndex: wi,
          otherDoors: (other.doors || []).filter(d => d.wallIndex === wi),
          otherWindows: (other.windows || []).filter(w => w.wallIndex === wi),
        };
      }
    }
  }
  return { shared: false, otherRoomIndex: -1, otherWallIndex: -1, otherDoors: [], otherWindows: [] };
}

function getWallInwardOffset(wall: WallSegment, roomCenter: { x: number; y: number }): [number, number] {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return [0, 0];
  const nx = -dy / len;
  const ny = dx / len;
  const wallCx = (wall.x1 + wall.x2) / 2;
  const wallCy = (wall.y1 + wall.y2) / 2;
  const dot = nx * (roomCenter.x - wallCx) + ny * (roomCenter.y - wallCy);
  const sign = dot >= 0 ? 1 : -1;
  const offset = 0.005;
  return [nx * sign * offset, ny * sign * offset];
}

export function RoomMesh({ room, roomIndex, allRooms }: RoomMeshProps) {
  const { selectedRoomIndex, setSelectedRoomIndex, customTextures, showContextMenu3D, editMode3D } = useStore();
  const isSelected = selectedRoomIndex === roomIndex;
  const height = room.ceilingHeight || 2.7;

  const resolveTexture = (texId: string, tileSize: number) => {
    if (texId.startsWith('custom-')) {
      const custom = customTextures.find(t => t.id === texId);
      if (custom) return loadCustomTexture(texId, custom.imageUrl, tileSize);
    }
    return getTexture(texId, tileSize);
  };

  const wallTex = useMemo(() => resolveTexture(room.wallTexture || 'plaster-white', 2), [room.wallTexture, customTextures]);
  const floorTex = useMemo(() => resolveTexture(room.floorTexture || 'hardwood-oak', 1), [room.floorTexture, customTextures]);
  const ceilingTex = useMemo(() => resolveTexture(room.ceilingTexture || 'plaster-white', 2), [room.ceilingTexture, customTextures]);

  const wallMeshes = useMemo(() => {
    return room.walls.map((wall, i) => {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const thickness = wall.thickness || 0.15;
      const centerX = (wall.x1 + wall.x2) / 2;
      const centerZ = (wall.y1 + wall.y2) / 2;

      const shared = findSharedWall(wall, roomIndex, allRooms);
      if (shared.shared && shared.otherRoomIndex < roomIndex) return null;

      let doorsOnWall = (room.doors || []).filter(d => d.wallIndex === i);
      let windowsOnWall = (room.windows || []).filter(w => w.wallIndex === i);

      if (shared.shared && shared.otherRoomIndex > roomIndex) {
        const otherWall = allRooms[shared.otherRoomIndex].walls[shared.otherWallIndex];
        const isReversed =
          Math.abs(wall.x1 - otherWall.x2) < 0.15 &&
          Math.abs(wall.y1 - otherWall.y2) < 0.15;
        doorsOnWall = [...doorsOnWall, ...shared.otherDoors.map(d => ({
          ...d, position: isReversed ? 1 - d.position : d.position,
        }))];
        windowsOnWall = [...windowsOnWall, ...shared.otherWindows.map(w => ({
          ...w, position: isReversed ? 1 - w.position : w.position,
        }))];
      }

      const [offsetX, offsetZ] = getWallInwardOffset(wall, room.center);

      return {
        key: i,
        position: [centerX + offsetX, 0, centerZ + offsetZ] as [number, number, number],
        rotation: [0, -angle, 0] as [number, number, number],
        length,
        // Per-wall height override (Craig: vary height wall-by-wall). Falls
        // back to the room/floor default when not set.
        height: (wall.height ?? height),
        thickness,
        doors: doorsOnWall, windows: windowsOnWall,
        wall, isShared: shared.shared,
      };
    }).filter(Boolean);
  }, [room.walls, height, room.doors, room.windows, roomIndex, allRooms]);

  const { minX, minY, maxX, maxY } = room.bounds;
  const roomWidth = maxX - minX;
  const roomDepth = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cz = (minY + maxY) / 2;

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedRoomIndex(isSelected ? null : roomIndex);
  };

  const handleContextMenu = (e: any, objectType: string, objectId: string) => {
    if (!editMode3D) return;
    e.stopPropagation();
    // Get screen coordinates from the native event
    const nativeEvent = e.nativeEvent || e;
    showContextMenu3D({
      x: nativeEvent.clientX || nativeEvent.pageX || 0,
      y: nativeEvent.clientY || nativeEvent.pageY || 0,
      objectType,
      objectId,
      roomIndex,
    });
  };

  return (
    <group onClick={handleClick}>
      {wallMeshes.map((wm) => wm && (
        <WallWithOpenings
          key={wm.key}
          position={wm.position}
          rotation={wm.rotation}
          length={wm.length}
          height={wm.height}
          thickness={wm.thickness}
          doors={wm.doors}
          windows={wm.windows}
          texture={wm.wall.texture ? resolveTexture(wm.wall.texture, 2) : wallTex}
          isSelected={isSelected}
          roomIndex={roomIndex}
          wallIndex={wm.key}
          onContextMenu={handleContextMenu}
          wall={wm.wall}
        />
      ))}

      {room.showFloor && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[cx, 0.002, cz]}
          receiveShadow
          onContextMenu={(e: any) => handleContextMenu(e, 'floor', String(roomIndex))}
        >
          <planeGeometry args={[roomWidth, roomDepth]} />
          <meshStandardMaterial map={floorTex} roughness={0.6} metalness={0.1} />
        </mesh>
      )}

      {room.showCeiling && (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[cx, height, cz]}
          onContextMenu={(e: any) => handleContextMenu(e, 'ceiling', String(roomIndex))}
        >
          <planeGeometry args={[roomWidth, roomDepth]} />
          <meshStandardMaterial map={ceilingTex} roughness={0.9} metalness={0} />
        </mesh>
      )}

      {(room.furniture || []).map(item => (
        <group
          key={item.id}
          onContextMenu={(e: any) => handleContextMenu(e, 'furniture', item.id)}
        >
          <FurnitureModel item={item} roomIndex={roomIndex} />
        </group>
      ))}

      {(room.furniture || []).filter(f => LIGHT_FIXTURE_TYPES.has(f.type)).map(item => (
        <LightFixtureModel key={`light-${item.id}`} item={item} ceilingHeight={height} />
      ))}

      {isSelected && (
        <mesh position={[cx, 0.01, cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial color="#4c6ef5" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── WALL WITH OPENINGS ─────────────────────────────────

interface WallWithOpeningsProps {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  height: number;
  thickness: number;
  doors: DoorData[];
  windows: WindowData[];
  texture: THREE.Texture;
  isSelected: boolean;
  roomIndex: number;
  wallIndex?: number;
  onContextMenu?: (e: any, objectType: string, objectId: string) => void;
}

function WallWithOpenings({
  position, rotation, length, height, thickness,
  doors, windows, texture, isSelected, roomIndex, wallIndex, onContextMenu, wall,
}: WallWithOpeningsProps & { wall?: WallSegment }) {
  const { selectedDoorId, setSelectedDoorId, selectedWindowId, setSelectedWindowId } = useStore();

  const subSegs = wall?.subSegments;

  const wallGeometry = useMemo(() => {
    // If wall has sub-segments with gaps, create separate shapes for solid sections
    const hasGaps = subSegs && subSegs.some(s => s.isGap);

    if (hasGaps && subSegs) {
      // Build geometry from multiple solid segments
      const geometries: THREE.BufferGeometry[] = [];
      for (const seg of subSegs) {
        if (seg.isGap) continue;
        const segStart = -length / 2 + seg.startFraction * length;
        const segEnd = -length / 2 + seg.endFraction * length;
        const segLen = segEnd - segStart;
        if (segLen < 0.01) continue;

        const shape = new THREE.Shape();
        shape.moveTo(segStart, 0);
        shape.lineTo(segEnd, 0);
        shape.lineTo(segEnd, height);
        shape.lineTo(segStart, height);
        shape.closePath();

        // Cut door/window holes that fall within this segment
        for (const door of doors) {
          const doorX = -length / 2 + door.position * length;
          const halfW = door.width / 2;
          if (doorX + halfW > segStart && doorX - halfW < segEnd) {
            const hole = new THREE.Path();
            hole.moveTo(Math.max(segStart, doorX - halfW), 0);
            hole.lineTo(Math.min(segEnd, doorX + halfW), 0);
            hole.lineTo(Math.min(segEnd, doorX + halfW), door.height);
            hole.lineTo(Math.max(segStart, doorX - halfW), door.height);
            hole.closePath();
            shape.holes.push(hole);
          }
        }
        for (const win of windows) {
          const winX = -length / 2 + win.position * length;
          const halfW = win.width / 2;
          if (winX + halfW > segStart && winX - halfW < segEnd) {
            const hole = new THREE.Path();
            hole.moveTo(Math.max(segStart, winX - halfW), win.sillHeight);
            hole.lineTo(Math.min(segEnd, winX + halfW), win.sillHeight);
            hole.lineTo(Math.min(segEnd, winX + halfW), win.sillHeight + win.height);
            hole.lineTo(Math.max(segStart, winX - halfW), win.sillHeight + win.height);
            hole.closePath();
            shape.holes.push(hole);
          }
        }

        const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
        geo.translate(0, 0, -thickness / 2);
        geometries.push(geo);
      }

      if (geometries.length === 0) return new THREE.BufferGeometry();
      if (geometries.length === 1) return geometries[0];

      // Merge geometries
      const merged = new THREE.BufferGeometry();
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      for (const g of geometries) {
        const pos = g.getAttribute('position');
        const norm = g.getAttribute('normal');
        const uv = g.getAttribute('uv');
        for (let i = 0; i < pos.count; i++) {
          positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
          normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
          if (uv) uvs.push(uv.getX(i), uv.getY(i));
        }
      }
      merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      if (uvs.length > 0) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      return merged;
    }

    // Standard full wall
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(-length / 2, height);
    shape.closePath();

    for (const door of doors) {
      const doorX = -length / 2 + door.position * length;
      const halfW = door.width / 2;
      const hole = new THREE.Path();
      hole.moveTo(doorX - halfW, 0);
      hole.lineTo(doorX + halfW, 0);
      hole.lineTo(doorX + halfW, door.height);
      hole.lineTo(doorX - halfW, door.height);
      hole.closePath();
      shape.holes.push(hole);
    }

    for (const win of windows) {
      const winX = -length / 2 + win.position * length;
      const halfW = win.width / 2;
      const hole = new THREE.Path();
      hole.moveTo(winX - halfW, win.sillHeight);
      hole.lineTo(winX + halfW, win.sillHeight);
      hole.lineTo(winX + halfW, win.sillHeight + win.height);
      hole.lineTo(winX - halfW, win.sillHeight + win.height);
      hole.closePath();
      shape.holes.push(hole);
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -thickness / 2);
    return geo;
  }, [length, height, thickness, doors, windows, subSegs]);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        geometry={wallGeometry}
        castShadow receiveShadow renderOrder={roomIndex}
        onContextMenu={(e: any) => onContextMenu?.(e, 'wall', String(wallIndex ?? 0))}
      >
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.05}
          color={isSelected ? '#e8e0ff' : '#ffffff'}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1 + roomIndex}
          polygonOffsetUnits={4 + roomIndex * 4}
        />
      </mesh>

      {doors.map((door) => (
        <InteractiveDoor
          key={door.id}
          door={door}
          length={length}
          thickness={thickness}
          isSelected={selectedDoorId === door.id}
          onSelect={() => setSelectedDoorId(selectedDoorId === door.id ? null : door.id)}
        />
      ))}

      {windows.map((win) => (
        <InteractiveWindow
          key={win.id}
          win={win}
          length={length}
          thickness={thickness}
          isSelected={selectedWindowId === win.id}
          onSelect={() => setSelectedWindowId(selectedWindowId === win.id ? null : win.id)}
        />
      ))}
    </group>
  );
}

// ─── INTERACTIVE DOOR ───────────────────────────────────
// Frame pieces are INSET into the door opening (not sitting on the wall surface)
// so they cannot z-fight with the wall face. All frame geometry is recessed
// inside the opening by 0.01m on each side.

function getDoorColors(style?: DoorStyle, isSelected?: boolean): { panel: string; frame: string; detail: string; isGlassStyle: boolean; opacity: number; metalness: number } {
  // Get base colors first, then apply selection tint — preserving glass transparency
  const base = (() => { switch (style) {
    case 'wood-dark': return { panel: '#5C3A1E', frame: '#4A2E16', detail: '#6B4A2A', isGlassStyle: false, opacity: 1, metalness: 0.05 };
    case 'wood-white': return { panel: '#F0EDE8', frame: '#D8D0C8', detail: '#E8E0D8', isGlassStyle: false, opacity: 1, metalness: 0.05 };
    case 'painted-white': return { panel: '#FAFAFA', frame: '#E0E0E0', detail: '#F0F0F0', isGlassStyle: false, opacity: 1, metalness: 0 };
    case 'painted-blue': return { panel: '#4A7AB5', frame: '#3A6090', detail: '#5A8AC5', isGlassStyle: false, opacity: 1, metalness: 0 };
    case 'painted-red': return { panel: '#A63030', frame: '#802020', detail: '#B84040', isGlassStyle: false, opacity: 1, metalness: 0 };
    case 'painted-green': return { panel: '#3A7A4A', frame: '#2A5A3A', detail: '#4A8A5A', isGlassStyle: false, opacity: 1, metalness: 0 };
    case 'glass-clear': return { panel: '#B0D8F0', frame: '#C0C0C0', detail: '#B0D8F0', isGlassStyle: true, opacity: 0.15, metalness: 0 };
    case 'glass-frosted': return { panel: '#D8E8F0', frame: '#C0C0C0', detail: '#D8E8F0', isGlassStyle: true, opacity: 0.4, metalness: 0 };
    case 'metal-steel': return { panel: '#B8B8B8', frame: '#999999', detail: '#C8C8C8', isGlassStyle: false, opacity: 1, metalness: 0.8 };
    case 'metal-black': return { panel: '#2A2A2A', frame: '#1A1A1A', detail: '#3A3A3A', isGlassStyle: false, opacity: 1, metalness: 0.6 };
    case 'wood-natural':
    default: return { panel: '#A0845C', frame: '#6B5B45', detail: '#B89868', isGlassStyle: false, opacity: 1, metalness: 0.1 };
  } })();
  if (isSelected) {
    return {
      ...base,
      frame: '#4c6ef5',
      // For glass doors, keep glass transparency but tint the panel
      panel: base.isGlassStyle ? '#a0c0ff' : '#6c8cff',
      detail: '#8cacff',
      opacity: base.isGlassStyle ? Math.max(base.opacity, 0.25) : 1,
    };
  }
  return base;
}

function InteractiveDoor({ door, length, thickness, isSelected, onSelect }: {
  door: DoorData; length: number; thickness: number;
  isSelected: boolean; onSelect: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<THREE.Group>(null);
  const targetAngle = isOpen ? -Math.PI / 2 : 0;
  const currentAngle = useRef(0);

  useFrame((_, delta) => {
    if (!panelRef.current) return;
    currentAngle.current += (targetAngle - currentAngle.current) * Math.min(1, 3 * delta);
    panelRef.current.rotation.y = currentAngle.current;
  });

  const doorX = -length / 2 + door.position * length;
  const colors = getDoorColors(door.style, isSelected);
  const isGlass = door.type === 'glass' || colors.isGlassStyle;
  const halfW = door.width / 2;
  const frameW = 0.035;
  const frameColor = colors.frame;
  const frameDepth = thickness - 0.02;

  return (
    <group>
      {/* Door frame — INSET into the wall opening, not flush on surface.
          Frame sits 0.01m inside each wall face so no z-fight possible. */}
      {/* Top lintel */}
      <mesh position={[doorX, door.height + frameW / 2 - 0.005, 0]}>
        <boxGeometry args={[door.width - 0.01, frameW, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Left jamb */}
      <mesh position={[doorX - halfW + frameW / 2 + 0.005, door.height / 2, 0]}>
        <boxGeometry args={[frameW, door.height - 0.01, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[doorX + halfW - frameW / 2 - 0.005, door.height / 2, 0]}>
        <boxGeometry args={[frameW, door.height - 0.01, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>

      {/* Door panel — pivots on left jamb inner edge */}
      <group
        ref={panelRef}
        position={[doorX - halfW + frameW + 0.01, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          onSelect();
        }}
      >
        {/* The door panel itself */}
        <mesh position={[(door.width - frameW * 2 - 0.02) / 2, door.height / 2, 0]} castShadow>
          <boxGeometry args={[door.width - frameW * 2 - 0.02, door.height - frameW - 0.01, 0.04]} />
          {isGlass ? (
            <meshStandardMaterial
              color={colors.panel}
              transparent opacity={colors.opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          ) : (
            <meshStandardMaterial
              color={colors.panel}
              roughness={0.4} metalness={colors.metalness}
            />
          )}
        </mesh>
        {/* Panel inset details */}
        {!isGlass && (
          <>
            <mesh position={[(door.width - frameW * 2 - 0.02) / 2, door.height * 0.3, 0.025]}>
              <boxGeometry args={[door.width * 0.55, door.height * 0.28, 0.005]} />
              <meshStandardMaterial color={colors.detail} roughness={0.5} />
            </mesh>
            <mesh position={[(door.width - frameW * 2 - 0.02) / 2, door.height * 0.7, 0.025]}>
              <boxGeometry args={[door.width * 0.55, door.height * 0.28, 0.005]} />
              <meshStandardMaterial color={colors.detail} roughness={0.5} />
            </mesh>
          </>
        )}
        {/* Handle */}
        <mesh position={[door.width - frameW * 2 - 0.1, door.height * 0.45, 0.04]} castShadow>
          <boxGeometry args={[0.03, 0.1, 0.05]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ─── INTERACTIVE WINDOW ─────────────────────────────────
// Frame is INSET into the wall opening to avoid z-fighting.

function InteractiveWindow({ win, length, thickness, isSelected, onSelect }: {
  win: WindowData; length: number; thickness: number;
  isSelected: boolean; onSelect: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const paneRef = useRef<THREE.Group>(null);
  const targetAngle = isOpen ? -Math.PI / 4 : 0;
  const currentAngle = useRef(0);

  useFrame((_, delta) => {
    if (!paneRef.current) return;
    currentAngle.current += (targetAngle - currentAngle.current) * Math.min(1, 3 * delta);
    paneRef.current.rotation.y = currentAngle.current;
  });

  const winX = -length / 2 + win.position * length;
  const halfW = win.width / 2;
  const frameW = 0.035;
  const frameColor = isSelected ? '#4c6ef5' : '#E8E0D8';
  const frameDepth = thickness - 0.02;

  return (
    <group>
      {/* Window frame — INSET into opening (0.005m inside each wall face).
          No geometry touches the wall extrusion surface. */}
      {/* Top */}
      <mesh position={[winX, win.sillHeight + win.height - frameW / 2 - 0.005, 0]}>
        <boxGeometry args={[win.width - 0.01, frameW, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Bottom / sill */}
      <mesh position={[winX, win.sillHeight + frameW / 2 + 0.005, 0]}>
        <boxGeometry args={[win.width - 0.01, frameW, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Left */}
      <mesh position={[winX - halfW + frameW / 2 + 0.005, win.sillHeight + win.height / 2, 0]}>
        <boxGeometry args={[frameW, win.height - 0.01, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Right */}
      <mesh position={[winX + halfW - frameW / 2 - 0.005, win.sillHeight + win.height / 2, 0]}>
        <boxGeometry args={[frameW, win.height - 0.01, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>

      {/* Outer sill ledge */}
      <mesh position={[winX, win.sillHeight, thickness / 2 + 0.02]} castShadow>
        <boxGeometry args={[win.width + 0.08, 0.03, 0.06]} />
        <meshStandardMaterial color="#D8D0C8" roughness={0.5} />
      </mesh>

      {/* Glass pane — pivots on left edge, click to open/close */}
      <group
        ref={paneRef}
        position={[winX - halfW + frameW + 0.01, win.sillHeight + frameW + 0.01, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          onSelect();
        }}
      >
        {/* Clear glass — very transparent, see-through */}
        <mesh position={[(win.width - frameW * 2 - 0.02) / 2, (win.height - frameW * 2 - 0.02) / 2, 0]}>
          <planeGeometry args={[win.width - frameW * 2 - 0.02, win.height - frameW * 2 - 0.02]} />
          <meshStandardMaterial
            color="#D0E8F8"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Cross bars for double windows */}
        {win.type === 'double' && (
          <>
            <mesh position={[(win.width - frameW * 2 - 0.02) / 2, (win.height - frameW * 2) / 2, 0.003]}>
              <boxGeometry args={[0.018, win.height - frameW * 2 - 0.06, 0.01]} />
              <meshStandardMaterial color="#E8E0D8" roughness={0.4} />
            </mesh>
            <mesh position={[(win.width - frameW * 2 - 0.02) / 2, (win.height - frameW * 2) / 2, 0.003]}>
              <boxGeometry args={[win.width - frameW * 2 - 0.06, 0.018, 0.01]} />
              <meshStandardMaterial color="#E8E0D8" roughness={0.4} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
