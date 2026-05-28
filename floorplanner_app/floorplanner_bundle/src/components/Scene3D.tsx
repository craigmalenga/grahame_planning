import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Sky, Stars } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { RoomMesh } from './RoomMesh';
import { SceneLighting } from './SceneLighting';
import { CameraController } from './CameraController';
import { DestructionMode } from './DestructionMode';
import { ZombieSurvival } from './ZombieSurvival';
import { Measurements3D } from './Measurements3D';

export function Scene3D() {
  const { floorPlan, sceneConfig, isNightMode, cameraResetKey, zombieMode } = useStore();

  // Increment camera reset key when Scene3D mounts (entering 3D view)
  useEffect(() => {
    useStore.setState(s => ({ cameraResetKey: s.cameraResetKey + 1 }));
  }, []);

  if (!floorPlan) return null;

  const allBounds = floorPlan.rooms.map(r => r.bounds);
  if (allBounds.length === 0) {
    // Empty floor plan — show blank scene
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No rooms yet</p>
          <p className="text-sm">Go back to Design mode to add rooms</p>
        </div>
      </div>
    );
  }

  const minBX = Math.min(...allBounds.map(b => b.minX));
  const maxBX = Math.max(...allBounds.map(b => b.maxX));
  const minBZ = Math.min(...allBounds.map(b => b.minY));
  const maxBZ = Math.max(...allBounds.map(b => b.maxY));
  const centerX = (minBX + maxBX) / 2;
  const centerZ = (minBZ + maxBZ) / 2;
  const extentX = maxBX - minBX;
  const extentZ = maxBZ - minBZ;
  const maxExtent = Math.max(extentX, extentZ, 4);

  const bgColor = isNightMode ? '#0a0a1a' : sceneConfig.backgroundColor;

  return (
    <div className="w-full h-full">
      <Canvas
        key={cameraResetKey}
        shadows
        camera={{
          position: [centerX + maxExtent * 0.3, Math.max(6, maxExtent * 0.8), centerZ + maxExtent * 1.2],
          fov: 60,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNightMode ? 0.5 : 1.0,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[bgColor]} />

        {sceneConfig.fogEnabled && (
          <fog attach="fog" args={[isNightMode ? '#0a0a1a' : sceneConfig.fogColor, sceneConfig.fogNear, sceneConfig.fogFar]} />
        )}

        <Suspense fallback={null}>
          <SceneLighting />

          {isNightMode ? (
            <>
              <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
              <directionalLight
                position={[centerX + 20, 15, centerZ - 30]}
                intensity={0.15}
                color="#b8c8e0"
              />
            </>
          ) : (
            <Sky
              distance={450000}
              sunPosition={[5, 1, 8]}
              inclination={0.6}
              azimuth={0.25}
            />
          )}

          {floorPlan.rooms.map((room, i) => (
            <RoomMesh key={i} room={room} roomIndex={i} allRooms={floorPlan.rooms} />
          ))}

          {/* Free-standing angled walls (drawn with the Wall tool) */}
          {(floorPlan.wallSegments ?? []).map((seg, i) => {
            const dx = seg.x2 - seg.x1, dz = seg.y2 - seg.y1;
            const len = Math.hypot(dx, dz);
            if (len < 0.01) return null;
            const cx = (seg.x1 + seg.x2) / 2;
            const cz = (seg.y1 + seg.y2) / 2;
            const angle = Math.atan2(dz, dx);
            const th = seg.thickness || 0.1;
            const wh = seg.height ?? 2.7;
            return (
              <mesh key={`fw-${i}`} position={[cx, wh / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
                <boxGeometry args={[len, wh, th]} />
                <meshStandardMaterial color={isNightMode ? '#3a3f48' : '#d9d4c8'} roughness={0.85} />
              </mesh>
            );
          })}

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.05, centerZ]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial
              color={isNightMode ? '#0a0f0a' : '#6a8a5a'}
              roughness={0.9}
              polygonOffset
              polygonOffsetFactor={4}
              polygonOffsetUnits={4}
            />
          </mesh>

          {!isNightMode && (
            <ContactShadows
              position={[centerX, -0.04, centerZ]}
              opacity={0.35}
              scale={Math.max(30, maxExtent * 2)}
              blur={2}
              far={10}
            />
          )}

          <Environment
            preset={isNightMode ? 'night' : 'sunset'}
            background
            backgroundBlurriness={0}
            backgroundIntensity={isNightMode ? 0.3 : 0.8}
            environmentIntensity={isNightMode ? 0.4 : 1.0}
          />
        </Suspense>

        <Measurements3D />
        <CameraController center={[centerX, 1.6, centerZ]} extent={maxExtent} />
        {zombieMode && <DestructionMode />}
        {zombieMode && <ZombieSurvival />}
      </Canvas>
    </div>
  );
}
