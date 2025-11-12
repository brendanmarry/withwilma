"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";

import { SideTranscript } from "@/components/SideTranscript";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/types";
import { useInterviewStore } from "@/store/interview-store";
import { LocalVideoPreview } from "@/components/LocalVideoPreview";
import { JourneyProgress } from "@/components/JourneyProgress";
import { BackButton } from "@/components/BackButton";
import { useRealtimeAgent } from "@/hooks/useRealtimeAgent";
import { WilmaAvatar } from "@/components/WilmaAvatar";

interface InterviewExperienceProps {
  job: Job;
  fromFallback?: boolean;
}

export function InterviewExperience({ job, fromFallback = false }: InterviewExperienceProps) {
  const transcript = useInterviewStore((state) => state.transcript);
  const selectJob = useInterviewStore((state) => state.selectJob);
  const jobs = useInterviewStore((state) => state.jobs);
  const setJobs = useInterviewStore((state) => state.setJobs);
  const addTranscriptMessage = useInterviewStore((state) => state.addTranscriptMessage);
  const [showTranscript, setShowTranscript] = useState(false);
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
  const [hasGreeted, setHasGreeted] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!jobs.find((existing) => existing.id === job.id)) {
      setJobs([...jobs, job]);
    }
    selectJob(job.id);
  }, [job, jobs, selectJob, setJobs]);

  useEffect(() => {
    void connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (isConnected && !hasGreeted) {
      createResponse(
        "Please greet the candidate, introduce yourself as Wilma, the AI assistant representing the organisation, and invite them to ask any questions about the company, team, or role. Keep it warm, professional, and concise.",
      );
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
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="flex flex-wrap items-center gap-4 px-6 pt-6 lg:px-12">
        <BackButton label="Back" />
        <JourneyProgress currentStep={2} className="min-w-[260px] flex-1" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-6 lg:px-12">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-purple-500">Live with Wilma</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Let’s explore the {job.title} role together</h1>
            <p className="text-sm text-slate-600 md:text-base">
              Wilma knows the ins and outs of this organisation’s products, team culture, and expectations. Ask her anything — she’ll respond instantly with voice and transcript.
            </p>
          </motion.div>

          {fromFallback ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-900">
              This conversation uses the sample job description because the backend jobs table is unreachable or empty. Start Wilma’s backend and repopulate jobs to see live data.
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:mx-auto lg:max-w-[860px]">
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

          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex w-full max-w-[320px] flex-col gap-4 lg:w-[320px]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-lg">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex w-full max-w-[320px] flex-col gap-4 lg:w-[320px]"
            >
              <LocalVideoPreview />
            </motion.div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Conversation notes</h2>
                <p className="text-xs text-slate-500">Wilma keeps track of the discussion for recruiters.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowTranscript((prev) => !prev)}
              >
                {showTranscript ? "Hide notes" : "Show notes"}
              </Button>
            </div>
            {showTranscript ? (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-slate-100">
                <SideTranscript messages={transcript} />
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Notes are hidden. Select “Show notes” to review the conversation summary.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg lg:mx-auto lg:flex-row lg:items-center lg:justify-between lg:max-w-[860px]">
            <p className="text-sm text-slate-600 lg:max-w-xl">
              When you’re happy with your conversation, continue to the tailored application flow. Wilma will analyse your CV and prepare a few follow-up questions.
            </p>
            <Button asChild className="h-12 px-8 text-base">
              <Link href={`/apply/${job.id}`}>Continue to submit application</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

