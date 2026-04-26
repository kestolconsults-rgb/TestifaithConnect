import { useState, useRef, useCallback } from "react";
import { Play, Volume2, VolumeX, Maximize, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  duration,
  className = "",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnailUrl);
  // Controls are always visible; only auto-hide while actively playing,
  // and immediately reappear on any tap/click.
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500);
  }, []);

  const bringUpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setShowThumbnail(false);
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // Tap on the video body: show controls if hidden, toggle play if already visible
  const handleVideoAreaClick = useCallback(() => {
    if (!controlsVisible) {
      bringUpControls();
    } else {
      togglePlay();
      if (!videoRef.current?.paused) scheduleHide();
    }
  }, [controlsVisible, bringUpControls, togglePlay, scheduleHide]);

  const handlePlay = () => {
    setIsPlaying(true);
    scheduleHide();
  };

  const handlePause = () => {
    setIsPlaying(false);
    bringUpControls(); // always show controls when paused
  };

  const handleEnded = () => {
    setIsPlaying(false);
    bringUpControls();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setVideoDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handlePlayPauseClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    togglePlay();
    if (isPlaying) {
      bringUpControls();
    } else {
      scheduleHide();
    }
  };

  const handleSliderInteraction = (e: React.PointerEvent) => {
    e.stopPropagation();
    bringUpControls();
  };

  return (
    <div
      className={`relative aspect-video bg-black rounded-xl overflow-hidden select-none ${className}`}
      onClick={handleVideoAreaClick}
      onTouchEnd={handleVideoAreaClick}
      data-testid="video-player-container"
    >
      {/* Thumbnail overlay */}
      {showThumbnail && thumbnailUrl && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          {duration && (
            <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-mono">
              {formatTime(duration)}
            </div>
          )}
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
        data-testid="video-player"
      />

      {/* Big centred play button — shown when paused/stopped */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom control bar — always rendered, visibility via opacity */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-3 transition-opacity duration-200 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="mb-2"
          onPointerDown={handleSliderInteraction}
        >
          <Slider
            value={[currentTime]}
            max={videoDuration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            data-testid="slider-video-progress"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white shrink-0"
            onClick={handlePlayPauseClick}
            onTouchEnd={handlePlayPauseClick}
            data-testid="button-play-pause"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white" />
            )}
          </Button>

          {/* Time */}
          <span className="text-white text-xs font-mono shrink-0">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </span>

          <div className="flex-1" />

          {/* Mute */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white shrink-0"
            onClick={handleMuteToggle}
            onTouchEnd={handleMuteToggle}
            data-testid="button-mute"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          {/* Fullscreen */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white shrink-0"
            onClick={handleFullscreen}
            onTouchEnd={handleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
