import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { calcPolygonArea, wallLength } from '../utils/geometry';

export function Measurements3D() {
  const { floorPlan, selectedRoomIndex, editMode3D } = useStore();
  if (!floorPlan || !editMode3D) return null;

  return (
    <group>
      {floorPlan.rooms.map((room, ri) => {
        const isSelected = selectedRoomIndex === ri;
        const area = calcPolygonArea(room.walls);

        return (
          <group key={ri}>
            {/* Room area label on floor */}
            <Html
              position={[room.center.x, 0.02, room.center.y]}
              distanceFactor={8}
              center
              style={{ pointerEvents: 'none' }}
            >
              <div className={`px-2 py-1 rounded text-center whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 shadow'
              }`}>
                <div className="text-xs font-bold">{room.name}</div>
                <div className="text-[10px]">{area.toFixed(1)} m²</div>
              </div>
            </Html>

            {/* Wall dimension labels */}
            {isSelected && room.walls.map((wall, wi) => {
              const len = wallLength(wall);
              if (len < 0.3) return null;
              const midX = (wall.x1 + wall.x2) / 2;
              const midZ = (wall.y1 + wall.y2) / 2;
              const midY = room.ceilingHeight / 2;

              // Offset label perpendicular to wall
              const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
              const nx = -Math.sin(angle) * 0.3;
              const nz = Math.cos(angle) * 0.3;

              return (
                <Html
                  key={wi}
                  position={[midX + nx, midY, midZ + nz]}
                  distanceFactor={6}
                  center
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg">
                    {len.toFixed(2)}m
                  </div>
                </Html>
              );
            })}

            {/* Ceiling height indicator at corner */}
            {isSelected && (
              <Html
                position={[room.bounds.minX - 0.3, room.ceilingHeight / 2, room.bounds.minY - 0.3]}
                distanceFactor={6}
                center
                style={{ pointerEvents: 'none' }}
              >
                <div className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg">
                  H: {room.ceilingHeight.toFixed(1)}m
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
