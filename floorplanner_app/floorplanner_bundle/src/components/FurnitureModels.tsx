import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { FurnitureType, FurnitureItem } from '../types';
import { getCatalogItem } from '../utils/furnitureCatalog';

interface FurnitureModelProps {
  item: FurnitureItem;
  roomIndex: number;
}

const LIGHT_TYPES = new Set([
  'pendant-light', 'downlight-single', 'downlight-triple',
  'wall-uplight', 'wall-downlight', 'floor-lamp', 'table-lamp',
  'mirror-led', 'mirror-plain',
]);

export function FurnitureModel({ item, roomIndex }: FurnitureModelProps) {
  // Lighting/mirrors are rendered by LightingModels.tsx
  if (LIGHT_TYPES.has(item.type)) return null;

  const catalog = getCatalogItem(item.type);
  const w = catalog.defaultWidth * item.scaleX;
  const d = catalog.defaultDepth * item.scaleY;
  const h = catalog.defaultHeight;

  return (
    <group position={[item.x, 0, item.y]} rotation={[0, item.rotation, 0]}>
      {renderModel(item.type, w, d, h, item.color)}
    </group>
  );
}

function renderModel(type: FurnitureType, w: number, d: number, h: number, color?: string) {
  switch (type) {
    case 'bathtub': return <BathtubModel w={w} d={d} h={h} />;
    case 'shower': return <ShowerModel w={w} d={d} h={h} />;
    case 'toilet': return <ToiletModel w={w} d={d} h={h} />;
    case 'bathroom-sink': return <BathroomSinkModel w={w} d={d} h={h} />;
    case 'kitchen-sink': return <KitchenSinkModel w={w} d={d} h={h} />;
    case 'countertop': return <CountertopModel w={w} d={d} h={h} />;
    case 'stove': return <StoveModel w={w} d={d} h={h} />;
    case 'fridge': return <FridgeModel w={w} d={d} h={h} />;
    case 'oven': return <OvenModel w={w} d={d} h={h} />;
    case 'microwave': return <MicrowaveModel w={w} d={d} h={h} />;
    case 'dishwasher': return <DishwasherModel w={w} d={d} h={h} />;
    case 'extractor-hood': return <ExtractorHoodModel w={w} d={d} h={h} />;
    case 'sofa': return <SofaModel w={w} d={d} h={h} color={color} />;
    case 'armchair': return <ArmchairModel w={w} d={d} h={h} color={color} />;
    case 'coffee-table': return <CoffeeTableModel w={w} d={d} h={h} />;
    case 'tv-unit': return <TVUnitModel w={w} d={d} h={h} />;
    case 'bookshelf': return <BookshelfModel w={w} d={d} h={h} />;
    case 'bed-single':
    case 'bed-double': return <BedModel w={w} d={d} h={h} />;
    case 'wardrobe': return <WardrobeModel w={w} d={d} h={h} />;
    case 'nightstand': return <NightstandModel w={w} d={d} h={h} />;
    case 'desk': return <DeskModel w={w} d={d} h={h} />;
    case 'dresser': return <DresserModel w={w} d={d} h={h} />;
    case 'dining-table': return <DiningTableModel w={w} d={d} h={h} />;
    case 'dining-chair': return <DiningChairModel w={w} d={d} h={h} />;
    case 'rug': return <RugModel w={w} d={d} h={h} />;
    case 'plant-pot': return <PlantPotModel w={w} d={d} h={h} />;
    case 'staircase-straight': return <StraightStaircaseModel w={w} d={d} h={h} />;
    case 'staircase-spiral': return <SpiralStaircaseModel w={w} d={d} h={h} />;
    default: return <FallbackModel w={w} d={d} h={h} />;
  }
}

// ─── BATHROOM ───────────────────────────────────────────

function BathtubModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Outer tub body — sits on floor */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Inner basin recess */}
      <mesh position={[0, h - 0.03, 0]}>
        <boxGeometry args={[w * 0.88, 0.06, d * 0.82]} />
        <meshStandardMaterial color="#E8F4FD" roughness={0.1} metalness={0.05} />
      </mesh>
      {/* Rim — slightly wider at top */}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.05} />
      </mesh>
      {/* Faucet post */}
      <mesh position={[w * 0.35, h + 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Faucet spout */}
      <mesh position={[w * 0.35, h + 0.2, -0.04]} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.08]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Drain */}
      <mesh position={[w * 0.15, h - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color="#808080" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ShowerModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Base tray — on floor */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.2} />
      </mesh>
      {/* Glass wall right */}
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[0.01, h, d]} />
        <meshPhysicalMaterial color="#E8F4FD" transparent opacity={0.15} roughness={0} transmission={0.85} depthWrite={false} />
      </mesh>
      {/* Glass wall back */}
      <mesh position={[0, h / 2, d / 2]}>
        <boxGeometry args={[w, h, 0.01]} />
        <meshPhysicalMaterial color="#E8F4FD" transparent opacity={0.15} roughness={0} transmission={0.85} depthWrite={false} />
      </mesh>
      {/* Glass door */}
      <mesh position={[-w / 2 + 0.3, h / 2, -d / 2]}>
        <boxGeometry args={[0.6, h, 0.01]} />
        <meshPhysicalMaterial color="#D0E8F5" transparent opacity={0.2} roughness={0} transmission={0.7} depthWrite={false} />
      </mesh>
      {/* Shower rail */}
      <mesh position={[0, h * 0.5, d / 2 - 0.05]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, h * 0.7, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Shower head */}
      <mesh position={[0, h * 0.85, d / 2 - 0.12]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.04, 0.03, 12]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Drain */}
      <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ToiletModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Bowl — bottom on floor */}
      <mesh position={[0, h * 0.4, d * 0.05]} castShadow>
        <cylinderGeometry args={[w * 0.45, w * 0.4, h * 0.8, 16]} />
        <meshStandardMaterial color="#F8F8F8" roughness={0.15} metalness={0.05} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, h * 0.82, d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.85, 0.04, d * 0.7]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, h * 0.65, -d * 0.3]} castShadow>
        <boxGeometry args={[w * 0.75, h * 0.55, d * 0.25]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.15} metalness={0.05} />
      </mesh>
      {/* Flush button */}
      <mesh position={[0, h * 0.93, -d * 0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BathroomSinkModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Pedestal — from floor up */}
      <mesh position={[0, h * 0.35, 0]} castShadow>
        <cylinderGeometry args={[w * 0.18, w * 0.22, h * 0.7, 12]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.15} />
      </mesh>
      {/* Basin top */}
      <mesh position={[0, h * 0.78, 0]} castShadow>
        <cylinderGeometry args={[w * 0.45, w * 0.38, h * 0.15, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>
      {/* Inner bowl */}
      <mesh position={[0, h * 0.83, 0]}>
        <cylinderGeometry args={[w * 0.3, w * 0.22, h * 0.08, 16]} />
        <meshStandardMaterial color="#E8F0F5" roughness={0.05} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, h * 0.88, -d * 0.25]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.14, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, h * 0.95, -d * 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.02, d * 0.2]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── KITCHEN ────────────────────────────────────────────

function KitchenSinkModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Cabinet body — from floor */}
      <mesh position={[0, h * 0.4, 0]} castShadow>
        <boxGeometry args={[w, h * 0.8, d]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.6} />
      </mesh>
      {/* Countertop surface */}
      <mesh position={[0, h * 0.82, 0]} castShadow>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color="#D0D0D0" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Sink basin recessed */}
      <mesh position={[0, h * 0.78, 0]}>
        <boxGeometry args={[w * 0.6, 0.1, d * 0.45]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, h * 0.84 + 0.1, -d * 0.3]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, h * 0.84 + 0.2, -d * 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.02, d * 0.3]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Cabinet doors */}
      <mesh position={[-w * 0.15, h * 0.4, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.42, h * 0.72]} />
        <meshStandardMaterial color="#D8CFC0" roughness={0.7} />
      </mesh>
      <mesh position={[w * 0.15, h * 0.4, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.42, h * 0.72]} />
        <meshStandardMaterial color="#D8CFC0" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CountertopModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h * 0.4, 0]} castShadow>
        <boxGeometry args={[w, h * 0.8, d]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.6} />
      </mesh>
      <mesh position={[0, h * 0.82, 0]} castShadow>
        <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
        <meshStandardMaterial color="#808080" roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh position={[0, h * 0.5, d / 2 + 0.015]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.03]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function StoveModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h * 0.45, 0]} castShadow>
        <boxGeometry args={[w, h * 0.9, d]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Burners */}
      {[[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, h * 0.91, bz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.06, 16]} />
          <meshStandardMaterial color="#404040" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Knobs */}
      {[-0.15, -0.05, 0.05, 0.15].map((kx, i) => (
        <mesh key={i} position={[kx, h * 0.7, d / 2 + 0.01]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
          <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function FridgeModel({ w, d, h }: { w: number; d: number; h: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);
  const targetAngle = isOpen ? Math.PI / 2 : 0;

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    currentAngle.current += (targetAngle - currentAngle.current) * Math.min(1, 3 * delta);
    doorRef.current.rotation.y = currentAngle.current;
  });

  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Interior (visible when open) */}
      <mesh position={[0, h * 0.35, 0.01]}>
        <boxGeometry args={[w - 0.04, h * 0.55, d - 0.04]} />
        <meshStandardMaterial color="#F0F5FF" roughness={0.5} />
      </mesh>
      {/* Interior light */}
      {isOpen && (
        <pointLight position={[0, h * 0.5, d * 0.2]} color="#FFF8E0" intensity={0.3} distance={1.5} decay={2} />
      )}
      {/* Freezer door (top, static) */}
      <mesh position={[0, h * 0.8, d / 2]} castShadow>
        <boxGeometry args={[w - 0.01, h * 0.35, 0.03]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Fridge door — pivots on right edge */}
      <group
        ref={doorRef}
        position={[w / 2 - 0.01, 0, d / 2]}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <mesh position={[-(w / 2 - 0.01), h * 0.32, 0]} castShadow>
          <boxGeometry args={[w - 0.01, h * 0.55, 0.03]} />
          <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.15} />
        </mesh>
        {/* Handle */}
        <mesh position={[-(w - 0.15), h * 0.32, 0.03]} castShadow>
          <boxGeometry args={[0.02, 0.18, 0.03]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* Freezer handle */}
      <mesh position={[w * 0.35, h * 0.8, d / 2 + 0.03]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.03]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function OvenModel({ w, d, h }: { w: number; d: number; h: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);
  const targetAngle = isOpen ? -Math.PI / 3 : 0;

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    currentAngle.current += (targetAngle - currentAngle.current) * Math.min(1, 3 * delta);
    doorRef.current.rotation.x = currentAngle.current;
  });

  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Glass window */}
      <mesh position={[0, h * 0.5, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.7, h * 0.5]} />
        <meshPhysicalMaterial color="#1A1A1A" transparent opacity={0.6} roughness={0.05} metalness={0.3} />
      </mesh>
      {/* Door — pivots at bottom */}
      <group
        ref={doorRef}
        position={[0, h * 0.05, d / 2]}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <mesh position={[0, h * 0.02, 0]} castShadow>
          <boxGeometry args={[w - 0.02, 0.04, 0.02]} />
          <meshStandardMaterial color="#3A3A3A" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
      {/* Handle */}
      <mesh position={[0, h * 0.88, d / 2 + 0.02]} castShadow>
        <boxGeometry args={[w * 0.5, 0.02, 0.03]} />
        <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Temperature knob */}
      <mesh position={[-w * 0.25, h * 0.92, d / 2 + 0.01]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
        <meshStandardMaterial color="#606060" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function MicrowaveModel({ w, d, h }: { w: number; d: number; h: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);
  const targetAngle = isOpen ? -Math.PI / 2 : 0;

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    currentAngle.current += (targetAngle - currentAngle.current) * Math.min(1, 3 * delta);
    doorRef.current.rotation.y = currentAngle.current;
  });

  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Door — pivots on left */}
      <group
        ref={doorRef}
        position={[-w / 2 + 0.01, 0, d / 2]}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <mesh position={[w * 0.3, h / 2, 0]} castShadow>
          <boxGeometry args={[w * 0.6, h - 0.02, 0.02]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.1} metalness={0.3} />
        </mesh>
        {/* Glass window */}
        <mesh position={[w * 0.3, h / 2, 0.011]}>
          <planeGeometry args={[w * 0.45, h * 0.6]} />
          <meshPhysicalMaterial color="#0A0A2A" transparent opacity={0.4} roughness={0.05} />
        </mesh>
      </group>
      {/* Control panel (right side) */}
      <mesh position={[w * 0.38, h / 2, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.2, h * 0.7]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.2} />
      </mesh>
      {/* Buttons */}
      {[0.3, 0.4, 0.5, 0.6, 0.7].map((by, i) => (
        <mesh key={i} position={[w * 0.38, h * by, d / 2 + 0.005]}>
          <boxGeometry args={[0.03, 0.02, 0.005]} />
          <meshStandardMaterial color="#404040" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function DishwasherModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, h * 0.4, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.9, h * 0.7]} />
        <meshStandardMaterial color="#D0D0D0" roughness={0.4} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, h * 0.85, d / 2 + 0.02]} castShadow>
        <boxGeometry args={[w * 0.6, 0.02, 0.03]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Control strip */}
      <mesh position={[0, h * 0.92, d / 2 + 0.003]}>
        <planeGeometry args={[w * 0.8, 0.04]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.2} />
      </mesh>
    </group>
  );
}

function ExtractorHoodModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Hood body — mounted at ~1.5m */}
      <mesh position={[0, 1.5 + h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0, 1.5 + h + 0.3, -d * 0.2]} castShadow>
        <boxGeometry args={[w * 0.4, 0.6, d * 0.4]} />
        <meshStandardMaterial color="#B0B0B0" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Filter grille */}
      <mesh position={[0, 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.8, d * 0.7]} />
        <meshStandardMaterial color="#808080" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ─── LIVING ─────────────────────────────────────────────

function SofaModel({ w, d, h, color }: { w: number; d: number; h: number; color?: string }) {
  const c = color || '#6B7B8D';
  return (
    <group>
      {/* Base/seat — bottom on floor (legs lift it slightly) */}
      {/* Legs */}
      {[[-w/2+0.08, d/2-0.08], [w/2-0.08, d/2-0.08], [-w/2+0.08, -d/2+0.08], [w/2-0.08, -d/2+0.08]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.04, lz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
          <meshStandardMaterial color="#4A3728" roughness={0.6} />
        </mesh>
      ))}
      {/* Seat cushion */}
      <mesh position={[0, h * 0.28, d * 0.05]} castShadow>
        <boxGeometry args={[w - 0.18, h * 0.2, d * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, h * 0.55, -d * 0.35]} castShadow>
        <boxGeometry args={[w - 0.18, h * 0.5, d * 0.2]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-w / 2 + 0.07, h * 0.35, 0]} castShadow>
        <boxGeometry args={[0.14, h * 0.4, d * 0.88]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* Right arm */}
      <mesh position={[w / 2 - 0.07, h * 0.35, 0]} castShadow>
        <boxGeometry args={[0.14, h * 0.4, d * 0.88]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* Seat cushion divisions */}
      <mesh position={[-w * 0.15, h * 0.4, d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.32, h * 0.08, d * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[w * 0.15, h * 0.4, d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.32, h * 0.08, d * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
    </group>
  );
}

function ArmchairModel({ w, d, h, color }: { w: number; d: number; h: number; color?: string }) {
  const c = color || '#8B6914';
  return (
    <group>
      {/* Legs */}
      {[[-w/2+0.06, -d/2+0.06], [w/2-0.06, -d/2+0.06], [-w/2+0.06, d/2-0.06], [w/2-0.06, d/2-0.06]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.04, lz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
          <meshStandardMaterial color="#3E2C22" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, h * 0.28, d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.78, h * 0.18, d * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, h * 0.55, -d * 0.32]} castShadow>
        <boxGeometry args={[w * 0.78, h * 0.45, d * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[-w / 2 + 0.06, h * 0.32, 0]} castShadow>
        <boxGeometry args={[0.12, h * 0.32, d * 0.78]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[w / 2 - 0.06, h * 0.32, 0]} castShadow>
        <boxGeometry args={[0.12, h * 0.32, d * 0.78]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  );
}

function CoffeeTableModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Legs — from floor */}
      {[[-w/2+0.05, -d/2+0.05], [w/2-0.05, -d/2+0.05], [-w/2+0.05, d/2-0.05], [w/2-0.05, d/2-0.05]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, (h - 0.04) / 2, lz]} castShadow>
          <boxGeometry args={[0.04, h - 0.04, 0.04]} />
          <meshStandardMaterial color="#6B4914" roughness={0.5} />
        </mesh>
      ))}
      {/* Tabletop */}
      <mesh position={[0, h - 0.02, 0]} castShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  );
}

function TVUnitModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Cabinet — bottom on floor */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* TV screen on top */}
      <mesh position={[0, h + 0.3, -d * 0.3]}>
        <boxGeometry args={[w * 0.85, 0.5, 0.03]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.05} metalness={0.3} />
      </mesh>
      <mesh position={[0, h + 0.3, -d * 0.3 + 0.017]}>
        <planeGeometry args={[w * 0.8, 0.45]} />
        <meshStandardMaterial color="#0A0A2A" roughness={0.1} metalness={0.1} />
      </mesh>
    </group>
  );
}

function BookshelfModel({ w, d, h }: { w: number; d: number; h: number }) {
  const shelves = 5;
  return (
    <group>
      {/* Sides — from floor to top */}
      <mesh position={[-w / 2, h / 2, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Back */}
      <mesh position={[0, h / 2, -d / 2 + 0.005]}>
        <boxGeometry args={[w, h, 0.01]} />
        <meshStandardMaterial color="#A08040" roughness={0.6} />
      </mesh>
      {/* Shelves */}
      {Array.from({ length: shelves }, (_, i) => (
        <mesh key={i} position={[0, (h / shelves) * i + 0.01, 0]} castShadow>
          <boxGeometry args={[w - 0.02, 0.02, d]} />
          <meshStandardMaterial color="#8B6914" roughness={0.5} />
        </mesh>
      ))}
      {/* Books */}
      {Array.from({ length: shelves - 1 }, (_, i) => (
        <mesh key={`b${i}`} position={[-w * 0.1, (h / shelves) * (i + 0.5) + 0.01, 0]} castShadow>
          <boxGeometry args={[w * 0.5, h / shelves * 0.65, d * 0.65]} />
          <meshStandardMaterial color={['#8B4513', '#2F4F4F', '#800020', '#1B3F5C', '#4A2C2A'][i % 5]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── BEDROOM ────────────────────────────────────────────

function BedModel({ w, d, h }: { w: number; d: number; h: number }) {
  const legH = h * 0.2;
  const frameH = h * 0.15;
  const mattressH = h * 0.3;
  const baseY = legH;
  const mattressY = baseY + frameH + mattressH / 2;

  return (
    <group>
      {/* Legs (4 corners, rounded) */}
      {[
        [-w / 2 + 0.04, -d / 2 + 0.04],
        [w / 2 - 0.04, -d / 2 + 0.04],
        [-w / 2 + 0.04, d / 2 - 0.04],
        [w / 2 - 0.04, d / 2 - 0.04],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, legH / 2, lz]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, legH, 8]} />
          <meshStandardMaterial color="#4A3220" roughness={0.5} />
        </mesh>
      ))}

      {/* Bed frame / base platform */}
      <mesh position={[0, baseY + frameH / 2, 0]} castShadow>
        <boxGeometry args={[w, frameH, d]} />
        <meshStandardMaterial color="#6B4226" roughness={0.5} />
      </mesh>

      {/* Slat detail lines on frame sides */}
      {[-w / 2 - 0.001, w / 2 + 0.001].map((sx, i) => (
        <mesh key={`side-${i}`} position={[sx, baseY + frameH / 2, 0]}>
          <planeGeometry args={[d, frameH]} />
          <meshStandardMaterial color="#5A3518" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Mattress — soft rounded look */}
      <mesh position={[0, mattressY, 0]} castShadow>
        <boxGeometry args={[w - 0.06, mattressH, d - 0.06]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.85} />
      </mesh>
      {/* Mattress top quilting line */}
      <mesh position={[0, mattressY + mattressH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.1, d - 0.1]} />
        <meshStandardMaterial color="#EDE8E0" roughness={0.9} />
      </mesh>

      {/* Pillows (2 side by side) */}
      {[-(w * 0.22), w * 0.22].map((px, i) => (
        <group key={`pillow-${i}`} position={[px, mattressY + mattressH / 2 + 0.04, -d * 0.36]}>
          <mesh castShadow>
            <boxGeometry args={[w * 0.36, 0.08, 0.3]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {/* Pillow puff on top */}
          <mesh position={[0, 0.03, 0]}>
            <sphereGeometry args={[0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Duvet / blanket — slightly crumpled look */}
      <mesh position={[0, mattressY + mattressH / 2 + 0.03, d * 0.08]} castShadow>
        <boxGeometry args={[w - 0.08, 0.06, d * 0.58]} />
        <meshStandardMaterial color="#8BA4B8" roughness={0.9} />
      </mesh>
      {/* Duvet fold at top */}
      <mesh position={[0, mattressY + mattressH / 2 + 0.05, -d * 0.14]} castShadow>
        <boxGeometry args={[w - 0.1, 0.04, 0.15]} />
        <meshStandardMaterial color="#9BB4C8" roughness={0.9} />
      </mesh>

      {/* Headboard — panel style with frame */}
      <mesh position={[0, h * 0.55, -d / 2 - 0.03]} castShadow>
        <boxGeometry args={[w + 0.02, h * 0.75, 0.05]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.4} />
      </mesh>
      {/* Headboard panel inset */}
      <mesh position={[0, h * 0.55, -d / 2 - 0.056]}>
        <boxGeometry args={[w - 0.12, h * 0.55, 0.01]} />
        <meshStandardMaterial color="#7A5230" roughness={0.5} />
      </mesh>

      {/* Footboard — shorter */}
      <mesh position={[0, baseY + frameH + 0.08, d / 2 + 0.02]} castShadow>
        <boxGeometry args={[w + 0.02, 0.2, 0.04]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.4} />
      </mesh>
    </group>
  );
}

function WardrobeModel({ w, d, h }: { w: number; d: number; h: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const leftAngle = useRef(0);
  const rightAngle = useRef(0);

  useFrame((_, delta) => {
    const target = isOpen ? Math.PI / 2.5 : 0;
    leftAngle.current += (target - leftAngle.current) * Math.min(1, 3 * delta);
    rightAngle.current += (-target - rightAngle.current) * Math.min(1, 3 * delta);
    if (leftDoorRef.current) leftDoorRef.current.rotation.y = leftAngle.current;
    if (rightDoorRef.current) rightDoorRef.current.rotation.y = rightAngle.current;
  });

  const woodDark = '#5C3D1E';
  const woodMed = '#7A5230';
  const woodLight = '#A08040';
  const interior = '#D4C4A0';

  return (
    <group onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
      {/* Outer shell — back panel */}
      <mesh position={[0, h / 2, -d / 2 + 0.01]} castShadow>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color={woodDark} roughness={0.5} />
      </mesh>
      {/* Left side panel */}
      <mesh position={[-w / 2 + 0.01, h / 2, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color={woodMed} roughness={0.5} />
      </mesh>
      {/* Right side panel */}
      <mesh position={[w / 2 - 0.01, h / 2, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color={woodMed} roughness={0.5} />
      </mesh>
      {/* Top panel */}
      <mesh position={[0, h - 0.01, 0]} castShadow>
        <boxGeometry args={[w, 0.02, d]} />
        <meshStandardMaterial color={woodMed} roughness={0.5} />
      </mesh>
      {/* Bottom panel */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[w, 0.02, d]} />
        <meshStandardMaterial color={woodMed} roughness={0.5} />
      </mesh>

      {/* Interior back wall */}
      <mesh position={[0, h / 2, -d / 2 + 0.025]}>
        <boxGeometry args={[w - 0.06, h - 0.08, 0.005]} />
        <meshStandardMaterial color={interior} roughness={0.7} />
      </mesh>

      {/* Center divider */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.015, h - 0.06, d - 0.04]} />
        <meshStandardMaterial color={woodLight} roughness={0.6} />
      </mesh>

      {/* Hanging rail — left section */}
      <mesh position={[-w / 4, h * 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, w / 2 - 0.08, 12]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rail brackets */}
      {[-w / 2 + 0.04, -0.02].map((rx, i) => (
        <mesh key={`bracket-l-${i}`} position={[rx, h * 0.82, -d / 2 + 0.06]}>
          <boxGeometry args={[0.015, 0.04, 0.04]} />
          <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Shelves — right section (3 shelves) */}
      {[0.25, 0.5, 0.75].map((sy, i) => (
        <mesh key={`shelf-${i}`} position={[w / 4, h * sy, 0]}>
          <boxGeometry args={[w / 2 - 0.06, 0.015, d - 0.06]} />
          <meshStandardMaterial color={woodLight} roughness={0.6} />
        </mesh>
      ))}

      {/* Drawer at bottom — right section */}
      <mesh position={[w / 4, h * 0.1, d / 2 - 0.02]}>
        <boxGeometry args={[w / 2 - 0.08, h * 0.14, 0.015]} />
        <meshStandardMaterial color={woodLight} roughness={0.5} />
      </mesh>
      <mesh position={[w / 4, h * 0.1, d / 2 + 0.005]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#B0B0B0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Feet/plinth */}
      {[
        [-w / 2 + 0.06, -d / 2 + 0.06],
        [w / 2 - 0.06, -d / 2 + 0.06],
        [-w / 2 + 0.06, d / 2 - 0.06],
        [w / 2 - 0.06, d / 2 - 0.06],
      ].map(([fx, fz], i) => (
        <mesh key={`foot-${i}`} position={[fx, 0.02, fz]}>
          <boxGeometry args={[0.06, 0.04, 0.06]} />
          <meshStandardMaterial color={woodDark} roughness={0.5} />
        </mesh>
      ))}

      {/* Left door — with panel detail */}
      <group ref={leftDoorRef} position={[-w / 2 + 0.02, 0, d / 2]}>
        {/* Door body */}
        <mesh position={[w / 4 - 0.01, h / 2, 0]} castShadow>
          <boxGeometry args={[w / 2 - 0.03, h - 0.04, 0.02]} />
          <meshStandardMaterial color={woodMed} roughness={0.45} />
        </mesh>
        {/* Panel inset detail */}
        <mesh position={[w / 4 - 0.01, h * 0.35, 0.011]}>
          <boxGeometry args={[w / 2 - 0.14, h * 0.35, 0.005]} />
          <meshStandardMaterial color={woodLight} roughness={0.5} />
        </mesh>
        <mesh position={[w / 4 - 0.01, h * 0.72, 0.011]}>
          <boxGeometry args={[w / 2 - 0.14, h * 0.35, 0.005]} />
          <meshStandardMaterial color={woodLight} roughness={0.5} />
        </mesh>
        {/* Handle */}
        <mesh position={[w / 2 - 0.08, h * 0.5, 0.025]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          <meshStandardMaterial color="#B8B8B8" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Right door — with panel detail */}
      <group ref={rightDoorRef} position={[w / 2 - 0.02, 0, d / 2]}>
        <mesh position={[-w / 4 + 0.01, h / 2, 0]} castShadow>
          <boxGeometry args={[w / 2 - 0.03, h - 0.04, 0.02]} />
          <meshStandardMaterial color={woodMed} roughness={0.45} />
        </mesh>
        <mesh position={[-w / 4 + 0.01, h * 0.35, 0.011]}>
          <boxGeometry args={[w / 2 - 0.14, h * 0.35, 0.005]} />
          <meshStandardMaterial color={woodLight} roughness={0.5} />
        </mesh>
        <mesh position={[-w / 4 + 0.01, h * 0.72, 0.011]}>
          <boxGeometry args={[w / 2 - 0.14, h * 0.35, 0.005]} />
          <meshStandardMaterial color={woodLight} roughness={0.5} />
        </mesh>
        <mesh position={[-w / 2 + 0.08, h * 0.5, 0.025]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          <meshStandardMaterial color="#B8B8B8" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Crown molding at top */}
      <mesh position={[0, h + 0.01, d / 2 - 0.02]} castShadow>
        <boxGeometry args={[w + 0.04, 0.03, 0.06]} />
        <meshStandardMaterial color={woodDark} roughness={0.4} />
      </mesh>
    </group>
  );
}

function NightstandModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.6, d / 2 + 0.002]}>
        <boxGeometry args={[w * 0.7, 0.01, 0.001]} />
        <meshStandardMaterial color="#6B4914" />
      </mesh>
      <mesh position={[0, h * 0.35, d / 2 + 0.015]} castShadow>
        <boxGeometry args={[0.05, 0.02, 0.03]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function DeskModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Legs from floor */}
      {[[-w/2+0.04, -d/2+0.04], [w/2-0.04, -d/2+0.04], [-w/2+0.04, d/2-0.04], [w/2-0.04, d/2-0.04]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, (h - 0.04) / 2, lz]} castShadow>
          <boxGeometry args={[0.04, h - 0.04, 0.04]} />
          <meshStandardMaterial color="#8B6914" roughness={0.5} />
        </mesh>
      ))}
      {/* Top */}
      <mesh position={[0, h - 0.02, 0]} castShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color="#A08040" roughness={0.4} />
      </mesh>
      {/* Drawer unit */}
      <mesh position={[w / 2 - 0.2, h * 0.38, 0]} castShadow>
        <boxGeometry args={[0.35, h * 0.5, d - 0.1]} />
        <meshStandardMaterial color="#A08040" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ─── DINING ─────────────────────────────────────────────

function DiningTableModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Legs from floor */}
      {[[-w/2+0.06, -d/2+0.06], [w/2-0.06, -d/2+0.06], [-w/2+0.06, d/2-0.06], [w/2-0.06, d/2-0.06]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, (h - 0.05) / 2, lz]} castShadow>
          <boxGeometry args={[0.06, h - 0.05, 0.06]} />
          <meshStandardMaterial color="#6B4914" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, h - 0.025, 0]} castShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial color="#8B6914" roughness={0.35} />
      </mesh>
    </group>
  );
}

function DiningChairModel({ w, d, h }: { w: number; d: number; h: number }) {
  const seatH = h * 0.5;
  return (
    <group>
      {/* Legs from floor */}
      {[[-w/2+0.03, -d/2+0.03], [w/2-0.03, -d/2+0.03], [-w/2+0.03, d/2-0.03], [w/2-0.03, d/2-0.03]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, seatH / 2, lz]} castShadow>
          <boxGeometry args={[0.03, seatH, 0.03]} />
          <meshStandardMaterial color="#6B4914" roughness={0.5} />
        </mesh>
      ))}
      {/* Seat */}
      <mesh position={[0, seatH, 0]} castShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color="#A08040" roughness={0.5} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, h * 0.73, -d / 2 + 0.02]} castShadow>
        <boxGeometry args={[w - 0.04, h * 0.42, 0.03]} />
        <meshStandardMaterial color="#A08040" roughness={0.5} />
      </mesh>
    </group>
  );
}

function DresserModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#A08040" roughness={0.5} />
      </mesh>
      {/* Drawers (3 rows) */}
      {[0.2, 0.45, 0.7].map((dy, i) => (
        <group key={i}>
          <mesh position={[0, h * dy, d / 2 + 0.003]}>
            <planeGeometry args={[w * 0.88, h * 0.2]} />
            <meshStandardMaterial color="#B09050" roughness={0.6} />
          </mesh>
          <mesh position={[0, h * dy, d / 2 + 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.02, 0.03]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RugModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#8B4513" roughness={0.9} />
    </mesh>
  );
}

function PlantPotModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, h * 0.2, 0]} castShadow>
        <cylinderGeometry args={[w * 0.4, w * 0.3, h * 0.4, 12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, h * 0.38, 0]}>
        <cylinderGeometry args={[w * 0.35, w * 0.35, 0.03, 12]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      {/* Foliage (sphere) */}
      <mesh position={[0, h * 0.7, 0]} castShadow>
        <sphereGeometry args={[w * 0.45, 10, 10]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, h * 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.015, h * 0.3, 6]} />
        <meshStandardMaterial color="#4E342E" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ─── STAIRS ─────────────────────────────────────────────

function StraightStaircaseModel({ w, d, h }: { w: number; d: number; h: number }) {
  const steps = 14;
  const stepHeight = h / steps;
  const stepDepth = d / steps;
  return (
    <group>
      {Array.from({ length: steps }, (_, i) => (
        <mesh key={i} position={[0, stepHeight * (i + 0.5), -d / 2 + stepDepth * (i + 0.5)]} castShadow receiveShadow>
          <boxGeometry args={[w, stepHeight * 0.9, stepDepth * 0.95]} />
          <meshStandardMaterial color="#8B7355" roughness={0.6} />
        </mesh>
      ))}
      {/* Left railing */}
      <mesh position={[-w / 2 - 0.02, h / 2 + 0.4, 0]}>
        <boxGeometry args={[0.04, 0.04, d]} />
        <meshStandardMaterial color="#5C4033" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Right railing */}
      <mesh position={[w / 2 + 0.02, h / 2 + 0.4, 0]}>
        <boxGeometry args={[0.04, 0.04, d]} />
        <meshStandardMaterial color="#5C4033" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Railing posts */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const z = -d / 2 + d * t;
        const y = h * t;
        return (
          <group key={i}>
            <mesh position={[-w / 2 - 0.02, y / 2 + 0.2, z]}>
              <boxGeometry args={[0.03, y + 0.4, 0.03]} />
              <meshStandardMaterial color="#5C4033" roughness={0.4} />
            </mesh>
            <mesh position={[w / 2 + 0.02, y / 2 + 0.2, z]}>
              <boxGeometry args={[0.03, y + 0.4, 0.03]} />
              <meshStandardMaterial color="#5C4033" roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SpiralStaircaseModel({ w, d, h }: { w: number; d: number; h: number }) {
  const steps = 16;
  const radius = Math.min(w, d) / 2 - 0.1;
  const stepAngle = (Math.PI * 2) / steps;
  const stepHeight = h / steps;
  return (
    <group>
      {/* Center pole */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, h, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Steps */}
      {Array.from({ length: steps }, (_, i) => {
        const angle = stepAngle * i;
        const y = stepHeight * (i + 0.5);
        const cx = Math.cos(angle) * radius * 0.45;
        const cz = Math.sin(angle) * radius * 0.45;
        return (
          <mesh key={i} position={[cx, y, cz]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[radius * 0.9, stepHeight * 0.6, 0.3]} />
            <meshStandardMaterial color="#8B7355" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Railing */}
      {Array.from({ length: steps }, (_, i) => {
        const angle = stepAngle * i;
        const y = stepHeight * (i + 0.5) + 0.4;
        const rx = Math.cos(angle) * radius;
        const rz = Math.sin(angle) * radius;
        return (
          <mesh key={`r${i}`} position={[rx, y, rz]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#5C4033" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function FallbackModel({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <mesh position={[0, h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#C0C0C0" roughness={0.5} wireframe />
    </mesh>
  );
}
