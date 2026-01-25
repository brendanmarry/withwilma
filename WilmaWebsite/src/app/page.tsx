import { ArrowRight, Brain, MessageCircle, ShieldCheck, Sparkles, Target, Users2 } from "lucide-react";
import { LogoCloud } from "@/components/LogoCloud";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StatCard } from "@/components/ui/StatCard";
import { StepCard } from "@/components/ui/StepCard";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { CANDIDATE_APP_URL } from "@/lib/external-links";

const heroStats = [
  { label: "Faster time-to-hire", value: "72%" },
  { label: "Candidate satisfaction", value: "4.9/5" },
  { label: "Hours saved per week", value: "40+" },
];

const coreFeatures = [
  {
    icon: Brain,
    title: "Conversational AI Interviews",
    description:
      "Adaptive voice and video interviews that learn from every conversation and mirror your top performers.",
  },
  {
    icon: Target,
    title: "Precision Candidate Scoring",
    description:
      "Multi-dimensional scoring across skills, experience, and culture fit with transparent rationale for recruiters.",
  },
  {
    icon: Users2,
    title: "Recruiter Intelligence Hub",
    description:
      "Crystal-clear dashboards that surface the right candidate at the right moment with AI-recommended next actions.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Trust",
    description:
      "SOC2-ready architecture, configurable guardrails, and compliance across GDPR, EEOC, and global privacy standards.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Upload your knowledge & roles",
    description:
      "Sync job descriptions, interview scorecards, and tribal knowledge in minutes—no engineering lift required.",
  },
  {
    step: "02",
    title: "Launch AI-led experiences",
    description:
      "Candidates meet withWilma across voice, video, and chat and improve their application by recording short answers to persoanlised questions. Then withWilma scores the candidate based on the job description and the interview answers, presenting this all to use to make informed selection decisions.",
  },
  {
    step: "03",
    title: "Hire with total clarity",
    description:
      "Get ranked shortlists, bias alerts, and curated follow-ups that convert the best talent before competitors do.",
  },
];

const testimonials = [
  {
    quote:
      "We tripled our candidate throughput without adding headcount. Candidates are amazed that withWilma remembers context across interviews.",
    author: "Lena Ortiz",
    role: "Head of Talent",
    company: "Aurora Capital",
  },
  {
    quote:
      "Recruiters spend less time scheduling and more time closing. withWilma's interview insights give us a competitive advantage.",
    author: "Marcus Chen",
    role: "Director of Recruiting",
    company: "Northwind Labs",
  },
  {
    quote:
      "Our DEI council loves the bias safeguards. Every hiring manager gets rich insights, not just another dashboard.",
    author: "Priya Desai",
    role: "Chief People Officer",
    company: "Summit Talent",
  },
];

const conciergeFeatures = [
  {
    icon: MessageCircle,
    title: "Live Recruiter Co-Pilot",
    description: "Shadow interviews, whisper prompts, and suggested follow-ups while withWilma handles the conversation.",
  },
  {
    icon: Sparkles,
    title: "Always-On Candidate Concierge",
    description: "Onboard, answer FAQs, and pre-close candidates with beautifully branded experiences tailored to your voice.",
  },
];

