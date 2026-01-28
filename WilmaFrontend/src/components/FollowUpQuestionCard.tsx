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
    <Card className="space-y-4 bg-white/80 p-8 shadow-lg backdrop-blur border-0 rounded-[2rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-[var(--brand-primary)] uppercase tracking-widest">
        <span>Question {index + 1} of {total}</span>
        <div className="flex items-center gap-2">
          {onReplay ? (
            <Button
              type="button"
              variant={showPlayPrompt && !isSpeaking ? "default" : "ghost"}
              size="sm"
              className={showPlayPrompt && !isSpeaking
                ? "h-8 px-3 text-xs font-bold uppercase tracking-wide animate-pulse bg-[var(--brand-primary)] text-white hover:opacity-90 rounded-xl"
                : "h-8 px-3 text-xs font-bold uppercase tracking-wide text-[var(--brand-primary)] hover:bg-[#BFCC80]/20 rounded-xl"
              }
              onClick={onReplay}
            >
              {isSpeaking ? <Volume2 className="mr-2 h-3.5 w-3.5" /> : <VolumeX className="mr-2 h-3.5 w-3.5" />}
              {isSpeaking ? "Playing…" : showPlayPrompt ? "🔊 Play question" : "Replay question"}
            </Button>
          ) : null}
          {question.isFallback ? (
            <Badge variant="outline" className="border-[#BFCC80] bg-[#FAF8F2] text-xs uppercase tracking-wide text-[var(--brand-primary)]">
              {question.fallbackLabel ?? "Wilma default follow-up"}
            </Badge>
          ) : null}
        </div>
      </div>
      {showPlayPrompt && !isSpeaking ? (
        <div className="rounded-xl bg-[#FAF8F2] border border-[#BFCC80] p-3 text-center text-sm font-bold text-[var(--brand-primary)]">
          👆 Click the button above to hear Wilma read the question aloud
        </div>
      ) : null}
      <h2 className="text-2xl font-bold text-[var(--brand-primary)] tracking-tight leading-snug">{question.question}</h2>
      <div className="rounded-2xl bg-[#FAF8F2] border border-[#BFCC80]/30 p-4 text-sm text-[var(--brand-primary)]">
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-0 text-sm font-bold uppercase tracking-wide text-[var(--brand-primary)] hover:text-[#4d581c] hover:bg-transparent"
          onClick={() => setShowReason((prev) => !prev)}
        >
          <span>Why we’re asking</span>
          {showReason ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {showReason ? (
          <div className="mt-2 space-y-3 border-t border-[#BFCC80]/30 pt-3">
            <p className="text-[var(--brand-primary)] font-medium leading-relaxed">{question.reason}</p>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#BFCC80]">
              Target competency: {question.competencyTargeted}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

