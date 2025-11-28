import { notFound } from "next/navigation";

import { getJobs } from "@/lib/api";
import { InterviewExperience } from "@/components/InterviewExperience";

interface InterviewPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { jobId } = await params;
  const { jobs } = await getJobs();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return <InterviewExperience job={job} />;
}

