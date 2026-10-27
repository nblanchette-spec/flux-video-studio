import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Repeat,
  Radio,
  Film,
} from 'lucide-react';
import { AspectRatio, VideoTake } from '../types/flux';
import { formatTimecode } from '../utils/fluxVideoUtils';

interface StagePreviewProps {
  currentTake: VideoTake | null;
  aspectRatio: AspectRatio;
  fps?: number;
  isGenerating: boolean;
}

export const StagePreview: React.FC<StagePreviewProps> = ({
  currentTake,
  aspectRatio,
  fps = 24,
  isGenerating,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentTake ? currentTake.duration : 5);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Sync state when take changes
  useEffect(() => {
    if (currentTake) {
      setDuration(currentTake.duration);
      setCurrentTime(0);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = playbackRate;
      }
    }
  }, [currentTake]);

  // Video event listeners
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && !isNaN(vidDuration)) {
        setDuration(vidDuration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Frame Stepping
  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const frameDuration = 1 / fps;
    const newTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + frames * frameDuration)
    );
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Scrubber change
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Playback Rate
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea or input
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'textarea' || activeTag === 'input') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, fps]);

  // Current frame index
  const currentFrameNumber = Math.min(
    Math.round(duration * fps),
    Math.floor(currentTime * fps) + 1
  );
  const totalFrames = Math.round(duration * fps);

  // Aspect ratio container sizing
  const containerAspectClass = {
    '16:9': 'aspect-video max-w-3xl max-h-[380px]',
    '9:16': 'aspect-[9/16] max-h-[380px] w-auto',
    '1:1': 'aspect-square max-h-[380px] w-auto',
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-1 flex flex-col bg-zinc-950/60 rounded-2xl border border-zinc-800/80 overflow-hidden relative"
    >
      {/* Stage Header Info */}
      <div className="h-10 px-4 bg-zinc-900/70 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold text-zinc-200 truncate max-w-xs">
            {currentTake ? currentTake.title : 'Stage Preview • Ready for Generation'}
          </span>
          {currentTake && (
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
              {currentTake.aspectRatio} • {currentTake.resolution}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-zinc-300">
            {formatTimecode(currentTime, fps)} / {formatTimecode(duration, fps)}
          </span>
          <span className="hidden sm:inline-block text-zinc-500">
            Frame {currentFrameNumber}/{totalFrames} ({fps}fps)
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="flex-1 flex items-center justify-center p-3 relative bg-black/60 min-h-[340px]">
        {/* Aspect Ratio Box */}
        <div
          className={`w-full relative rounded-xl overflow-hidden shadow-2xl bg-black border border-zinc-800/80 flex items-center justify-center transition-all duration-300 ${containerAspectClass}`}
        >
          {currentTake ? (
            <video
              ref={videoRef}
              src={currentTake.videoUrl}
              poster={currentTake.posterUrl}
              loop={isLooping}
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <Play className="w-6 h-6 ml-1" />
              </div>
              <p className="text-xs font-medium text-zinc-400">Ready to synthesize sequence</p>
              <p className="text-[11px] text-zinc-600 max-w-xs">
                Select your parameters in Column 1 and click Generate Video
              </p>
            </div>
          )}

          {/* Quick Play Overlay Button when paused */}
          {currentTake && !isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all group"
              aria-label="Play video"
            >
              <div className="w-14 h-14 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>
            </button>
          )}

          {/* Resolution Badge over player */}
          {currentTake && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
              {currentTake.resolution === '1080p' ? (
                <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 backdrop-blur-md border border-purple-400/60 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>HD / 1080p</span>
                </div>
              ) : currentTake.resolution === '4K' ? (
                <div className="bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-md border border-amber-300/60 px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
                  <span>4K Ultra HD</span>
                </div>
              ) : (
                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700/80 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                  480p Draft
                </div>
              )}
            </div>
          )}

          {/* Audio Synthesized Badge */}
          {currentTake?.hasAudio && (
            <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-1 rounded-md text-[10px] text-amber-300 flex items-center gap-1.5 shadow-lg z-20">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="font-mono">FLUX Native Audio Track</span>
            </div>
          )}
        </div>
      </div>

      {/* Frame Scrubber & Playback Controls Bar */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-2">
        {/* Timeline Scrubber Slider with frame tick marks */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min="0"
            max={duration || 5}
            step={1 / fps}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={!currentTake}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 group-hover:h-2 transition-all disabled:opacity-30"
          />
        </div>

        {/* Transport Bar Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Left: Playback, Loop & Audio */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              disabled={!currentTake}
              className="w-8 h-8 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-40"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-md border text-xs transition-colors ${
                isLooping
                  ? 'bg-zinc-800 text-orange-400 border-orange-500/40'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
              title="Toggle Looping"
              aria-label="Toggle Looping"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              disabled={!currentTake?.hasAudio}
              className={`p-1.5 rounded-md border text-xs transition-colors ${
                isMuted || !currentTake?.hasAudio
                  ? 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  : 'bg-zinc-800 text-amber-400 border-amber-500/40'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || !currentTake?.hasAudio ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Center: Timecode & Frame Indicator */}
          <div className="text-xs font-mono text-zinc-400 px-2.5 py-1 bg-zinc-900 rounded-md border border-zinc-800/80">
            <span className="text-white font-semibold">{formatTimecode(currentTime, fps)}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span>{formatTimecode(duration, fps)}</span>
          </div>

          {/* Right: Fullscreen Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              title="Fullscreen (F)"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
