"use client"

import { create } from "zustand"
import { ApplicationInput, FollowUpQuestion, Job } from "@/lib/types"

interface InterviewState {
  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  selectedJob?: Job
  selectJob: (jobId: string) => void
  application?: { id: string; data: ApplicationInput; matchScore?: number }
  setApplication: (application: NonNullable<InterviewState["application"]>) => void
  followUpQuestions: FollowUpQuestion[]
  setFollowUpQuestions: (questions: FollowUpQuestion[]) => void
  transcript: { role: "wilma" | "candidate"; text: string }[]
  addTranscriptMessage: (message: { role: "wilma" | "candidate"; text: string }) => void
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  selectedJob: undefined,
  selectJob: (jobId) =>
    set((state) => ({
      selectedJob: state.jobs.find((job) => job.id === jobId) ?? state.selectedJob,
    })),
  application: undefined,
  setApplication: (application) => set({ application }),
  followUpQuestions: [],
  setFollowUpQuestions: (questions) => set({ followUpQuestions: questions }),
  transcript: [
    {
      role: "wilma",
      text: "Hi there! I’m Wilma, the AI assistant for this organisation. I’m here to answer any questions you have about the role and the company. Ready when you are!",
    },
  ],
  addTranscriptMessage: (message) => set({ transcript: [...get().transcript, message] }),
}))

