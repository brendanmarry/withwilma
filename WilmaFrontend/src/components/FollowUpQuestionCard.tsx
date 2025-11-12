import { FollowUpQuestion } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FollowUpQuestionCardProps {
  question: FollowUpQuestion
  index: number
  total: number
}

export function FollowUpQuestionCard({ question, index, total }: FollowUpQuestionCardProps) {
  return (
    <Card className="space-y-4 bg-white/80 p-8 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between text-sm font-medium text-purple-600">
        <span>Question {index + 1} of {total}</span>
        {question.isFallback ? (
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-xs uppercase tracking-wide text-purple-600">
            {question.fallbackLabel ?? "Wilma default follow-up"}
          </Badge>
        ) : null}
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">{question.question}</h2>
      <div className="rounded-2xl bg-purple-50 p-4 text-sm text-purple-900">
        <p className="font-medium">Why we’re asking</p>
        <p className="mt-1 text-purple-700">{question.reason}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-purple-500">
          Target competency: {question.competencyTargeted}
        </p>
      </div>
    </Card>
  )
}

