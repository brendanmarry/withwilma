import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";

const plans = [
  {
    name: "Growth",
    price: "$2,400",
    cadence: "per month",
    description: "For in-house teams scaling across 3-5 core roles with AI interviews and scoring.",
    highlights: [
      "AI voice + video interviews",
      "Candidate scoring with bias guardrails",
      "Recruiter co-pilot workspace",
      "3 live roles included",
      "ATS integrations",
      "Email + in-product support",
    ],
    cta: "Start free trial",
  },
  {
    name: "Scale",
    price: "$5,900",
    cadence: "per month",
    description: "For high-growth orgs hiring across multiple regions and departments.",
    highlights: [
      "Everything in Growth",
      "Unlimited roles & interview templates",
      "Multilingual candidate experiences",
      "Offer analytics & conversion insights",
      "Dedicated implementation partner",
      "24/5 live support",
    ],
    featured: true,
    cta: "Book a demo",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "deployment",
    description: "For global talent organizations requiring deep integrations and governance.",
    highlights: [
      "Everything in Scale",
      "SOC2 Type II + regional compliance",
      "Private LLM deployment options",
      "Custom recruiter workflows",
      "Change management playbooks",
      "Global customer success pod",
    ],
    cta: "Talk to sales",
  },
];

const comparison = [
  { feature: "AI interviews & scheduling", growth: true, scale: true, enterprise: true },
  { feature: "Bias guardrails & fairness analytics", growth: true, scale: true, enterprise: true },
  { feature: "Recruiter co-pilot workspace", growth: true, scale: true, enterprise: true },
  { feature: "Knowledge ingestion (docs, decks, Help Center)", growth: true, scale: true, enterprise: true },
  { feature: "Multi-language support", growth: false, scale: true, enterprise: true },
  { feature: "Role-based permissions", growth: true, scale: true, enterprise: true },
  { feature: "Custom ATS integration", growth: false, scale: true, enterprise: true },
  { feature: "Private cloud deployment", growth: false, scale: false, enterprise: true },
];

const faqs = [
  {
    question: "How long does implementation take?",
    answer:
      "Growth plans launch in under a week with guided onboarding. Scale and Enterprise deployments include dedicated solution architects and typically go live within 30 days.",
  },
  {
    question: "Can we bring our own language models?",
    answer:
      "Yes. Enterprise customers can deploy Wilma on private LLM infrastructure or connect to approved third-party models via our governance framework.",
  },
  {
    question: "Do you integrate with our ATS and HRIS?",
    answer:
      "Wilma integrates natively with Greenhouse, Lever, Ashby, Workday, and SuccessFactors. Our team will blueprint workflows during onboarding.",
  },
  {
    question: "How do you ensure fairness and compliance?",
    answer:
      "Bias guardrails, explainability reports, and candidate consent flows are included in every plan. Enterprise plans add custom audit logs and legal review support.",
  },
];

export const metadata: Metadata = {
  title: "Pricing",
  description: "Flexible plans for talent teams of every size. Launch AI-native recruiting with clear ROI from day one.",
};

export default function PricingPage() {
  return (
    <>
      <Section padding="xl" background="gradient">
        <Container className="space-y-12">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="pricing that scales"
              title="Choose the Wilma plan that fits your hiring velocity"
              description="Every plan includes AI voice + video interviews, recruiter co-pilot, and candidate scoring. Add-on modules expand as your team grows."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex h-full flex-col rounded-3xl border ${
                  plan.featured
                    ? "border-brand-200 bg-white shadow-xl shadow-brand-500/20"
                    : "border-slate-200 bg-white/90 shadow-lg"
                } p-8`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-semibold text-slate-900">{plan.name}</h3>
                  {plan.featured ? <Badge variant="info">Most popular</Badge> : null}
                </div>
                <p className="mt-3 text-sm text-slate-500">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.cadence}</span>
                </div>
                <ButtonLink
                  href="/contact"
                  className="mt-6"
                  variant={plan.featured ? "primary" : "secondary"}
                >
                  {plan.cta}
                </ButtonLink>
                <ul className="mt-8 space-y-3 text-sm text-slate-600">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-brand-500" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="default">
        <Container className="space-y-10">
          <FadeIn>
            <SectionHeading
              title="Feature comparison"
              description="See exactly what’s included at each tier. Enterprise plans include a custom roadmap co-authored with your talent leadership."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
              <table className="w-full table-auto text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Capability</th>
                    <th className="px-6 py-4 text-center">Growth</th>
                    <th className="px-6 py-4 text-center">Scale</th>
                    <th className="px-6 py-4 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-medium text-slate-700">{row.feature}</td>
                      {[row.growth, row.scale, row.enterprise].map((enabled, index) => (
                        <td key={index} className="px-6 py-4 text-center">
                          {enabled ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                              —
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="muted">
        <Container className="space-y-10">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="faq"
              title="Answers for talent leaders"
              description="Pricing should be predictable. Our team will co-design ROI models tailored to your hiring roadmap."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="mx-auto grid max-w-4xl grid-cols-1 gap-6">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-200"
              >
                <summary className="text-lg font-semibold text-slate-900">
                  {faq.question}
                </summary>
                <p className="mt-4 text-base text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </FadeIn>
        </Container>
      </Section>

      <Section padding="xl" background="brand">
        <Container className="flex flex-col items-center gap-6 text-center text-white">
          <FadeIn className="max-w-3xl">
            <h2 className="text-4xl font-semibold md:text-5xl">
              Need a procurement-ready bundle?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Enterprise packages include security reviews, legal support, data residency options, and co-branded candidate experiences across all markets.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Book a pricing workshop
              </ButtonLink>
              <ButtonLink href="/case-studies" variant="ghost" size="lg">
                See ROI in action
              </ButtonLink>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
