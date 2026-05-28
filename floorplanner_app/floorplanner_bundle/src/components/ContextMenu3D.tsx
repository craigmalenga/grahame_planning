import { useStore } from '../store/useStore';

export function ContextMenu3D() {
  const {
    contextMenu3D, hideContextMenu3D, floorPlan,
    removeDoor, removeWindow, removeFurniture, removeRoom,
    updateRoomTexture, updateRoomHeight, updateWallTexture,
    setSelectedRoomIndex, setSelectedDoorId, setSelectedWindowId, setSelectedFurnitureId,
  } = useStore();

  if (!contextMenu3D || !floorPlan) return null;

  const { x, y, objectType, objectId, roomIndex } = contextMenu3D;
  const room = floorPlan.rooms[roomIndex];
  if (!room) return null;

  const close = () => hideContextMenu3D();

  const menuItems: { label: string; action: () => void; danger?: boolean }[] = [];

  if (objectType === 'wall') {
    const wallIndex = parseInt(objectId);
    menuItems.push(
      { label: 'Select Room', action: () => { setSelectedRoomIndex(roomIndex); close(); } },
      { label: 'Increase Height', action: () => { updateRoomHeight(roomIndex, room.ceilingHeight + 0.3); close(); } },
      { label: 'Decrease Height', action: () => { updateRoomHeight(roomIndex, Math.max(2, room.ceilingHeight - 0.3)); close(); } },
      { label: 'Paint Wall...', action: () => {
        // Cycle through textures as a quick action
        const textures = ['plaster-white', 'plaster-grey', 'brick-red', 'brick-white', 'concrete', 'wood-panel'];
        const current = room.walls[wallIndex]?.texture || room.wallTexture;
        const nextIdx = (textures.indexOf(current) + 1) % textures.length;
        updateWallTexture(roomIndex, wallIndex, textures[nextIdx]);
        close();
      }},
      { label: 'Delete Room', action: () => { removeRoom(roomIndex); close(); }, danger: true },
    );
  } else if (objectType === 'door') {
    menuItems.push(
      { label: 'Select Door', action: () => { setSelectedRoomIndex(roomIndex); setSelectedDoorId(objectId); close(); } },
      { label: 'Delete Door', action: () => { removeDoor(roomIndex, objectId); close(); }, danger: true },
    );
  } else if (objectType === 'window') {
    menuItems.push(
      { label: 'Select Window', action: () => { setSelectedRoomIndex(roomIndex); setSelectedWindowId(objectId); close(); } },
      { label: 'Delete Window', action: () => { removeWindow(roomIndex, objectId); close(); }, danger: true },
    );
  } else if (objectType === 'furniture') {
    menuItems.push(
      { label: 'Select Item', action: () => { setSelectedRoomIndex(roomIndex); setSelectedFurnitureId(objectId); close(); } },
      { label: 'Rotate 45°', action: () => {
        const { updateFurniture } = useStore.getState();
        const item = room.furniture.find(f => f.id === objectId);
        if (item) updateFurniture(roomIndex, objectId, { rotation: item.rotation + Math.PI / 4 });
        close();
      }},
      { label: 'Delete', action: () => { removeFurniture(roomIndex, objectId); close(); }, danger: true },
    );
  } else if (objectType === 'floor') {
    const textures = ['hardwood-oak', 'hardwood-walnut', 'marble-white', 'tile-grey', 'carpet-beige'];
    menuItems.push(
      { label: 'Select Room', action: () => { setSelectedRoomIndex(roomIndex); close(); } },
      { label: 'Change Floor Material', action: () => {
        const nextIdx = (textures.indexOf(room.floorTexture) + 1) % textures.length;
        updateRoomTexture(roomIndex, 'floorTexture', textures[nextIdx]);
        close();
      }},
    );
  } else if (objectType === 'ceiling') {
    menuItems.push(
      { label: 'Increase Height', action: () => { updateRoomHeight(roomIndex, room.ceilingHeight + 0.3); close(); } },
      { label: 'Decrease Height', action: () => { updateRoomHeight(roomIndex, Math.max(2, room.ceilingHeight - 0.3)); close(); } },
    );
  }

  return (
    <div
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[180px]"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 300) }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
        {objectType}
      </div>
      {menuItems.map((item, i) => (
        <button
          key={i}
          onClick={item.action}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
            item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
          }`}
        >
          {item.label}
        </button>
      ))}
      <div className="border-t border-gray-100">
        <button
          onClick={close}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
