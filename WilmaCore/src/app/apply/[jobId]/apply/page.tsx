
import { ApplicationForm } from "@/components/ApplicationForm";
import { getJob, getBranding } from "@/lib/api";
import { headers } from "next/headers";
import { BrandedHeader } from "@/components/BrandedHeader";

interface ApplyPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return <div>Job not found</div>;
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
        fontFamily: branding.fontFamily || `'Outfit', sans-serif`,
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap');
          
          body {
              background-color: #FAF8F2;
              font-family: ${branding.fontFamily || `'Outfit', sans-serif`};
          }
      `}} />
      <BrandedHeader branding={branding} backLink={`/apply/${jobId}`} backLabel="Back to Job" />
      <ApplicationForm job={job} />
    </div>
  );
}
