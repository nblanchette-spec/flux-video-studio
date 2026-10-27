import React from 'react';
import { Loader2, X } from 'lucide-react';
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

  return (
    <div className="bg-neutral-900/80 border border-white/[0.08] rounded-2xl p-3.5 shadow-lg backdrop-blur-xl relative overflow-hidden text-neutral-100">
      <div className="space-y-2.5">
        {/* Status Line */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-300" />
            <span className="font-medium text-white tracking-tight">
              {status.statusMessage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-neutral-400 text-[11px]">
              Step {status.currentStep}/{status.totalSteps}
            </span>
            <span className="font-mono text-xs text-white font-semibold">
              {Math.round(status.progressPercent)}%
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
                title="Cancel Generation"
                aria-label="Cancel Generation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, status.progressPercent))}%` }}
          />
        </div>

        {/* ETA */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Processing video pass</span>
          <span>Estimated time: ~{status.etaSeconds}s</span>
        </div>
      </div>
    </div>
  );
};
