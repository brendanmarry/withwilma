import { useState } from "react"
import { ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react"

import { FollowUpQuestion } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FollowUpQuestionCardProps {
  question: FollowUpQuestion
  index: number
  total: number
  onReplay?: () => void
  isSpeaking?: boolean
  showPlayPrompt?: boolean
}

export function FollowUpQuestionCard({ question, index, total, onReplay, isSpeaking = false, showPlayPrompt = false }: FollowUpQuestionCardProps) {
  const [showReason, setShowReason] = useState(false)

  return (
    <Card className="space-y-4 bg-white/80 p-8 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-purple-600">
        <span>Question {index + 1} of {total}</span>
        <div className="flex items-center gap-2">
          {onReplay ? (
            <Button
              type="button"
              variant={showPlayPrompt && !isSpeaking ? "default" : "ghost"}
              size="sm"
              className={showPlayPrompt && !isSpeaking 
                ? "h-8 px-3 text-xs font-semibold uppercase tracking-wide animate-pulse bg-purple-600 text-white hover:bg-purple-700"
                : "h-8 px-3 text-xs font-semibold uppercase tracking-wide text-purple-600 hover:text-purple-800"
              }
              onClick={onReplay}
            >
              {isSpeaking ? <Volume2 className="mr-2 h-3.5 w-3.5" /> : <VolumeX className="mr-2 h-3.5 w-3.5" />}
              {isSpeaking ? "Playing…" : showPlayPrompt ? "🔊 Play question" : "Replay question"}
            </Button>
          ) : null}
          {question.isFallback ? (
            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-xs uppercase tracking-wide text-purple-600">
              {question.fallbackLabel ?? "Wilma default follow-up"}
            </Badge>
          ) : null}
        </div>
      </div>
      {showPlayPrompt && !isSpeaking ? (
        <div className="rounded-lg bg-purple-100 p-3 text-center text-sm text-purple-700">
          👆 Click the button above to hear Wilma read the question aloud
        </div>
      ) : null}
      <h2 className="text-2xl font-semibold text-gray-900">{question.question}</h2>
      <div className="rounded-2xl bg-purple-50 p-4 text-sm text-purple-900">
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-0 text-sm font-semibold text-purple-700 hover:text-purple-900"
          onClick={() => setShowReason((prev) => !prev)}
        >
          <span>Why we’re asking</span>
          {showReason ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {showReason ? (
          <div className="mt-2 space-y-3 border-t border-purple-100 pt-3">
            <p className="text-purple-700">{question.reason}</p>
            <p className="text-xs uppercase tracking-wide text-purple-500">
              Target competency: {question.competencyTargeted}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

