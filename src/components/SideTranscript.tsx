"use client"

import { cn } from "@/lib/utils"

interface TranscriptMessage {
  role: "wilma" | "candidate"
  text: string
  timestamp?: string
}

interface SideTranscriptProps {
  messages: TranscriptMessage[]
  className?: string
}

export function SideTranscript({ messages, className }: SideTranscriptProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Conversation Notes</p>
          <p className="text-xs text-gray-500">Highlights from your discussion with Wilma</p>
        </div>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          Live
        </span>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
              message.role === "wilma"
                ? "ml-auto bg-purple-50 text-purple-900"
                : "mr-auto bg-gray-100 text-gray-900",
            )}
          >
            <p className="leading-relaxed">{message.text}</p>
            {message.timestamp ? (
              <span className="mt-2 block text-[11px] uppercase tracking-wide text-gray-500">
                {message.timestamp}
              </span>
            ) : null}
          </div>
        ))}
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Your conversation history will appear here.</p>
        ) : null}
      </div>
    </div>
  )
}

