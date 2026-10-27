import {
  AspectRatio,
  DurationSeconds,
  FluxGenerationParams,
  QualityTier,
  TimelineKeyframe,
  VideoTake,
  WorkflowMode,
} from '../types/flux';

/**
 * Calculates generation cost in USD and platform compute credits.
 * Resolution Quality Tiers:
 * - Draft (480p): ~$0.30 • 5x faster
 * - Full Quality (1080p): ~$2.50 • Production grade
 */
export function calculateCost(
  duration: DurationSeconds,
  qualityTier: QualityTier,
  nativeAudio: boolean,
  inferenceSteps: number = 30
): { dollars: number; credits: number; formatted: string } {
  const durationFactor = duration / 5;
  const baseRate = qualityTier === 'draft' ? 0.30 : 2.50;
  const audioRate = nativeAudio ? (qualityTier === 'draft' ? 0.05 : 0.20) : 0;
  const stepModifier = Math.max(0.7, Math.min(1.5, inferenceSteps / 30));

  const totalDollars = (baseRate + audioRate) * Math.sqrt(durationFactor) * stepModifier;
  const roundedDollars = Math.round(totalDollars * 100) / 100;
  const credits = Math.max(5, Math.round(roundedDollars / 0.004));

  return {
    dollars: roundedDollars,
    credits,
    formatted: `$${roundedDollars.toFixed(2)} (${credits} Credits)`,
  };
}

/**
 * Formats time in seconds to MM:SS:FF timecode given frame rate.
 */
export function formatTimecode(seconds: number, fps: number = 24): string {
  const safeSeconds = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  const frames = Math.floor((safeSeconds % 1) * fps);

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const ff = frames.toString().padStart(2, '0');

  return `${mm}:${ss}:${ff}`;
}

/**
 * Formats time in seconds to standard MM:SS display.
 */
export function formatSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validates and sorts timeline keyframes.
 * Constraints:
 * - Max 10 frames
 * - Timestamps clamped between 0 and duration
 * - Sorted ascending by timestamp
 */
export function validateKeyframes(
  keyframes: TimelineKeyframe[],
  duration: number
): TimelineKeyframe[] {
  const clamped = keyframes.slice(0, 10).map((kf) => ({
    ...kf,
    timeSeconds: Math.max(0, Math.min(duration, Math.round(kf.timeSeconds * 10) / 10)),
  }));

  return clamped.sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/**
 * Generates a pseudo-random seed integer.
 */
export function generateRandomSeed(): number {
  return Math.floor(100000 + Math.random() * 900000000);
}

/**
 * Helper to prepare state when clicking "Extend Video".
 * Takes the current clip and creates an extended workflow state.
 */
export function prepareExtendVideoState(
  currentTake: VideoTake
): {
  workflowMode: WorkflowMode;
  startFrameUrl: string;
  sourceVideoUrl: string;
  sourceVideoName: string;
  prompt: string;
} {
  return {
    workflowMode: 'video_extend',
    startFrameUrl: currentTake.posterUrl,
    sourceVideoUrl: currentTake.videoUrl,
    sourceVideoName: `${currentTake.title} (Out-Take)`,
    prompt: `Continue camera motion seamlessly: ${currentTake.prompt}`,
  };
}

/**
 * Default sample presets for instant creative inspiration
 */
export const SAMPLE_PROMPTS = [
  {
    title: 'Cyberpunk Rain Alley',
    prompt:
      'Cinematic 35mm anamorphic shot of a cybernetic courier in a neon-drenched Tokyo alleyway at night. Heavy rain splashing on asphalt, volumetric holographic advertisements glowing cyan and magenta, slow dynamic forward dolly zoom, photorealistic motion blur.',
    aspectRatio: '16:9' as AspectRatio,
    duration: 5 as DurationSeconds,
    category: 'Sci-Fi',
  },
  {
    title: 'Alpine Drone Sweeping Pass',
    prompt:
      'Breathtaking high-altitude drone flyover across jagged snow-capped Alpine peaks during golden hour sunrise. Mist drifting through fir tree valleys, lens flare, crisp glacial reflections, fluid cinematic camera banking right.',
    aspectRatio: '16:9' as AspectRatio,
    duration: 10 as DurationSeconds,
    category: 'Nature',
  },
  {
    title: 'Fashion Editorial Runway',
    prompt:
      'Vertical 9:16 high-fashion runway model walking toward camera in an avant-garde iridescent flowing silk cape. Dramatic low-angle studio lighting, bokeh dust motes, elegant slow-motion stride at 60fps.',
    aspectRatio: '9:16' as AspectRatio,
    duration: 5 as DurationSeconds,
    category: 'Fashion',
  },
  {
    title: 'Barista Latte Macro Pour',
    prompt:
      'Square 1:1 extreme close-up macro lens of steaming espresso and velvety microfoam swirling into a white ceramic cup. Rich crema marbling, subtle steam tendrils, warm morning cafe atmosphere.',
    aspectRatio: '1:1' as AspectRatio,
    duration: 5 as DurationSeconds,
    category: 'Commercial',
  },
];

/**
 * Default initial parameters
 */
export const DEFAULT_FLUX_PARAMS: FluxGenerationParams = {
  workflowMode: 'text_to_video',
  prompt:
    'Cinematic 35mm anamorphic shot of a cybernetic courier in a neon-drenched Tokyo alleyway at night. Heavy rain splashing on asphalt, volumetric cyan and magenta holograms, slow dynamic forward dolly zoom.',
  negativePrompt: 'blurry, low resolution, warped hands, jitter, watermark, flicker',
  nativeAudio: true,
  audioPrompt: 'Atmospheric heavy rain on asphalt, distant city sirens, synth ambient drone',
  aspectRatio: '16:9',
  duration: 5,
  qualityTier: 'draft',
  guidanceScale: 3.5,
  transformationStrength: 0.75,
  inferenceSteps: 30,
  seed: 428914,
  cameraMovement: 'Dolly In',
  fps: 24,
  startFrameUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  endFrameUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  keyframes: [
    {
      id: 'kf-1',
      timeSeconds: 0,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      label: 'Establishing wide',
      note: 'Alley entrance',
    },
    {
      id: 'kf-2',
      timeSeconds: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      label: 'Mid-motion push',
      note: 'Neon signage parallax',
    },
    {
      id: 'kf-3',
      timeSeconds: 5,
      imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      label: 'Target frame',
      note: 'Courier reflection',
    },
  ],
  sourceVideoUrl: null,
  sourceVideoName: undefined,
  referenceImages: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  ],
};

