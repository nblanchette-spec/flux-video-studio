import React from 'react';
import {
  ArrowRight,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ActionBarProps {
  onGenerate: () => void;
  onExtend: () => void;
  onDownload: () => void;
  costEstimate: {
    dollars: number;
    credits: number;
    formatted: string;
  };
  isGenerating: boolean;
  canExtend: boolean;
  canDownload: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onGenerate,
  onExtend,
  onDownload,
  costEstimate,
  isGenerating,
  canExtend,
  canDownload,
}) => {
  return (
    <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
      {/* Primary Generation Action */}
      <div className="flex-1 min-w-[240px]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full relative group overflow-hidden py-3 px-5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-500 hover:via-amber-500 hover:to-rose-500 active:scale-[0.99] border border-orange-400/30"
        >
          <div className="flex items-center justify-center gap-2 relative z-10">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing FLUX Latents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Generate Video</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/40 text-[11px] font-mono font-medium text-amber-200 border border-white/10">
                  {costEstimate.formatted}
                </span>
              </>
            )}
          </div>
          {/* Button shine animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Extend Video Button */}
        <button
          type="button"
          onClick={onExtend}
          disabled={!canExtend || isGenerating}
          className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Loads clip's final frame into Start slot to synthesize next segment"
        >
          <ArrowRight className="w-4 h-4 text-cyan-400" />
          <span>Extend Video</span>
        </button>

        {/* Download MP4 */}
        <button
          type="button"
          onClick={onDownload}
          disabled={!canDownload || isGenerating}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          title="Direct export for full-resolution .mp4"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download .MP4</span>
        </button>
      </div>
    </div>
  );
};
