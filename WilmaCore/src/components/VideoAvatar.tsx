"use client"

import Image from "next/image"

export function VideoAvatar() {
  return (
    <div className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-500 shadow-xl">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center text-center text-white">
          <div className="relative mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-white/30">
            <Image alt="Wilma AI Avatar" src="/wilma-avatar-placeholder.png" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Wilma — AI Career Guide</h2>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            Ask me anything about the company, the role, or the people you’d be working with.
          </p>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between px-6 py-4 text-sm text-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          Listening
        </div>
        <span>Powered by your organisation’s knowledge base</span>
      </div>
    </div>
  )
}

