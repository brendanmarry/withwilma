export interface NormalisedJob {
  title?: string
  department?: string
  location?: string
  employment_type?: string
  summary?: string
  responsibilities?: string[]
  requirements?: string[]
  nice_to_have?: string[]
  seniority_level?: string
  company_values_alignment?: string
  clean_text?: string
}

export interface Job {
  id: string
  organisationId: string
  title: string
  department?: string | null
  location?: string | null
  employmentType?: string | null
  description: string
  wilmaEnabled: boolean
  status?: "open" | "closed"
  sourceUrl?: string | null
  normalizedJson?: NormalisedJob | null
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
  isFallback?: boolean
  fallbackLabel?: string
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

