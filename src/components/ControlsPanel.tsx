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
  Info,
  Maximize2,
  Smartphone,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  AspectRatio,
  DurationSeconds,
  FluxGenerationParams,
  QualityTier,
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
  desc: string;
}[] = [
  {
    id: 'text_to_video',
    label: 'Text to Video',
    icon: Type,
    desc: 'Prompt & camera motion synthesis',
  },
  {
    id: 'image_to_video',
    label: 'Image to Video',
    icon: ImageIcon,
    desc: 'Single starting keyframe asset',
  },
  {
    id: 'first_last_frame',
    label: 'First + Last Frame',
    icon: SplitSquareVertical,
    desc: 'Interpolate start & end targets',
  },
  {
    id: 'keyframes_timeline',
    label: 'Keyframes Timeline',
    icon: Clock,
    desc: 'Up to 10 anchored frames with timestamps',
  },
  {
    id: 'video_extend',
    label: 'Video Extend / Edit',
    icon: Film,
    desc: 'Extend clip or restyle motion',
  },
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
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 overflow-y-auto">
      {/* Panel Title */}
      <div className="p-4 pb-2 border-b border-zinc-900 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-400" />
            Creative Controls
          </h2>
          <p className="text-[11px] text-zinc-500">Configure FLUX generation pipeline</p>
        </div>
        <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
          Column 1
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* 1. Workflow Mode Tab Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            1. Workflow Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
            {WORKFLOW_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = params.workflowMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleModeChange(tab.id)}
                  disabled={disabled}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-left transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-b from-orange-500/20 to-orange-600/10 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                  title={tab.desc}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <span className="text-[11px] font-medium leading-tight text-center line-clamp-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Media Dropzones (Context-sensitive) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>2. Media Dropzones</span>
            <span className="text-[10px] font-mono text-zinc-500">Context Sensitive</span>
          </label>
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

        {/* 3. Prompt & Audio Direction */}
        <div className="space-y-3 pt-1 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>3. Prompt & Audio Direction</span>
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              {params.prompt.length} chars
            </span>
          </div>

          {/* Multiline Prompt Box */}
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={params.prompt}
              disabled={disabled}
              onChange={(e) => onChangeParams({ prompt: e.target.value })}
              placeholder="Describe scene motion, camera action, lighting dynamics, narrative cues..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/40 transition-all resize-y leading-relaxed"
            />

            {/* Quick Camera Tags */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> Camera:
              </span>
              {CAMERA_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddCameraTag(tag)}
                  disabled={disabled}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-orange-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Native Audio Toggle */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    params.nativeAudio
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {params.nativeAudio ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Generate Native Audio
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Automatically synthesizes synced audio matching the visual scene
                  </div>
                </div>
              </div>

              {/* iOS style toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={params.nativeAudio}
                disabled={disabled}
                onClick={() => onChangeParams({ nativeAudio: !params.nativeAudio })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  params.nativeAudio ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    params.nativeAudio ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Quick Presets */}
        <div className="space-y-3 pt-1 border-t border-zinc-900">
          <label className="text-xs font-semibold text-zinc-300 block">
            4. Quick Presets
          </label>

          {/* Aspect Ratio Chips */}
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400">Aspect Ratio</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9' as AspectRatio, label: '16:9 Landscape', icon: Maximize2 },
                { id: '9:16' as AspectRatio, label: '9:16 Vertical', icon: Smartphone },
                { id: '1:1' as AspectRatio, label: '1:1 Square', icon: Square },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = params.aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeParams({ aspectRatio: item.id })}
                    disabled={disabled}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white border-orange-500/80 shadow-xs'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Preset Buttons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Duration</span>
              <span className="text-[10px] text-orange-400 font-mono">Max 20s FLUX Single Take</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([5, 10, 15, 20] as DurationSeconds[]).map((dur) => {
                const isActive = params.duration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => onChangeParams({ duration: dur })}
                    disabled={disabled}
                    className={`py-2 rounded-lg border text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {dur}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution Quality Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-300">Resolution Quality</span>
              <span className="text-[10px] text-zinc-500 font-mono">Two-Stage Workflow</span>
            </div>

            {/* Segmented control */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
              {/* Draft (480p) */}
              <button
                type="button"
                onClick={() => onChangeParams({ qualityTier: 'draft' })}
                disabled={disabled}
                className={`p-2.5 rounded-lg text-left transition-all relative ${
                  params.qualityTier === 'draft'
                    ? 'bg-zinc-800 text-white border border-amber-500/70 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    Draft (480p)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                    Fast
                  </span>
                </div>
                <div className="text-[10px] text-amber-300/90 font-mono font-medium">
                  ~$0.30 • 5x faster
                </div>
              </button>

              {/* Full Quality (1080p) */}
              <button
                type="button"
                onClick={() => onChangeParams({ qualityTier: 'final' })}
                disabled={disabled}
                className={`p-2.5 rounded-lg text-left transition-all relative ${
                  params.qualityTier === 'final'
                    ? 'bg-zinc-800 text-white border border-orange-500/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    Full Quality (1080p)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/60 font-semibold">
                    Pro
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  ~$2.50 • Production grade
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Advanced Controls (Collapsible Accordion) */}
        <div className="pt-1 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            aria-expanded={showAdvanced}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              5. Advanced Controls
            </span>
            <span className="text-zinc-400">
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-4 text-xs">
              {/* Guidance Scale (Prompt Adherence) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Prompt Adherence (Guidance)</span>
                  <span className="font-mono text-orange-400">{params.guidanceScale.toFixed(1)}</span>
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
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>1.0 (Natural Motion)</span>
                  <span>Default: 3.5</span>
                  <span>8.0 (Strict Prompt)</span>
                </div>
              </div>

              {/* Transformation Strength */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Transformation Strength</span>
                  <span className="font-mono text-cyan-400">{params.transformationStrength.toFixed(2)}</span>
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
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>0.0 (Preserve Pixels)</span>
                  <span>1.0 (Reimagine)</span>
                </div>
              </div>

              {/* Inference Steps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Inference Steps</span>
                  <span className="font-mono text-amber-400">{params.inferenceSteps}</span>
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
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>15 (High Speed)</span>
                  <span>30 (Balanced)</span>
                  <span>50 (Fine Detail)</span>
                </div>
              </div>

              {/* Seed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Seed</span>
                  <span className="text-[10px] text-zinc-500">Deterministic Re-rolls</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.seed}
                    disabled={disabled}
                    onChange={(e) =>
                      onChangeParams({ seed: parseInt(e.target.value, 10) || 0 })
                    }
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeSeed}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 text-xs transition-colors"
                    title="Randomize seed"
                  >
                    <Dices className="w-3.5 h-3.5 text-orange-400" />
                    <span>🎲</span>
                  </button>
                </div>
              </div>

              {/* FPS selection */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Frame Rate (FPS)</span>
                  <span className="font-mono text-zinc-400">{params.fps} fps</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([24, 30, 60] as const).map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => onChangeParams({ fps: rate })}
                      disabled={disabled}
                      className={`py-1 text-xs font-mono rounded border ${
                        params.fps === rate
                          ? 'bg-zinc-800 text-white border-zinc-600'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {rate} fps
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
