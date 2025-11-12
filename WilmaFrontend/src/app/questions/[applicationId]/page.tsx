import { FollowUpFlow } from "@/components/FollowUpFlow";
import { JourneyProgress } from "@/components/JourneyProgress";
import { BackButton } from "@/components/BackButton";

interface QuestionsPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { applicationId } = await params;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 pb-24 pt-16">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <BackButton label="Back" />
        <JourneyProgress currentStep={4} className="max-w-3xl" />
      </div>
      <FollowUpFlow applicationId={applicationId} />
    </div>
  );
}

