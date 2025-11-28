import { FollowUpFlow } from "@/components/FollowUpFlow";
import { JourneyProgress } from "@/components/JourneyProgress";
import { BackButton } from "@/components/BackButton";

interface QuestionsPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { applicationId } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-wrap items-center gap-4 px-6 pt-6 lg:px-12">
        <BackButton label="Back" />
        <JourneyProgress currentStep={4} className="min-w-[260px] flex-1" />
      </div>
      <main className="flex flex-1 justify-center overflow-y-auto px-6 pb-16 pt-6 lg:px-12">
        <div className="flex w-full max-w-5xl flex-col gap-8">
          <FollowUpFlow applicationId={applicationId} />
        </div>
      </main>
    </div>
  );
}

