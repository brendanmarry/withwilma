"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { FollowUpQuestionCard } from "@/components/FollowUpQuestionCard"
import { Recorder } from "@/components/Recorder"
import { Button } from "@/components/ui/button"
import { uploadVideoAnswer, getFollowUpQuestions, finalizeApplication } from "@/lib/api"
import { FollowUpQuestion } from "@/lib/types"
import { useInterviewStore } from "@/store/interview-store"

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-500">Step 4</p>
        <h1 className="text-3xl font-semibold text-slate-900">Wilma has a few quick follow-ups for you</h1>
        <p className="text-sm text-slate-600">
          Keep each answer to around 30 seconds. Wilma will send these responses directly to the hiring team.
        </p>
      </header>

      <FollowUpQuestionCard question={question} index={currentIndex} total={questions.length} />

      <Recorder maxDuration={30} onRecorded={handleRecording} />

      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

      {isUploading ? (
        <p className="text-center text-sm text-slate-500">Uploading your answer…</p>
      ) : (
        <p className="text-center text-xs uppercase tracking-[0.3em] text-purple-400">
          Question {currentIndex + 1} of {questions.length}
        </p>
      )}
    </div>
  )
}

