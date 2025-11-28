"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRealtimeAgent } from "@/hooks/useRealtimeAgent";
import { useInterviewStore } from "@/store/interview-store";
import { WilmaAvatar } from "@/components/WilmaAvatar";
import { cn } from "@/lib/utils";

const GREETING_MESSAGE =
  "Please greet the candidate, introduce yourself as Wilma, the AI assistant representing the organisation, " +
  "and invite them to ask any questions about the company, team, or role. Keep it warm, professional, and concise.";

interface VoiceChatPanelProps {
  className?: string
}

export function VoiceChatPanel({ className }: VoiceChatPanelProps) {
  const {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    isMicStreaming,
    startMicrophone,
    stopMicrophone,
    createResponse,
    toggleAudioEnabled,
    audioEnabled,
    audioAnalyser,
    messages,
    lastError,
  } = useRealtimeAgent({ enableAudio: true });

  const addTranscriptMessage = useInterviewStore((state) => state.addTranscriptMessage);
  const [hasGreeted, setHasGreeted] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Defer connection significantly to avoid HMR interference during development
    // Wait for Fast Refresh to complete (usually 3 cycles)
    const timer = setTimeout(() => {
      void connect();
    }, 2000); // 2 seconds should be enough for HMR to settle
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected && !hasGreeted) {
      createResponse(GREETING_MESSAGE);
      window.setTimeout(() => setHasGreeted(true), 0);
    }
  }, [createResponse, hasGreeted, isConnected]);

  useEffect(() => {
    messages.forEach((message) => {
      if (seenIds.current.has(message.id)) return;
      seenIds.current.add(message.id);

      if (message.role === "wilma" || message.role === "candidate") {
        addTranscriptMessage({ role: message.role, text: message.text });
      }
    });
  }, [messages, addTranscriptMessage]);

  const statusLabel = useMemo(() => {
    if (isConnecting) return "Connecting";
    if (isConnected) return isMicStreaming ? "Listening" : "Connected";
    return "Disconnected";
  }, [isConnected, isConnecting, isMicStreaming]);

  const handleStopInteraction = () => {
    stopMicrophone();
    disconnect();
    setHasGreeted(false);
  };

  return (
    <div className={cn("flex h-full w-full flex-col gap-3", className)}>
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Wilma responds in real time over audio. Enable your microphone to ask questions and she will answer using the organisation’s knowledge base.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={isMicStreaming ? "secondary" : "outline"}
            className="flex items-center gap-2"
            onClick={() => {
              if (isMicStreaming) {
                stopMicrophone();
              } else {
                void startMicrophone();
              }
            }}
            disabled={!isConnected || isConnecting}
          >
            {isMicStreaming ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />} {isMicStreaming ? "Mute microphone" : "Enable microphone"}
          </Button>
          {isConnecting ? <Loader2 className="h-4 w-4 animate-spin text-purple-500" /> : null}
        </div>
        <AnimatePresence>
          {lastError ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700"
            >
              {lastError}
            </motion.p>
          ) : null}
        </AnimatePresence>
        <p className="mt-3 text-xs text-slate-500">
          Tip: keep your questions conversational. Wilma listens continuously while your microphone is enabled and will reply instantly with her voice.
        </p>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-3xl shadow-lg">
        <WilmaAvatar audioAnalyser={audioAnalyser} />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          {statusLabel}
        </div>
        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 text-slate-700 hover:bg-white"
            onClick={toggleAudioEnabled}
            aria-label={audioEnabled ? "Mute Wilma" : "Unmute Wilma"}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 text-slate-700 hover:bg-white"
            onClick={handleStopInteraction}
            aria-label="Stop interaction"
            disabled={!isConnected && !isConnecting}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
