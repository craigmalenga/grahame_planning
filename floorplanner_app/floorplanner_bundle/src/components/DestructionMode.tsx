import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';

// ─── TYPES ──────────────────────────────────────────────

interface BulletHole {
  id: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  size: number;
  time: number;
}

interface DebrisParticle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  size: number;
  lifetime: number;
  age: number;
  color: string;
}

interface CrackLine {
  id: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  points: THREE.Vector3[];
  time: number;
}

// ─── DESTRUCTION SYSTEM ─────────────────────────────────

export function DestructionMode() {
  const { controlMode } = useStore();
  const { camera, scene, gl } = useThree();
  const [bulletHoles, setBulletHoles] = useState<BulletHole[]>([]);
  const [debris, setDebris] = useState<DebrisParticle[]>([]);
  const [cracks, setCracks] = useState<CrackLine[]>([]);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());
  const idCounter = useRef(0);
  const isLocked = useRef(false);
  const lastShotTime = useRef(0);

  // Deterministic random
  const rng = useCallback((seed: number) => {
    let s = seed;
    return () => { s = (s * 16807 + 11) % 2147483647; return (s / 2147483647) * 2 - 1; };
  }, []);

  const shoot = useCallback(() => {
    const now = performance.now();
    if (now - lastShotTime.current < 120) return; // fire rate limit
    lastShotTime.current = now;

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.current.far = 100;

    const intersects = raycaster.current.intersectObjects(scene.children, true);
    if (intersects.length === 0) return;

    const hit = intersects[0];
    const id = idCounter.current++;
    const rand = rng(id * 7 + 13);

    // Muzzle flash
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);

    // Bullet hole
    const holeSize = 0.015 + Math.abs(rand()) * 0.02;
    setBulletHoles(prev => [...prev.slice(-80), {
      id,
      position: hit.point.clone().add(hit.face ? hit.face.normal.clone().multiplyScalar(0.002) : new THREE.Vector3()),
      normal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 0, 1),
      size: holeSize,
      time: now,
    }]);

    // Crack lines radiating from impact
    if (Math.abs(rand()) > 0.3) {
      const numCracks = 2 + Math.floor(Math.abs(rand()) * 4);
      const crackPoints: THREE.Vector3[] = [];
      for (let c = 0; c < numCracks; c++) {
        const angle = (c / numCracks) * Math.PI * 2 + rand() * 0.5;
        const length = 0.05 + Math.abs(rand()) * 0.15;
        // Create crack in the plane of the wall (perpendicular to normal)
        const tangent = new THREE.Vector3(1, 0, 0);
        if (hit.face) {
          tangent.crossVectors(hit.face.normal, new THREE.Vector3(0, 1, 0)).normalize();
          if (tangent.length() < 0.01) {
            tangent.crossVectors(hit.face.normal, new THREE.Vector3(1, 0, 0)).normalize();
          }
        }
        const bitangent = new THREE.Vector3().crossVectors(
          hit.face?.normal || new THREE.Vector3(0, 0, 1),
          tangent
        ).normalize();

        const endPoint = hit.point.clone()
          .add(tangent.clone().multiplyScalar(Math.cos(angle) * length))
          .add(bitangent.clone().multiplyScalar(Math.sin(angle) * length))
          .add((hit.face?.normal || new THREE.Vector3(0, 0, 1)).clone().multiplyScalar(0.003));
        crackPoints.push(endPoint);
      }

      setCracks(prev => [...prev.slice(-40), {
        id,
        position: hit.point.clone(),
        normal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 0, 1),
        points: crackPoints,
        time: now,
      }]);
    }

    // Debris particles
    const numDebris = 4 + Math.floor(Math.abs(rand()) * 8);
    const newDebris: DebrisParticle[] = [];
    for (let d = 0; d < numDebris; d++) {
      const r = rng(id * 100 + d * 7 + 3);
      const speed = 1 + Math.abs(r()) * 3;
      const dir = hit.face
        ? hit.face.normal.clone().add(new THREE.Vector3(r() * 0.8, r() * 0.8 + 0.3, r() * 0.8)).normalize()
        : new THREE.Vector3(r(), Math.abs(r()), r()).normalize();

      newDebris.push({
        id: idCounter.current++,
        position: hit.point.clone().add(dir.clone().multiplyScalar(0.02)),
        velocity: dir.multiplyScalar(speed),
        rotation: new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI),
        rotationSpeed: new THREE.Vector3(r() * 10, r() * 10, r() * 10),
        size: 0.008 + Math.abs(r()) * 0.025,
        lifetime: 1.5 + Math.abs(r()) * 2,
        age: 0,
        color: Math.abs(r()) > 0.5 ? '#d0c8b8' : '#a0a0a0',
      });
    }
    setDebris(prev => [...prev.slice(-150), ...newDebris]);
  }, [camera, scene, rng]);

  // Listen for mouse clicks when in FPS mode
  useEffect(() => {
    const onPointerLockChange = () => {
      isLocked.current = !!document.pointerLockElement;
    };
    const onMouseDown = (e: MouseEvent) => {
      if (isLocked.current && e.button === 0) {
        shoot();
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [shoot]);

  // Physics update — debris + bullet hole/crack expiry
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const now = performance.now();

    // Expire bullet holes after 8 seconds
    setBulletHoles(prev => prev.filter(h => now - h.time < 8000));
    // Expire cracks after 10 seconds
    setCracks(prev => prev.filter(c => now - c.time < 10000));

    setDebris(prev => prev
      .map(p => ({
        ...p,
        position: p.position.clone().add(p.velocity.clone().multiplyScalar(dt)),
        velocity: p.velocity.clone().add(new THREE.Vector3(0, -9.8 * dt, 0)),
        rotation: new THREE.Euler(
          p.rotation.x + p.rotationSpeed.x * dt,
          p.rotation.y + p.rotationSpeed.y * dt,
          p.rotation.z + p.rotationSpeed.z * dt,
        ),
        age: p.age + dt,
      }))
      .filter(p => p.age < p.lifetime && p.position.y > -1)
    );
  });

  if (controlMode !== 'firstperson') return null;

  return (
    <group>
      {/* Crosshair */}
      <Crosshair camera={camera} />

      {/* Muzzle flash */}
      {muzzleFlash && (
        <pointLight
          position={camera.position.clone().add(
            new THREE.Vector3(0, -0.1, 0).applyQuaternion(camera.quaternion)
          )}
          color="#FFA500"
          intensity={8}
          distance={5}
          decay={2}
        />
      )}

      {/* Bullet holes */}
      {bulletHoles.map(hole => (
        <BulletHoleDecal key={hole.id} hole={hole} />
      ))}

      {/* Crack lines */}
      {cracks.map(crack => (
        <CrackDecal key={crack.id} crack={crack} />
      ))}

      {/* Debris particles */}
      {debris.map(p => (
        <mesh
          key={p.id}
          position={p.position}
          rotation={p.rotation}
        >
          <boxGeometry args={[p.size, p.size * 0.6, p.size * 0.8]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.8}
            transparent
            opacity={Math.max(0, 1 - p.age / p.lifetime)}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── CROSSHAIR HUD ──────────────────────────────────────

function Crosshair({ camera }: { camera: THREE.Camera }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // Position crosshair 0.5m in front of camera
    const forward = new THREE.Vector3(0, 0, -0.5);
    forward.applyQuaternion(camera.quaternion);
    meshRef.current.position.copy(camera.position).add(forward);
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={meshRef} renderOrder={999}>
      {/* Cross lines */}
      <mesh>
        <planeGeometry args={[0.008, 0.001]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} depthTest={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.001, 0.008]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} depthTest={false} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.0008, 8]} />
        <meshBasicMaterial color="red" transparent opacity={0.9} depthTest={false} />
      </mesh>
    </group>
  );
}

// ─── BULLET HOLE DECAL ──────────────────────────────────

function BulletHoleDecal({ hole }: { hole: BulletHole }) {
  const meshRef = useRef<THREE.Mesh>(null);
  // Fade out over last 3 seconds of 8s lifetime
  const age = (performance.now() - hole.time) / 1000;
  const fadeStart = 5;
  const fadeAlpha = age > fadeStart ? Math.max(0, 1 - (age - fadeStart) / 3) : 1;

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hole.normal);
    return q;
  }, [hole.normal]);

  return (
    <group position={hole.position} quaternion={quaternion}>
      {/* Dark center */}
      <mesh renderOrder={10}>
        <circleGeometry args={[hole.size * 0.5, 12]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.9 * fadeAlpha} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Scorch ring */}
      <mesh position={[0, 0, 0.001]} renderOrder={11}>
        <ringGeometry args={[hole.size * 0.4, hole.size, 12]} />
        <meshBasicMaterial color="#3a3020" transparent opacity={0.7 * fadeAlpha} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer dust ring */}
      <mesh position={[0, 0, 0.0015]} renderOrder={12}>
        <ringGeometry args={[hole.size * 0.9, hole.size * 1.5, 12]} />
        <meshBasicMaterial color="#a09080" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── CRACK LINES ────────────────────────────────────────

function CrackDecal({ crack }: { crack: CrackLine }) {
  return (
    <group>
      {crack.points.map((endPoint, i) => {
        const start = crack.position.clone().add(crack.normal.clone().multiplyScalar(0.003));
        const mid = start.clone().lerp(endPoint, 0.5);
        const dir = endPoint.clone().sub(start);
        const length = dir.length();

        return (
          <mesh key={i} position={mid} renderOrder={9}>
            <planeGeometry args={[length, 0.003]} />
            <meshBasicMaterial color="#2a2a2a" transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}
