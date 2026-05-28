import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CubeCamera } from '@react-three/drei';
import type { FurnitureItem } from '../types';
import { getCatalogItem } from '../utils/furnitureCatalog';
import { useStore } from '../store/useStore';

interface LightFixtureProps {
  item: FurnitureItem;
  ceilingHeight: number;
}

// Lighting fixtures emit actual Three.js lights for realistic illumination
export function LightFixtureModel({ item, ceilingHeight }: LightFixtureProps) {
  const catalog = getCatalogItem(item.type);
  const w = catalog.defaultWidth * item.scaleX;
  const d = catalog.defaultDepth * item.scaleY;
  const h = catalog.defaultHeight;

  const sceneConfig = useStore(s => s.sceneConfig);
  // Use a warmth factor - brighter lights at night would look nice
  const intensity = 1.2;
  const warmColor = '#FFF5E0';

  switch (item.type) {
    case 'pendant-light':
      return <PendantLight x={item.x} z={item.y} ceilingHeight={ceilingHeight} w={w} h={h} intensity={intensity} color={warmColor} />;
    case 'downlight-single':
      return <DownlightSingle x={item.x} z={item.y} ceilingHeight={ceilingHeight} intensity={intensity} color={warmColor} />;
    case 'downlight-triple':
      return <DownlightTriple x={item.x} z={item.y} ceilingHeight={ceilingHeight} w={w} intensity={intensity} color={warmColor} />;
    case 'wall-uplight':
      return <WallUplight x={item.x} z={item.y} ceilingHeight={ceilingHeight} intensity={intensity} color={warmColor} rotation={item.rotation} />;
    case 'wall-downlight':
      return <WallDownlight x={item.x} z={item.y} ceilingHeight={ceilingHeight} intensity={intensity} color={warmColor} rotation={item.rotation} />;
    case 'floor-lamp':
      return <FloorLamp x={item.x} z={item.y} h={h} intensity={intensity} color={warmColor} />;
    case 'table-lamp':
      return <TableLamp x={item.x} z={item.y} h={h} intensity={intensity} color={warmColor} />;
    case 'mirror-led':
      return <MirrorLED x={item.x} z={item.y} w={w} h={h} rotation={item.rotation} />;
    case 'mirror-plain':
      return <MirrorPlain x={item.x} z={item.y} w={w} h={h} rotation={item.rotation} />;
    default:
      return null;
  }
}

// ─── PENDANT LIGHT ──────────────────────────────────────
function PendantLight({ x, z, ceilingHeight, w, h, intensity, color }: {
  x: number; z: number; ceilingHeight: number; w: number; h: number; intensity: number; color: string;
}) {
  const dropLength = 0.5;
  const fixtureY = ceilingHeight - dropLength;

  return (
    <group position={[x, 0, z]}>
      {/* Cord/rod */}
      <mesh position={[0, ceilingHeight - dropLength / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, dropLength, 6]} />
        <meshStandardMaterial color="#2A2A2A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Ceiling rose */}
      <mesh position={[0, ceilingHeight - 0.015, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Shade (inverted cone/dome) */}
      <mesh position={[0, fixtureY, 0]} castShadow>
        <coneGeometry args={[w / 2, h, 24, 1, true]} />
        <meshStandardMaterial
          color="#E8DDD0"
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, fixtureY - h * 0.3, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Actual point light */}
      <pointLight
        position={[0, fixtureY - h * 0.3, 0]}
        color={color}
        intensity={intensity * 2}
        distance={6}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </group>
  );
}

// ─── DOWNLIGHT (RECESSED) ───────────────────────────────
function DownlightSingle({ x, z, ceilingHeight, intensity, color }: {
  x: number; z: number; ceilingHeight: number; intensity: number; color: string;
}) {
  return (
    <group position={[x, 0, z]}>
      {/* Housing ring */}
      <mesh position={[0, ceilingHeight - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 24]} />
        <meshStandardMaterial color="#E0E0E0" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* LED glow disc */}
      <mesh position={[0, ceilingHeight - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
      <spotLight
        position={[0, ceilingHeight - 0.03, 0]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 4}
        penumbra={0.6}
        color={color}
        intensity={intensity * 1.5}
        distance={5}
        decay={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
    </group>
  );
}

// ─── TRIPLE DOWNLIGHTS ──────────────────────────────────
function DownlightTriple({ x, z, ceilingHeight, w, intensity, color }: {
  x: number; z: number; ceilingHeight: number; w: number; intensity: number; color: string;
}) {
  const spacing = w / 3;
  const offsets = [-spacing, 0, spacing];

  return (
    <group position={[x, 0, z]}>
      {offsets.map((ox, i) => (
        <group key={i}>
          <mesh position={[ox, ceilingHeight - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.04, 0.055, 20]} />
            <meshStandardMaterial color="#E0E0E0" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[ox, ceilingHeight - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={4}
              toneMapped={false}
            />
          </mesh>
          <spotLight
            position={[ox, ceilingHeight - 0.03, 0]}
            angle={Math.PI / 4}
            penumbra={0.6}
            color={color}
            intensity={intensity}
            distance={4}
            decay={2}
            castShadow={i === 1}
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
          />
        </group>
      ))}
    </group>
  );
}

// ─── WALL UPLIGHT ───────────────────────────────────────
function WallUplight({ x, z, ceilingHeight, intensity, color, rotation }: {
  x: number; z: number; ceilingHeight: number; intensity: number; color: string; rotation: number;
}) {
  const mountH = ceilingHeight * 0.7;
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Wall bracket */}
      <mesh position={[0, mountH, 0]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.08]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Shade (half-cylinder pointing up) */}
      <mesh position={[0, mountH + 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.1, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#E8DDD0"
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glow */}
      <mesh position={[0, mountH + 0.1, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} toneMapped={false} />
      </mesh>
      {/* Light pointing upward */}
      <spotLight
        position={[0, mountH + 0.05, 0.02]}
        target-position={[0, ceilingHeight, 0.02]}
        angle={Math.PI / 3}
        penumbra={0.8}
        color={color}
        intensity={intensity}
        distance={3}
        decay={2}
      />
    </group>
  );
}

// ─── WALL DOWNLIGHT ─────────────────────────────────────
function WallDownlight({ x, z, ceilingHeight, intensity, color, rotation }: {
  x: number; z: number; ceilingHeight: number; intensity: number; color: string; rotation: number;
}) {
  const mountH = ceilingHeight * 0.7;
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, mountH, 0]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.08]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, mountH - 0.05, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 12, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, mountH - 0.06, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <spotLight
        position={[0, mountH - 0.05, 0.02]}
        target-position={[0, 0, 0.02]}
        angle={Math.PI / 3}
        penumbra={0.8}
        color={color}
        intensity={intensity}
        distance={3}
        decay={2}
      />
    </group>
  );
}

