import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Square, Play, RotateCcw, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoRecorderProps {
  onVideoRecorded: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDurationSeconds?: number;
}

export function VideoRecorder({ 
  onVideoRecorded, 
  onCancel,
  maxDurationSeconds = 180 
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please allow camera and microphone permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError("Video recording is not supported on this browser.");
      return;
    }
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setIsPreviewing(true);
      stopCamera();
      
      if (previewRef.current) {
        previewRef.current.src = URL.createObjectURL(blob);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setRecordingTime(elapsed);
      
      if (elapsed >= maxDurationSeconds) {
        stopRecording();
      }
    }, 1000);
  }, [maxDurationSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleRetake = useCallback(() => {
    setRecordedBlob(null);
    setIsPreviewing(false);
    setRecordingTime(0);
    if (previewRef.current) {
      previewRef.current.src = '';
    }
    startCamera();
  }, [startCamera]);

  const handleSubmit = useCallback(() => {
    if (recordedBlob) {
      onVideoRecorded(recordedBlob, recordingTime);
    }
  }, [recordedBlob, recordingTime, onVideoRecorded]);

  const handleCancel = useCallback(() => {
    stopCamera();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  }, [stopCamera, onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (recordingTime / maxDurationSeconds) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          {!cameraActive && !isPreviewing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Video className="w-16 h-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center px-4">
                Record a video testimony to share your story
              </p>
              <Button 
                onClick={startCamera}
                className="bg-red-500 hover:bg-red-600"
                data-testid="button-start-camera"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}
          
          {cameraActive && (
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              autoPlay 
              playsInline 
              muted
            />
          )}
          
          {isPreviewing && (
            <video 
              ref={previewRef}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          )}
          
          {isRecording && (
            <div className="absolute top-4 left-4 right-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white font-medium text-sm">Recording</span>
                </div>
                <span className="text-white font-mono text-sm">
                  {formatTime(recordingTime)} / {formatTime(maxDurationSeconds)}
                </span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        )}
        
        <div className="p-4 flex items-center justify-center gap-4 bg-card">
          {cameraActive && !isRecording && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-recording"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600"
                data-testid="button-start-recording"
              >
                <div className="w-4 h-4 bg-white rounded-full mr-2" />
                Start Recording
              </Button>
            </>
          )}
          
          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              data-testid="button-stop-recording"
            >
              <Square className="w-4 h-4 mr-2 fill-current" />
              Stop Recording
            </Button>
          )}
          
          {isPreviewing && (
            <>
              <Button
                variant="outline"
                onClick={handleRetake}
                data-testid="button-retake"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-red-500 hover:bg-red-600"
                data-testid="button-use-video"
              >
                <Upload className="w-4 h-4 mr-2" />
                Use This Video
              </Button>
            </>
          )}
          
          {!cameraActive && !isPreviewing && (
            <Button
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
