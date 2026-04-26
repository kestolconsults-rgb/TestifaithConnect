import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, Maximize, Pause, RotateCcw } from "lucide-react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isEnded, setIsEnded] = useState(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Video area tap: show controls OR toggle play ──────────────────────────
  const handleVideoTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Prevent onClick firing after onTouchEnd on the same gesture
    if (e.type === "touchend") {
      (e as React.TouchEvent).preventDefault();
    }

    if (!hasStarted) {
      // First tap — start playback
      videoRef.current?.play();
      return;
    }

    if (!controlsVisible) {
      showControls();
      if (isPlaying) scheduleHide();
    } else {
      togglePlay();
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play();
    } else {
      v.pause();
    }
  };

  // ── Button handlers — stop propagation so they don't bubble to video area ─
  const handlePlayPause = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === "touchend") (e as React.TouchEvent).preventDefault();
    togglePlay();
    showControls();
    if (isPlaying) scheduleHide();
  };

  const handleMute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === "touchend") (e as React.TouchEvent).preventDefault();
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
    }
    showControls();
    if (isPlaying) scheduleHide();
  };

  const handleFullscreen = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === "touchend") (e as React.TouchEvent).preventDefault();
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleReplay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === "touchend") (e as React.TouchEvent).preventDefault();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
    showControls();
    if (isPlaying) scheduleHide();
  };

  // ── Video element event callbacks ─────────────────────────────────────────
  const onPlay = () => {
    setIsPlaying(true);
    setIsEnded(false);
    setHasStarted(true);
    scheduleHide();
  };

  const onPause = () => {
    setIsPlaying(false);
    showControls();
  };

  const onEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    showControls();
  };

  const onTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) setTotalDuration(videoRef.current.duration);
  };

  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  return (
    <div
      className={`relative aspect-video bg-black rounded-xl overflow-hidden ${className}`}
      style={{ touchAction: "manipulation" }}
      data-testid="video-player-container"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        playsInline
        data-testid="video-player"
      />

      {/* Thumbnail shown before first play */}
      {!hasStarted && thumbnailUrl && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          {duration && (
            <div className="absolute bottom-16 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-mono">
              {formatTime(duration)}
            </div>
          )}
        </div>
      )}

      {/* Transparent click/tap layer over the video (below controls) */}
      <div
        className="absolute inset-0 z-20"
        onClick={handleVideoTap}
        onTouchEnd={handleVideoTap}
      />

      {/* Centred play / replay button — shown when paused or ended */}
      {(!isPlaying) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg">
            {isEnded ? (
              <RotateCcw className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            )}
          </div>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-200 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Gradient backdrop */}
        <div className="bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10 pb-3 px-3">
          {/* Seek bar */}
          <div
            className="mb-2 px-1"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-1 accent-red-500 cursor-pointer"
              style={{ accentColor: "#ef4444" }}
              data-testid="slider-video-progress"
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-1">
            {/* Play / Pause */}
            <button
              className="p-2 text-white rounded-full active:bg-white/20"
              onClick={handlePlayPause}
              onTouchEnd={handlePlayPause}
              data-testid="button-play-pause"
              style={{ touchAction: "manipulation" }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : isEnded ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Replay on ended */}
            {isEnded && (
              <button
                className="p-2 text-white rounded-full active:bg-white/20"
                onClick={handleReplay}
                onTouchEnd={handleReplay}
                data-testid="button-replay"
                style={{ touchAction: "manipulation" }}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {/* Timestamps */}
            <span className="text-white text-xs font-mono ml-1 shrink-0">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>

            <div className="flex-1" />

            {/* Mute */}
            <button
              className="p-2 text-white rounded-full active:bg-white/20"
              onClick={handleMute}
              onTouchEnd={handleMute}
              data-testid="button-mute"
              style={{ touchAction: "manipulation" }}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              className="p-2 text-white rounded-full active:bg-white/20"
              onClick={handleFullscreen}
              onTouchEnd={handleFullscreen}
              data-testid="button-fullscreen"
              style={{ touchAction: "manipulation" }}
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
