import React from 'react';
import { Sparkles, Loader2, Check, ArrowLeftRight, Film } from 'lucide-react';
import { VideoTake, UpscaleState } from '../types/flux';

interface UpscaleBannerProps {
  currentTake: VideoTake | null;
  upscaleState: UpscaleState;
  onUpscale: (resolution: '1080p' | '4K') => void;
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

  // Active upscaling loading state
  if (upscaleState.isUpscaling && upscaleState.takeId === currentTake.id) {
    return (
      <div className="bg-neutral-900/80 border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-300" />
            <span className="font-medium text-white">
              {upscaleState.stepMessage || 'Upscaling video details...'}
            </span>
          </div>
          <span className="font-mono text-neutral-300 text-xs">
            {Math.round(upscaleState.progressPercent)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out rounded-full"
            style={{ width: `${upscaleState.progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Already upscaled take banner with option to compare with original 480p draft
  if (currentTake.resolution !== '480p' && currentTake.qualityTier === 'final') {
    return (
      <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Check className="w-3 h-3" />
          </div>
          <div>
            <span className="font-medium text-white">
              {currentTake.resolution} HD Master Ready
            </span>
            <span className="text-neutral-400 text-[11px] ml-1.5 hidden sm:inline">
              High-definition render
            </span>
          </div>
        </div>

        {originalDraftTake && onCompareWithDraft && (
          <button
            type="button"
            onClick={() => onCompareWithDraft(originalDraftTake.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            <ArrowLeftRight className="w-3 h-3 text-neutral-400" />
            <span>Compare with 480p Draft</span>
          </button>
        )}
      </div>
    );
  }

  // Draft mode complete: Offer Upscale
  if (currentTake.resolution === '480p' || currentTake.qualityTier === 'draft') {
    return (
      <div className="bg-neutral-900/80 border border-white/[0.08] rounded-2xl p-3.5 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-white">
              Draft render complete (480p). Ready for production?
            </div>
            <div className="text-[11px] text-neutral-400">
              Upscale to sharp high definition using video diffusion
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary CTA: 1080p */}
          <button
            type="button"
            onClick={() => onUpscale('1080p')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-medium text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Upscale to 1080p HD</span>
          </button>

          {/* Secondary CTA: 4K */}
          <button
            type="button"
            onClick={() => onUpscale('4K')}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
          >
            <span>Upscale to 4K</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
