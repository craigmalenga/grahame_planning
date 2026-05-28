import { useRef } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { UploadPanel } from './components/UploadPanel';
import { Scene3D } from './components/Scene3D';
import { TexturePanel } from './components/TexturePanel';
import { DesignMode } from './components/DesignMode';
import { ContextMenu3D } from './components/ContextMenu3D';
import { SaveLoadPanel } from './components/SaveLoadPanel';
import { HOUSE_TEMPLATES } from './utils/houseTemplates';

export default function App() {
  const {
    viewMode, setViewMode, isNightMode, setIsNightMode,
    controlMode, setControlMode, loadTemplate,
    zombieMode, setZombieMode,
    editMode3D, setEditMode3D, contextMenu3D, hideContextMenu3D,
    floorPlan,
  } = useStore();

  const totalArea = floorPlan?.rooms.reduce((sum, r) => {
    const w = r.bounds.maxX - r.bounds.minX;
    const d = r.bounds.maxY - r.bounds.minY;
    return sum + w * d;
  }, 0) ?? 0;

  const totalDoors = floorPlan?.rooms.reduce((sum, r) => sum + (r.doors?.length ?? 0), 0) ?? 0;
  const totalWindows = floorPlan?.rooms.reduce((sum, r) => sum + (r.windows?.length ?? 0), 0) ?? 0;

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-['Inter',sans-serif]" onClick={() => contextMenu3D && hideContextMenu3D()}>
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'upload' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <UploadPanel />

            {/* Saved projects */}
            <SaveLoadPanel />

            {/* Template Quick-Start */}
            <div className="mt-8 max-w-3xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Or start from a template
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => loadTemplate([])}
                  className="p-4 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 text-left hover:border-blue-400 hover:shadow-lg transition-all group"
                >
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    Blank Canvas
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Start from scratch.</div>
                  <div className="mt-2 text-xs text-blue-500 font-medium">Empty — click to start</div>
                </button>
                {HOUSE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t.generator())}
                    className="p-4 bg-white rounded-xl shadow-md border border-gray-200 text-left hover:border-orange-400 hover:shadow-lg transition-all group"
                  >
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-orange-600">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                    <div className="mt-2 text-xs text-orange-500 font-medium">{t.roomCount} rooms — click to load</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'design' && <DesignMode />}

        {viewMode === '3d-view' && (
          <>
            <div className="flex-1 relative">
              <Scene3D />

              {/* 3D view overlay controls */}
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setViewMode('design')}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Back to Design
                </button>

                <button
                  onClick={() => setEditMode3D(!editMode3D)}
                  className={`px-4 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all ${
                    editMode3D
                      ? 'bg-purple-700 text-white border-purple-600 hover:bg-purple-600'
                      : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  {editMode3D ? 'Edit Mode' : 'Edit Mode'}
                </button>

                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`px-4 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all ${
                    isNightMode
                      ? 'bg-indigo-900 text-yellow-300 border-indigo-700 hover:bg-indigo-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {isNightMode ? 'Night' : 'Day'}
                </button>

                <button
                  onClick={() => setControlMode(controlMode === 'orbit' ? 'firstperson' : 'orbit')}
                  className={`px-4 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all ${
                    controlMode === 'firstperson'
                      ? 'bg-green-700 text-white border-green-600 hover:bg-green-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {controlMode === 'firstperson' ? 'Walking' : 'Orbit'}
                </button>

                <button
                  onClick={() => setZombieMode(!zombieMode)}
                  className={`px-4 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all ${
                    zombieMode
                      ? 'bg-red-700 text-white border-red-600 hover:bg-red-600 animate-pulse'
                      : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                  }`}
                >
                  {zombieMode ? 'ZOMBIES!' : 'Zombie Mode'}
                </button>
              </div>

              {/* Property summary bar */}
              {floorPlan && (
                <div className="absolute top-4 right-[340px] bg-white/90 backdrop-blur rounded-lg shadow-lg px-3 py-2 text-xs text-gray-600 flex gap-3">
                  <span>{floorPlan.rooms.length} rooms</span>
                  <span>{totalArea.toFixed(0)} m²</span>
                  <span>{totalDoors} doors</span>
                  <span>{totalWindows} windows</span>
                </div>
              )}

              {/* Edit mode hints */}
              {editMode3D && controlMode === 'orbit' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-900/80 text-white px-4 py-2 rounded-lg text-xs backdrop-blur flex gap-4">
                  <span>Right-click walls/doors/windows/furniture for options</span>
                  <span>Click to select rooms</span>
                  <span>Measurements shown on selected room</span>
                </div>
              )}

              {controlMode === 'firstperson' && !zombieMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-xs backdrop-blur flex gap-4">
                  <span>Click to lock mouse</span>
                  <span>WASD to move</span>
                  <span>Mouse to look</span>
                  <span>Click doors/windows to open</span>
                  <span>ESC to unlock</span>
                </div>
              )}

              {/* Context menu overlay */}
              {contextMenu3D && <ContextMenu3D />}
            </div>
            <TexturePanel />
          </>
        )}
      </div>
    </div>
  );
}
