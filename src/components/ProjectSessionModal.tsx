import React, { useState } from 'react';
import { FluxProject, FluxGenerationParams } from '../types/flux';
import {
  createNewProject,
  duplicateProject,
  exportProjectAsJson,
} from '../utils/projectUtils';
import { formatRelativeTime } from '../utils/fluxVideoUtils';
import {
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
  Layers,
} from 'lucide-react';

export type SessionModalView = 'welcome' | 'saved_sessions' | 'create_new';

interface ProjectSessionModalProps {
  isOpen: boolean;
  initialView?: SessionModalView;
  projects: FluxProject[];
  currentProjectId: string;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
  onCreateProject: (title: string, template?: Partial<FluxGenerationParams>) => void;
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
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  if (!isOpen) return null;

  // Filter projects by search query only (no folders detail)
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.params.prompt.toLowerCase().includes(q)
    );
  });

  // Active project
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
      templateParams
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-hidden flex flex-col shadow-2xl relative text-neutral-100">
        
        {/* Apple Window Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-neutral-950/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* macOS traffic dots aesthetic */}
            <div className="flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 flex items-center justify-center group"
                aria-label="Close"
              >
                <X className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">
                  FLUX Studio
                </span>
                <span className="text-[11px] text-neutral-400">
                  {view === 'welcome'
                    ? 'Welcome'
                    : view === 'saved_sessions'
                    ? `Sessions (${projects.length})`
                    : 'New Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Sleek Segmented Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-950/80 p-0.5 rounded-lg border border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  view === 'welcome'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => setView('saved_sessions')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  view === 'saved_sessions'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sessions ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setView('create_new')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  view === 'create_new'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                New
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* VIEW 1: WELCOME SCREEN */}
        {view === 'welcome' && (
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-1.5 pt-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                FLUX Video Studio
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                High-fidelity video synthesis and multi-frame direction. Continue an existing session or begin a new composition.
              </p>
            </div>

            {/* Two Primary Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
              {/* Option 1: Create New Session */}
              <div
                onClick={() => setView('create_new')}
                className="group cursor-pointer p-6 rounded-2xl bg-neutral-950/50 hover:bg-neutral-900/60 border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 group-hover:bg-white/10 transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-neutral-100 transition-colors flex items-center gap-1.5">
                      <span>Create New Session</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Start fresh with clean timeline anchors, camera motions, and custom prompts.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Sparkles className="w-3 h-3 text-neutral-300" />
                  <span>Includes cinematic starter presets</span>
                </div>
              </div>

              {/* Option 2: Open Saved Session */}
              <div
                onClick={() => setView('saved_sessions')}
                className="group cursor-pointer p-6 rounded-2xl bg-neutral-950/50 hover:bg-neutral-900/60 border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 group-hover:bg-white/10 transition-all">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white group-hover:text-neutral-100 transition-colors flex items-center gap-1.5">
                        <span>Open Session</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/10">
                        {projects.length} saved
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Resume previous takes, upscale draft renders to 1080p/4K, and review history.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Clock className="w-3 h-3 text-neutral-300" />
                  <span>Auto-saved state & history</span>
                </div>
              </div>
            </div>

            {/* Quick Resume Active Session */}
            {activeProject && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl bg-neutral-950/40 border border-white/[0.07] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {activeProject.thumbnailUrl ? (
                    <img
                      src={activeProject.thumbnailUrl}
                      alt={activeProject.title}
                      className="w-12 h-12 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Recent:</span>
                      <span className="text-xs font-semibold text-white">
                        {activeProject.title}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({activeProject.takes.length} takes)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
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
                  className="px-3.5 py-1.5 rounded-lg bg-white text-neutral-950 font-medium text-xs hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SAVED SESSIONS LIBRARY WINDOW (FOLDERS COMPLETELY REMOVED) */}
        {view === 'saved_sessions' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Spotlight Search & Actions Bar */}
            <div className="p-3.5 border-b border-white/[0.08] bg-neutral-950/40 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'session' : 'sessions'}
                </span>
                <button
                  type="button"
                  onClick={() => setView('create_new')}
                  className="px-3 py-1.5 rounded-lg bg-white text-neutral-950 text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Session</span>
                </button>
              </div>
            </div>

            {/* Saved Sessions Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredProjects.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-neutral-950/30">
                  <Film className="w-8 h-8 text-neutral-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-300">No sessions found</p>
                  <p className="text-xs text-neutral-500 max-w-sm mt-1">
                    Try adjusting your search query, or initialize a new video generation session.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('create_new')}
                    className="mt-4 px-4 py-1.5 bg-white text-neutral-950 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors"
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
                        className={`group rounded-xl border transition-all duration-200 overflow-hidden flex flex-col bg-neutral-900/60 ${
                          isCurrent
                            ? 'border-white/30 ring-1 ring-white/20'
                            : 'border-white/[0.07] hover:border-white/20 hover:shadow-lg'
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
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-neutral-950">
                              <Film className="w-7 h-7 opacity-40 mb-1" />
                              <span className="text-[10px] font-mono">Empty Session</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-4 h-4 ml-0.5 fill-current" />
                            </div>
                          </div>

                          {/* Top Badges */}
                          {isCurrent && (
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-md text-white border border-white/20">
                                Current
                              </span>
                            </div>
                          )}

                          {/* Bottom Badges */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-neutral-200">
                              {totalTakes} {totalTakes === 1 ? 'take' : 'takes'}
                              {hdTakes > 0 ? ` • ${hdTakes} HD` : ''}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-neutral-300">
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
                                  className="w-full bg-neutral-950 border border-white/20 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="p-1 bg-white text-neutral-950 rounded text-xs font-semibold"
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
                                  className="text-xs font-semibold text-white group-hover:text-neutral-200 transition-colors line-clamp-1 cursor-pointer"
                                  title={project.title}
                                >
                                  {project.title}
                                </h4>
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(project, e)}
                                  className="p-1 text-neutral-500 hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Rename session"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                              {project.params.prompt}
                            </p>
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatRelativeTime(project.updatedAt)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => onDuplicateProject(project)}
                                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                                title="Duplicate session"
                              >
                                <Copy className="w-3 h-3" />
                              </button>

                              {/* Export JSON */}
                              <button
                                type="button"
                                onClick={() => exportProjectAsJson(project)}
                                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                                title="Export session JSON"
                              >
                                <Download className="w-3 h-3" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => onDeleteProject(project.id)}
                                className="p-1 text-neutral-500 hover:text-rose-400 rounded hover:bg-white/5 transition-colors"
                                title="Delete session"
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
                                className="ml-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
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

        {/* VIEW 3: CREATE NEW SESSION FORM (FOLDERS COMPLETELY REMOVED) */}
        {view === 'create_new' && (
          <form
            onSubmit={handleStartCreate}
            className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-5"
          >
            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">New Video Session</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure your session title and choose an optional starter template.
                </p>
              </div>

              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Session Title
                </label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Drone Pursuits Take 01"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                  autoFocus
                />
              </div>

              {/* Starter Template */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-neutral-300">
                  Starter Template Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedTemplate('blank')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'blank'
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/[0.08] bg-neutral-950/40 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">
                      Blank Slate
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      Clean defaults, ready for prompt input.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('cyberpunk')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'cyberpunk'
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/[0.08] bg-neutral-950/40 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">
                      Cyberpunk Sci-Fi 16:9
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      Neon alleyway dolly zoom with volumetric rain.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('nature')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'nature'
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/[0.08] bg-neutral-950/40 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">
                      Alpine Drone Flyover 16:9
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      Glacial high-altitude aerial flyover pass.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('vertical_fashion')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'vertical_fashion'
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/[0.08] bg-neutral-950/40 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block">
                      Vertical Fashion 9:16
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      High-fashion runway cape motion.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setView('welcome')}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-medium text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Studio</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
