import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  HelpCircle,
  X,
  Layers,
  ChevronDown,
  Check,
  Plus,
  Play,
  Sliders,
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
    <header className="h-13 border-b border-white/[0.08] bg-neutral-950/80 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 text-neutral-100">
      {/* Studio Brand & Project Selector */}
      <div className="flex items-center gap-3">
        {/* App Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Film className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold tracking-tight text-white text-sm">FLUX</span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Project Selector Dropdown */}
        {activeProject && onOpenSessionManager && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/[0.08] text-xs transition-colors max-w-[180px] sm:max-w-[240px]"
              title="Sessions Manager"
            >
              <span className="font-medium text-neutral-200 truncate text-xs">
                {activeProject.title}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-neutral-900/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 z-50 text-left">
                <div className="p-2 border-b border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="font-medium text-neutral-400 uppercase tracking-wider text-[10px]">
                    Current Session
                  </span>
                  <span className="text-neutral-400 font-mono text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-neutral-300" /> Saved
                  </span>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenSessionManager('saved_sessions');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs font-medium text-white flex items-center justify-between transition-colors"
                  >
                    <span>Browse All Sessions</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {allProjects.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenSessionManager('create_new');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Session...</span>
                  </button>
                </div>

                {allProjects.length > 1 && (
                  <div className="pt-2 border-t border-white/[0.08]">
                    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider px-2 block mb-1">
                      Recent Sessions
                    </span>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
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
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-white/10 text-white font-semibold'
                                : 'text-neutral-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate pr-2">{p.title}</span>
                            <span className="text-[10px] font-mono text-neutral-500 shrink-0">
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
      </div>

      {/* Central Apple Segmented Control: Studio vs Gallery */}
      {onChangeView && (
        <div className="flex items-center bg-neutral-900/90 border border-white/[0.08] rounded-xl p-0.5 text-xs font-medium shadow-inner">
          <button
            type="button"
            onClick={() => onChangeView('studio')}
            className={`px-3.5 py-1 rounded-lg transition-all ${
              currentView === 'studio'
                ? 'bg-neutral-800 text-white shadow-xs font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => onChangeView('gallery')}
            className={`px-3.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'gallery'
                ? 'bg-neutral-800 text-white shadow-xs font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Gallery</span>
            {takesCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-700/80 text-neutral-300">
                {takesCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Right Toolset: Presets & Credits */}
      <div className="flex items-center gap-2.5">
        {/* Preset Scenes Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Load sample scene templates"
            aria-expanded={showPresetsMenu}
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {showPresetsMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-neutral-900/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 z-50 text-left">
              <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center justify-between">
                <span>Inspiration</span>
                <span className="font-mono text-neutral-400">Presets</span>
              </div>
              <div className="space-y-1 mt-1">
                {SAMPLE_PROMPTS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      onLoadPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-200 group-hover:text-white">
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                        {preset.aspectRatio}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compute Credits Balance Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900/60 border border-white/[0.08] text-xs text-neutral-300 font-mono">
          <span className="text-neutral-200 font-medium">${(userCredits * 0.004).toFixed(2)}</span>
        </div>

        {/* Shortcuts & Guide */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Studio Shortcuts"
          title="Studio Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-neutral-900/95 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <Film className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Keyboard Navigation</h3>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 pt-1">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 font-mono">
                <div className="p-2 rounded-lg bg-neutral-950/60 border border-white/[0.06] flex items-center justify-between">
                  <span>Play / Pause</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded text-[10px]">Space</kbd>
                </div>
                <div className="p-2 rounded-lg bg-neutral-950/60 border border-white/[0.06] flex items-center justify-between">
                  <span>Fullscreen</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded text-[10px]">F</kbd>
                </div>
                <div className="p-2 rounded-lg bg-neutral-950/60 border border-white/[0.06] flex items-center justify-between">
                  <span>Step Back</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded text-[10px]">←</kbd>
                </div>
                <div className="p-2 rounded-lg bg-neutral-950/60 border border-white/[0.06] flex items-center justify-between">
                  <span>Step Forward</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded text-[10px]">→</kbd>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 bg-white text-neutral-950 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
