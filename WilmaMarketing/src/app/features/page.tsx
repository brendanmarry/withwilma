import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StepCard } from "@/components/ui/StepCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Brain, FileText, Globe, MessageSquare, Network, Sparkle } from "lucide-react";
import { CANDIDATE_APP_URL } from "@/lib/external-links";

const pillars = [
  {
    icon: MessageSquare,
    title: "AI interviews that coach themselves",
    description:
      "Conversational intelligence adapts every question in real-time. withWilma listens, probes deeper, and mirrors your best interviewers.",
    bullets: [
      "Dynamic question trees tied to each role",
      "Voice, video, or chat experiences with branded UI",
      "Follow-up probes personalized to each candidate",
    ],
  },
  {
    icon: Network,
    title: "Unified candidate graph",
    description:
      "Aggregate scores, interview insights, and recruiter notes into a living profile that travels across pipeline stages.",
    bullets: [
      "Real-time fit scores with qualitative reasoning",
      "Signal clustering to surface hidden strengths",
      "Bias guardrails and diversity impact alerts",
    ],
  },
  {
    icon: FileText,
    title: "Knowledge ingestion & memory",
    description:
      "Upload playbooks, documentation, and research. withWilma synthesizes it into on-brand, accurate responses for candidates.",
    bullets: [
      "Drag-and-drop ingestion for docs, decks, Help Centers",
      "Auto-updates when knowledge sources change",
      "Human-in-the-loop approvals for sensitive topics",
    ],
  },
];

const workflows = [
  {
    step: "Before the interview",
    title: "Briefing in one click",
    description:
      "withWilma generates interviewer prep docs with candidate history, scorecard focus areas, and key moments to probe—in seconds.",
  },
  {
    step: "During the interview",
    title: "Co-pilot whisper stream",
    description:
      "Recruiters nudge withWilma with real-time prompts, track candidate sentiment, and bookmark moments for deeper review.",
  },
  {
    step: "After the interview",
    title: "Decision intelligence",
    description:
      "Auto-generated recaps, bias audits, and closing strategies land in your ATS, Slack, and hiring manager inbox.",
  },
];

const globalFeatures = [
  {
    icon: Globe,
    title: "18 languages + localized tone",
    description:
      "Candidate experiences feel native with localized phrasing, compliance disclosures, and cultural nuance baked in.",
  },
  {
    icon: Sparkle,
    title: "Persona builder",
    description:
      "Craft withWilma’s interviewing style to match your employer brand—curious, direct, warm, technical—you choose.",
  },
  {
    icon: Brain,
    title: "Adaptive scoring",
    description:
      "Model weights adjust as your team calibrates feedback, ensuring the best predictors of success rise to the top.",
  },
];

export const metadata: Metadata = {
  title: "Feature Deep Dive",
  description:
    "Explore withWilma’s AI interviewing, candidate scoring, and knowledge ingestion capabilities across the full talent lifecycle.",
};

export default function FeaturesPage() {
  const candidateAppUrl = CANDIDATE_APP_URL;
  return (
    <>
      <Section padding="xl" background="gradient">
        <Container className="space-y-8">
          <FadeIn>
            <Badge>Product tour</Badge>
          </FadeIn>
          <FadeIn delay={0.05}>
            <SectionHeading
              title="Everything teams need to deliver AI-native recruiting"
              description="withWilma unifies conversational AI, adaptive scoring, and recruiter co-pilots so every candidate encounter feels bespoke and decisive."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-8 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-3 text-base text-slate-600">{pillar.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-600">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="default">
        <Container className="space-y-14">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="workflow spotlight"
              title="Recruiter co-pilot keeps humans at the center"
              description="withWilma augments recruiters, interviewers, and hiring managers with real-time intelligence and automation."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {workflows.map((workflow) => (
              <StepCard key={workflow.title} {...workflow} />
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="muted">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <SectionHeading
              eyebrow="global ready"
              title="Deploy across every market and brand experience"
              description="Orchestrate multi-market interviews, localized messaging, and knowledge updates from a single interface."
            />
            <p className="text-base text-slate-600">
              withWilma supports enterprise teams operating in dozens of languages and compliance regimes. Build custom personas for your graduate program, executive hiring, or technical orgs—all while maintaining governance across the platform.
            </p>
            <ButtonLink href="/contact" size="md">
              Schedule a feature workshop
            </ButtonLink>
          </FadeIn>
          <FadeIn delay={0.1} className="space-y-4">
            {globalFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="default">
        <Container className="space-y-12">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="for developers"
              title="Integrates with the tools your teams already love"
              description="withWilma connects to your ATS, HRIS, BI stack, and collaboration tools with secure APIs and event streams."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Greenhouse + Lever",
              "Workday + SuccessFactors",
              "Slack + Teams",
              "Snowflake + Looker",
              "Salesforce + HubSpot",
              "Custom webhooks",
              "Private APIs",
              "Data warehouse sync",
            ].map((integration) => (
              <div
                key={integration}
                className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm"
              >
                {integration}
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="brand">
        <Container className="flex flex-col items-center gap-6 text-center text-white">
          <FadeIn className="max-w-3xl">
            <h2 className="text-4xl font-semibold md:text-5xl">
              Experience the full withWilma platform
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Launch a sandbox with your real roles, knowledge base, and candidate flows. Our team will co-pilot every step.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={candidateAppUrl} variant="secondary" size="lg" external>
                Start your pilot
              </ButtonLink>

            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