export default function HomePage() {
  const candidateAppUrl = CANDIDATE_APP_URL;
  return (
    <>
      {/* Hero */}
      <Section padding="xl" background="gradient" id="overview">
        <Container className="relative flex flex-col gap-16 lg:flex-row lg:items-center">
          <div className="relative flex-1">

            <FadeIn delay={0.1} className="mt-6">
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                Hire brilliantly with <span className="text-brand-500">AI-powered</span> applications
              </h1>
            </FadeIn>

            <FadeIn delay={0.2} className="mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
              withWilma surfaces the best candidate applications through every submission by conducting personalised conversations, that surface improved data to score candidates with radical clarity, and fast follow-ups that close top talent.
            </FadeIn>

            <FadeIn delay={0.3} className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink
                href={candidateAppUrl}
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                external

                className="group">
                Launch a demo interview
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Talk to our team
              </ButtonLink>
            </FadeIn>

            <FadeIn delay={0.35} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} className={index === 0 ? "bg-brand-500 text-white" : ""} />
              ))}
            </FadeIn>
          </div>

          <FadeIn delay={0.25} className="relative flex-1">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-brand-500/15 backdrop-blur">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-500">Live Interview</p>
                    <p className="text-lg font-semibold text-slate-900">AI Recruiter: withWilma</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                    Recording
                  </span>
                </div>
                <div className="space-y-4 text-sm text-slate-600">
                  <p><strong>withWilma:</strong> Walk me through your product launch that required cross-functional alignment.</p>
                  <p><strong>Candidate:</strong> I led go-to-market for Atlas Robotics...</p>
                  <p className="rounded-2xl bg-brand-500/10 p-4 text-brand-600">
                    Insight: Coachability signals high. Suggest follow-up on stakeholder management.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                  <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
                    <p className="font-semibold text-slate-900">Fit Score</p>
                    <p className="text-3xl font-semibold text-brand-500">92</p>
                    <p>Top percentile for growth-stage SaaS roles</p>
                  </div>
                  <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
                    <p className="font-semibold text-slate-900">Next Best Action</p>
                    <p>Introduce hiring manager with tailored briefing deck</p>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-brand-500/20" />
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Social proof */}
      <Section padding="md" background="default">
        <Container className="space-y-8">
          <SectionHeading
            align="center"
            eyebrow="trusted by talent-first teams"
            title="AI recruitment co-pilots for modern hiring orgs"
            description="From scale-ups to global enterprises, teams trust withWilma to elevate every candidate conversation."
          />
          <LogoCloud />
        </Container>
      </Section>

      {/* Core features */}
      <Section padding="xl" background="default" id="features">
        <Container className="space-y-16">
          <SectionHeading
            align="center"
            eyebrow="end-to-end intelligence"
            title="Everything you need to deliver unforgettable candidate experiences"
            description="withWilma fuses conversational AI, recruiter co-pilots, and adaptive scoring into one cohesive platform."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {coreFeatures.map((feature, index) => (
              <FadeIn key={feature.title} delay={index * 0.05}>
                <FeatureCard {...feature} highlight={index === 0} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section padding="xl" background="muted" id="how-it-works">
        <Container className="space-y-16">
          <SectionHeading
            align="center"
            eyebrow="Go live in days"
            title="Launch AI-native recruiting without process chaos"
            description="withWilma meets you where you are. No overhauls. No complicated change management."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <FadeIn key={step.step} delay={index * 0.08}>
                <StepCard {...step} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Concierge features */}
      <Section padding="lg" background="default">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <SectionHeading
              eyebrow="always-on concierge"
              title="Recruiters stay strategic while withWilma handles the heavy lifting"
              description="Combine human intuition with AI orchestration. withWilma gives recruiters superpowers across every candidate touchpoint."
            />
            <div className="space-y-6">
              {conciergeFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm"
                >
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-100 bg-gradient-to-br from-brand-500/20 via-brand-500/5 to-white p-8 shadow-2xl shadow-brand-500/20">
              <div className="space-y-6 text-white">
                <p className="text-sm uppercase tracking-widest text-white/70">Recruiter co-pilot</p>
                <p className="text-2xl font-semibold">Suggested follow-up briefing</p>
                <ul className="space-y-4 text-sm text-white/90">
                  <li>• Candidate motivations mapped to offer levers</li>
                  <li>• Bias guardrails flagged for next interview loop</li>
                  <li>• Follow-up email drafted with voice-of-brand tone</li>
                  <li>• Hiring manager briefing deck auto-generated</li>
                </ul>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/20" />
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section padding="lg" background="default" id="customers">
        <Container className="space-y-12">
          <SectionHeading
            align="center"
            eyebrow="people teams love wilma"
            title="Designed with the world's most ambitious talent teams"
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={testimonial.author} delay={index * 0.08}>
                <TestimonialCard {...testimonial} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section padding="xl" background="brand">
        <Container className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/10 via-white/5 to-brand-500/20 p-12 text-white shadow-2xl shadow-brand-500/30">
          <FadeIn className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">experience wilma</p>
            <h2 className="mt-6 text-4xl font-semibold md:text-5xl">
              Turn every candidate conversation into a hiring superpower
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Launch in days, scale globally, and close the talent your competitors are chasing. withWilma adapts to your workflows—no heavy lift required.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={candidateAppUrl} size="lg" variant="secondary" external>
                Start your 14-day pilot
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="ghost">
                Get a custom roadmap
              </ButtonLink>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
