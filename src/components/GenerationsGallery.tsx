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
  Filter,
  CheckCircle2,
  Loader2,
  Film,
  Zap,
  Maximize2,
  X,
  Layers,
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
  const [previewModalTake, setPreviewModalTake] = useState<VideoTake | null>(null);

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
      // Merge unique
      const set = new Set([...prev, ...favDraftIds]);
      return Array.from(set);
    });
  };

  const handleSelectAllDrafts = () => {
    const draftIds = draftTakes.map((t) => t.id);
    setSelectedIds(draftIds);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Cost estimates for floating action bar
  const batch1080p = calculateBatchUpscaleCost(selectedDraftTakes.length, '1080p');
  const batch4K = calculateBatchUpscaleCost(selectedDraftTakes.length, '4K');

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 relative">
      {/* Gallery Header / Controls */}
      <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold tracking-tight text-white">
              Generations Gallery
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {takes.length} {takes.length === 1 ? 'Take' : 'Takes'}
            </span>
          </div>

          {/* Filter Segmented Control: All Takes vs Favorited Only */}
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>All Takes</span>
              <span className="text-[10px] text-zinc-500 font-mono">({takes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                filterMode === 'favorites'
                  ? 'bg-amber-950/70 text-amber-300 font-semibold border border-amber-600/40 shadow-xs'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Favorited Only</span>
              <span className="text-[10px] font-mono text-amber-400/80">({favoritedCount})</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Select */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt, seed..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {draftTakes.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllDrafts}
              className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 whitespace-nowrap transition-colors hidden sm:block"
              title="Select all draft takes"
            >
              Select All Drafts
            </button>
          )}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28">
        {filteredTakes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <Filter className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm font-medium text-zinc-300">No takes match your filter</p>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              {filterMode === 'favorites'
                ? 'You have not favorited any video takes yet. Click the star icon on any card to favorite it.'
                : 'Try adjusting your search terms or generate a new take in the Studio.'}
            </p>
            {filterMode === 'favorites' && (
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="mt-3 text-xs text-orange-400 hover:text-orange-300 underline"
              >
                View all takes
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-4 ${
              compact
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            }`}
          >
            {filteredTakes.map((take) => {
              const isSelected = selectedIds.includes(take.id);
              const isCurrentInStudio = take.id === selectedTakeId;
              const isDraft = take.resolution === '480p' || take.qualityTier === 'draft';
              const isProcessingThis =
                batchUpscaleState.isProcessing &&
                batchUpscaleState.activeTakeId === take.id;

              return (
                <GalleryCard
                  key={take.id}
                  take={take}
                  isSelected={isSelected}
                  isCurrentInStudio={isCurrentInStudio}
                  isDraft={isDraft}
                  isProcessingThis={isProcessingThis}
                  batchState={batchUpscaleState}
                  onSelectInStudio={() => onSelectTake(take)}
                  onToggleSelect={() => toggleSelectId(take.id)}
                  onToggleFavorite={() => onToggleFavorite(take.id)}
                  onOpenModal={() => setPreviewModalTake(take)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Batch Action Bar */}
      {selectedDraftTakes.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          {/* Left summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide">
                  {selectedDraftTakes.length}{' '}
                  {selectedDraftTakes.length === 1 ? 'Draft Selected' : 'Drafts Selected'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Ready for fal.ai neural upscaler
                </span>
              </div>
            </div>

            {/* Quick Select All Favorites */}
            {favoritedDraftTakes.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFavorites}
                className="text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-800/60 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                title="Select all favorited drafts"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Select All Favorites</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline p-1"
            >
              Clear
            </button>
          </div>

          {/* Right Action Buttons: 1080p and 4K */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Primary CTA: Batch Upscale (1080p) */}
            <button
              type="button"
              disabled={batchUpscaleState.isProcessing}
              onClick={() =>
                onBatchUpscale(
                  selectedDraftTakes.map((t) => t.id),
                  '1080p'
                )
              }
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {batchUpscaleState.isProcessing && batchUpscaleState.targetResolution === '1080p' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Upscaling {batchUpscaleState.currentIndex} of {batchUpscaleState.totalCount}...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>Batch Upscale (1080p)</span>
                  <span className="text-[10px] opacity-80 font-mono ml-0.5">
                    • {batch1080p.formatted.split('(')[0].trim()}
                  </span>
                </>
              )}
            </button>

            {/* Secondary CTA: Batch Upscale (4K) */}
            <button
              type="button"
              disabled={batchUpscaleState.isProcessing}
              onClick={() =>
                onBatchUpscale(
                  selectedDraftTakes.map((t) => t.id),
                  '4K'
                )
              }
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-200 hover:text-white border border-amber-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {batchUpscaleState.isProcessing && batchUpscaleState.targetResolution === '4K' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>4K Queue...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Batch (4K)</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    • {batch4K.formatted.split('(')[0].trim()}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Video Preview Modal */}
      {previewModalTake && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {previewModalTake.title}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    previewModalTake.resolution === '480p'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      : previewModalTake.resolution === '4K'
                      ? 'bg-orange-950/80 text-orange-300 border border-orange-700'
                      : 'bg-purple-950/80 text-purple-300 border border-purple-700'
                  }`}
                >
                  {previewModalTake.resolution}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalTake(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black aspect-video flex items-center justify-center">
              <video
                src={previewModalTake.videoUrl}
                poster={previewModalTake.posterUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 space-y-2 bg-zinc-950 text-xs">
              <p className="text-zinc-200">{previewModalTake.prompt}</p>
              <div className="flex items-center gap-4 text-zinc-400 text-[11px] font-mono">
                <span>Seed: #{previewModalTake.params.seed}</span>
                <span>Duration: {previewModalTake.duration}s</span>
                <span>Aspect: {previewModalTake.aspectRatio}</span>
                <span>Created: {formatRelativeTime(previewModalTake.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface GalleryCardProps {
  take: VideoTake;
  isSelected: boolean;
  isCurrentInStudio: boolean;
  isDraft: boolean;
  isProcessingThis: boolean;
  batchState: BatchUpscaleState;
  onSelectInStudio: () => void;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onOpenModal: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  take,
  isSelected,
  isCurrentInStudio,
  isDraft,
  isProcessingThis,
  batchState,
  onSelectInStudio,
  onToggleSelect,
  onToggleFavorite,
  onOpenModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hover to play video preview
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-xl overflow-hidden border transition-all duration-200 flex flex-col bg-zinc-900/80 ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-500/40 bg-zinc-900'
          : isCurrentInStudio
          ? 'border-purple-500/80 bg-zinc-900'
          : 'border-zinc-800 hover:border-zinc-700 hover:shadow-lg'
      }`}
    >
      {/* Video Preview Container with Hover-to-Play */}
      <div className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer" onClick={onSelectInStudio}>
        <video
          ref={videoRef}
          src={take.videoUrl}
          poster={take.posterUrl}
          muted
          playsInline
          loop
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover-to-play status badge */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <Play className="w-4 h-4 ml-0.5 fill-current text-white" />
            </div>
          </div>
        )}

        {/* Multi-select Checkbox (top-left) */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`p-1 rounded-md transition-all backdrop-blur-md ${
              isSelected
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
            }`}
            title={isSelected ? 'Deselect take' : 'Select for batch upscale'}
            aria-label={isSelected ? 'Deselect take' : 'Select for batch upscale'}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 fill-current" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Mode Badge: Draft 480p, HD 1080p, or 4K */}
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-md shadow-xs ${
              take.resolution === '480p'
                ? 'bg-amber-950/85 text-amber-300 border border-amber-600/50'
                : take.resolution === '4K'
                ? 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                : 'bg-purple-950/90 text-purple-200 border border-purple-500/60'
            }`}
          >
            {take.resolution === '480p'
              ? 'Draft 480p'
              : take.resolution === '4K'
              ? '4K Ultra'
              : 'HD 1080p'}
          </span>
        </div>

        {/* Favorite Toggle Button (top-right) */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1.5 rounded-lg transition-all backdrop-blur-md ${
              take.isFavorite
                ? 'bg-amber-500/90 text-zinc-950 shadow-md ring-1 ring-amber-300'
                : 'bg-black/60 text-zinc-400 hover:text-amber-300 hover:bg-black/80'
            }`}
            title={take.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            aria-label={take.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                take.isFavorite ? 'fill-zinc-950' : 'hover:fill-amber-400/30'
              }`}
            />
          </button>

          {/* Fullscreen Modal Preview Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            className="p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-white hover:bg-black/80 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            title="Inspect video take"
            aria-label="Inspect video take"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video duration & aspect chips (bottom) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-xs text-[9px] font-mono text-zinc-300 px-1.5 py-0.5 rounded">
            {take.duration}s
          </span>
          <span className="bg-black/75 backdrop-blur-xs text-[9px] font-mono text-orange-400 px-1.5 py-0.5 rounded">
            {take.aspectRatio}
          </span>
        </div>

        {/* Batch Processing Overlay if active */}
        {isProcessingThis && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-20 animate-in fade-in">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin mb-1.5" />
            <span className="text-xs font-bold text-white">
              Upscaling {batchState.currentIndex} of {batchState.totalCount}...
            </span>
            <span className="text-[10px] text-purple-300 font-mono mt-0.5">
              Synthesizing {batchState.targetResolution} master container
            </span>
          </div>
        )}
      </div>

      {/* Card Body Metadata */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1">
            <h4
              onClick={onSelectInStudio}
              className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover:text-orange-400 cursor-pointer transition-colors"
              title={take.title}
            >
              {take.title}
            </h4>
            {isCurrentInStudio && (
              <span className="text-[9px] font-semibold text-purple-400 bg-purple-950/60 px-1 rounded shrink-0">
                In Player
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {take.prompt}
          </p>
        </div>

        {/* Footer: Timestamp, Seed, and Studio Load Button */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span title={`Seed: #${take.params.seed}`}>
              #{take.params.seed}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {formatRelativeTime(take.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={onSelectInStudio}
            className="text-orange-400 hover:text-orange-300 font-sans font-medium hover:underline flex items-center gap-1"
          >
            <span>Open in Player</span>
          </button>
        </div>
      </div>
    </div>
  );
};
