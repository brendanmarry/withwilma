import { FollowUpQuestion, Job, Organisation, OrganisationProfile, DocumentSummary, Candidate } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.withwilma.com";
const ORGANISATION_ID = process.env.NEXT_PUBLIC_ORGANISATION_ID;
const ORGANISATION_ROOT_URL = process.env.NEXT_PUBLIC_ORGANISATION_ROOT_URL;

const FALLBACK_JOBS: Job[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    organisationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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
    id: "22222222-2222-2222-2222-222222222222",
    organisationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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
];

const FALLBACK_QUESTIONS: FollowUpQuestion[] = [
  {
    id: "question-1",
    question: "Describe a project where you improved a recruitment or hiring workflow.",
    reason: "Evaluate candidate experience with process optimisation.",
    competencyTargeted: "Operational Excellence",
  },
  {
    id: "question-2",
    question: "How do you stay informed about emerging AI trends that could benefit our organisation?",
    reason: "Assess curiosity and knowledge depth about AI.",
    competencyTargeted: "Strategic Thinking",
  },
];

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "http://localhost:3000");

function buildUrl(path: string) {
  const baseUrl = typeof window === "undefined" ? INTERNAL_API_URL : API_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}


const DEFAULT_BRANDING = {
  primaryColor: "#616E24", // Babus Olive
  secondaryColor: "#BFCC80", // Light Olive
  fontFamily: "Outfit, sans-serif"
};

export async function getBranding(job?: Job | null, host?: string) {
  let tenant = null;

  if (host && (host.includes(".localhost") || host.endsWith(".withwilma.com"))) {
    const subdomain = host.split(".")[0];
    if (subdomain !== "www" && subdomain !== "app") {
      tenant = await getOrganisationBySlug(subdomain);
    }
  }

  return tenant?.branding || (job as any)?.organisation?.branding || DEFAULT_BRANDING;
}


export async function getJobs(organisationId?: string, tenantSlug?: string, wilmaEnabled?: boolean): Promise<{ jobs: Job[]; fromFallback: boolean }> {
  const url = new URL(buildUrl("/api/jobs"));
  const headers: HeadersInit = {};

  if (tenantSlug) {
    headers["x-tenant-id"] = tenantSlug;
  }

  if (organisationId) {
    url.searchParams.set("organisationId", organisationId);
  } else if (ORGANISATION_ID) {
    url.searchParams.set("organisationId", ORGANISATION_ID);
  } else if (ORGANISATION_ROOT_URL) {
    url.searchParams.set("rootUrl", ORGANISATION_ROOT_URL);
  }
  if (wilmaEnabled !== undefined) {
    url.searchParams.set("wilmaEnabled", wilmaEnabled.toString());
  }

  // Force fresh fetch for admin views
  if (wilmaEnabled === undefined) {
    url.searchParams.set("_t", Date.now().toString());
  }

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers,
      credentials: "include",
      next: { revalidate: 0 } // Add Next.js specific revalidation 
    });
    if (!response.ok) throw new Error(`Failed to load jobs: ${response.status}`);
    const data = (await response.json()) as Job[];
    return { jobs: data, fromFallback: false };
  } catch (error) {
    console.warn("Falling back to static job list", error);
    return { jobs: FALLBACK_JOBS, fromFallback: true };
  }
}

export async function getJob(id: string): Promise<Job> {
  const response = await fetch(buildUrl(`/api/jobs/${id}`), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load job: ${response.status}`);
  return response.json();
}

export async function getJobCandidates(jobId: string): Promise<Candidate[]> {
  const response = await fetch(buildUrl(`/api/jobs/${jobId}/candidates`), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load candidates: ${response.status}`);
  return response.json();
}

export async function getCandidates(jobId?: string, organisationId?: string): Promise<{ items: Candidate[] }> {
  const url = new URL(buildUrl("/api/candidates"));
  if (jobId) url.searchParams.set("jobId", jobId);

  if (organisationId) {
    url.searchParams.set("organisationId", organisationId);
  } else if (ORGANISATION_ID) {
    url.searchParams.set("organisationId", ORGANISATION_ID);
  }


  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load all candidates: ${response.status}`);
  return response.json();
}

export async function getCandidate(id: string): Promise<Candidate> {
  const response = await fetch(buildUrl(`/api/candidates/${id}`), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load candidate: ${response.status}`);
  return response.json();
}

