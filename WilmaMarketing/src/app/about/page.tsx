import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { StatCard } from "@/components/ui/StatCard";

const leaders = [
  {
    name: "Brendan Marry",
    role: "Founder & CEO",
    bio: "Former Product Leader at Gogole who is passionate about reimagining candidate experiences with AI.",
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
      {/* Hero: Our Story & Mission */}
      <Section padding="xl" background="gradient">
        <Container className="space-y-16">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <SectionHeading
                align="center"
                eyebrow="Our story & mission"
                title="Building the nervous system for modern recruiting"
                description="withWilma was founded with the belief that every candidate deserves a remarkable experience. The traditional hiring playbook is broken, recruiters are overwhelmed by AI noise, and candidates feel like just another data point. We're here to change that."
              />
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Leadership */}
      <Section padding="lg" background="muted">
        <Container className="space-y-12">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="Leadership"
              title="Champions of talent innovation"
              description="Our founding team has shipped recruiting systems and AI products loved by millions."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-2
          ">
            {leaders.map((leader) => (
              <div key={leader.name} className="flex flex-col rounded-3xl border border-white/60 bg-white p-8 shadow-lg shadow-brand-500/5 transition-all hover:-translate-y-1">
                <h3 className="text-2xl font-semibold text-slate-900">{leader.name}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-brand-500 font-medium">{leader.role}</p>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
