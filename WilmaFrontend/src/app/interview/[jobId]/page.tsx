import { notFound } from "next/navigation";

import { InterviewExperience } from "@/components/InterviewExperience";
import { getJobs } from "@/lib/api";

interface InterviewPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { jobId } = await params;
  const { jobs, fromFallback } = await getJobs();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return <InterviewExperience job={job} fromFallback={fromFallback} />;
}

