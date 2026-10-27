import React from 'react';
import { Sparkles, Wand2, ArrowUpRight, Loader2, CheckCircle2, SplitSquareVertical } from 'lucide-react';
import { UpscaleState, VideoTake } from '../types/flux';

interface UpscaleBannerProps {
  currentTake: VideoTake | null;
  upscaleState: UpscaleState;
  onUpscale: (targetResolution: '1080p' | '4K') => void;
  onCompareWithDraft?: (draftId: string) => void;
  originalDraftTake?: VideoTake | null;
}

export const UpscaleBanner: React.FC<UpscaleBannerProps> = ({
  currentTake,
  upscaleState,
  onUpscale,
  onCompareWithDraft,
  originalDraftTake,
}) => {
  if (!currentTake) return null;

  // 1. Loading state during upscale
  if (upscaleState.isUpscaling) {
    return (
      <div className="bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/40 rounded-xl p-3 shadow-lg relative overflow-hidden animate-in fade-in">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="font-semibold text-purple-200">
              Upscaling video details...
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-purple-900/40 border border-purple-700/50 px-1.5 py-0.5 rounded">
              fal-ai/video-upscaler
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-purple-300">
            {upscaleState.progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-zinc-900/80 rounded-full overflow-hidden border border-purple-900/50 mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${upscaleState.progressPercent}%` }}
          />
        </div>

        <div className="text-[11px] text-zinc-400 font-mono truncate">
          {upscaleState.stepMessage}
        </div>
      </div>
    );
  }

  // 2. Draft complete: Show actionable banner
  const isDraft = currentTake.resolution === '480p' || currentTake.qualityTier === 'draft';
  if (isDraft) {
    return (
      <div className="bg-gradient-to-r from-zinc-900 via-purple-950/40 to-zinc-900 border border-purple-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              <span>Draft render complete (480p). Ready for production?</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Two-stage workflow: Reconstruct fine grain, edge resolution, and motion consistency
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Button: Upscale to 1080p HD */}
          <button
            type="button"
            onClick={() => onUpscale('1080p')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-950/50 border border-purple-400/40 transition-all active:scale-[0.98]"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-200" />
            <span>Upscale to 1080p HD</span>
          </button>

          {/* Secondary Button: Upscale to 4K */}
          <button
            type="button"
            onClick={() => onUpscale('4K')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 hover:border-zinc-600 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upscale to 4K</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Upscaled Video Info Banner (with Compare toggle to view original draft)
  if (currentTake.upscaledFromId && originalDraftTake) {
    return (
      <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between text-xs animate-in fade-in">
        <div className="flex items-center gap-2 text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">
            Upscaled to {currentTake.resolution} HD
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            via fal-ai/video-upscaler
          </span>
        </div>

        {onCompareWithDraft && (
          <button
            type="button"
            onClick={() => onCompareWithDraft(originalDraftTake.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-[11px] font-medium transition-colors"
            title="View original 480p draft for side-by-side comparison"
          >
            <SplitSquareVertical className="w-3 h-3 text-amber-400" />
            <span>Compare with 480p Draft</span>
          </button>
        )}
      </div>
    );
  }

  return null;
};
