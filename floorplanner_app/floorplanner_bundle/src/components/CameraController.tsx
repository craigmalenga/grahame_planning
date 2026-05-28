import { useRef, useEffect, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

interface Props {
  center: [number, number, number];
  extent: number; // max building dimension for camera distance
}

export function CameraController({ center, extent }: Props) {
  const { controlMode, cameraResetKey } = useStore();

  if (controlMode === 'firstperson') {
    return <FirstPersonCamera center={center} extent={extent} />;
  }

  return <OrbitCamera center={center} extent={extent} />;
}

function OrbitCamera({ center, extent }: Props) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const hasInitialized = useRef(false);
  const { cameraResetKey } = useStore();

  // Reset camera to a good orbit position
  useEffect(() => {
    const dist = Math.max(8, extent * 1.5);
    camera.position.set(center[0] + dist * 0.3, Math.max(6, extent * 0.8), center[2] + dist * 0.7);
    camera.near = 0.1;
    camera.far = 500;
    (camera as THREE.PerspectiveCamera).fov = 60;
    camera.updateProjectionMatrix();
    camera.lookAt(center[0], 0, center[2]);

    if (controlsRef.current) {
      controlsRef.current.target.set(center[0], 0, center[2]);
      controlsRef.current.update();
    }
    hasInitialized.current = true;
  }, [cameraResetKey]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={new THREE.Vector3(center[0], 0, center[2])}
      maxPolarAngle={Math.PI * 0.85}
      minDistance={1}
      maxDistance={Math.max(50, extent * 3)}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

function FirstPersonCamera({ center, extent }: Props) {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<Set<string>>(new Set());
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());

  const moveSpeed = 5;
  const eyeHeight = 1.6;
  const interactDistance = 4;

  // On mount: set up the camera for FPS view — position OUTSIDE the building
  useEffect(() => {
    camera.position.set(center[0], eyeHeight, center[2] + extent * 0.6 + 3);
    camera.near = 0.1;
    camera.far = 500;
    (camera as THREE.PerspectiveCamera).fov = 75;
    camera.updateProjectionMatrix();
    camera.lookAt(center[0], eyeHeight, center[2]);
  }, []);

  const handleInteract = useCallback(() => {
    if (!isLockedRef.current) return;
    // Don't interact with doors/windows in zombie mode — shooting is handled by ZombieSurvival
    if (useStore.getState().zombieMode) return;

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.current.far = interactDistance;

    const intersects = raycaster.current.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj) {
        const userData = (obj as any).__r3f;
        if (userData?.handlers?.onClick) {
          const event = {
            stopPropagation: () => {},
            point: intersects[0].point,
            distance: intersects[0].distance,
            object: intersects[0].object,
            face: intersects[0].face,
          };
          userData.handlers.onClick(event);
          return;
        }
        if ((obj as any).onClick) {
          (obj as any).onClick({
            stopPropagation: () => {},
            point: intersects[0].point,
            distance: intersects[0].distance,
            object: intersects[0].object,
          });
          return;
        }
        obj = obj.parent;
      }

      const domEvent = new PointerEvent('pointerdown', {
        clientX: gl.domElement.width / 2,
        clientY: gl.domElement.height / 2,
        bubbles: true,
      });
      gl.domElement.dispatchEvent(domEvent);
      setTimeout(() => {
        gl.domElement.dispatchEvent(new PointerEvent('pointerup', {
          clientX: gl.domElement.width / 2,
          clientY: gl.domElement.height / 2,
          bubbles: true,
        }));
      }, 16);
    }
  }, [camera, scene, gl]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onMouseDown = (e: MouseEvent) => {
      if (isLockedRef.current && e.button === 0) handleInteract();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [handleInteract]);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const dt = Math.min(delta, 0.1);
    velocity.current.x -= velocity.current.x * 8.0 * dt;
    velocity.current.z -= velocity.current.z * 8.0 * dt;

    direction.current.z = Number(keys.current.has('KeyW') || keys.current.has('ArrowUp')) -
      Number(keys.current.has('KeyS') || keys.current.has('ArrowDown'));
    direction.current.x = Number(keys.current.has('KeyD') || keys.current.has('ArrowRight')) -
      Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft'));

    if (direction.current.z !== 0 || direction.current.x !== 0) {
      direction.current.normalize();
    }

    velocity.current.z -= direction.current.z * moveSpeed * dt * 10;
    velocity.current.x -= direction.current.x * moveSpeed * dt * 10;

    controlsRef.current.moveRight(-velocity.current.x * dt);
    controlsRef.current.moveForward(-velocity.current.z * dt);

    camera.position.y = eyeHeight;
  });

  return (
    <>
      <PointerLockControls
        ref={controlsRef}
        onLock={() => { isLockedRef.current = true; setIsLocked(true); }}
        onUnlock={() => { isLockedRef.current = false; setIsLocked(false); }}
      />
      {isLocked && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-8 h-8">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2 opacity-80" style={{ boxShadow: '0 0 3px rgba(0,0,0,0.8)' }} />
              <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white -translate-x-1/2 opacity-80" style={{ boxShadow: '0 0 3px rgba(0,0,0,0.8)' }} />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
