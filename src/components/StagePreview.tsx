import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Repeat,
  Film,
  SkipBack,
  SkipForward,
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
    '16:9': 'aspect-video max-w-3xl max-h-[400px]',
    '9:16': 'aspect-[9/16] max-h-[400px] w-auto',
    '1:1': 'aspect-square max-h-[400px] w-auto',
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-1 flex flex-col bg-neutral-900/40 rounded-2xl border border-white/[0.08] overflow-hidden relative shadow-lg text-neutral-100"
    >
      {/* Stage Header Info */}
      <div className="h-10 px-4 bg-neutral-900/60 border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate max-w-sm">
            {currentTake ? currentTake.title : 'Preview Stage'}
          </span>
          {currentTake && (
            <span className="text-[10px] bg-white/10 text-neutral-200 px-1.5 py-0.5 rounded font-mono">
              {currentTake.aspectRatio} • {currentTake.resolution}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-white">
            {formatTimecode(currentTime, fps)} / {formatTimecode(duration, fps)}
          </span>
          <span className="hidden sm:inline-block text-neutral-500">
            Frame {currentFrameNumber}/{totalFrames}
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 relative bg-black min-h-[340px]">
        {/* Aspect Ratio Box */}
        <div
          className={`w-full relative rounded-xl overflow-hidden shadow-2xl bg-neutral-950 border border-white/[0.08] flex items-center justify-center transition-all duration-300 ${containerAspectClass}`}
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
            <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500 space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <p className="text-xs font-medium text-neutral-300">Ready to synthesize</p>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Configure your prompt and click Generate Video
              </p>
            </div>
          )}

          {/* Quick Play Overlay Button when paused */}
          {currentTake && !isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-all group"
              aria-label="Play video"
            >
              <div className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
            </button>
          )}

          {/* Resolution Badge over player */}
          {currentTake && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
              <div className="bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold text-white shadow-lg">
                {currentTake.resolution} {currentTake.resolution !== '480p' ? 'HD' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frame Scrubber & Playback Controls Bar */}
      <div className="p-3 bg-neutral-900/80 border-t border-white/[0.08] space-y-2">
        {/* Scrubber */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 5}
            step={1 / fps}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={!currentTake}
            className="w-full cursor-pointer disabled:opacity-30"
          />
        </div>

        {/* Transport Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
          {/* Left: Playback & Step */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!currentTake}
              className="w-7 h-7 rounded-lg bg-white text-neutral-950 flex items-center justify-center transition-colors shadow-xs disabled:opacity-30 hover:bg-neutral-200"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Step Back 1 Frame */}
            <button
              type="button"
              onClick={() => stepFrame(-1)}
              disabled={!currentTake}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
              title="Step Back 1 Frame (←)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Step Forward 1 Frame */}
            <button
              type="button"
              onClick={() => stepFrame(1)}
              disabled={!currentTake}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
              title="Step Forward 1 Frame (→)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping
                  ? 'text-white bg-white/10'
                  : 'text-neutral-500 hover:text-white'
              }`}
              title="Toggle Loop Playback"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Speed & Volume & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-neutral-950/60 rounded-md p-0.5 border border-white/[0.08] text-[10px] font-mono">
              {[0.5, 1, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackRate === rate
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Fullscreen (F)"
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
