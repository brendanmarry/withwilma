import { FollowUpQuestion, Job, JobCreateInput } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
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
    : "http://wilma-backend:3001");

function buildUrl(path: string) {
  const baseUrl = typeof window === "undefined" ? INTERNAL_API_URL : API_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}


export async function getJobs(organisationId?: string, tenantSlug?: string): Promise<{ jobs: Job[]; fromFallback: boolean }> {
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
  url.searchParams.set("wilmaEnabled", "true");

  try {
    const response = await fetch(url.toString(), { cache: "no-store", headers });
    if (!response.ok) throw new Error(`Failed to load jobs: ${response.status}`);
    const data = (await response.json()) as Job[];
    return { jobs: data, fromFallback: false };
  } catch (error) {
    console.warn("Falling back to static job list", error);
    return { jobs: FALLBACK_JOBS, fromFallback: true };
  }
}

export async function getOrganisationBySlug(slug: string) {
  const url = new URL(buildUrl("/api/organisations/lookup"));
  url.searchParams.set("slug", slug);
  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export async function createJob(data: any) {
  const response = await fetch(buildUrl("/api/jobs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create job failed: ${response.status}`);
  return response.json();
}

export async function getOrganisations() {
  const response = await fetch(buildUrl("/api/organisations/public"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch organisations: ${response.statusText}`);
  }
  return response.json();
}

export async function submitApplication(
  data: FormData,
): Promise<{ applicationId: string; matchScore: number; recommendedQuestions: FollowUpQuestion[] }> {
  try {
    const response = await fetch(buildUrl("/api/application/submit"), {
      method: "POST",
      body: data,
    });
    if (!response.ok) throw new Error(`Submit failed: ${response.status}`);
    return (await response.json()) as {
      applicationId: string;
      matchScore: number;
      recommendedQuestions: FollowUpQuestion[];
    };
  } catch (error) {
    console.error("Application submission failed", error);
    throw error;
  }
}

export async function getFollowUpQuestions(applicationId: string): Promise<FollowUpQuestion[]> {
  try {
    const response = await fetch(buildUrl(`/api/application/${applicationId}/questions`), {
      cache: "no-store",
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
    });

    if (!response.ok) throw new Error(`Finalise failed: ${response.status}`);
    return (await response.json()) as { status: "received" };
  } catch (error) {
    console.warn("Finalise fallback", error);
    return { status: "received" };
  }
}
