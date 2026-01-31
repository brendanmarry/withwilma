"use client";

import { useEffect, useState } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVideoCall } from "@/hooks/useVideoCall";

interface VideoCallProps {
  className?: string;
}

export function VideoCall({ className }: VideoCallProps) {
  const { localVideoRef, stream, error } = useVideoCall();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOn;
    });
  }, [stream, isCameraOn]);

  useEffect(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = isMicOn;
    });
  }, [stream, isMicOn]);

  const displayError = error ?? null;
  const shouldShowVideo = hasMounted && !displayError;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-lg",
        className,
      )}
    >
      {!hasMounted ? (
        <div className="flex h-full items-center justify-center bg-gray-900 text-sm text-gray-400">
          Preparing camera…
        </div>
      ) : displayError ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-900 text-center text-sm text-gray-200">
          <p>{displayError}</p>
        </div>
      ) : (
        shouldShowVideo && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            data-testid="candidate-video"
          />
        )
      )}

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
        <Button
          size="icon"
          variant={isMicOn ? "default" : "outline"}
          onClick={() => setIsMicOn((prev) => !prev)}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant={isCameraOn ? "default" : "outline"}
          onClick={() => setIsCameraOn((prev) => !prev)}
        >
          {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}

