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
  apply_url?: string
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
  layoutConfig?: any | null
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

export interface VideoAnswer {
  id: string
  questionId: string
  videoUrl: string
  transcript?: string
  analysis?: any
  followupQuestion?: FollowUpQuestion
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
  videos?: VideoAnswer[]
  status?: "new" | "reviewed" | "shortlisted" | "rejected" | "interview"
  createdAt?: string
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  rootUrl: string;
  careersPageUrl?: string; // Optional
  createdAt: string;
  updatedAt: string;
  counts: {
    documents: number;
    faqs: number;
    jobs: number;
  };
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
}

export interface OrganisationProfile {
  overview: string;
  productsAndServices: string[];
  historyHighlights: string[];
  leadershipTeam: string[];
  fundingStatus: string;
  ownershipStructure: string;
  confidence: "high" | "medium" | "low";
  notes: string[];
  generatedAt: string;
  sourceCount: number;
}

export interface DocumentSummary {
  id: string;
  sourceType: string;
  sourceUrl: string | null;
  mimeType: string | null;
  createdAt: string;
  metadata: Record<string, any> | null;
}
