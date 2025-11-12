import { getJobs } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { JourneyProgress } from "@/components/JourneyProgress";

export default async function Home() {
  const { jobs, fromFallback } = await getJobs();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-24">
      <JourneyProgress currentStep={1} />

      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-500">Discover Wilma</p>
        <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">
          Meet the AI recruitment assistant answering every question your candidates have.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Browse open roles, then join a live conversation with Wilma to explore team culture, product history, and what makes this opportunity unique.
        </p>
      </header>

      {fromFallback ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 shadow-sm">
          Jobs are currently displayed from the sample in-memory dataset because the Wilma backend jobs table is unreachable or empty.
          Start the backend service and populate jobs to see live roles here.
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
