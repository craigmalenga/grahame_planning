import { useStore } from '../store/useStore';
import { saveProject, exportProjectToFile } from '../utils/projectStorage';
import type { SavedProject } from '../types';

export function Header() {
  const { viewMode, floorPlan, setViewMode, sceneConfig, customTextures, savedProjectId, setSavedProjectId } = useStore();

  const handleQuickSave = () => {
    if (!floorPlan) return;
    const project: SavedProject = {
      version: '1.0',
      name: floorPlan.name || 'Untitled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      floorPlan,
      sceneConfig,
      customTextures,
    };
    const id = saveProject(project);
    setSavedProjectId(id);
  };

  const handleExport = () => {
    if (!floorPlan) return;
    exportProjectToFile({
      version: '1.0',
      name: floorPlan.name || 'Untitled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      floorPlan,
      sceneConfig,
      customTextures,
    });
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">3D</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-sm leading-none">FloorVision 3D</h1>
          <p className="text-xs text-gray-400 leading-none mt-0.5">Floor Plan Designer</p>
        </div>
      </div>

      {floorPlan && viewMode !== 'upload' && (
        <div className="ml-8 flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('design')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setViewMode('3d-view')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === '3d-view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            3D View
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {floorPlan && (
          <>
            <span className="text-xs text-gray-400">
              {floorPlan.name} — {floorPlan.rooms.length} room{floorPlan.rooms.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handleQuickSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 shadow-sm"
                title="Save project (Ctrl+S)"
              >
                Save
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                title="Export to .json file"
              >
                Export
              </button>
              <button
                onClick={() => setViewMode('upload')}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
              >
                Home
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
