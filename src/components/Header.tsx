import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Cpu,
  Coins,
  HelpCircle,
  X,
  Layers,
  Wand2,
  Folder,
  FolderOpen,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { SAMPLE_PROMPTS } from '../utils/fluxVideoUtils';
import { AspectRatio, DurationSeconds, FluxProject } from '../types/flux';

interface HeaderProps {
  onLoadPreset: (preset: {
    prompt: string;
    aspectRatio: AspectRatio;
    duration: DurationSeconds;
    title: string;
  }) => void;
  userCredits: number;
  currentView?: 'studio' | 'gallery';
  onChangeView?: (view: 'studio' | 'gallery') => void;
  takesCount?: number;
  favoritesCount?: number;
  activeProject?: FluxProject;
  allProjects?: FluxProject[];
  onOpenSessionManager?: (view: 'welcome' | 'saved_sessions' | 'create_new') => void;
  onSwitchProject?: (projectId: string) => void;
  isAutoSaved?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadPreset,
  userCredits,
  currentView = 'studio',
  onChangeView,
  takesCount = 0,
  favoritesCount = 0,
  activeProject,
  allProjects = [],
  onOpenSessionManager,
  onSwitchProject,
  isAutoSaved = true,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Studio Brand & Project Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Film className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-bold tracking-tight text-white text-base">FLUX</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-orange-400 bg-orange-950/60 border border-orange-800/60 px-1.5 py-0.5 rounded">
              Video Studio
            </span>
          </div>
        </div>

        {/* Project / Session Selector Dropdown */}
        {activeProject && onOpenSessionManager && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/80 text-xs transition-colors max-w-[210px] sm:max-w-[260px]"
              title="Project Sessions & Save Folder"
            >
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-zinc-100 truncate text-[11px] sm:text-xs">
                {activeProject.title}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
                ({activeProject.folder})
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-2 z-50 text-left">
                <div className="p-2 border-b border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Active Project
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Auto-saved
                  </span>
                </div>

                <div className="py-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenSessionManager('saved_sessions');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-800 text-xs font-semibold text-white flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      <span>Open Saved Sessions Window</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {allProjects.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenSessionManager('create_new');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-800 text-xs font-semibold text-orange-400 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Session...</span>
                  </button>
                </div>

                {allProjects.length > 1 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2">
                      Switch Saved Project
                    </span>
                    <div className="mt-1 space-y-0.5 max-h-44 overflow-y-auto">
                      {allProjects.map((p) => {
                        const isCurrent = p.id === activeProject.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setShowProjectMenu(false);
                              if (onSwitchProject) onSwitchProject(p.id);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-orange-500/20 text-orange-300 font-bold'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span className="truncate pr-2">{p.title}</span>
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                              {p.takes.length} takes
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auto-saved badge */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto-saved to folder</span>
        </div>

        {/* View Switcher: Studio vs Gallery */}
        {onChangeView && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 ml-1 text-xs">
            <button
              type="button"
              onClick={() => onChangeView('studio')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'studio'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeView('gallery')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'gallery'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Gallery</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                {takesCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Preset Prompts Button */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title="Load sample scene templates"
            aria-expanded={showPresetsMenu}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scene Presets</span>
          </button>

          {showPresetsMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-50 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1 flex items-center justify-between">
                <span>Curated Inspiration</span>
                <span className="text-orange-400 font-mono">FLUX Takes</span>
              </div>
              <div className="space-y-1 mt-1">
                {SAMPLE_PROMPTS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      onLoadPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-800/90 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-amber-300">
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {preset.aspectRatio} • {preset.duration}s
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compute Credits Balance */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-mono">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-100">${(userCredits * 0.004).toFixed(2)}</span>
          <span className="text-[10px] text-zinc-500">({userCredits} cr)</span>
        </div>

        {/* Help / Guide */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          aria-label="Studio Guide & Shortcuts"
          title="Studio Guide & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">FLUX Video Studio Guide</h3>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                Experience the state-of-the-art FLUX Video Turbo generation pipeline organized into a dual-column workflow:
              </p>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-400" /> Workflow Modes
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li><strong>Text to Video:</strong> Pure prompt synthesis with camera motion direction.</li>
                  <li><strong>Image to Video:</strong> Seed motion starting from a single high-res keyframe.</li>
                  <li><strong>First + Last Frame:</strong> Cinematic interpolation bridging start & end compositions.</li>
                  <li><strong>Keyframes Timeline:</strong> Anchor up to 10 keyframes at specific seconds.</li>
                  <li><strong>Video Extend / Edit:</strong> Chain continuous takes or restyle existing footage.</li>
                </ul>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="font-semibold text-zinc-200 mb-1.5">Keyboard Shortcuts</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded">Space</kbd> Play / Pause</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded">←</kbd> Step Back 1 Frame</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded">→</kbd> Step Forward 1 Frame</div>
                  <div><kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded">F</kbd> Fullscreen Player</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
