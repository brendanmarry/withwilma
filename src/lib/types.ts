export interface Job {
  id: string
  organisationId: string
  title: string
  department?: string
  location?: string
  description: string
  wilmaEnabled: boolean
}

export interface ApplicationInput {
  jobId: string
  name: string
  email: string
  linkedin?: string
  cvFile?: File
}

export interface FollowUpQuestion {
  id: string
  question: string
  reason: string
  competencyTargeted: string
  transcript?: string
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email: string
  linkedin?: string
  matchScore?: number
  summary?: string
  linkedinPhotoUrl?: string
}

