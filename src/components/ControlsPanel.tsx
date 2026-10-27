import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  SplitSquareVertical,
  Clock,
  Film,
  Volume2,
  VolumeX,
  Sliders,
  ChevronDown,
  ChevronUp,
  Dices,
  Maximize2,
  Smartphone,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  AspectRatio,
  DurationSeconds,
  FluxGenerationParams,
  TimelineKeyframe,
  WorkflowMode,
} from '../types/flux';
import { MediaDropzones } from './MediaDropzones';
import { generateRandomSeed } from '../utils/fluxVideoUtils';

interface ControlsPanelProps {
  params: FluxGenerationParams;
  onChangeParams: (newParams: Partial<FluxGenerationParams>) => void;
  disabled?: boolean;
}

const WORKFLOW_TABS: {
  id: WorkflowMode;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'text_to_video', label: 'Text to Video', icon: Type },
  { id: 'image_to_video', label: 'Image to Video', icon: ImageIcon },
  { id: 'first_last_frame', label: 'Keyframe Pair', icon: SplitSquareVertical },
  { id: 'keyframes_timeline', label: 'Timeline', icon: Clock },
  { id: 'video_extend', label: 'Extend & Edit', icon: Film },
];

const CAMERA_TAGS = [
  'Dolly In',
  'Dynamic Orbit',
  'Drone Flyover',
  'Pan Right',
  'Crane Up',
  'FPV Dive',
  'Anamorphic 35mm',
  'Hyperlapse',
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  params,
  onChangeParams,
  disabled = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleModeChange = (mode: WorkflowMode) => {
    onChangeParams({ workflowMode: mode });
  };

  const handleAddCameraTag = (tag: string) => {
    const trimmed = params.prompt.trim();
    if (!trimmed.includes(tag)) {
      onChangeParams({
        prompt: trimmed ? `${trimmed}, ${tag}` : tag,
      });
    }
  };

  const handleRandomizeSeed = () => {
    const newSeed = generateRandomSeed();
    onChangeParams({ seed: newSeed });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Panel Header */}
      <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
          Studio Controls
        </span>
        <span className="text-[10px] font-mono text-neutral-500">
          FLUX.1 Turbo
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-6 flex-1">
        {/* Workflow Mode Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 block">
            Workflow Mode
          </label>
          <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-900/80 rounded-xl border border-white/[0.08]">
            {WORKFLOW_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = params.workflowMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleModeChange(tab.id)}
                  disabled={disabled}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-xs font-medium'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-3.5 h-3.5 mb-1" />
                  <span className="text-[10px] leading-tight text-center line-clamp-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Dropzones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Media Input
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Drag & Drop</span>
          </div>
          <MediaDropzones
            workflowMode={params.workflowMode}
            duration={params.duration}
            startFrameUrl={params.startFrameUrl}
            endFrameUrl={params.endFrameUrl}
            keyframes={params.keyframes}
            sourceVideoUrl={params.sourceVideoUrl}
            sourceVideoName={params.sourceVideoName}
            referenceImages={params.referenceImages || []}
            onUpdateStartFrame={(url) => onChangeParams({ startFrameUrl: url })}
            onUpdateEndFrame={(url) => onChangeParams({ endFrameUrl: url })}
            onUpdateKeyframes={(kfs: TimelineKeyframe[]) => onChangeParams({ keyframes: kfs })}
            onUpdateSourceVideo={(url, name) =>
              onChangeParams({ sourceVideoUrl: url, sourceVideoName: name })
            }
            onUpdateReferenceImages={(imgs) => onChangeParams({ referenceImages: imgs })}
          />
        </div>

        {/* Prompt & Audio Direction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Prompt & Motion Direction
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">
              {params.prompt.length} chars
            </span>
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={params.prompt}
              disabled={disabled}
              onChange={(e) => onChangeParams({ prompt: e.target.value })}
              placeholder="Describe scene motion, camera dynamics, lighting, and narrative atmosphere..."
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-all resize-y leading-relaxed"
            />

            {/* Subtle Camera Motion Pills */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-neutral-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-neutral-400" /> Camera:
              </span>
              {CAMERA_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddCameraTag(tag)}
                  disabled={disabled}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/[0.06] hover:border-white/20 transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sleek Apple Toggle: Native Audio */}
          <div className="bg-neutral-900/60 border border-white/[0.08] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  params.nativeAudio
                    ? 'bg-white/10 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {params.nativeAudio ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  Native Sound Design
                </div>
                <div className="text-[11px] text-neutral-400">
                  Synthesize synced dialogue, ambient audio, and foley
                </div>
              </div>
            </div>

            {/* Apple style toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={params.nativeAudio}
              disabled={disabled}
              onClick={() => onChangeParams({ nativeAudio: !params.nativeAudio })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                params.nativeAudio ? 'bg-white' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                  params.nativeAudio
                    ? 'translate-x-4 bg-neutral-950'
                    : 'translate-x-0.5 bg-neutral-200'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Format & Presets */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 block">
            Format & Quality
          </label>

          {/* Aspect Ratio Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Aspect Ratio</span>
              <span className="text-[10px] text-neutral-500 font-mono">{params.aspectRatio}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-white/[0.08]">
              {[
                { id: '16:9' as AspectRatio, label: '16:9', icon: Maximize2 },
                { id: '9:16' as AspectRatio, label: '9:16', icon: Smartphone },
                { id: '1:1' as AspectRatio, label: '1:1', icon: Square },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = params.aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeParams({ aspectRatio: item.id })}
                    disabled={disabled}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-neutral-800 text-white font-medium shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Duration</span>
              <span className="text-[10px] text-neutral-500 font-mono">{params.duration} seconds</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-white/[0.08]">
              {([5, 10, 15, 20] as DurationSeconds[]).map((dur) => {
                const isActive = params.duration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => onChangeParams({ duration: dur })}
                    disabled={disabled}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {dur}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Tier Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Resolution Quality</span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {params.qualityTier === 'draft' ? 'Fast Preview' : 'Production Master'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900/80 rounded-xl border border-white/[0.08]">
              {/* Draft (480p) */}
              <button
                type="button"
                onClick={() => onChangeParams({ qualityTier: 'draft' })}
                disabled={disabled}
                className={`p-2.5 rounded-lg text-left transition-all ${
                  params.qualityTier === 'draft'
                    ? 'bg-neutral-800 text-white border border-white/15 shadow-xs'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-white">Draft (480p)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-700/60 text-neutral-300 font-medium">
                    Fast
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  ~$0.30 • 5x faster
                </div>
              </button>

              {/* Full Quality (1080p) */}
              <button
                type="button"
                onClick={() => onChangeParams({ qualityTier: 'final' })}
                disabled={disabled}
                className={`p-2.5 rounded-lg text-left transition-all ${
                  params.qualityTier === 'final'
                    ? 'bg-neutral-800 text-white border border-white/15 shadow-xs'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-white">Full Quality (1080p)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/15 text-white font-medium">
                    HD
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  ~$2.50 • Production
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Controls Accordion */}
        <div className="pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            aria-expanded={showAdvanced}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Advanced Parameters
            </span>
            <span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-2 p-3.5 bg-neutral-900/60 border border-white/[0.08] rounded-xl space-y-4 text-xs">
              {/* Guidance Scale */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Prompt Adherence</span>
                  <span className="font-mono text-white text-[11px]">{params.guidanceScale.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={params.guidanceScale}
                  disabled={disabled}
                  onChange={(e) =>
                    onChangeParams({ guidanceScale: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Natural Motion (1.0)</span>
                  <span>Strict (8.0)</span>
                </div>
              </div>

              {/* Transformation Strength */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Transformation Strength</span>
                  <span className="font-mono text-white text-[11px]">{params.transformationStrength.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={params.transformationStrength}
                  disabled={disabled}
                  onChange={(e) =>
                    onChangeParams({ transformationStrength: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Preserve Pixels</span>
                  <span>Full Reimagine</span>
                </div>
              </div>

              {/* Inference Steps */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Inference Steps</span>
                  <span className="font-mono text-white text-[11px]">{params.inferenceSteps}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={params.inferenceSteps}
                  disabled={disabled}
                  onChange={(e) =>
                    onChangeParams({ inferenceSteps: parseInt(e.target.value, 10) })
                  }
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Fast (15)</span>
                  <span>High Detail (50)</span>
                </div>
              </div>

              {/* Seed */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Generation Seed</span>
                  <button
                    type="button"
                    onClick={handleRandomizeSeed}
                    disabled={disabled}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Randomize</span>
                  </button>
                </div>
                <input
                  type="number"
                  value={params.seed}
                  disabled={disabled}
                  onChange={(e) =>
                    onChangeParams({ seed: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
