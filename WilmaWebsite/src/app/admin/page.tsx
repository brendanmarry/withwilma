import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StepCard } from "@/components/ui/StepCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { BrainCircuit, Gauge, LineChart, Shield, Users } from "lucide-react";

const adminHighlights = [
  {
    icon: Gauge,
    title: "Control tower visibility",
    description:
      "Observe live interviews, candidate sentiment, and recruiter co-pilot suggestions from a single command center.",
  },
  {
    icon: BrainCircuit,
    title: "Intelligence that explains itself",
    description:
      "See exactly why candidates are recommended with qualitative and quantitative signals linked to interviewer notes.",
  },
  {
    icon: Users,
    title: "Workflow orchestration",
    description:
      "Automate scheduling, follow-ups, and interviewer prep while maintaining human approvals in the loop.",
  },
  {
    icon: Shield,
    title: "Governance-first",
    description:
      "Role-based access, audit trails, and bias guardrails ensure compliance across legal and DEI requirements.",
  },
];

const dashboards = [
  {
    step: "Recruiter home",
    title: "AI queue prioritization",
    description: "Wilma triages candidates by impact, nudging recruiters toward actions that move offers forward faster.",
  },
  {
    step: "Interview ops",
    title: "Live whisper coaching",
    description: "Observe conversations, send prompts to Wilma, and track key themes without disrupting candidate flow.",
  },
  {
    step: "Talent intelligence",
    title: "Conversion analytics",
    description: "Forecast hiring velocity, track DEI goals, and monitor pipeline health across markets and teams.",
  },
];

export const metadata: Metadata = {
  title: "Admin Experience",
  description:
    "Explore the Wilma admin workspace—real-time control tower, recruiter co-pilot, and governance tools for talent leaders.",
};

export default function AdminPage() {
  return (
    <>
      <Section padding="xl" background="gradient">
        <Container className="space-y-10">
          <FadeIn>
            <Badge>Platform overview</Badge>
          </FadeIn>
          <FadeIn delay={0.05}>
            <SectionHeading
              title="The application review and control centre your team deserves"
              description="Wilma’s admin workspace unifies live candidate experiences, recruiter co-pilot, and intelligence dashboards in one beautifully-designed interface."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="overflow-hidden rounded-[2.5rem] border border-brand-100 bg-white/90 p-10 shadow-2xl shadow-brand-500/20">
            <div className="grid gap-8 text-sm text-slate-600 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900">Live control room</h3>
                <p>Monitor interviews in progress, see candidate sentiment in real-time, and provide whisper coaching to Wilma without breaking the conversation flow.</p>
                <ul className="space-y-2">
                  <li>• Adaptive prompts based on company knowledge</li>
                  <li>• Bias guardrail alerts with suggested follow-ups</li>
                  <li>• Conversation timeline with auto-generated notes</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900">Decision intelligence</h3>
                <p>View candidate rankings, interview quality metrics, and recruiter performance insights in one glance.</p>
                <ul className="space-y-2">
                  <li>• Visualize funnel health by team, role, or market</li>
                  <li>• Track interviewer calibration and coaching outcomes</li>
                  <li>• Export-ready reports for leadership and DEI councils</li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="default">
        <Container className="space-y-14">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="workflows"
              title="Design workflows that keep humans in the loop"
              description="Wilma amplifies the humans on your team. Recruiters stay strategic while AI handles the heavy lift."
            />
          </FadeIn>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {adminHighlights.map((highlight, index) => (
              <FadeIn key={highlight.title} delay={index * 0.07}>
                <FeatureCard {...highlight} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      <Section padding="lg" background="muted">
        <Container className="space-y-10">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="dashboards"
              title="Everything talent leaders need, nothing they don’t"
              description="Navigate between AI queues, live interviews, and pipeline analytics without opening a single spreadsheet."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {dashboards.map((dash, index) => (
              <StepCard key={dash.title} step={dash.step} title={dash.title} description={dash.description} className="rounded-3xl" />
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="default">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <SectionHeading
              eyebrow="security & controls"
              title="Enterprise-grade guardrails come standard"
              description="Designed with legal, security, and DEI leaders to ensure your AI recruiting motion scales with confidence."
            />
            <ul className="space-y-4 text-sm text-slate-600">
              <li>• Fine-grained permissions for recruiters, interviewers, executives, and external agencies</li>
              <li>• Audit trails with immutable logs, downloadable transcripts, and bias detection reports</li>
              <li>• Regional data residency, encryption in transit and at rest, SSO + SCIM provisioning</li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Badge variant="neutral">SOC2 Type II</Badge>
              <Badge variant="neutral">GDPR / CCPA ready</Badge>
              <Badge variant="neutral">EEOC compliant</Badge>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="rounded-[2.5rem] border border-brand-100 bg-brand-500/10 p-10 shadow-2xl shadow-brand-500/30">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-500">pilot ready</p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-900">Launch in days, not quarters</h3>
            <p className="mt-4 text-base text-slate-600">
              Our implementation team co-designs workflows, migrates knowledge bases, and trains your recruiters with live “Wilma Studio” sessions.
            </p>
            <ButtonLink href="/contact" size="md" className="mt-8">
              Plan your admin rollout
            </ButtonLink>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
