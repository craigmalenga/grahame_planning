import type { SavedProject, StoredProjectMeta, FloorPlanData, SceneConfig, TextureInfo } from '../types';

const PROJECTS_KEY = '3dfloor_projects';
const AUTOSAVE_KEY = '3dfloor_autosave';

// ─── AUTO-SAVE ──────────────────────────────────────────

export function autoSave(floorPlan: FloorPlanData, sceneConfig: SceneConfig, customTextures: TextureInfo[]) {
  try {
    const data = JSON.stringify({ floorPlan, sceneConfig, customTextures, timestamp: Date.now() });
    localStorage.setItem(AUTOSAVE_KEY, data);
  } catch {
    // localStorage might be full — ignore
  }
}

export function loadAutoSave(): { floorPlan: FloorPlanData; sceneConfig: SceneConfig; customTextures: TextureInfo[] } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAutoSave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

// ─── PROJECT LIST ───────────────────────────────────────

interface StoredProject {
  id: string;
  meta: StoredProjectMeta;
  data: SavedProject;
}

function getProjects(): StoredProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setProjects(projects: StoredProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function listProjects(): StoredProjectMeta[] {
  return getProjects().map(p => p.meta).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function saveProject(project: SavedProject): string {
  const projects = getProjects();
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const meta: StoredProjectMeta = {
    id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    roomCount: project.floorPlan.rooms.length,
  };
  projects.push({ id, meta, data: project });
  setProjects(projects);
  return id;
}

export function updateProject(id: string, project: SavedProject) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx >= 0) {
    projects[idx].data = project;
    projects[idx].meta.name = project.name;
    projects[idx].meta.updatedAt = new Date().toISOString();
    projects[idx].meta.roomCount = project.floorPlan.rooms.length;
    setProjects(projects);
  }
}

export function loadProject(id: string): SavedProject | null {
  const proj = getProjects().find(p => p.id === id);
  return proj?.data ?? null;
}

export function deleteProject(id: string) {
  setProjects(getProjects().filter(p => p.id !== id));
}

export function renameProject(id: string, name: string) {
  const projects = getProjects();
  const proj = projects.find(p => p.id === id);
  if (proj) {
    proj.meta.name = name;
    proj.data.name = name;
    setProjects(projects);
  }
}

// ─── FILE EXPORT / IMPORT ───────────────────────────────

export function exportProjectToFile(project: SavedProject) {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.floorplan.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProjectFromFile(file: File): Promise<SavedProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.floorPlan || !data.version) {
          reject(new Error('Invalid project file format'));
          return;
        }
        resolve(data as SavedProject);
      } catch {
        reject(new Error('Failed to parse project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ─── SCREENSHOT EXPORT ──────────────────────────────────

export function exportScreenshot(canvas: HTMLCanvasElement, name: string) {
  const url = canvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}
