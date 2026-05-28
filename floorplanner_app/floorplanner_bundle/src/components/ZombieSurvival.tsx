import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';

// ─── TYPES ──────────────────────────────────────────────

interface Zombie {
  id: number;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  speed: number;
  state: 'approaching' | 'attacking' | 'dying' | 'dead';
  deathTime: number;
  animPhase: number;
  type: 'normal' | 'fast' | 'tank';
}

interface BulletTracer {
  id: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  time: number;
}

interface BloodSplat {
  id: number;
  position: THREE.Vector3;
  size: number;
}

interface GameState {
  wave: number;
  kills: number;
  health: number;
  maxHealth: number;
  score: number;
  zombiesRemaining: number;
  gameOver: boolean;
  waveComplete: boolean;
}

// ─── ZOMBIE SURVIVAL GAME ───────────────────────────────

export function ZombieSurvival() {
  const { camera } = useThree();
  const { controlMode, floorPlan } = useStore();
  const raycaster = useRef(new THREE.Raycaster());
  const idCounter = useRef(0);
  const lastShotTime = useRef(0);
  const waveTimer = useRef(0);
  const isLocked = useRef(false);
  const zombiesRef = useRef<Zombie[]>([]);

  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [tracers, setTracers] = useState<BulletTracer[]>([]);
  const [bloodSplats, setBloodSplats] = useState<BloodSplat[]>([]);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    wave: 1,
    kills: 0,
    health: 100,
    maxHealth: 100,
    score: 0,
    zombiesRemaining: 0,
    gameOver: false,
    waveComplete: false,
  });

  // Keep a ref in sync for the click handler
  useEffect(() => { zombiesRef.current = zombies; }, [zombies]);

  // Spawn ring around the building
  const spawnPositions = useMemo(() => {
    if (!floorPlan) return [];
    const bounds = floorPlan.rooms.map(r => r.bounds);
    const minX = Math.min(...bounds.map(b => b.minX)) - 12;
    const maxX = Math.max(...bounds.map(b => b.maxX)) + 12;
    const minZ = Math.min(...bounds.map(b => b.minY)) - 12;
    const maxZ = Math.max(...bounds.map(b => b.maxY)) + 12;

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 24; i++) {
      const t = i / 24;
      positions.push(new THREE.Vector3(minX + (maxX - minX) * t, 0, minZ));
      positions.push(new THREE.Vector3(minX + (maxX - minX) * t, 0, maxZ));
      positions.push(new THREE.Vector3(minX, 0, minZ + (maxZ - minZ) * t));
      positions.push(new THREE.Vector3(maxX, 0, minZ + (maxZ - minZ) * t));
    }
    return positions;
  }, [floorPlan]);

  // Spawn a wave
  const spawnWave = useCallback((wave: number) => {
    const count = 3 + wave * 2;
    const newZombies: Zombie[] = [];

    for (let i = 0; i < count; i++) {
      const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
      if (!spawnPos) continue;

      const roll = Math.random();
      const type: Zombie['type'] =
        roll < 0.08 + wave * 0.02 ? 'tank' :
        roll < 0.25 + wave * 0.03 ? 'fast' : 'normal';

      const hp = type === 'tank' ? 80 + wave * 10 : type === 'fast' ? 20 : 40 + wave * 5;
      const spd = type === 'fast' ? 2.5 + wave * 0.1 : type === 'tank' ? 0.8 : 1.2 + wave * 0.08;

      newZombies.push({
        id: idCounter.current++,
        position: spawnPos.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          0,
          (Math.random() - 0.5) * 4,
        )),
        health: hp,
        maxHealth: hp,
        speed: spd,
        state: 'approaching',
        deathTime: 0,
        animPhase: Math.random() * Math.PI * 2,
        type,
      });
    }

    setZombies(prev => [...prev.filter(z => z.state !== 'dead'), ...newZombies]);
    setGameState(prev => ({
      ...prev,
      wave,
      zombiesRemaining: count,
      waveComplete: false,
      gameOver: false,
    }));
    waveTimer.current = 0;
  }, [spawnPositions]);

  // Start wave 1
  useEffect(() => {
    if (spawnPositions.length > 0) {
      spawnWave(1);
    }
  }, [spawnPositions.length]);

  // Shoot
  const shoot = useCallback(() => {
    const now = performance.now();
    if (now - lastShotTime.current < 150) return; // fire rate
    if (gameState.gameOver) return;
    lastShotTime.current = now;

    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 60);

    // Bullet ray from camera
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const start = camera.position.clone().add(dir.clone().multiplyScalar(0.5));
    const end = camera.position.clone().add(dir.clone().multiplyScalar(50));

    // Add visible tracer
    setTracers(prev => [...prev.slice(-8), {
      id: idCounter.current++,
      start: start.clone(),
      end: end.clone(),
      time: now,
    }]);

    // Check zombie hits by distance to ray
    const ray = new THREE.Ray(camera.position.clone(), dir.clone().normalize());
    let bestDist = Infinity;
    let bestIdx = -1;
    const current = zombiesRef.current;

    for (let i = 0; i < current.length; i++) {
      const z = current[i];
      if (z.state === 'dying' || z.state === 'dead') continue;

      // Zombie collision: cylinder roughly 0.6m wide, 2m tall
      const zCenter = z.position.clone();
      zCenter.y = 1.0; // center of zombie body
      const closest = new THREE.Vector3();
      ray.closestPointToPoint(zCenter, closest);

      // Check the point is in front of camera and within range
      const along = closest.clone().sub(camera.position).dot(dir);
      if (along < 0 || along > 50) continue;

      const lateralDist = closest.distanceTo(zCenter);
      const hitRadius = z.type === 'tank' ? 0.9 : z.type === 'fast' ? 0.5 : 0.6;

      if (lateralDist < hitRadius && along < bestDist) {
        bestDist = along;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      const z = current[bestIdx];
      const damage = 25 + Math.random() * 15;
      const newHealth = z.health - damage;

      // Blood at hit point
      setBloodSplats(prev => [...prev.slice(-40), {
        id: idCounter.current++,
        position: z.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
        size: 0.15 + Math.random() * 0.2,
      }]);

      // Update tracer end to the zombie
      setTracers(prev => {
        const last = prev[prev.length - 1];
        if (last) {
          return [...prev.slice(0, -1), { ...last, end: z.position.clone().add(new THREE.Vector3(0, 1, 0)) }];
        }
        return prev;
      });

      if (newHealth <= 0) {
        setGameState(gs => ({
          ...gs,
          kills: gs.kills + 1,
          score: gs.score + (z.type === 'tank' ? 50 : z.type === 'fast' ? 30 : 10),
          zombiesRemaining: Math.max(0, gs.zombiesRemaining - 1),
        }));
        setZombies(prev => prev.map((zz, i) =>
          i === bestIdx ? { ...zz, health: 0, state: 'dying' as const, deathTime: now } : zz
        ));
      } else {
        setZombies(prev => prev.map((zz, i) =>
          i === bestIdx ? { ...zz, health: newHealth } : zz
        ));
      }
    }
  }, [camera, gameState.gameOver]);

  // Mouse click listener
  useEffect(() => {
    const onLockChange = () => {
      isLocked.current = !!document.pointerLockElement;
    };
    const onMouseDown = (e: MouseEvent) => {
      if (isLocked.current && e.button === 0) {
        shoot();
      }
    };

    document.addEventListener('pointerlockchange', onLockChange);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [shoot]);

  // Game loop: zombie AI + wave management
  useFrame((_, delta) => {
    if (gameState.gameOver) return;
    const dt = Math.min(delta, 0.05);
    const playerPos = camera.position.clone();
    playerPos.y = 0;
    waveTimer.current += dt;

    // Clean up old tracers
    const now = performance.now();
    setTracers(prev => prev.filter(t => now - t.time < 200));

    setZombies(prev => {
      let playerDamage = 0;

      const updated = prev.map(z => {
        if (z.state === 'dead') return z;

        if (z.state === 'dying') {
          if (performance.now() - z.deathTime > 3000) {
            return { ...z, state: 'dead' as const };
          }
          return z;
        }

        // Move toward player
        const toPlayer = playerPos.clone().sub(z.position);
        const dist = toPlayer.length();
        toPlayer.normalize();

        const newPos = z.position.clone();
        if (dist > 1.5) {
          newPos.add(toPlayer.multiplyScalar(z.speed * dt));
          newPos.y = 0;
        }

        // Attack if close
        if (dist < 2.0) {
          playerDamage += (z.type === 'tank' ? 8 : z.type === 'fast' ? 5 : 3) * dt;
          return {
            ...z,
            position: newPos,
            state: 'attacking' as const,
            animPhase: z.animPhase + dt * 8,
          };
        }

        return {
          ...z,
          position: newPos,
          state: 'approaching' as const,
          animPhase: z.animPhase + dt * z.speed * 3,
        };
      });

      if (playerDamage > 0) {
        setGameState(gs => {
          const newHealth = Math.max(0, gs.health - playerDamage);
          return { ...gs, health: newHealth, gameOver: newHealth <= 0 };
        });
      }

      return updated;
    });

    // Wave completion check
    if (gameState.zombiesRemaining <= 0 && !gameState.waveComplete && waveTimer.current > 3) {
      setGameState(gs => ({ ...gs, waveComplete: true }));
      setTimeout(() => {
        spawnWave(gameState.wave + 1);
        setGameState(gs => ({ ...gs, health: Math.min(gs.maxHealth, gs.health + 30) }));
        // Clean up blood splats between waves
        setBloodSplats([]);
        setTracers([]);
      }, 4000);
    }
  });

  // Not in FPS mode — show message
  if (controlMode !== 'firstperson') {
    return (
      <Html center position={[0, 4, 0]}>
        <div className="bg-red-900/90 text-white px-6 py-3 rounded-xl text-center whitespace-nowrap shadow-2xl">
          <div className="font-bold text-lg">Switch to FPS Mode to play!</div>
          <div className="text-sm mt-1 text-red-200">Click the "Orbit Mode" button to switch</div>
        </div>
      </Html>
    );
  }

  return (
    <group>
      {/* Muzzle flash light */}
      {muzzleFlash && (
        <pointLight
          position={camera.position.clone().add(
            new THREE.Vector3(0.3, -0.1, -0.8).applyQuaternion(camera.quaternion)
          )}
          color="#FF8800"
          intensity={15}
          distance={10}
          decay={2}
        />
      )}

      {/* Bullet tracers — bright yellow lines */}
      {tracers.map(t => {
        const mid = t.start.clone().add(t.end).multiplyScalar(0.5);
        const dir = t.end.clone().sub(t.start);
        const len = dir.length();
        return (
          <group key={t.id} position={mid}>
            <mesh
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                dir.normalize()
              )}
            >
              <cylinderGeometry args={[0.01, 0.01, len, 4]} />
              <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Zombies */}
      {zombies.filter(z => z.state !== 'dead').map(z => (
        <ZombieMesh key={z.id} zombie={z} />
      ))}

      {/* Blood splats on ground */}
      {bloodSplats.map(bs => (
        <mesh key={bs.id} position={[bs.position.x, 0.02, bs.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[bs.size, 8]} />
          <meshBasicMaterial color="#8B0000" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}

      {/* HUD */}
      <GameHUD gameState={gameState} />
    </group>
  );
}

// ─── ZOMBIE 3D MODEL (visible at distance) ──────────────

// Higher-poly zombie with sphere/capsule anatomy — ~300 polys per zombie
const SEG = 12; // sphere segments for smooth look

function ZombieMesh({ zombie }: { zombie: Zombie }) {
  const groupRef = useRef<THREE.Group>(null);
  const isDying = zombie.state === 'dying';
  const deathProgress = isDying ? Math.min(1, (performance.now() - zombie.deathTime) / 1500) : 0;

  const limbSwing = Math.sin(zombie.animPhase) * 0.4;
  const bodyBob = Math.abs(Math.sin(zombie.animPhase * 2)) * 0.06;
  const headTilt = Math.sin(zombie.animPhase * 0.7) * 0.08;

  const skinColor = zombie.type === 'tank' ? '#3a4a2a' : zombie.type === 'fast' ? '#7a6850' : '#5a6a4a';
  const skinDark = zombie.type === 'tank' ? '#2a3a1a' : zombie.type === 'fast' ? '#5a4830' : '#3a4a2a';
  const clothColor = zombie.type === 'tank' ? '#2a2a1a' : zombie.type === 'fast' ? '#3a3020' : '#2a2a20';
  const clothDark = zombie.type === 'tank' ? '#1a1a0a' : zombie.type === 'fast' ? '#2a2010' : '#1a1a10';
  const zScale = zombie.type === 'tank' ? 1.4 : zombie.type === 'fast' ? 0.85 : 1;

  const rotY = useRef(0);
  useFrame(({ camera }) => {
    if (!groupRef.current || isDying) return;
    const toCamera = new THREE.Vector3(
      camera.position.x - zombie.position.x, 0,
      camera.position.z - zombie.position.z
    );
    const targetRot = Math.atan2(toCamera.x, toCamera.z);
    rotY.current += (targetRot - rotY.current) * 0.1;
    groupRef.current.rotation.y = rotY.current;
  });

  return (
    <group
      ref={groupRef}
      position={[zombie.position.x, isDying ? -deathProgress * 1.0 : bodyBob, zombie.position.z]}
      scale={zScale}
    >
      {/* Health bar */}
      {zombie.health < zombie.maxHealth && !isDying && (
        <group position={[0, 2.4, 0]}>
          <mesh><planeGeometry args={[0.8, 0.08]} /><meshBasicMaterial color="#111" transparent opacity={0.8} depthTest={false} /></mesh>
          <mesh position={[(zombie.health / zombie.maxHealth - 1) * 0.4, 0, 0.001]}>
            <planeGeometry args={[0.8 * (zombie.health / zombie.maxHealth), 0.06]} />
            <meshBasicMaterial color={zombie.health / zombie.maxHealth > 0.5 ? '#ff3333' : '#ff0000'} depthTest={false} />
          </mesh>
        </group>
      )}

      <group rotation={[isDying ? -deathProgress * Math.PI / 2 : 0, 0, 0]}>
        {/* ─── TORSO: capsule shape ─── */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.45, 8, SEG]} />
          <meshStandardMaterial color={clothColor} roughness={0.85} />
        </mesh>
        {/* Chest volume */}
        <mesh position={[0, 1.2, 0.05]} castShadow>
          <sphereGeometry args={[0.22, SEG, SEG]} />
          <meshStandardMaterial color={clothDark} roughness={0.9} />
        </mesh>
        {/* Ribcage / exposed skin patches */}
        <mesh position={[-0.12, 1.0, 0.18]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={skinDark} roughness={0.95} />
        </mesh>
        <mesh position={[0.1, 1.05, 0.19]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={skinDark} roughness={0.95} />
        </mesh>

        {/* ─── PELVIS ─── */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.15, 6, SEG]} />
          <meshStandardMaterial color={clothDark} roughness={0.9} />
        </mesh>

        {/* ─── HEAD: sphere with jaw ─── */}
        <group position={[0, 1.58, 0]} rotation={[headTilt, 0, headTilt * 0.5]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.15, SEG, SEG]} />
            <meshStandardMaterial color={skinColor} roughness={0.75} />
          </mesh>
          {/* Jaw / lower face */}
          <mesh position={[0, -0.08, 0.08]}>
            <sphereGeometry args={[0.1, SEG, 8]} />
            <meshStandardMaterial color={skinDark} roughness={0.8} />
          </mesh>
          {/* Brow ridge */}
          <mesh position={[0, 0.06, 0.12]}>
            <capsuleGeometry args={[0.03, 0.12, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color={skinDark} roughness={0.8} />
          </mesh>
          {/* Eyes — glowing */}
          <mesh position={[-0.055, 0.02, 0.13]}>
            <sphereGeometry args={[0.025, SEG, SEG]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff2200" emissiveIntensity={4} />
          </mesh>
          <mesh position={[0.055, 0.02, 0.13]}>
            <sphereGeometry args={[0.025, SEG, SEG]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff2200" emissiveIntensity={4} />
          </mesh>
          {/* Mouth / teeth */}
          <mesh position={[0, -0.06, 0.14]}>
            <capsuleGeometry args={[0.015, 0.06, 4, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1a0404" roughness={0.9} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color={skinDark} roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color={skinDark} roughness={0.9} />
          </mesh>
        </group>

        {/* ─── NECK ─── */}
        <mesh position={[0, 1.42, 0.02]}>
          <capsuleGeometry args={[0.06, 0.08, 4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.85} />
        </mesh>

        {/* ─── LEFT ARM ─── */}
        <group position={[-0.3, 1.25, 0]} rotation={[zombie.state === 'attacking' ? -1.4 : -0.9 + limbSwing * 0.3, 0, 0.2]}>
          {/* Shoulder */}
          <mesh position={[-0.02, 0, 0]}>
            <sphereGeometry args={[0.08, SEG, SEG]} />
            <meshStandardMaterial color={clothColor} roughness={0.85} />
          </mesh>
          {/* Upper arm */}
          <mesh position={[0, -0.18, 0.06]} castShadow>
            <capsuleGeometry args={[0.055, 0.22, 6, SEG]} />
            <meshStandardMaterial color={clothColor} roughness={0.85} />
          </mesh>
          {/* Elbow */}
          <mesh position={[0, -0.32, 0.15]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.4, 0.25]} castShadow>
            <capsuleGeometry args={[0.04, 0.18, 6, SEG]} />
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.5, 0.32]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={skinDark} roughness={0.9} />
          </mesh>
        </group>

        {/* ─── RIGHT ARM ─── */}
        <group position={[0.3, 1.25, 0]} rotation={[zombie.state === 'attacking' ? -1.4 : -0.9 - limbSwing * 0.3, 0, -0.2]}>
          <mesh position={[0.02, 0, 0]}>
            <sphereGeometry args={[0.08, SEG, SEG]} />
            <meshStandardMaterial color={clothColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.18, 0.06]} castShadow>
            <capsuleGeometry args={[0.055, 0.22, 6, SEG]} />
            <meshStandardMaterial color={clothColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.32, 0.15]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.4, 0.25]} castShadow>
            <capsuleGeometry args={[0.04, 0.18, 6, SEG]} />
            <meshStandardMaterial color={skinColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.5, 0.32]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={skinDark} roughness={0.9} />
          </mesh>
        </group>

        {/* ─── LEFT LEG ─── */}
        <group position={[-0.1, 0.65, 0]} rotation={[limbSwing, 0, 0]}>
          {/* Hip joint */}
          <mesh><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color={clothDark} roughness={0.9} /></mesh>
          {/* Thigh */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.25, 6, SEG]} />
            <meshStandardMaterial color={clothDark} roughness={0.9} />
          </mesh>
          {/* Knee */}
          <mesh position={[0, -0.38, 0]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial color={clothDark} roughness={0.9} /></mesh>
          {/* Shin */}
          <mesh position={[0, -0.52, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.2, 6, SEG]} />
            <meshStandardMaterial color={clothDark} roughness={0.9} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.65, 0.04]}>
            <capsuleGeometry args={[0.04, 0.08, 4, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1a1a10" roughness={0.95} />
          </mesh>
        </group>

        {/* ─── RIGHT LEG ─── */}
        <group position={[0.1, 0.65, 0]} rotation={[-limbSwing, 0, 0]}>
          <mesh><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color={clothDark} roughness={0.9} /></mesh>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.25, 6, SEG]} />
            <meshStandardMaterial color={clothDark} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.38, 0]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial color={clothDark} roughness={0.9} /></mesh>
          <mesh position={[0, -0.52, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.2, 6, SEG]} />
            <meshStandardMaterial color={clothDark} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.65, 0.04]}>
            <capsuleGeometry args={[0.04, 0.08, 4, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1a1a10" roughness={0.95} />
          </mesh>
        </group>
      </group>

      {/* Tank glow */}
      {zombie.type === 'tank' && !isDying && (
        <pointLight position={[0, 1.5, 0]} color="#440000" intensity={1.5} distance={4} />
      )}
    </group>
  );
}

// ─── GAME HUD ───────────────────────────────────────────

function GameHUD({ gameState }: { gameState: GameState }) {
  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Health bar — bottom left */}
        <div className="absolute bottom-8 left-8">
          <div className="text-white text-xs mb-1 font-bold drop-shadow-lg tracking-wider">HEALTH</div>
          <div className="w-52 h-5 bg-black/60 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(gameState.health / gameState.maxHealth) * 100}%`,
                backgroundColor: gameState.health > 60 ? '#22c55e' : gameState.health > 30 ? '#eab308' : '#ef4444',
                boxShadow: `0 0 10px ${gameState.health > 60 ? '#22c55e' : gameState.health > 30 ? '#eab308' : '#ef4444'}`,
              }}
            />
          </div>
          <div className="text-white/70 text-xs mt-1 font-mono">{Math.ceil(gameState.health)} / {gameState.maxHealth}</div>
        </div>

        {/* Wave / Score — top right */}
        <div className="absolute top-20 right-8 text-right">
          <div className="text-red-500 text-4xl font-black drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255,0,0,0.5)' }}>
            WAVE {gameState.wave}
          </div>
          <div className="text-white text-xl font-bold drop-shadow-lg mt-1">Score: {gameState.score}</div>
          <div className="text-gray-300 text-base drop-shadow-lg">Kills: {gameState.kills}</div>
          <div className="text-yellow-300 text-base drop-shadow-lg font-semibold mt-1">
            Remaining: {gameState.zombiesRemaining}
          </div>
        </div>

        {/* Ammo / weapon indicator — bottom right */}
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-white/50 text-xs tracking-wider">WEAPON</div>
          <div className="text-white text-lg font-bold">Assault Rifle</div>
          <div className="text-yellow-300 text-sm font-mono">INF / INF</div>
        </div>

        {/* Wave complete banner */}
        {gameState.waveComplete && !gameState.gameOver && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
            <div
              className="text-green-400 text-5xl font-black drop-shadow-lg animate-bounce"
              style={{ textShadow: '0 0 30px rgba(0,255,0,0.5)' }}
            >
              WAVE {gameState.wave} COMPLETE!
            </div>
            <div className="text-white text-xl mt-3 drop-shadow-lg">
              +30 HP | Next wave incoming...
            </div>
          </div>
        )}

        {/* Game over */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-red-300 text-7xl font-black" style={{ textShadow: '0 0 40px rgba(255,0,0,0.6)' }}>
                GAME OVER
              </div>
              <div className="text-white text-2xl mt-6 font-semibold">
                Score: {gameState.score} | Kills: {gameState.kills} | Wave: {gameState.wave}
              </div>
              <div className="text-gray-300 text-lg mt-3">
                Press ESC, then toggle Zombie Mode off/on to restart
              </div>
            </div>
          </div>
        )}

        {/* Damage vignette when low health */}
        {gameState.health < 40 && !gameState.gameOver && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent 50%, rgba(255,0,0,${0.3 * (1 - gameState.health / 40)}) 100%)`,
            }}
          />
        )}
      </div>
    </Html>
  );
}
