"use client"

import { useMemo, useState } from "react"
import { Info, Loader2, Play, Redo2, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ProgressRing"
import { useRecorder } from "@/hooks/useRecorder"
import { VideoCall } from "@/components/VideoCall"

interface RecorderProps {
  maxDuration?: number
  onRecorded: (file: Blob) => Promise<void> | void
}

export function Recorder({ maxDuration = 20, onRecorded, maxRetries = 3 }: RecorderProps & { maxRetries?: number }) {
  const { startRecording, stopRecording, reset, elapsed, isRecording, error, stream } = useRecorder({
    maxDuration,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [lastRecording, setLastRecording] = useState<Blob | null>(null)
  const [isPlayback, setIsPlayback] = useState(false)
  const [retriesLeft, setRetriesLeft] = useState(maxRetries)

  const hasRecording = useMemo(() => Boolean(lastRecording && lastRecording.size > 0), [lastRecording])

  async function handleStop() {
    try {
      const blob = await stopRecording()
      if (!blob || blob.size === 0) {
        setLocalError("We couldn’t capture that. Please record again.")
        return
      }
      setLocalError(null)
      setLastRecording(blob)
      setIsPlayback(true) // Automatically playback after stop to review
    } catch (err) {
      console.error(err)
      setLocalError("Something went wrong capturing your answer. Please try again.")
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
              <p className="text-sm text-red-600 font-bold uppercase tracking-tight">{error ?? localError}</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-700 font-medium">
                  {isRecording
                    ? "Recording... just be yourself!"
                    : retriesLeft === 0
                      ? "That's your final attempt! Feel free to review or submit."
                      : `Ready to shine? Simply be yourself and show us your spark! You have up to ${maxDuration} seconds and ${retriesLeft} attempts to get it perfect.`}
                </p>
                {!isRecording && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Info className="h-3 w-3 text-[var(--brand-primary)] opacity-60" />
                    <span>Relax! We only see the final version you choose to submit.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                className="h-16 w-16 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90"
                size="icon"
                onClick={() => {
                  if (retriesLeft > 0 || !hasRecording) {
                    setIsPlayback(false)
                    startRecording()
                  } else {
                    setLocalError("No retries left. Please use your current recording.")
                  }
                }}
                disabled={isUploading || (retriesLeft === 0 && hasRecording)}
              >
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Rec"}
              </Button>
            ) : (
              <Button
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg animate-pulse"
                size="icon"
                onClick={async () => {
                  await handleStop();
                  setRetriesLeft(prev => Math.max(0, prev - 1));
                }}
              >
                <StopCircle className="h-7 w-7" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-slate-200"
              onClick={() => {
                if (retriesLeft > 0) {
                  reset()
                  setLocalError(null)
                  setLastRecording(null)
                  setIsPlayback(false)
                }
              }}
              disabled={isRecording || isUploading || retriesLeft === 0}
              title={retriesLeft === 0 ? "No retries left" : `${retriesLeft} retries left`}
            >
              <Redo2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-gray-100"
              onClick={() => setIsPlayback(true)}
              disabled={!hasRecording || isRecording || isUploading}
              aria-label="Replay last recording"
            >
              <Play className="h-5 w-5" />
            </Button>
          </div>

          {hasRecording && !isRecording && (
            <Button
              onClick={() => onRecorded(lastRecording!)}
              disabled={isUploading}
              className="mt-4 bg-[#616E24] hover:bg-[#4d581c] text-white px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-sm"
            >
              {isUploading ? "Uploading..." : "Submit Answer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

