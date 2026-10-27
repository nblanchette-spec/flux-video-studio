import React from 'react';
import { Loader2, XCircle, Zap, Cpu, Radio, Sparkles } from 'lucide-react';
import { GenerationQueueStatus } from '../types/flux';

interface GenerationProgressProps {
  status: GenerationQueueStatus;
  onCancel?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  status,
  onCancel,
}) => {
  if (!status.isGenerating) return null;

  const phaseColor = {
    idle: 'text-zinc-400',
    queued: 'text-amber-400',
    vram_allocation: 'text-cyan-400',
    denoising: 'text-orange-400',
    audio_synthesis: 'text-purple-400',
    encoding: 'text-emerald-400',
    completed: 'text-emerald-400',
    failed: 'text-red-400',
  }[status.phase];

  return (
    <div className="bg-zinc-950 border border-orange-500/30 rounded-xl p-3.5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background Animated Gradient Pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/10 to-rose-500/5 animate-pulse pointer-events-none" />

      <div className="relative z-10 space-y-2.5">
        {/* Status Line */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className={`w-4 h-4 animate-spin ${phaseColor}`} />
            <span className="font-semibold text-white tracking-wide">
              {status.statusMessage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-zinc-400 text-[11px]">
              Step <span className="text-white font-bold">{status.currentStep}</span>/{status.totalSteps}
            </span>
            <span className="font-mono text-xs text-orange-400 font-bold">
              {Math.round(status.progressPercent)}%
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                title="Cancel Generation"
                aria-label="Cancel Generation"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-300 ease-out relative"
            style={{ width: `${Math.min(100, Math.max(0, status.progressPercent))}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Queue Metadata & Hardware Badges */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-400">
              <Cpu className="w-3 h-3 text-cyan-400" /> VRAM: 24.0GB H100
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Zap className="w-3 h-3 text-amber-400" /> FLUX DiT v1.4
            </span>
          </div>
          <div>
            ETA: <span className="text-zinc-300 font-medium">~{status.etaSeconds}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
