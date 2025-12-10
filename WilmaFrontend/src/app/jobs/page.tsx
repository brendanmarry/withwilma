import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getJobs } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import Section from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";
import { JourneyProgress } from "@/components/JourneyProgress";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function JobsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const organisationId = typeof resolvedSearchParams.organisationId === "string" ? resolvedSearchParams.organisationId : undefined;
  const { jobs, fromFallback } = await getJobs(organisationId);
  const organisationName =
    process.env.NEXT_PUBLIC_ORGANISATION_NAME ??
    process.env.ORGANISATION_NAME ??
    "our company";

  return (
    <>
      <Section background="gradient" padding="xl">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
          <Badge variant="outline" className="mx-auto px-4 py-1 text-sm text-[var(--brand-primary)]">
            Open roles
          </Badge>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
            Pick a role, view its details, and let’s talk it through together
          </h1>
          <p className="text-lg text-gray-600 sm:text-xl">
            Whether you’re curious about the team, tech stack, or interview flow, I'm ready to help. Pick a role below to start the conversation.
          </p>
        </div>
      </Section>

      <Section padding="lg" background="default">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <JourneyProgress currentStep={1} />

          {fromFallback ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 shadow-sm">
              Jobs are currently shown from our sample dataset because the live backend could not be reached. Start the backend service and populate jobs to see real openings here.
            </div>
          ) : null}

          {jobs.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-subtle)] px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              Back to candidate homepage
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

