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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-wrap items-center gap-4 px-6 pt-6 lg:px-12">
        <BackButton label="Back" />
        <JourneyProgress currentStep={3} className="min-w-[260px] flex-1" />
      </div>

      <main className="flex flex-1 justify-center overflow-y-auto px-6 pb-16 pt-6 lg:px-12">
        <div className="flex w-full max-w-4xl flex-col gap-6">
          {fromFallback ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-900">
              Job data is currently coming from the sample dataset because the backend jobs table is unreachable or empty. Start the backend and populate jobs to continue with live data.
            </div>
          ) : null}

          <ApplicationForm job={job} />
        </div>
      </main>
    </div>
  );
}

