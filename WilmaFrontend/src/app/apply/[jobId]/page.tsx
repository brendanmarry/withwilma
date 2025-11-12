import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/ApplicationForm";
import { getJobs } from "@/lib/api";
import { JourneyProgress } from "@/components/JourneyProgress";
import { BackButton } from "@/components/BackButton";

interface ApplyPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const { jobs, fromFallback } = await getJobs();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-8 px-6 pb-24 pt-16">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <BackButton label="Back" />
        <JourneyProgress currentStep={3} className="max-w-3xl" />
      </div>

      {fromFallback ? (
        <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-900">
          Job data is currently coming from the sample dataset because the backend jobs table is unreachable or empty. Start the backend and populate jobs to continue with live data.
        </div>
      ) : null}

      <div className="w-full">
        <ApplicationForm job={job} />
      </div>
    </div>
  );
}