export function calculateBatchUpscaleCost(
  count: number,
  resolution: '1080p' | '4K'
): {
  dollars: number;
  credits: number;
  estimatedSeconds: number;
  formatted: string;
} {
  const safeCount = Math.max(0, count);
  const costPerVideo = resolution === '4K' ? 1.20 : 0.75;
  const timePerVideo = resolution === '4K' ? 5 : 3;

  const totalDollars = Math.round(safeCount * costPerVideo * 100) / 100;
  const credits = Math.round(totalDollars / 0.004);
  const estimatedSeconds = safeCount * timePerVideo;

  return {
    dollars: totalDollars,
    credits,
    estimatedSeconds,
    formatted: `$${totalDollars.toFixed(2)} (${credits} Credits • ~${estimatedSeconds}s)`,
  };
}

/**
 * Filter takes based on favorites and optional text search
 */
export function filterTakes(
  takes: VideoTake[],
  filter: 'all' | 'favorites',
  searchQuery: string = ''
): VideoTake[] {
  return takes.filter((take) => {
    if (filter === 'favorites' && !take.isFavorite) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchPrompt = take.prompt.toLowerCase().includes(q);
      const matchTitle = take.title.toLowerCase().includes(q);
      const matchResolution = take.resolution.toLowerCase().includes(q);
      const matchSeed = take.params?.seed?.toString().includes(q);
      return matchPrompt || matchTitle || matchResolution || matchSeed;
    }
    return true;
  });
}

/**
 * Formats relative timestamp (e.g., 'Just now', '12m ago', '2h ago', 'Yesterday')
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)}d ago`;
}

/**
 * Curated initial sample takes with actual playable sample videos
 * Using reliable, verified web video sources and fallback synthetic animation
 */
