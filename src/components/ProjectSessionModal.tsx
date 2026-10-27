import React, { useState } from 'react';
import { FluxProject, FluxGenerationParams } from '../types/flux';
import {
  createNewProject,
  duplicateProject,
  filterProjects,
  exportProjectAsJson,
} from '../utils/projectUtils';
import { formatRelativeTime } from '../utils/fluxVideoUtils';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  Sparkles,
  Film,
  Clock,
  Trash2,
  Copy,
  Download,
  Search,
  Check,
  Edit2,
  X,
  Play,
  ArrowRight,
  Video,
  Layers,
  Star,
  FileText,
} from 'lucide-react';

export type SessionModalView = 'welcome' | 'saved_sessions' | 'create_new';

interface ProjectSessionModalProps {
  isOpen: boolean;
  initialView?: SessionModalView;
  projects: FluxProject[];
  currentProjectId: string;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
  onCreateProject: (title: string, template?: Partial<FluxGenerationParams>, folder?: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: FluxProject) => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
}

export const ProjectSessionModal: React.FC<ProjectSessionModalProps> = ({
  isOpen,
  initialView = 'welcome',
  projects,
  currentProjectId,
  onClose,
  onOpenProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
}) => {
  const [view, setView] = useState<SessionModalView>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectFolder, setNewProjectFolder] = useState('Default Projects');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  if (!isOpen) return null;

  // Extract unique folders
  const allFolders = Array.from(new Set(projects.map((p) => p.folder)));
  const filteredProjects = filterProjects(projects, selectedFolder, searchQuery);

  // Latest active project
  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const handleStartCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let templateParams: Partial<FluxGenerationParams> | undefined = undefined;

    if (selectedTemplate === 'cyberpunk') {
      templateParams = {
        workflowMode: 'text_to_video',
        prompt:
          'Cinematic 35mm anamorphic shot of a cybernetic courier in a neon-drenched Tokyo alleyway at night. Heavy rain splashing on asphalt, volumetric cyan and magenta holograms.',
        aspectRatio: '16:9',
        duration: 10,
        qualityTier: 'draft',
      };
    } else if (selectedTemplate === 'nature') {
      templateParams = {
        workflowMode: 'text_to_video',
        prompt:
          'Breathtaking high-altitude drone flyover across jagged snow-capped Alpine peaks during golden hour sunrise. Mist drifting through fir tree valleys.',
        aspectRatio: '16:9',
        duration: 10,
        qualityTier: 'final',
      };
    } else if (selectedTemplate === 'vertical_fashion') {
      templateParams = {
        workflowMode: 'text_to_video',
        prompt:
          'Vertical 9:16 high-fashion runway model walking toward camera in an avant-garde iridescent flowing silk cape. Dramatic low-angle studio lighting.',
        aspectRatio: '9:16',
        duration: 5,
        qualityTier: 'draft',
      };
    }

    onCreateProject(
      newProjectTitle.trim() || 'Untitled Session',
      templateParams,
      newProjectFolder
    );
    setNewProjectTitle('');
    onClose();
  };

  const handleStartRename = (project: FluxProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditTitleInput(project.title);
  };

  const handleSaveRename = (projectId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleInput.trim()) {
      onRenameProject(projectId, editTitleInput.trim());
    }
    setEditingProjectId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Film className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  FLUX Video Studio
                </span>
                <span className="text-[10px] uppercase font-semibold text-orange-400 bg-orange-950/70 border border-orange-800/60 px-1.5 py-0.5 rounded">
                  Sessions Manager
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {view === 'welcome'
                  ? 'Start a fresh production or resume a saved project'
                  : view === 'saved_sessions'
                  ? `Saved Sessions Library • ${projects.length} Saved Projects in Save Folder`
                  : 'Configure and initialize a new video generation session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view !== 'welcome' && (
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                Welcome Screen
              </button>
            )}

            {view !== 'saved_sessions' && (
              <button
                type="button"
                onClick={() => setView('saved_sessions')}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Saved Sessions ({projects.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: STARTUP WELCOME SCREEN */}
        {view === 'welcome' && (
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                FLUX Video Generation Studio
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                State-of-the-art dual-column AI video synthesis. Every project includes all your
                draft takes, 1080p/4K upscales, and timeline keyframes auto-saved to your project
                folder.
              </p>
            </div>

            {/* Two Primary Choices: Create New Session vs Open Saved Session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Option 1: Create New Session */}
              <div
                onClick={() => setView('create_new')}
                className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-orange-500/80 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      <span>Create New Session</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Initialize a clean studio take with custom prompt, workflow mode, and timeline
                      anchors.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] font-medium text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choose template or start blank</span>
                </div>
              </div>

              {/* Option 2: Open Saved Session */}
              <div
                onClick={() => setView('saved_sessions')}
                className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-purple-500/80 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <FolderOpen className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                        <span>Open Saved Session</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800">
                        {projects.length} Saved
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Browse your save folder of existing projects, resume previous takes, and batch
                      upscale drafts.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] font-medium text-purple-400">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Browse {projects.length} projects in Save Folder</span>
                </div>
              </div>
            </div>

            {/* Quick Resume Active Session */}
            {activeProject && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {activeProject.thumbnailUrl ? (
                    <img
                      src={activeProject.thumbnailUrl}
                      alt={activeProject.title}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Quick Resume:</span>
                      <span className="text-xs font-bold text-white">
                        {activeProject.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({activeProject.takes.length} takes)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {activeProject.params.prompt}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenProject(activeProject.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SAVED SESSIONS LIBRARY WINDOW */}
        {view === 'saved_sessions' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Folder Tabs & Search Controls */}
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolder('all')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                    selectedFolder === 'all'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All Folders ({projects.length})
                </button>
                {allFolders.map((folder) => {
                  const count = projects.filter((p) => p.folder === folder).length;
                  return (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setSelectedFolder(folder)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                        selectedFolder === folder
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Folder className="w-3 h-3" />
                      <span>{folder}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setView('create_new')}
                  className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Session</span>
                </button>
              </div>
            </div>

            {/* Saved Sessions Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredProjects.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                  <FolderOpen className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-sm font-medium text-zinc-300">No saved projects found</p>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Try adjusting your search query or folder filter, or create a new session.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('create_new')}
                    className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium"
                  >
                    Create New Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => {
                    const isCurrent = project.id === currentProjectId;
                    const isEditing = editingProjectId === project.id;
                    const totalTakes = project.takes.length;
                    const hdTakes = project.takes.filter((t) => t.resolution !== '480p').length;

                    return (
                      <div
                        key={project.id}
                        className={`group rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col bg-zinc-900/70 ${
                          isCurrent
                            ? 'border-orange-500 ring-1 ring-orange-500/30'
                            : 'border-zinc-800 hover:border-zinc-700 hover:shadow-xl'
                        }`}
                      >
                        {/* Thumbnail & Badges */}
                        <div
                          className="relative aspect-video w-full bg-black cursor-pointer overflow-hidden"
                          onClick={() => {
                            onOpenProject(project.id);
                            onClose();
                          }}
                        >
                          {project.thumbnailUrl ? (
                            <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900">
                              <Film className="w-8 h-8 opacity-40 mb-1" />
                              <span className="text-[10px] font-mono">No generations yet</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </div>
                          </div>

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-orange-400 font-bold border border-orange-500/30">
                              {project.folder}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                Active Now
                              </span>
                            )}
                          </div>

                          {/* Bottom Badges */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-zinc-200">
                              {totalTakes} {totalTakes === 1 ? 'Take' : 'Takes'}
                              {hdTakes > 0 ? ` • ${hdTakes} HD` : ''}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-zinc-300">
                              {project.params.aspectRatio}
                            </span>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div className="space-y-1">
                            {isEditing ? (
                              <form
                                onSubmit={(e) => handleSaveRename(project.id, e)}
                                className="flex items-center gap-1"
                              >
                                <input
                                  type="text"
                                  value={editTitleInput}
                                  onChange={(e) => setEditTitleInput(e.target.value)}
                                  className="w-full bg-zinc-950 border border-orange-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="p-1 bg-orange-600 text-white rounded text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <h4
                                  onClick={() => {
                                    onOpenProject(project.id);
                                    onClose();
                                  }}
                                  className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"
                                  title={project.title}
                                >
                                  {project.title}
                                </h4>
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(project, e)}
                                  className="p-1 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Rename project"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {project.params.prompt}
                            </p>
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatRelativeTime(project.updatedAt)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => onDuplicateProject(project)}
                                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                                title="Duplicate project"
                              >
                                <Copy className="w-3 h-3" />
                              </button>

                              {/* Export JSON */}
                              <button
                                type="button"
                                onClick={() => exportProjectAsJson(project)}
                                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                                title="Export session JSON"
                              >
                                <Download className="w-3 h-3" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => onDeleteProject(project.id)}
                                className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                                title="Delete project"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {/* Open Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenProject(project.id);
                                  onClose();
                                }}
                                className="ml-1 px-2.5 py-1 rounded-md bg-orange-600/90 hover:bg-orange-500 text-white font-semibold text-[11px] transition-colors"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: CREATE NEW SESSION FORM */}
        {view === 'create_new' && (
          <form
            onSubmit={handleStartCreate}
            className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-5"
          >
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Video Project Session</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set up a fresh project workspace. All generations, keyframes, and prompt history
                  will be auto-saved in this project.
                </p>
              </div>

              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Drone Pursuits Take 01"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              {/* Save Folder Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Save Folder / Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectFolder}
                    onChange={(e) => setNewProjectFolder(e.target.value)}
                    placeholder="Folder name"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) setNewProjectFolder(e.target.value);
                    }}
                    value=""
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="" disabled>
                      Existing Folders...
                    </option>
                    {allFolders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Starter Template */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Starter Template Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedTemplate('blank')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'blank'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      Blank Slate
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Standard defaults, ready for prompt input.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('cyberpunk')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'cyberpunk'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      Cyberpunk Sci-Fi 16:9
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Neon alleyway dolly zoom with volumetric rain.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('nature')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'nature'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      Alpine Drone Flyover 16:9
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Glacial high-altitude aerial flyover pass.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('vertical_fashion')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'vertical_fashion'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      Vertical Fashion 9:16
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      High-fashion runway cape motion at 60fps.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setView('welcome')}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-orange-600/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Launch Studio</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
