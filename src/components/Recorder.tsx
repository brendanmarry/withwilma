"use client"

import { useState } from "react"
import { Loader2, Redo2, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ProgressRing"
import { useRecorder } from "@/hooks/useRecorder"

interface RecorderProps {
  maxDuration?: number
  onRecorded: (file: Blob) => Promise<void> | void
}

export function Recorder({ maxDuration = 30, onRecorded }: RecorderProps) {
  const {
    startRecording,
    stopRecording,
    reset,
    getRecording,
    elapsed,
    isRecording,
    error,
  } = useRecorder({ maxDuration })
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleStop() {
    stopRecording()
    const blob = getRecording()
    try {
      setIsUploading(true)
      await Promise.resolve(onRecorded(blob))
    } catch (err) {
      console.error(err)
      setLocalError("Something went wrong uploading your answer. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
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
            onClick={startRecording}
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
          }}
          disabled={isRecording || isUploading}
        >
          <Redo2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

