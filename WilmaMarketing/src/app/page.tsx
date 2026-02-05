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
    title: "Personalized Discovery Dialogues",
    description:
      "Move beyond generic forms and AI-generated cover letters with adaptive conversations that reveal the human behind the application.",
  },
  {
    icon: Target,
    title: "Filter the Slop",
    description:
      "AI-generated CVs are noisy. withWilma scores candidates based on real-time dialogue and genuine intent, not keyword-stuffed templates.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Define your Team DNA",
    description:
      "Instead of just keywords, we capture what makes your team tick. What kind of human actually succeeds in your specific culture?",
  },
  {
    step: "02",
    title: "Uncover Genuine Skills",
    description:
      "withWilma asks tailored, personal questions that evolve based on candidate responses—making it impossible to hide behind AI-generated fluff.",
  },
  {
    step: "03",
    title: "Hire the Human",
    description:
      "Get a shortlist of candidates you actually want to meet. No more filtering through 500 identical 'ideal' CVs that were written by a bot.",
  },
];

const testimonials = [
  {
    quote:
      "We were drowning in perfect-looking applications that were clearly AI-generated. withWilma finally helped us find the real people again.",
    author: "Lena Ortiz",
    role: "Head of Talent",
    company: "Aurora Capital",
  },
  {
    quote:
      "The degree of personal insight we get from the discovery dialogues is staggering. It's like having the first interview before the first interview.",
    author: "Marcus Chen",
    role: "Director of Recruiting",
    company: "Northwind Labs",
  },
  {
    quote:
      "Finally, a tool that values human nuance over keyword matching. Our hiring managers are actually excited to look at candidates again.",
    author: "Priya Desai",
    role: "Chief People Officer",
    company: "Summit Talent",
  },
];

const conciergeFeatures = [
  {
    icon: MessageCircle,
    title: "Real-Time Skill Validation",
    description: "Verify claims and probe for depth as candidates speak, cutting through the high-level generalities of modern applications.",
  },
  {
    icon: Sparkles,
    title: "Human Fit Insights",
    description: "Analyze tone, enthusiasm, and problem-solving styles to ensure they're a person who adds to your culture, not just a skill-set match.",
  },
];

export default function HomePage() {
  const candidateAppUrl = CANDIDATE_APP_URL;
  return (
    <>
      {/* Hero */}
      <Section padding="xl" background="gradient" id="overview">
        <Container className="relative">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <FadeIn delay={0.1} className="mt-6">
                <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Cut through <span className="text-brand-500">AI Candidate Slop</span>. See the person behind the CV.
                </h1>
              </FadeIn>

              <FadeIn delay={0.2} className="mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
                Traditional applications are buried in AI-generated fluff. withWilma uses tailored conversations to surface the genuine human talent you actually want to hire starting from the very first interaction.
              </FadeIn>

              <FadeIn delay={0.3} className="mt-10 flex flex-wrap items-center gap-4">
                <ButtonLink
                  href={candidateAppUrl}
                  size="lg"
                  icon={<ArrowRight className="h-5 w-5" />}
                  external
                  className="group">
                  Experience a Human Interview
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Talk to our team
                </ButtonLink>
              </FadeIn>
            </div>

            <FadeIn delay={0.25} className="relative flex-1">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-brand-500/15 backdrop-blur">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-500">Personal Discovery</p>
                      <p className="text-lg font-semibold text-slate-900">Validating the real candidate...</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                      Live Dialogue
                    </span>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600">
                    <p><strong>withWilma:</strong> Your CV mentions 'cross-functional leadership'. Tell me about a specific time you had to disagree with a technical lead and how you handled it.</p>
                    <p><strong>Candidate:</strong> (Avoiding the scripted fluff...) "Actually, it was specifically about the Atlas Robotics launch..."</p>
                    <p className="rounded-2xl bg-brand-500/10 p-4 text-brand-600">
                      Insight: Genuine technical depth detected. Deviates from AI-standard response patterns.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
                      <p className="font-semibold text-slate-900">Human Fit</p>
                      <p className="text-3xl font-semibold text-brand-500">A+</p>
                      <p>High nuance and specific situational examples</p>
                    </div>
                    <div className="rounded-2xl border border-brand-100 bg-white/70 p-4">
                      <p className="font-semibold text-slate-900">Recommendation</p>
                      <p>Fast-track to technical interview. Bypasses keyword filter.</p>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-brand-500/20" />
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.35} className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {heroStats.map((stat, index) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} className={index === 0 ? "bg-brand-500 text-white" : ""} />
            ))}
          </FadeIn>
        </Container>
      </Section>

      {/* Social proof */}
      <Section padding="md" background="default">
        <Container className="space-y-8">
          <SectionHeading
            align="center"
            eyebrow="trusted by talent-first teams"
            title="Finding the signals in a sea of AI noise"
            description="From scale-ups to global enterprises, teams use withWilma to rediscover the joy of meeting real people."
          />
          <LogoCloud />
        </Container>
      </Section>

      {/* Core features */}
      <Section padding="xl" background="default" id="features">
        <Container className="space-y-16">
          <SectionHeading
            align="center"
            eyebrow="Real human response centric filtering"
            title="Everything you need to find the real person behind the resume"
            description="withWilma combines video conversations with intelligent questions to make sure you're hiring for personality, not just optics."
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
            eyebrow="Simple, Human, Effective"
            title="Uncover the true candidate in minutes"
            description="withWilma integrates into your existing workflow to replace endless CV scanning with meaningful discovery."
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
              eyebrow="Strategic validation"
              title="Stop playing detective with AI cover letters"
              description="withWilma handles the initial probing so you can focus on the strategic decisions that build great teams."
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
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-brand-500/20">
              <div className="space-y-6 text-white">
                <p className="text-sm uppercase tracking-widest text-white/70">Human Insight Report</p>
                <p className="text-2xl font-semibold">Genuine Depth Briefing</p>
                <ul className="space-y-4 text-sm text-white/90">
                  <li>• Specific, unscripted anecdotes flagged</li>
                  <li>• Authentic problem-solving approach mapped</li>
                  <li>• "AI-Slop" indicators: 0 detected</li>
                  <li>• Ready for human-to-human interview</li>
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
            eyebrow="teams that value humans"
            title="Built for the recruiters who care about the 'who', not just the 'what'"
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
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">find the real you</p>
            <h2 className="mt-6 text-4xl font-semibold md:text-5xl">
              Stop filtering bots. Start hiring humans.
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Cut through the noise and rediscover the talent buried in your inbox. withWilma brings the 'who' back to recruitment.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={candidateAppUrl} size="lg" variant="secondary" external>
                Start your human-first pilot
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline">
                Get the truth about your pipeline
              </ButtonLink>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
