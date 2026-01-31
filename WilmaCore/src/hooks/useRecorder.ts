"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface RecorderOptions {
  maxDuration?: number
  mimeType?: string
}

export function useRecorder({ maxDuration = 30, mimeType = "video/webm;codecs=vp8,opus" }: RecorderOptions = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const stopResolveRef = useRef<((blob: Blob) => void) | null>(null)
  const stopRejectRef = useRef<((error: Error) => void) | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) {
      return null
    }

    if (recorder.state === "inactive") {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      chunksRef.current = []
      return blob
    }

    setIsRecording(false)

    return await new Promise<Blob>((resolve, reject) => {
      stopResolveRef.current = resolve
      stopRejectRef.current = reject
      try {
        recorder.stop()
      } catch (err) {
        stopResolveRef.current = null
        stopRejectRef.current = null
        stream?.getTracks().forEach((track) => track.stop())
        setStream(null)
        reject(err as Error)
      }
    })
  }, [stream])

  useEffect(() => {
    if (!isRecording) return
    if (elapsed >= maxDuration) {
      window.setTimeout(() => {
        stopRecording().catch(() => null)
      }, 0)
      return
    }

    const id = window.setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => window.clearInterval(id)
  }, [elapsed, isRecording, maxDuration, stopRecording])

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(mediaStream)
      setElapsed(0)
      chunksRef.current = []

      const recorder = new MediaRecorder(mediaStream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        chunksRef.current = []
        stopResolveRef.current?.(blob)
        stopResolveRef.current = null
        stopRejectRef.current = null
      }

      recorder.onerror = (event) => {
        const err = (event as { error?: Error }).error ?? new Error("Recorder error")
        setError("Wilma hit a recording error. Please try again.")
        stopRejectRef.current?.(err)
        stopResolveRef.current = null
        stopRejectRef.current = null
      }

      recorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Wilma can’t access your camera/mic yet. Please enable permissions and try again.")
    }
  }, [mimeType])

  const reset = useCallback(() => {
    setElapsed(0)
    setIsRecording(false)
    setError(null)
    chunksRef.current = []
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null)
  }, [])

  return {
    startRecording,
    stopRecording,
    reset,
    elapsed,
    isRecording,
    error,
    maxDuration,
    stream,
  }
}

