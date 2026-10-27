import React, { useState, useRef } from 'react';
import {
  VideoTake,
  BatchUpscaleState,
} from '../types/flux';
import {
  formatRelativeTime,
  calculateBatchUpscaleCost,
  filterTakes,
} from '../utils/fluxVideoUtils';
import {
  Star,
  Sparkles,
  Play,
  CheckSquare,
  Square,
  Clock,
  Search,
  CheckCircle2,
  Loader2,
  Film,
  X,
  Trash2,
} from 'lucide-react';

interface GenerationsGalleryProps {
  takes: VideoTake[];
  selectedTakeId: string | null;
  batchUpscaleState: BatchUpscaleState;
  onSelectTake: (take: VideoTake) => void;
  onToggleFavorite: (takeId: string) => void;
  onBatchUpscale: (takeIds: string[], targetResolution: '1080p' | '4K') => void;
  onDeleteTake?: (takeId: string) => void;
  compact?: boolean;
}

export const GenerationsGallery: React.FC<GenerationsGalleryProps> = ({
  takes,
  selectedTakeId,
  batchUpscaleState,
  onSelectTake,
  onToggleFavorite,
  onBatchUpscale,
  onDeleteTake,
  compact = false,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredTakeId, setHoveredTakeId] = useState<string | null>(null);

  // Filtered list
  const filteredTakes = filterTakes(takes, filterMode, searchQuery);
  const favoritedCount = takes.filter((t) => t.isFavorite).length;

  // Only draft takes can be upscaled
  const draftTakes = takes.filter(
    (t) => t.resolution === '480p' || t.qualityTier === 'draft'
  );
  const favoritedDraftTakes = draftTakes.filter((t) => t.isFavorite);

  // Selected draft takes count
  const selectedDraftTakes = takes.filter(
    (t) => selectedIds.includes(t.id) && (t.resolution === '480p' || t.qualityTier === 'draft')
  );

  const toggleSelectId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFavorites = () => {
    const favDraftIds = favoritedDraftTakes.map((t) => t.id);
    setSelectedIds((prev) => {
      const set = new Set([...prev, ...favDraftIds]);
      return Array.from(set);
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Cost estimates for batch bar
  const batch1080p = calculateBatchUpscaleCost(selectedDraftTakes.length, '1080p');
  const batch4K = calculateBatchUpscaleCost(selectedDraftTakes.length, '4K');

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 relative">
      {/* Gallery Header / Controls */}
      <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-neutral-950/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-white">
              Takes Gallery
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-white/[0.08]">
              {takes.length}
            </span>
          </div>

          {/* Filter Segmented Control */}
          <div className="flex bg-neutral-900/90 p-0.5 rounded-lg border border-white/[0.08] text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterMode === 'all'
                  ? 'bg-neutral-800 text-white shadow-xs font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({takes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                filterMode === 'favorites'
                  ? 'bg-neutral-800 text-white shadow-xs font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Favorites ({favoritedCount})</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter takes..."
              className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Grid of Takes */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24">
        {filteredTakes.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-neutral-900/20">
            <Film className="w-6 h-6 text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-400">No takes match your selection.</p>
          </div>
        ) : (
          <div
            className={`grid gap-3.5 ${
              compact
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {filteredTakes.map((take) => {
              const isSelected = selectedTakeId === take.id;
              const isChecked = selectedIds.includes(take.id);
              const isHovered = hoveredTakeId === take.id;
              const isProcessingBatch =
                batchUpscaleState.isProcessing && batchUpscaleState.activeTakeId === take.id;

              return (
                <div
                  key={take.id}
                  onClick={() => onSelectTake(take)}
                  onMouseEnter={() => setHoveredTakeId(take.id)}
                  onMouseLeave={() => setHoveredTakeId(null)}
                  className={`group rounded-xl border transition-all duration-200 overflow-hidden flex flex-col bg-neutral-900/60 cursor-pointer ${
                    isSelected
                      ? 'border-white/40 ring-1 ring-white/20'
                      : 'border-white/[0.07] hover:border-white/20 hover:shadow-lg'
                  }`}
                >
                  {/* Media Thumbnail & Hover Preview */}
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    {isHovered ? (
                      <video
                        src={take.videoUrl}
                        poster={take.posterUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={take.posterUrl}
                        alt={take.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Batch Processing Overlay */}
                    {isProcessingBatch && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-white mb-1.5" />
                        <span className="text-[11px] font-medium text-white">
                          Upscaling {batchUpscaleState.currentIndex} of {batchUpscaleState.totalCount}...
                        </span>
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-md font-medium border ${
                          take.resolution === '480p'
                            ? 'bg-black/60 text-neutral-300 border-white/10'
                            : 'bg-white/90 text-neutral-950 border-transparent font-semibold'
                        }`}
                      >
                        {take.resolution}
                      </span>
                      {take.upscaledFromId && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-900/80 text-neutral-300 border border-white/10">
                          Upscaled
                        </span>
                      )}
                    </div>

                    {/* Top Right: Favorite & Select Checkbox */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      {/* Checkbox for batch select */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelectId(take.id, e)}
                        className={`p-1 rounded-md backdrop-blur-md transition-colors ${
                          isChecked
                            ? 'bg-white text-neutral-950'
                            : 'bg-black/50 text-neutral-300 hover:text-white'
                        }`}
                        title="Select for batch upscale"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(take.id);
                        }}
                        className={`p-1 rounded-md backdrop-blur-md transition-colors ${
                          take.isFavorite
                            ? 'bg-black/60 text-amber-400'
                            : 'bg-black/50 text-neutral-400 hover:text-amber-400'
                        }`}
                        title={take.isFavorite ? 'Favorited' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            take.isFavorite ? 'fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom Duration & Aspect */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-neutral-200">
                        {take.duration}s • {take.aspectRatio}
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-neutral-200 transition-colors">
                        {take.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 leading-relaxed">
                        {take.prompt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>{formatRelativeTime(take.createdAt)}</span>
                      {onDeleteTake && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTake(take.id);
                          }}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete take"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sleek Floating Apple Capsule: Batch Upscale Bar */}
      {selectedDraftTakes.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200 w-[92%] max-w-xl">
          <div className="bg-neutral-900/90 border border-white/15 rounded-full px-4 py-2.5 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {selectedDraftTakes.length} {selectedDraftTakes.length === 1 ? 'Draft' : 'Drafts'}
              </span>
              {favoritedDraftTakes.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllFavorites}
                  className="text-[11px] text-neutral-400 hover:text-white underline"
                >
                  Select All Favorites
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Batch 1080p */}
              <button
                type="button"
                onClick={() =>
                  onBatchUpscale(
                    selectedDraftTakes.map((t) => t.id),
                    '1080p'
                  )
                }
                disabled={batchUpscaleState.isProcessing}
                className="px-3.5 py-1.5 rounded-full bg-white text-neutral-950 font-medium text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                <span>Batch 1080p ({batch1080p.formatted})</span>
              </button>

              {/* Batch 4K */}
              <button
                type="button"
                onClick={() =>
                  onBatchUpscale(
                    selectedDraftTakes.map((t) => t.id),
                    '4K'
                  )
                }
                disabled={batchUpscaleState.isProcessing}
                className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-white/10 text-xs font-medium transition-colors disabled:opacity-40 hidden sm:inline-flex"
              >
                <span>4K ({batch4K.formatted})</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
