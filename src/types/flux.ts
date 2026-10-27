export type WorkflowMode =
  | 'text_to_video'
  | 'image_to_video'
  | 'first_last_frame'
  | 'keyframes_timeline'
  | 'video_extend';

export type AspectRatio = '16:9' | '9:16' | '1:1';
export type DurationSeconds = 5 | 10 | 15 | 20;
export type QualityTier = 'draft' | 'final';

export interface TimelineKeyframe {
  id: string;
  timeSeconds: number;
  imageUrl: string;
  label?: string;
  note?: string;
}

export interface FluxGenerationParams {
  workflowMode: WorkflowMode;
  prompt: string;
  negativePrompt?: string;
  nativeAudio: boolean;
  audioPrompt?: string;
  aspectRatio: AspectRatio;
  duration: DurationSeconds;
  qualityTier: QualityTier;
  // Advanced controls
  guidanceScale: number; // 1.0 - 8.0 (default 3.5)
  transformationStrength: number; // 0.0 - 1.0 (default 0.75)
  inferenceSteps: number; // 15 - 50 (default 30)
  seed: number; // integer >= 0, or randomized
  cameraMovement?: string;
  fps: 24 | 30 | 60;
  // Media slots
  startFrameUrl: string | null;
  endFrameUrl: string | null;
  keyframes: TimelineKeyframe[];
  sourceVideoUrl: string | null;
  sourceVideoName?: string;
  referenceImages?: string[];
}

export interface GenerationQueueStatus {
  isGenerating: boolean;
  progressPercent: number; // 0 - 100
  currentStep: number;
  totalSteps: number;
  phase: 'idle' | 'queued' | 'vram_allocation' | 'denoising' | 'audio_synthesis' | 'encoding' | 'completed' | 'failed';
  statusMessage: string;
  etaSeconds: number;
}

export interface UpscaleState {
  isUpscaling: boolean;
  takeId: string | null;
  targetResolution: '1080p' | '4K';
  progressPercent: number;
  stepMessage: string;
}

export interface BatchUpscaleState {
  isProcessing: boolean;
  currentIndex: number;
  totalCount: number;
  targetResolution: '1080p' | '4K';
  activeTakeId: string | null;
  completedCount: number;
}

export interface VideoTake {
  id: string;
  createdAt: number;
  title: string;
  videoUrl: string;
  posterUrl: string;
  duration: number;
  aspectRatio: AspectRatio;
  qualityTier: QualityTier;
  resolution: '480p' | '1080p' | '4K';
  prompt: string;
  params: FluxGenerationParams;
  hasAudio: boolean;
  costEstimate: number;
  isFavorite?: boolean;
  upscaledFromId?: string;
  upscaleDetails?: {
    model: string; // e.g. 'fal-ai/video-upscaler'
    targetResolution: '1080p' | '4K';
    upscaledAt: number;
  };
}

export interface FluxProject {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  folder?: string;
  params: FluxGenerationParams;
  takes: VideoTake[];
  currentTakeId: string | null;
  thumbnailUrl?: string;
  isStarred?: boolean;
}

