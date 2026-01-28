"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { FollowUpQuestionCard } from "@/components/FollowUpQuestionCard"
import { Recorder } from "@/components/Recorder"
import { Button } from "@/components/ui/button"
import { uploadVideoAnswer, getFollowUpQuestions, finalizeApplication } from "@/lib/api"
import { FollowUpQuestion } from "@/lib/types"
import { useInterviewStore } from "@/store/interview-store"
import { useWilmaVoice } from "@/hooks/useWilmaVoice"

interface FollowUpFlowProps {
  applicationId: string
}

export function FollowUpFlow({ applicationId }: FollowUpFlowProps) {
  const router = useRouter()
  const storeQuestions = useInterviewStore((state) => state.followUpQuestions)
  const setFollowUpQuestions = useInterviewStore((state) => state.setFollowUpQuestions)

  const [questions, setQuestions] = useState<FollowUpQuestion[]>(storeQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [answers, setAnswers] = useState<Map<string, Blob>>(new Map())
  const [isReviewing, setIsReviewing] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const hasUserInteractedRef = useRef(false)
  const { speak: speakWithWilmaVoice, isReady: isVoiceReady } = useWilmaVoice()

  useEffect(() => {
    hasUserInteractedRef.current = hasUserInteracted
  }, [hasUserInteracted])

  useEffect(() => {
    async function ensureQuestions() {
      if (storeQuestions.length > 0) {
        return
      }
      const fetched = await getFollowUpQuestions(applicationId)
      setFollowUpQuestions(fetched)
      setQuestions(fetched)
    }
    ensureQuestions()
  }, [applicationId, setFollowUpQuestions, storeQuestions])

  useEffect(() => {
    setQuestions(storeQuestions)
  }, [storeQuestions])

  const question = questions[currentIndex]

  const speakQuestion = useCallback((isManualClick = false) => {
    if (typeof window === "undefined" || !question || !("speechSynthesis" in window)) {
      console.warn("[FollowUpFlow] Cannot speak: window, question, or speechSynthesis unavailable")
      return
    }

    if (isManualClick) {
      console.log("[FollowUpFlow] Manual interaction detected — enabling auto-play for future questions")
      setHasUserInteracted((prev) => prev || true)
    }

    if (!isVoiceReady) {
      console.log("[FollowUpFlow] Voice not ready yet, deferring speech (manual:", isManualClick, ")")
      return
    }

    console.log("[FollowUpFlow] Speaking question (manual click:", isManualClick, "):", question.question)
    const utterance = speakWithWilmaVoice(question.question, {
      onStart: () => {
        console.log("[FollowUpFlow] Question speaking started")
        setIsSpeaking(true)
        setHasUserInteracted(true) // Mark as interacted on successful start
      },
      onEnd: () => {
        console.log("[FollowUpFlow] Question speaking ended")
        setIsSpeaking(false)
        utteranceRef.current = null
      },
      onError: () => {
        if (isManualClick) {
          console.error("[FollowUpFlow] ERROR: Speech failed even after manual click!")
        } else {
          console.log("[FollowUpFlow] Auto-play blocked (expected on first load)")
        }
        setIsSpeaking(false)
        utteranceRef.current = null
        if (!isManualClick) {
          setHasUserInteracted(false)
        }
        if (isManualClick) {
          hasUserInteractedRef.current = true
        }
      },
    })
    utteranceRef.current = utterance
  }, [question, speakWithWilmaVoice, isVoiceReady])

  useEffect(() => {
    if (!question) {
      console.log("[FollowUpFlow] No question available yet")
      return
    }

    console.log("[FollowUpFlow] Question loaded, isVoiceReady:", isVoiceReady, "hasUserInteracted:", hasUserInteracted)

    // Only auto-play after the first question (once user has interacted)
    // OR if user navigated back and forth (currentIndex > 0)
    const shouldAutoPlay = hasUserInteractedRef.current || currentIndex > 0

    if (!shouldAutoPlay) {
      console.log("[FollowUpFlow] Skipping auto-play on first question (browser autoplay policy)")
      // On first load, try once anyway - if it fails, user will need to click
      const timer = setTimeout(() => {
        if (isVoiceReady) {
          console.log("[FollowUpFlow] Attempting initial auto-play (may fail due to browser policy)")
          speakQuestion(false) // false = not a manual click
        }
      }, 800)
      return () => clearTimeout(timer)
    }

    // Wait for voice system to be ready before speaking
    if (!isVoiceReady) {
      console.log("[FollowUpFlow] Voice not ready, will try in 1 second")
      // If not ready yet, wait longer and try again
      const readyTimer = setTimeout(() => {
        console.log("[FollowUpFlow] Attempting to speak after voice ready delay")
        speakQuestion(false) // Auto-play
      }, 1000)
      return () => clearTimeout(readyTimer)
    }

    // Give a moment for everything to settle, then speak
    console.log("[FollowUpFlow] Voice ready, will speak in 500ms")
    const timer = setTimeout(() => {
      console.log("[FollowUpFlow] Triggering speech now")
      speakQuestion(false) // Auto-play
    }, 500)

    return () => {
      clearTimeout(timer)
      // Only cancel speech if we're actually unmounting or changing questions
      // Don't cancel during re-renders in development mode
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const synth = window.speechSynthesis
        // Only cancel if speech is actually in progress
        if (synth.speaking || synth.pending) {
          console.log("[FollowUpFlow] Cleaning up - canceling active speech")
          synth.cancel()
        }
      }
      setIsSpeaking(false)
      utteranceRef.current = null
    }
  }, [question, speakQuestion, isVoiceReady, currentIndex])

  async function handleRecording(file: Blob) {
    if (!question) return

    try {
      setIsUploading(true)
      await uploadVideoAnswer(applicationId, question.id, file)
      setError(null)
      if (currentIndex === questions.length - 1) {
        await finalizeApplication(applicationId)
        router.push("/thanks")
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    } catch (err) {
      console.error(err)
      setError("We couldn't upload that answer. Please retry.")
    } finally {
      setIsUploading(false)
    }
  }

  if (!question) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500">Wilma is preparing your tailored questions…</p>
        <Button onClick={() => router.refresh()}>Refresh</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-[var(--brand-primary)] tracking-tight">Let&apos;s put a face to the name!</h1>
        <p className="text-lg font-medium text-gray-700 max-w-2xl mx-auto leading-relaxed">
          CV received! We&apos;re excited to meet you. To help you stand out and give us a taste of your personality,
          we&apos;ve got one quick follow-up. Just a 30-second video to bring your application to life!
        </p>
      </header>

      <FollowUpQuestionCard
        question={question}
        index={currentIndex}
        total={questions.length}
        onReplay={() => speakQuestion(true)}
        isSpeaking={isSpeaking}
        showPlayPrompt={!hasUserInteracted && currentIndex === 0}
      />

      <Recorder maxDuration={30} maxRetries={3} onRecorded={handleRecording} />

      {error ? <p className="text-center text-sm text-red-600 custom-font font-bold">{error}</p> : null}

      {isUploading ? (
        <p className="text-center text-sm text-[var(--brand-primary)] font-bold uppercase tracking-widest animate-pulse">Uploading your answer…</p>
      ) : (
        <p className="text-center text-xs uppercase tracking-[0.3em] text-[var(--brand-primary)] font-bold">
          Question {currentIndex + 1} of {questions.length}
        </p>
      )}
    </div>
  )
}

