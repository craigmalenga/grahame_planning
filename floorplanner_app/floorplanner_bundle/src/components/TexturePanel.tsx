import { useStore } from '../store/useStore';
import { TEXTURE_CATALOG, getTexture } from '../utils/textures';
import { useRef, useEffect, useCallback, useState } from 'react';
import type { DoorStyle } from '../types';

export function TexturePanel() {
  const {
    floorPlan,
    selectedRoomIndex,
    setSelectedRoomIndex,
    updateRoomTexture,
    updateRoomHeight,
    updateRoomName,
    toggleRoomFloor,
    toggleRoomCeiling,
    sceneConfig,
    updateSceneConfig,
    controlMode,
    setControlMode,
    setViewMode,
    customTextures,
    addCustomTexture,
    selectedDoorId, setSelectedDoorId, updateDoor, removeDoor,
    selectedWindowId, setSelectedWindowId, updateWindow, removeWindow,
    selectedFurnitureId, setSelectedFurnitureId, updateFurniture, removeFurniture,
  } = useStore();

  if (!floorPlan) return null;

  const selectedRoom = selectedRoomIndex !== null ? floorPlan.rooms[selectedRoomIndex] : null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-lg">Scene Editor</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('design')}
              className="text-xs text-brand-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50 font-medium"
            >
              Design
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
            >
              New Plan
            </button>
          </div>
        </div>

        {/* Camera mode toggle */}
        <div className="flex gap-1 bg-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setControlMode('orbit')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              controlMode === 'orbit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Orbit View
          </button>
          <button
            onClick={() => setControlMode('firstperson')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              controlMode === 'firstperson'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Walk Mode
          </button>
        </div>

        {controlMode === 'firstperson' && (
          <p className="text-xs text-brand-600 mt-2 bg-brand-50 p-2 rounded">
            Click the 3D view to lock cursor. WASD to move, mouse to look. ESC to unlock.
          </p>
        )}
      </div>

      {/* Room List */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Rooms ({floorPlan.rooms.length})
        </h3>
        <div className="space-y-1">
          {floorPlan.rooms.map((room, i) => (
            <button
              key={i}
              onClick={() => setSelectedRoomIndex(selectedRoomIndex === i ? null : i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedRoomIndex === i
                  ? 'bg-brand-100 text-brand-800 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{room.name}</span>
                <span className="text-xs text-gray-400">
                  {room.doors?.length || 0}D {room.windows?.length || 0}W
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {(room.bounds.maxX - room.bounds.minX).toFixed(1)}m x{' '}
                {(room.bounds.maxY - room.bounds.minY).toFixed(1)}m
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Room Editor */}
      {selectedRoom && selectedRoomIndex !== null && (
        <div className="p-4 flex-1 space-y-5">
          {/* Room Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={selectedRoom.name}
              onChange={(e) => updateRoomName(selectedRoomIndex, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Ceiling Height */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Ceiling Height: {selectedRoom.ceilingHeight.toFixed(1)}m
            </label>
            <input
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={selectedRoom.ceilingHeight}
              onChange={(e) => updateRoomHeight(selectedRoomIndex, parseFloat(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Floor/Ceiling visibility */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoom.showFloor}
                onChange={() => toggleRoomFloor(selectedRoomIndex)}
                className="accent-brand-600 w-4 h-4"
              />
              Show Floor
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoom.showCeiling}
                onChange={() => toggleRoomCeiling(selectedRoomIndex)}
                className="accent-brand-600 w-4 h-4"
              />
              Show Ceiling
            </label>
          </div>

          {/* Wall Texture */}
          <TextureSelector
            label="Wall Texture"
            category="wall"
            currentTexture={selectedRoom.wallTexture}
            onChange={(tex) => updateRoomTexture(selectedRoomIndex, 'wallTexture', tex)}
            customTextures={customTextures.filter(t => t.category === 'wall')}
          />

          {/* Floor Texture */}
          <TextureSelector
            label="Floor Texture"
            category="floor"
            currentTexture={selectedRoom.floorTexture}
            onChange={(tex) => updateRoomTexture(selectedRoomIndex, 'floorTexture', tex)}
            customTextures={customTextures.filter(t => t.category === 'floor')}
          />

          {/* Ceiling Texture */}
          <TextureSelector
            label="Ceiling Texture"
            category="ceiling"
            currentTexture={selectedRoom.ceilingTexture}
            onChange={(tex) => updateRoomTexture(selectedRoomIndex, 'ceilingTexture', tex)}
            customTextures={customTextures.filter(t => t.category === 'ceiling')}
          />

          {/* ─── Doors List ─── */}
          {selectedRoom.doors.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Doors ({selectedRoom.doors.length})
              </label>
              <div className="space-y-1">
                {selectedRoom.doors.map((d, i) => (
                  <div key={d.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-all ${
                      selectedDoorId === d.id ? 'bg-amber-100 border border-amber-300' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDoorId(selectedDoorId === d.id ? null : d.id)}
                  >
                    <span>Door {i + 1} ({d.type}) — {d.width.toFixed(1)}m</span>
                    <button onClick={(e) => { e.stopPropagation(); removeDoor(selectedRoomIndex, d.id); }}
                      className="text-red-400 hover:text-red-600">x</button>
                  </div>
                ))}
              </div>
              {selectedDoorId && (() => {
                const d = selectedRoom.doors.find(x => x.id === selectedDoorId);
                if (!d) return null;
                return (
                  <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 space-y-2">
                    <div className="flex gap-1 flex-wrap">
                      {(['single', 'double', 'sliding', 'french', 'glass'] as const).map(t => (
                        <button key={t} onClick={() => updateDoor(selectedRoomIndex, d.id, { type: t })}
                          className={`px-2 py-0.5 rounded text-[10px] border ${d.type === t ? 'bg-amber-200 border-amber-400 font-bold' : 'border-gray-200'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Width: {d.width.toFixed(2)}m</label>
                      <input type="range" min="0.6" max="2.0" step="0.05" value={d.width}
                        onChange={(e) => updateDoor(selectedRoomIndex, d.id, { width: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Style</label>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {([
                          { v: 'wood-natural', l: 'Wood', c: '#A0845C' },
                          { v: 'wood-dark', l: 'Dark', c: '#5C3A1E' },
                          { v: 'painted-white', l: 'White', c: '#FAFAFA' },
                          { v: 'glass-clear', l: 'Glass', c: '#B0D8F0' },
                          { v: 'metal-black', l: 'Metal', c: '#2A2A2A' },
                          { v: 'painted-blue', l: 'Blue', c: '#4A7AB5' },
                          { v: 'painted-red', l: 'Red', c: '#A63030' },
                          { v: 'painted-green', l: 'Green', c: '#3A7A4A' },
                        ] as { v: DoorStyle; l: string; c: string }[]).map(s => (
                          <button key={s.v} onClick={() => updateDoor(selectedRoomIndex, d.id, { style: s.v })}
                            className={`p-0.5 rounded border ${d.style === s.v ? 'ring-2 ring-amber-400' : 'border-gray-200'}`}
                            title={s.l}>
                            <div className="h-3 rounded" style={{ backgroundColor: s.c }} />
                            <div className="text-[7px] text-center">{s.l}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── Windows List ─── */}
          {selectedRoom.windows.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Windows ({selectedRoom.windows.length})
              </label>
              <div className="space-y-1">
                {selectedRoom.windows.map((w, i) => (
                  <div key={w.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-all ${
                      selectedWindowId === w.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedWindowId(selectedWindowId === w.id ? null : w.id)}
                  >
                    <span>Window {i + 1} ({w.type}) — {w.width.toFixed(1)}m</span>
                    <button onClick={(e) => { e.stopPropagation(); removeWindow(selectedRoomIndex, w.id); }}
                      className="text-red-400 hover:text-red-600">x</button>
                  </div>
                ))}
              </div>
              {selectedWindowId && (() => {
                const w = selectedRoom.windows.find(x => x.id === selectedWindowId);
                if (!w) return null;
                return (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-500">Width: {w.width.toFixed(2)}m</label>
                      <input type="range" min="0.3" max="3.0" step="0.05" value={w.width}
                        onChange={(e) => updateWindow(selectedRoomIndex, w.id, { width: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Height: {w.height.toFixed(2)}m</label>
                      <input type="range" min="0.3" max="2.5" step="0.05" value={w.height}
                        onChange={(e) => updateWindow(selectedRoomIndex, w.id, { height: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Sill: {w.sillHeight.toFixed(2)}m</label>
                      <input type="range" min="0" max="2.0" step="0.05" value={w.sillHeight}
                        onChange={(e) => updateWindow(selectedRoomIndex, w.id, { sillHeight: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500" />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── Furniture List ─── */}
          {selectedRoom.furniture.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Furniture ({selectedRoom.furniture.length})
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedRoom.furniture.map(f => (
                  <div key={f.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-all ${
                      selectedFurnitureId === f.id ? 'bg-green-100 border border-green-300' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedFurnitureId(selectedFurnitureId === f.id ? null : f.id)}
                  >
                    <span>{f.type}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFurniture(selectedRoomIndex, f.id); }}
                      className="text-red-400 hover:text-red-600">x</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Texture Upload */}
      <CustomTextureUpload />

      {/* Lighting Controls */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Lighting
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Ambient: {(sceneConfig.ambientLightIntensity * 100).toFixed(0)}%
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={sceneConfig.ambientLightIntensity}
              onChange={(e) => updateSceneConfig({ ambientLightIntensity: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Sun: {(sceneConfig.directionalLightIntensity * 100).toFixed(0)}%
            </label>
            <input
              type="range" min="0" max="2" step="0.1"
              value={sceneConfig.directionalLightIntensity}
              onChange={(e) => updateSceneConfig({ directionalLightIntensity: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Sun Color</label>
            <input
              type="color"
              value={sceneConfig.directionalLightColor}
              onChange={(e) => updateSceneConfig({ directionalLightColor: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomTextureUpload() {
  const { addCustomTexture } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState<'wall' | 'floor' | 'ceiling'>('wall');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Read file as data URL for client-side use
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const name = file.name.replace(/\.[^.]+$/, '');

      addCustomTexture({
        id,
        name,
        category,
        imageUrl: dataUrl,
        tileSize: 1.0,
        isCustom: true,
      });

      setIsUploading(false);

      // Also upload to server if project is saved
      // (for now, custom textures are stored client-side as data URLs)
      const formData = new FormData();
      formData.append('texture', file);
      formData.append('name', name);
      formData.append('category', category);
      // fetch('/api/textures/custom/PROJECT_ID', { method: 'POST', body: formData }).catch(() => {});
    };
    reader.onerror = () => setIsUploading(false);
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 border-t border-gray-100">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Upload Custom Texture
      </h3>
      <div className="flex gap-2 mb-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded-lg"
        >
          <option value="wall">Wall</option>
          <option value="floor">Floor</option>
          <option value="ceiling">Ceiling</option>
        </select>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Browse'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <p className="text-[10px] text-gray-400">
        Upload JPG, PNG, or WebP textures. They'll appear in the texture picker above.
      </p>
    </div>
  );
}

interface TextureSelectorProps {
  label: string;
  category: 'wall' | 'floor' | 'ceiling';
  currentTexture: string;
  onChange: (textureId: string) => void;
  customTextures?: Array<{ id: string; name: string; imageUrl: string }>;
}

function TextureSelector({ label, category, currentTexture, onChange, customTextures = [] }: TextureSelectorProps) {
  const builtinTextures = TEXTURE_CATALOG[category];

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {builtinTextures.map((tex) => (
          <TextureThumbnail
            key={tex.id}
            textureId={tex.id}
            name={tex.name}
            isSelected={currentTexture === tex.id}
            onClick={() => onChange(tex.id)}
          />
        ))}
        {customTextures.map((tex) => (
          <CustomTextureThumbnail
            key={tex.id}
            texture={tex}
            isSelected={currentTexture === tex.id}
            onClick={() => onChange(tex.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TextureThumbnail({
  textureId,
  name,
  isSelected,
  onClick,
}: {
  textureId: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const texture = getTexture(textureId, 1);
    if (texture.image) {
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(texture.image as HTMLCanvasElement, 0, 0, 48, 48);
    }
  }, [textureId]);

  return (
    <button
      onClick={onClick}
      className={`rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-200 scale-105'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      title={name}
    >
      <canvas ref={canvasRef} width={48} height={48} className="w-full aspect-square" />
      <div className="text-[10px] text-center py-0.5 bg-gray-50 truncate px-1">{name}</div>
    </button>
  );
}

function CustomTextureThumbnail({
  texture,
  isSelected,
  onClick,
}: {
  texture: { id: string; name: string; imageUrl: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-200 scale-105'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      title={texture.name}
    >
      <img
        src={texture.imageUrl}
        alt={texture.name}
        className="w-full aspect-square object-cover"
        style={{ imageRendering: 'auto' }}
      />
      <div className="text-[10px] text-center py-0.5 bg-purple-50 truncate px-1">{texture.name}</div>
    </button>
  );
}