// ─── FLOOR LAMP ─────────────────────────────────────────
function FloorLamp({ x, z, h, intensity, color }: {
  x: number; z: number; h: number; intensity: number; color: string;
}) {
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 16]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, h * 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, h * 0.85, 8]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, h * 0.88, 0]} castShadow>
        <coneGeometry args={[0.15, 0.22, 20, 1, true]} />
        <meshStandardMaterial
          color="#F5EDE0"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, h * 0.82, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, h * 0.82, 0]}
        color={color}
        intensity={intensity * 1.5}
        distance={5}
        decay={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
    </group>
  );
}

// ─── TABLE LAMP ─────────────────────────────────────────
function TableLamp({ x, z, h, intensity, color }: {
  x: number; z: number; h: number; intensity: number; color: string;
}) {
  // Sits on top of furniture — placed at Y=0 like others; the
  // user positions it on a nightstand/desk by placing it at the same spot
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, h * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.012, h * 0.6, 8]} />
        <meshStandardMaterial color="#A08040" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Shade (truncated cone) */}
      <mesh position={[0, h * 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, h * 0.35, 16, 1, true]} />
        <meshStandardMaterial
          color="#F5EDE0"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, h * 0.65, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, h * 0.65, 0]}
        color={color}
        intensity={intensity}
        distance={3.5}
        decay={2}
      />
    </group>
  );
}

// ─── REFLECTIVE MIRROR SURFACE (CubeCamera) ────────────
// Uses drei CubeCamera to capture real-time reflections of the room

function ReflectiveMirrorSurface({ w, h, mountH }: { w: number; h: number; mountH: number }) {
  return (
    <CubeCamera resolution={256} frames={Infinity} near={0.1} far={50}>
      {/* @ts-ignore — CubeCamera render prop */}
      {(envTexture: THREE.Texture) => (
        <mesh position={[0, mountH, 0.014]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial
            color="#E8EEF0"
            metalness={1}
            roughness={0.02}
            envMap={envTexture}
            envMapIntensity={1}
          />
        </mesh>
      )}
    </CubeCamera>
  );
}

// ─── MIRROR (PLAIN) ─────────────────────────────────────
function MirrorPlain({ x, z, w, h, rotation }: {
  x: number; z: number; w: number; h: number; rotation: number;
}) {
  const mountH = 1.2;
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, mountH, 0]} castShadow>
        <boxGeometry args={[w + 0.04, h + 0.04, 0.025]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Reflective mirror surface */}
      <ReflectiveMirrorSurface w={w} h={h} mountH={mountH} />
    </group>
  );
}

// ─── MIRROR WITH LED BACKLIGHT ──────────────────────────
function MirrorLED({ x, z, w, h, rotation }: {
  x: number; z: number; w: number; h: number; rotation: number;
}) {
  const mountH = 1.2;
  const ledColor = '#FFFFFF';
  const gap = 0.03;

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Backing plate */}
      <mesh position={[0, mountH, -0.01]}>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.02]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.6} />
      </mesh>

      {/* LED strips behind mirror edges — 4 sides */}
      <mesh position={[0, mountH + h / 2 + gap, 0.005]}>
        <boxGeometry args={[w + 0.06, 0.012, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={6} toneMapped={false} />
      </mesh>
      <mesh position={[0, mountH - h / 2 - gap, 0.005]}>
        <boxGeometry args={[w + 0.06, 0.012, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={6} toneMapped={false} />
      </mesh>
      <mesh position={[-w / 2 - gap, mountH, 0.005]}>
        <boxGeometry args={[0.012, h + 0.06, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={6} toneMapped={false} />
      </mesh>
      <mesh position={[w / 2 + gap, mountH, 0.005]}>
        <boxGeometry args={[0.012, h + 0.06, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={6} toneMapped={false} />
      </mesh>

      {/* Reflective mirror surface */}
      <ReflectiveMirrorSurface w={w} h={h} mountH={mountH} />

      {/* LED glow lights */}
      <pointLight position={[0, mountH, -0.05]} color={ledColor} intensity={0.8} distance={2} decay={2} />
      <pointLight position={[0, mountH, 0.2]} color={ledColor} intensity={0.5} distance={1.5} decay={2} />
    </group>
  );
}
