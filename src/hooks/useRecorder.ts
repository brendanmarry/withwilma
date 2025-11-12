"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface RecorderOptions {
  maxDuration?: number
  mimeType?: string
}

export function useRecorder({ maxDuration = 30, mimeType = "video/webm;codecs=vp8,opus" }: RecorderOptions = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  useEffect(() => {
    if (!isRecording) return
    if (elapsed >= maxDuration) {
      stopRecording()
      return
    }
    const id = window.setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => window.clearInterval(id)
  }, [elapsed, isRecording, maxDuration])

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

      recorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Wilma can’t access your camera/mic yet. Please enable permissions and try again.")
    }
  }, [mimeType])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    setElapsed(0)
    setIsRecording(false)
    setError(null)
    chunksRef.current = []
  }, [])

  const getRecording = useCallback(() => {
    return new Blob(chunksRef.current, { type: "video/webm" })
  }, [])

  return {
    startRecording,
    stopRecording,
    reset,
    getRecording,
    elapsed,
    isRecording,
    error,
    maxDuration,
  }
}

