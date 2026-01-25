import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatCard } from "@/components/ui/StatCard";

const values = [
  {
    title: "Design for belonging",
    description:
      "Every candidate, recruiter, and hiring manager should feel seen. We craft experiences that remove friction and bias at every step.",
  },
  {
    title: "Ship with curiosity",
    description:
      "We ask “what if” with our customers weekly, releasing faster than legacy vendors because progress beats perfection.",
  },
  {
    title: "Build trust in the loop",
    description:
      "Transparency is default. From bias guardrails to model explainability, trust is the core feature we refuse to compromise on.",
  },
];

const timeline = [
  {
    year: "2021",
    milestone: "withWilma founded",
    details:
      "Former recruiters, data scientists, and product designers build the first AI recruiter prototype in Brooklyn.",
  },
  {
    year: "2022",
    milestone: "First enterprise deployment",
    details:
      "Scaled to 4,000+ interviews per week across healthcare and fintech customers with compliance-ready guardrails.",
  },
  {
    year: "2023",
    milestone: "Voice intelligence launch",
    details:
      "Released withWilma Voice—real-time voice interviews with recruiter co-pilot, enabling whisper coaching and auto notes.",
  },
  {
    year: "2024",
    milestone: "Global expansion",
    details:
      "Offices in NYC and London, supporting 18 languages with localized candidate experiences and global privacy coverage.",
  },
  {
    year: "2025",
    milestone: "withWilma 3.0",
    details:
      "Unified candidate graph, multi-source scoring, and knowledge ingestion across support wikis, pitch decks, and more.",
  },
];

const stats = [
  { label: "Customers", value: "150+", description: "Hiring orgs across tech, healthcare, climate, and fintech." },
  { label: "Candidate interviews", value: "2.8M", description: "AI-led conversations conducted by withWilma to date." },
  { label: "Diversity uplift", value: "32%", description: "Average increase in diverse candidate progression with bias guardrails enabled." },
];

const leaders = [
  {
    name: "Amelia Hart",
    role: "Co-founder & CEO",
    bio: "Former Head of Recruiting at Atlas Robotics. Scaling teams from 50 to 2,000 inspired her to reimagine candidate experiences with AI.",
  },
  {
    name: "Noah Singh",
    role: "Co-founder & CTO",
    bio: "Built conversational AI at ScaleSense. Obsessed with explainable AI that talent leaders actually trust.",
  },
  {
    name: "Zoë Martinez",
    role: "Chief Design Officer",
    bio: "Led product design at Rally. Champions inclusive hiring experiences and storytelling that resonates with candidates.",
  },
];

export const metadata: Metadata = {
  title: "About withWilma",
  description:
    "Meet the team reimagining candidate experiences with AI-native recruiting technology.",
};

export default function AboutPage() {
  return (
    <>
      <Section padding="xl" background="gradient">
        <Container className="space-y-12">
          <FadeIn>
            <SectionHeading
              eyebrow="Our story"
              title="We’re building the nervous system for modern recruiting"
              description="withWilma was founded by people leaders and AI researchers who believe every candidate deserves a remarkable experience—without creating more work for recruiting teams."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="default">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <SectionHeading
              eyebrow="Why we exist"
              title="The hiring playbook needed a reboot"
              description="Recruiters are expected to be strategic partners, storytellers, data scientists, and psychologists. withWilma gives teams superpowers to do all of it—while candidates feel heard."
            />
            <p className="text-base text-slate-600">
              We collaborate with companies pushing the boundaries of science, climate, fintech, and healthcare. They need to win talent fast without sacrificing quality or belonging. withWilma fuses real human empathy with AI orchestration, so every candidate interaction feels bespoke, responsive, and honest.
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="space-y-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-base text-slate-600">{value.description}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="muted">
        <Container className="space-y-10">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="Leadership"
              title="Champions of talent innovation"
              description="Our founding team has shipped recruiting systems and AI products loved by millions."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {leaders.map((leader) => (
              <div key={leader.name} className="rounded-3xl border border-white/60 bg-white p-8 shadow-lg shadow-brand-500/10">
                <h3 className="text-2xl font-semibold text-slate-900">{leader.name}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-brand-500">{leader.role}</p>
                <p className="mt-4 text-base text-slate-600">{leader.bio}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="default">
        <Container className="space-y-10">
          <FadeIn>
            <SectionHeading
              eyebrow="Milestones"
              title="From prototype to the AI recruiter of record"
              description="We’re shipping features faster than any legacy vendor—hand-in-hand with talent teams who expect more."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="relative grid gap-8 border-l-2 border-brand-100 pl-6">
            {timeline.map((event) => (
              <div key={event.year} className="relative pl-6">
                <span className="absolute -left-9 flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 bg-white text-sm font-semibold text-brand-500 shadow-sm">
                  {event.year}
                </span>
                <h3 className="text-xl font-semibold text-slate-900">{event.milestone}</h3>
                <p className="mt-2 text-base text-slate-600">{event.details}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
