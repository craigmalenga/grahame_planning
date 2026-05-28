import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  listProjects, saveProject, loadProject, deleteProject, renameProject,
  exportProjectToFile, importProjectFromFile, loadAutoSave,
} from '../utils/projectStorage';
import type { SavedProject, StoredProjectMeta } from '../types';

export function SaveLoadPanel() {
  const {
    floorPlan, sceneConfig, customTextures, setFloorPlan, updateSceneConfig,
    addCustomTexture, setViewMode, savedProjectId, setSavedProjectId,
  } = useStore();

  const [projects, setProjects] = useState<StoredProjectMeta[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [autoSaveAvailable, setAutoSaveAvailable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjects(listProjects());
    setAutoSaveAvailable(!!loadAutoSave());
  }, []);

  const refreshProjects = () => setProjects(listProjects());

  const buildSavedProject = (): SavedProject => ({
    version: '1.0',
    name: floorPlan?.name || 'Untitled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    floorPlan: floorPlan!,
    sceneConfig,
    customTextures,
  });

  const handleSave = () => {
    if (!floorPlan) return;
    const project = buildSavedProject();
    const id = saveProject(project);
    setSavedProjectId(id);
    refreshProjects();
  };

  const handleExportFile = () => {
    if (!floorPlan) return;
    exportProjectToFile(buildSavedProject());
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const project = await importProjectFromFile(file);
      setFloorPlan(project.floorPlan);
      updateSceneConfig(project.sceneConfig);
      project.customTextures?.forEach(t => addCustomTexture(t));
      setViewMode('design');
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const handleLoadProject = (id: string) => {
    const project = loadProject(id);
    if (!project) return;
    setFloorPlan(project.floorPlan);
    updateSceneConfig(project.sceneConfig);
    project.customTextures?.forEach(t => addCustomTexture(t));
    setSavedProjectId(id);
    setViewMode('design');
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    refreshProjects();
  };

  const handleRecoverAutoSave = () => {
    const data = loadAutoSave();
    if (!data) return;
    setFloorPlan(data.floorPlan);
    updateSceneConfig(data.sceneConfig);
    data.customTextures?.forEach(t => addCustomTexture(t));
    setViewMode('design');
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Projects</h2>

      <div className="flex gap-2 mb-4">
        {floorPlan && (
          <>
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow">
              Save Project
            </button>
            <button onClick={handleExportFile}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow">
              Export to File
            </button>
          </>
        )}
        <button onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-300 shadow">
          Import from File
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />

        {autoSaveAvailable && !floorPlan && (
          <button onClick={handleRecoverAutoSave}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 shadow animate-pulse">
            Recover Auto-Save
          </button>
        )}
      </div>

      {/* Saved project list */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <button onClick={() => setShowProjects(!showProjects)}
            className="text-sm text-blue-600 hover:underline">
            {showProjects ? 'Hide' : 'Show'} saved projects ({projects.length})
          </button>

          {showProjects && (
            <div className="space-y-2 mt-2">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.roomCount} rooms — {new Date(p.updatedAt).toLocaleDateString()} {new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLoadProject(p.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Load
                    </button>
                    <button onClick={() => handleDeleteProject(p.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
