
import { FollowUpFlow } from "@/components/FollowUpFlow";
import { JourneyProgress } from "@/components/JourneyProgress";
import { BackButton } from "@/components/BackButton";
import { getBranding } from "@/lib/api";
import { headers } from "next/headers";
import { BrandedHeader } from "@/components/BrandedHeader";

interface QuestionsPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { applicationId } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const branding = await getBranding(null, host);

  return (
    <div
      className="flex min-h-screen flex-col bg-[#FAF8F2] selection:bg-[var(--brand-primary)] selection:text-white"
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
      <BrandedHeader branding={branding} backLink="#" backLabel="Back" />
      <main className="flex flex-1 justify-center overflow-y-auto px-6 pb-16 pt-12 lg:px-12">
        <div className="flex w-full max-w-5xl flex-col gap-8">
          <FollowUpFlow applicationId={applicationId} />
        </div>
      </main>
    </div>
  );
}
