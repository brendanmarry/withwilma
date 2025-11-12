import Link from "next/link";

import { Button } from "@/components/ui/button";
import { JourneyProgress } from "@/components/JourneyProgress";

export default function ThanksPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 text-center">
      <JourneyProgress currentStep={5} className="w-full" />
      <div className="space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <span className="text-3xl font-semibold">✓</span>
        </div>
        <h1 className="text-4xl font-semibold text-slate-900">Thanks for sharing your story</h1>
        <p className="text-base text-slate-600">
          Wilma has submitted your responses to the recruiting team. They’ll review everything and get back to you with next steps shortly.
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          Want to explore additional roles while you wait? Feel free to keep browsing.
        </p>
        <Button asChild className="h-12 rounded-full px-8 text-base">
          <Link href="/">Back to roles</Link>
        </Button>
      </div>
    </div>
  );
}