export const INITIAL_TAKES: VideoTake[] = [
  {
    id: 'take-001',
    createdAt: Date.now() - 3600000 * 2, // 2h ago
    title: 'Neon Tokyo Courier',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    duration: 15,
    aspectRatio: '16:9',
    qualityTier: 'draft',
    resolution: '480p',
    prompt: 'Cinematic 35mm anamorphic shot of a cybernetic courier in a neon-drenched Tokyo alleyway at night.',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      seed: 428914,
    },
    hasAudio: true,
    costEstimate: 0.35,
    isFavorite: true,
  },
  {
    id: 'take-002',
    createdAt: Date.now() - 3600000 * 1, // 1h ago
    title: 'Alpine Glacial Ridge',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    aspectRatio: '16:9',
    qualityTier: 'final',
    resolution: '1080p',
    prompt: 'Breathtaking high-altitude drone flyover across jagged snow-capped Alpine peaks during golden hour sunrise.',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      prompt: 'Breathtaking high-altitude drone flyover across jagged snow-capped Alpine peaks during golden hour sunrise.',
      duration: 10,
      qualityTier: 'final',
      seed: 871293,
    },
    hasAudio: false,
    costEstimate: 2.50,
    isFavorite: false,
  },
  {
    id: 'take-003',
    createdAt: Date.now() - 1800000, // 30m ago
    title: 'Fashion Editorial Runway',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    duration: 5,
    aspectRatio: '9:16',
    qualityTier: 'draft',
    resolution: '480p',
    prompt: 'Vertical 9:16 high-fashion runway model walking toward camera in an avant-garde iridescent flowing silk cape.',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      prompt: 'Vertical 9:16 high-fashion runway model walking toward camera in an avant-garde iridescent flowing silk cape.',
      aspectRatio: '9:16',
      duration: 5,
      qualityTier: 'draft',
      seed: 319402,
    },
    hasAudio: true,
    costEstimate: 0.30,
    isFavorite: true,
  },
  {
    id: 'take-004',
    createdAt: Date.now() - 900000, // 15m ago
    title: 'Barista Latte Macro Pour',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    duration: 5,
    aspectRatio: '1:1',
    qualityTier: 'draft',
    resolution: '480p',
    prompt: 'Square 1:1 extreme close-up macro lens of steaming espresso and velvety microfoam swirling into a white ceramic cup.',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      prompt: 'Square 1:1 extreme close-up macro lens of steaming espresso and velvety microfoam swirling into a white cup.',
      aspectRatio: '1:1',
      duration: 5,
      qualityTier: 'draft',
      seed: 105943,
    },
    hasAudio: true,
    costEstimate: 0.30,
    isFavorite: true,
  },
  {
    id: 'take-005',
    createdAt: Date.now() - 300000, // 5m ago
    title: 'Orbital Space Station Sunset',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    aspectRatio: '16:9',
    qualityTier: 'draft',
    resolution: '480p',
    prompt: 'Slow cinematic roll over an orbital deep-space station solar array reflecting blue earth atmospheric limb.',
    params: {
      ...DEFAULT_FLUX_PARAMS,
      prompt: 'Slow cinematic roll over an orbital deep-space station solar array reflecting blue earth atmosphere.',
      aspectRatio: '16:9',
      duration: 10,
      qualityTier: 'draft',
      seed: 762119,
    },
    hasAudio: false,
    costEstimate: 0.30,
    isFavorite: false,
  },
];

/**
 * Simulates calling fal.ai's video upscaler endpoint ('fal-ai/video-upscaler' or Topaz Video AI).
 * Reconstructs high-frequency details, sharpens edges, and generates a production-grade 1080p or 4K stream.
 */
export async function simulateFalVideoUpscale(
  draftTake: VideoTake,
  targetResolution: '1080p' | '4K',
  onProgress?: (percent: number, stepMessage: string) => void
): Promise<VideoTake> {
  const steps = [
    { percent: 18, msg: 'Submitting draft tensor (480p) to fal-ai/video-upscaler...' },
    { percent: 42, msg: 'Computing spatial-temporal optical flow & motion vectors...' },
    { percent: 68, msg: `Synthesizing high-frequency neural details (${targetResolution})...` },
    { percent: 88, msg: `Denoising film grain & edge enhancement pass (${targetResolution})...` },
    { percent: 98, msg: `Finalizing ${targetResolution} 60fps MP4 master container...` },
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (onProgress) {
      onProgress(step.percent, step.msg);
    }
  }

  // Provide crisp, high-resolution upscaled stream
  const highResVideos: Record<string, string> = {
    '1080p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    '4K': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  };

  const upscaledTake: VideoTake = {
    id: `take-upscaled-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
    title: `${draftTake.title} [${targetResolution}]`,
    videoUrl: highResVideos[targetResolution] || draftTake.videoUrl,
    posterUrl: draftTake.posterUrl,
    duration: draftTake.duration,
    aspectRatio: draftTake.aspectRatio,
    qualityTier: 'final',
    resolution: targetResolution,
    prompt: draftTake.prompt,
    params: {
      ...draftTake.params,
      qualityTier: 'final',
    },
    hasAudio: draftTake.hasAudio,
    costEstimate: targetResolution === '4K' ? 1.20 : 0.75,
    isFavorite: draftTake.isFavorite,
    upscaledFromId: draftTake.id,
    upscaleDetails: {
      model: 'fal-ai/video-upscaler',
      targetResolution,
      upscaledAt: Date.now(),
    },
  };

  return upscaledTake;
}
