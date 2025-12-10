import Link from "next/link";
import { ArrowRight, MessageSquare, Mic, Sparkles } from "lucide-react";

import Section from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Explore roles & ask questions",
    description:
      "Browse the openings that excite you and chat with me about the team, culture, or anything else you’d like to know.",
    icon: Sparkles,
  },
  {
    title: "Decide to apply",
    description:
      "Ready to go for it? I’ll guide you through a few tailored questions so we can capture your story with confidence.",
    icon: MessageSquare,
  },
  {
    title: "Submit when you’re ready",
    description:
      "Review everything together and send it off in one click. I’ll package your answers and share them directly with the hiring team.",
    icon: Mic,
  },
];

export default function Home() {
  return (
    <>
      <Section background="gradient" padding="xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="px-4 py-1 text-sm text-purple-700">
              Hi, I’m Wilma — your AI Application Assistant
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
                Let’s get you ready to apply for a role you’ll love
              </h1>
              <p className="text-lg text-gray-600 sm:text-xl">
                I’m the application assistant that pulls out the story behind the
                CV—helping candidates submit stronger applications while giving
                your screeners authentic video to understand the person behind
                the polish.
              </p>
            </div>
          </div>

          <div id="journey" className="flex flex-col gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
                How it works: a simple 3-step process
              </h2>
              <p className="mt-3 text-base text-gray-600 sm:text-lg">
                We keep the process transparent so you always know what comes next.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-purple-100 bg-white p-8 text-left shadow-sm">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button asChild size="lg" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-3 text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)]">
                <Link href="/select-company">
                  Explore open roles
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
