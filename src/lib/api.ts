"use client"

import { nanoid } from "nanoid"
import { ApplicationInput, FollowUpQuestion, Job } from "./types"

const JOBS: Job[] = [
  {
    id: "job-001",
    organisationId: "org-001",
    title: "Senior Product Manager",
    department: "Product",
    location: "Remote - North America",
    wilmaEnabled: true,
    description: [
      "We are looking for a Senior Product Manager to own the AI-driven candidate experience for Wilma.",
      "",
      "Responsibilities:",
      "• Collaborate with design and engineering to ship delightful recruitment workflows.",
      "• Translate customer feedback into roadmap priorities.",
      "• Partner with data science to refine Wilma's conversational intelligence.",
      "",
      "Requirements:",
      "• 5+ years in product management.",
      "• Experience building SaaS platforms.",
      "• Strong communication and storytelling skills.",
    ].join("\n"),
  },
  {
    id: "job-002",
    organisationId: "org-001",
    title: "Full Stack Engineer",
    department: "Engineering",
    location: "Hybrid - Dublin, IE",
    wilmaEnabled: true,
    description: [
      "Join the founding engineering team building Wilma's recruitment intelligence platform.",
      "",
      "Responsibilities:",
      "• Implement end-to-end features across the stack.",
      "• Integrate LLM-powered workflows, WebRTC, and video processing.",
      "• Collaborate closely with design and product to shape the candidate experience.",
      "",
      "Requirements:",
      "• 4+ years building React/Node applications.",
      "• Experience with WebRTC and media pipelines a plus.",
      "• Curious mindset and passion for shipping quality software.",
    ].join("\n"),
  },
]

export async function getJobs(): Promise<Job[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return JOBS
}

export async function submitApplication(
  data: FormData,
): Promise<{ applicationId: string; matchScore: number; recommendedQuestions: FollowUpQuestion[] }> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const applicationId = nanoid()
  const recommendedQuestions: FollowUpQuestion[] = [
    {
      id: nanoid(),
      question: "Describe a project where you improved a recruitment or hiring workflow.",
      reason: "Evaluate candidate experience with process optimisation.",
      competencyTargeted: "Operational Excellence",
    },
    {
      id: nanoid(),
      question: "How do you stay informed about emerging AI trends that could benefit our organisation?",
      reason: "Assess curiosity and knowledge depth about AI.",
      competencyTargeted: "Strategic Thinking",
    },
  ]

  return { applicationId, matchScore: 73, recommendedQuestions }
}

export async function getFollowUpQuestions(applicationId: string): Promise<FollowUpQuestion[]> {
  console.debug("Fetching follow-up questions for application", applicationId)
  await new Promise((resolve) => setTimeout(resolve, 600))

  return [
    {
      id: nanoid(),
      question: "Tell me about a time you leveraged data to improve hiring outcomes.",
      reason: "Measure analytical problem-solving.",
      competencyTargeted: "Data Fluency",
    },
    {
      id: nanoid(),
      question: "What motivates you to join our mission at Wilma?",
      reason: "Understand culture and mission alignment.",
      competencyTargeted: "Cultural Add",
    },
  ]
}

export async function uploadVideoAnswer(questionId: string, file: Blob): Promise<void> {
  console.debug("Uploading video answer", { questionId, size: file.size })
  await new Promise((resolve) => setTimeout(resolve, 800))
}

export async function finalizeApplication(applicationId: string): Promise<{ status: "received" }> {
  console.debug("Finalising application", applicationId)
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { status: "received" }
}

