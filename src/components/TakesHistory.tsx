import React from 'react';
import { VideoTake } from '../types/flux';
import { Film, Play, Trash2, Clock, Check } from 'lucide-react';

interface TakesHistoryProps {
  takes: VideoTake[];
  selectedTakeId: string | null;
  onSelectTake: (take: VideoTake) => void;
  onDeleteTake: (id: string) => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  selectedTakeId,
  onSelectTake,
  onDeleteTake,
}) => {
  if (takes.length === 0) return null;

  return (
    <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-orange-400" />
          Generation Takes ({takes.length})
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Click to preview in player</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {takes.map((take) => {
          const isSelected = take.id === selectedTakeId;
          return (
            <div
              key={take.id}
              onClick={() => onSelectTake(take)}
              className={`flex-shrink-0 w-44 group cursor-pointer rounded-lg overflow-hidden border transition-all ${
                isSelected
                  ? 'border-orange-500 bg-zinc-900 shadow-md ring-1 ring-orange-500/40'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-video w-full bg-black relative overflow-hidden">
                <img
                  src={take.posterUrl}
                  alt={take.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-black/70 text-zinc-300 group-hover:bg-orange-500 group-hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-zinc-300 px-1 rounded">
                  {take.duration}s
                </div>
                <div className="absolute top-1 left-1 bg-black/80 text-[9px] font-mono text-orange-300 px-1 rounded">
                  {take.aspectRatio}
                </div>
              </div>

              {/* Take metadata */}
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-orange-400">
                    {take.title}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTake(take.id);
                    }}
                    className="p-0.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete take"
                    aria-label="Delete take"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1">
                  {take.prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
