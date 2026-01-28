
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { getJobs, getBranding } from "@/lib/api";
import { InterviewExperience } from "@/components/InterviewExperience";
import { BrandedHeader } from "@/components/BrandedHeader";

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

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const branding = await getBranding(job, host);

  return (
    <div
      className="min-h-screen bg-[#FAF8F2] selection:bg-[var(--brand-primary)] selection:text-white"
      style={{
        // @ts-ignore
        "--brand-primary": branding.primaryColor,
        "--brand-secondary": branding.secondaryColor || branding.primaryColor, // fallback
        fontFamily: `'Outfit', sans-serif`,
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
            
            body {
                background-color: #FAF8F2;
            }
        `}} />
      <BrandedHeader branding={branding} backLink={`/apply/${jobId}`} backLabel="Back to Job" />
      <InterviewExperience job={job} />
    </div>
  );
}