export async function deleteCandidate(id: string): Promise<void> {
  const response = await fetch(buildUrl(`/api/candidates/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Delete candidate failed: ${response.status}`);
}

export async function updateCandidateStatus(id: string, status: string): Promise<Candidate> {
  const response = await fetch(buildUrl(`/api/candidates/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`Update status failed: ${response.status}`);
  return response.json();
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  const response = await fetch(buildUrl(`/api/jobs/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update job failed: ${response.status}`);
  return response.json();
}

export async function deleteJob(id: string): Promise<void> {
  const response = await fetch(buildUrl(`/api/jobs/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Delete job failed: ${response.status}`);
}

export async function getOrganisationBySlug(slug: string) {
  const url = new URL(buildUrl("/api/organisations/lookup"));
  url.searchParams.set("slug", slug);
  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) return null;
  return response.json();
}

export async function createJob(data: any) {
  const response = await fetch(buildUrl("/api/jobs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create job failed: ${response.status}`);
  return response.json();
}

export async function getOrganisations() {
  const response = await fetch(buildUrl("/api/organisations/public"), {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch organisations: ${response.statusText}`);
  }
  return response.json();
}

export async function askOrganisation(orgId: string, message: string): Promise<{ answer: string }> {
  const response = await fetch(buildUrl(`/api/organisations/${orgId}/chat`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Failed to get answer from Wilma");
  return response.json();
}

export async function submitApplication(
  data: FormData,
): Promise<{ applicationId: string; matchScore: number; recommendedQuestions: FollowUpQuestion[] }> {
  try {
    const response = await fetch(buildUrl("/api/application/submit"), {
      method: "POST",
      credentials: "include",
      body: data,
    });
    if (!response.ok) {
      let errorMessage = `Submit failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details[0]?.message || JSON.stringify(errorData.details)}`;
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }
    return (await response.json()) as {
      applicationId: string;
      matchScore: number;
      recommendedQuestions: FollowUpQuestion[];
    };
  } catch (error: any) {
    console.error("Application submission failed", error);
    throw new Error(error.message || "Failed to submit application");
  }
}

export async function getFollowUpQuestions(applicationId: string): Promise<FollowUpQuestion[]> {
  try {
    const response = await fetch(buildUrl(`/api/application/${applicationId}/questions`), {
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to load follow-up questions: ${response.status}`);
    return (await response.json()) as FollowUpQuestion[];
  } catch (error) {
    console.warn("Falling back to mock questions", error);
    return FALLBACK_QUESTIONS;
  }
}

export async function uploadVideoAnswer(
  applicationId: string,
  questionId: string,
  file: Blob,
): Promise<{ processing: boolean }> {
  const formData = new FormData();
  formData.append("questionId", questionId);
  formData.append("video", file);

  const response = await fetch(buildUrl(`/api/application/${applicationId}/upload-video`), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (response.status === 202 || response.status === 201) {
    try {
      const data = (await response.json()) as { processing?: boolean };
      return { processing: Boolean(data.processing) };
    } catch {
      return { processing: response.status === 202 };
    }
  }

  throw new Error(`Video upload failed: ${response.status}`);
}

export async function finalizeApplication(applicationId: string): Promise<{ status: "received" }> {
  try {
    const response = await fetch(buildUrl(`/api/application/${applicationId}/finalise`), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Finalise failed: ${response.status}`);
    return (await response.json()) as { status: "received" };
  } catch (error) {
    return { status: "received" };
  }
}

export async function getOrganisationProfile(organisationId: string): Promise<{ profile: OrganisationProfile; sources: any[] } | null> {
  const url = new URL(buildUrl("/api/knowledge/organisation-summary"));
  url.searchParams.set("organisationId", organisationId);
  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) return null;
  return response.json();
}

export async function getOrganisationKnowledge(organisationId: string): Promise<{ organisation: Organisation; faqs: any[]; documents: DocumentSummary[] } | null> {
  const url = new URL(buildUrl("/api/knowledge/faqs"));
  url.searchParams.set("organisationId", organisationId);
  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include"
  });
  if (!response.ok) return null;
  return response.json();
}

export async function ingestWebsite(rootUrl: string): Promise<{ pagesProcessed: number }> {
  const response = await fetch(buildUrl("/api/ingest/url"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rootUrl, depth: 2 }),
  });
  if (!response.ok) throw new Error("Failed to start website analysis");
  return response.json();
}

export async function sendCultureInterviewMessage(
  organisationId: string,
  history: { role: "user" | "assistant"; content: string }[],
  currentProfile?: OrganisationProfile | null
): Promise<{ message: string; analysis?: string; topic?: string; isComplete: boolean }> {
  const response = await fetch(buildUrl("/api/knowledge/culture-interview"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ organisationId, history, currentProfile }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

export async function extractJobs(rootUrl: string, careersUrl?: string): Promise<{ jobs: Job[] }> {
  const response = await fetch(buildUrl("/api/jobs/fetch"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rootUrl, careersUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to extract jobs: ${errorText}`);
  }

  return response.json();
}

// Update organisation details
export async function updateOrganisation(organisationId: string, data: Partial<Organisation>): Promise<Organisation> {
  const response = await fetch(buildUrl(`/api/organisations/${organisationId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update organisation");
  }

  return response.json();
}

export async function uploadJobFiles(rootUrl: string, files: File[]): Promise<{ uploaded: number; createdJobs: string[] }> {
  const formData = new FormData();
  formData.append("rootUrl", rootUrl);
  files.forEach(file => {
    formData.append("files", file);
  });

  const response = await fetch(buildUrl("/api/jobs/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${text}`);
  }

  return response.json();
}
