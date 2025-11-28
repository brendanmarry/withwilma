"use client"

import { useMemo, useState } from "react"
import { Loader2, Play, Redo2, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ProgressRing"
import { useRecorder } from "@/hooks/useRecorder"
import { VideoCall } from "@/components/VideoCall"

interface RecorderProps {
  maxDuration?: number
  onRecorded: (file: Blob) => Promise<void> | void
}

export function Recorder({ maxDuration = 30, onRecorded }: RecorderProps) {
  const { startRecording, stopRecording, reset, elapsed, isRecording, error, stream } = useRecorder({
    maxDuration,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [lastRecording, setLastRecording] = useState<Blob | null>(null)
  const [isPlayback, setIsPlayback] = useState(false)

  const hasRecording = useMemo(() => Boolean(lastRecording && lastRecording.size > 0), [lastRecording])

  async function handleStop() {
    try {
      const blob = await stopRecording()
      if (!blob || blob.size === 0) {
        setLocalError("We couldn’t capture that. Please record again.")
        return
      }
      setIsUploading(true)
      await Promise.resolve(onRecorded(blob))
      setLocalError(null)
      setLastRecording(blob)
    } catch (err) {
      console.error(err)
      setLocalError("Something went wrong uploading your answer. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="w-full max-w-[320px] rounded-3xl border border-slate-200 bg-white shadow-sm">
          {stream || hasRecording ? (
            <video
              key={isPlayback ? `playback-${Date.now()}` : "live-preview"}
              ref={(node) => {
                if (!node) return
                if (isPlayback && lastRecording) {
                  node.src = URL.createObjectURL(lastRecording)
                  node.controls = true
                  node.muted = false
                  node.playsInline = true
                  void node.play().catch(() => undefined)
                } else if (stream) {
                  node.srcObject = stream
                  node.muted = true
                  node.controls = false
                  node.playsInline = true
                  void node.play().catch(() => undefined)
                }
              }}
              className="h-full w-full rounded-3xl object-cover"
            />
          ) : (
            <VideoCall className="h-[360px] w-full rounded-3xl border-none shadow-none" />
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-4">
          <ProgressRing progress={(elapsed / maxDuration) * 100}>
            <span className="text-4xl font-semibold text-gray-900">{elapsed}s</span>
          </ProgressRing>

          <div className="flex flex-col items-center gap-3 text-center">
            {error || localError ? (
              <p className="text-sm text-red-600">{error ?? localError}</p>
            ) : (
              <p className="text-sm text-gray-600">
                {isRecording
                  ? "Recording... keep your answer concise and focused."
                  : "Record a short answer (up to 30 seconds)."}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                className="h-16 w-16 rounded-full text-lg"
                size="icon"
                onClick={() => {
                  setIsPlayback(false)
                  startRecording()
                }}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Rec"}
              </Button>
            ) : (
              <Button
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
                size="icon"
                onClick={handleStop}
              >
                <StopCircle className="h-7 w-7" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                reset()
                setLocalError(null)
                setLastRecording(null)
                setIsPlayback(false)
              }}
              disabled={isRecording || isUploading}
            >
              <Redo2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => setIsPlayback(true)}
              disabled={!hasRecording || isRecording || isUploading}
              aria-label="Replay last recording"
            >
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

