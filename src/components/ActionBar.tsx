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
    <div className="bg-neutral-900/80 border border-white/[0.08] rounded-2xl p-3 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-neutral-100">
      {/* Primary Generation CTA */}
      <div className="flex-1 min-w-[220px]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 px-5 rounded-xl font-medium text-xs tracking-tight text-white transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold">Generate Video</span>
              <span className="ml-1 text-[11px] font-mono opacity-80">
                • {costEstimate.formatted}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2">
        {/* Extend Video */}
        <button
          type="button"
          onClick={onExtend}
          disabled={!canExtend || isGenerating}
          className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 hover:text-white border border-white/[0.08] text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Chain final frame to synthesize continuous extension"
        >
          <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
          <span>Extend</span>
        </button>

        {/* Download MP4 */}
        <button
          type="button"
          onClick={onDownload}
          disabled={!canDownload || isGenerating}
          className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 hover:text-white border border-white/[0.08] text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Direct export for full-resolution MP4"
        >
          <Download className="w-3.5 h-3.5 text-neutral-300" />
          <span>Export MP4</span>
        </button>
      </div>
    </div>
  );
};
