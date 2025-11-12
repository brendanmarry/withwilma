"use client"

import { useEffect, useState } from "react"
import { Camera, CameraOff, Mic, MicOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useVideoCall } from "@/hooks/useVideoCall"

interface VideoCallProps {
  className?: string
}

export function VideoCall({ className }: VideoCallProps) {
  const { localVideoRef, stream, error } = useVideoCall()
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  function toggleCamera() {
    if (!stream) return
    stream.getVideoTracks().forEach((track) => (track.enabled = !isCameraOn))
    setIsCameraOn((prev) => !prev)
  }

  function toggleMic() {
    if (!stream) return
    stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn))
    setIsMicOn((prev) => !prev)
  }

  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-lg",
        className,
      )}
    >
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-900 text-center text-sm text-gray-200">
          <p>{error}</p>
        </div>
      ) : (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          data-testid="candidate-video"
        />
      )}

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
        <Button
          size="icon"
          variant={isMicOn ? "default" : "outline"}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant={isCameraOn ? "default" : "outline"}
          onClick={toggleCamera}
        >
          {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}

