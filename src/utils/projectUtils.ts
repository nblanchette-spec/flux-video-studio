import { FluxGenerationParams, FluxProject, VideoTake } from '../types/flux';
import { DEFAULT_FLUX_PARAMS, INITIAL_TAKES } from './fluxVideoUtils';

export const PROJECTS_STORAGE_KEY = 'flux_video_projects_v2';
export const LAST_ACTIVE_PROJECT_KEY = 'flux_last_active_project_id';

/**
 * Pre-seeded initial projects in the Save Folder
 */
export const INITIAL_PROJECTS: FluxProject[] = [
  {
    id: 'proj-001',
    title: 'Cyberpunk Tokyo Courier',
    description: 'Neon-lit nighttime alleyway pursuit with volumetric rain and holograms.',
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
    updatedAt: Date.now() - 3600000 * 2, // 2 hours ago
    folder: 'Sci-Fi Film',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      prompt:
        'Cinematic 35mm anamorphic shot of a cybernetic courier in a neon-drenched Tokyo alleyway at night. Heavy rain splashing on asphalt, volumetric cyan and magenta holograms, slow dynamic forward dolly zoom.',
      seed: 428914,
      aspectRatio: '16:9',
      duration: 15,
      qualityTier: 'draft',
    },
    takes: [
      INITIAL_TAKES[0],
      {
        ...INITIAL_TAKES[0],
        id: 'take-001-hd',
        title: 'Neon Tokyo Courier [1080p Master]',
        resolution: '1080p',
        qualityTier: 'final',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        costEstimate: 0.75,
        isFavorite: true,
      },
    ],
    currentTakeId: 'take-001-hd',
    thumbnailUrl: INITIAL_TAKES[0].posterUrl,
    isStarred: true,
  },
  {
    id: 'proj-002',
    title: 'Alpine Mountain Aerial Pass',
    description: 'High-altitude drone survey across glaciated Alpine peaks during sunrise.',
    createdAt: Date.now() - 3600000 * 48, // 2 days ago
    updatedAt: Date.now() - 3600000 * 1, // 1 hour ago
    folder: 'Nature & Drone',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      workflowMode: 'text_to_video',
      prompt:
        'Breathtaking high-altitude drone flyover across jagged snow-capped Alpine peaks during golden hour sunrise. Mist drifting through fir tree valleys, lens flare, crisp glacial reflections.',
      aspectRatio: '16:9',
      duration: 10,
      qualityTier: 'final',
      seed: 871293,
    },
    takes: [INITIAL_TAKES[1]],
    currentTakeId: INITIAL_TAKES[1].id,
    thumbnailUrl: INITIAL_TAKES[1].posterUrl,
    isStarred: false,
  },
  {
    id: 'proj-003',
    title: 'High-Fashion Iridescent Runway',
    description: 'Vertical 9:16 high-fashion commercial piece with slow-motion flowing fabrics.',
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
    updatedAt: Date.now() - 1800000, // 30 mins ago
    folder: 'Commercials',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      aspectRatio: '9:16',
      duration: 5,
      prompt:
        'Vertical 9:16 high-fashion runway model walking toward camera in an avant-garde iridescent flowing silk cape. Dramatic low-angle studio lighting, bokeh dust motes.',
      seed: 319402,
    },
    takes: [
      INITIAL_TAKES[2],
      INITIAL_TAKES[3],
    ],
    currentTakeId: INITIAL_TAKES[2].id,
    thumbnailUrl: INITIAL_TAKES[2].posterUrl,
    isStarred: true,
  },
];

/**
 * Load all saved projects from local storage or return initial seed
 */
export function loadProjectsFromStorage(): FluxProject[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      saveProjectsToStorage(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return INITIAL_PROJECTS;
  }
}

/**
 * Save all projects to local storage
 */
export function saveProjectsToStorage(projects: FluxProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

/**
 * Create a new project session
 */
export function createNewProject(
  title: string = 'Untitled Session',
  templateParams?: Partial<FluxGenerationParams>,
  folder?: string
): FluxProject {
  const id = `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const mergedParams: FluxGenerationParams = {
    ...DEFAULT_FLUX_PARAMS,
    seed: Math.floor(100000 + Math.random() * 900000000),
    ...templateParams,
  };

  return {
    id,
    title: title.trim() || 'Untitled Session',
    description: `Created on ${new Date().toLocaleDateString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    folder: folder?.trim() || undefined,
    params: mergedParams,
    takes: [],
    currentTakeId: null,
    thumbnailUrl: mergedParams.startFrameUrl || undefined,
    isStarred: false,
  };
}

/**
 * Duplicate an existing project
 */
export function duplicateProject(source: FluxProject): FluxProject {
  const id = `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const clonedTakes: VideoTake[] = source.takes.map((t) => ({
    ...t,
    id: `take-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  }));

  return {
    ...source,
    id,
    title: `${source.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    takes: clonedTakes,
    currentTakeId: clonedTakes.length > 0 ? clonedTakes[0].id : null,
  };
}

/**
 * Updates a specific project within the array and updates its timestamp
 */
export function updateProjectInList(
  projects: FluxProject[],
  updatedProject: FluxProject
): FluxProject[] {
  const index = projects.findIndex((p) => p.id === updatedProject.id);
  const stamped: FluxProject = {
    ...updatedProject,
    updatedAt: Date.now(),
    thumbnailUrl:
      updatedProject.takes.length > 0
        ? updatedProject.takes[0].posterUrl
        : updatedProject.params.startFrameUrl || undefined,
  };

  if (index === -1) {
    return [stamped, ...projects];
  }

  const copy = [...projects];
  copy[index] = stamped;
  return copy;
}

/**
 * Filters projects by folder and search term
 */
export function filterProjects(
  projects: FluxProject[],
  folderFilter: string = 'all',
  searchQuery: string = ''
): FluxProject[] {
  return projects.filter((p) => {
    if (folderFilter !== 'all' && p.folder && p.folder.toLowerCase() !== folderFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q) || false;
      const matchPrompt = p.params.prompt.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchPrompt;
    }
    return true;
  });
}

/**
 * Export project as a JSON file download
 */
export function exportProjectAsJson(project: FluxProject): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.title.replace(/[^a-z0-9]/gi, '_')}_session.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
