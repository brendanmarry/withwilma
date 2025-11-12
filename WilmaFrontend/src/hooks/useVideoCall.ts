"use client"

import { useEffect, useRef, useState } from "react"

interface UseVideoCallOptions {
  audio?: boolean
  video?: boolean
}

export function useVideoCall({ audio = true, video = true }: UseVideoCallOptions = {}) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function setupMedia() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio, video })
        setStream(media)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = media
        }
      } catch (err) {
        console.error(err)
        setError("Unable to start the call. Please check your browser permissions.")
      }
    }
    setupMedia()

    return () => {
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop())
        return null
      })
    }
  }, [audio, video])

  return { localVideoRef, stream, error }
}

