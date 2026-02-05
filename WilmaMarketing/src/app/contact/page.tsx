import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { ButtonLink } from "@/components/ui/ButtonLink";

const offices = [
  {
    city: "Zurich",
    address: "Bondlerstrasse 4, 8003 Zurich, Switzerland",
    hours: "Mon-Fri, 9am - 6pm ET",
    phone: "+41 79 763 3713",
  }
];

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to withWilma’s team about making your job application progess faster and more efficiently.",
};

export default function ContactPage() {
  return (
    <>
      <Section padding="xl" background="gradient">
        <Container className="space-y-8">
          <FadeIn>
            <SectionHeading
              align="center"
              eyebrow="let’s collaborate"
              title="Make your job application progress faster and more efficiently"
              description="Enable your team to get to know candidates for who they are, not just what they wrote on their resume."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-xl lg:grid-cols-1
          ">
            <form className="flex flex-col gap-4 bg-white p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  First name
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Jordan"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Last name
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Lee"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Work email
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Company
                <input
                  type="text"
                  name="company"
                  placeholder="Acme Robotics"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Team size
                  <select
                    name="teamSize"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select range
                    </option>
                    <option value="1-25">1-25 recruiters</option>
                    <option value="26-75">26-75 recruiters</option>
                    <option value="76-150">76-150 recruiters</option>
                    <option value="150+">150+ recruiters</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Monthly interview volume
                  <select
                    name="volume"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select volume
                    </option>
                    <option value="<500">Under 500</option>
                    <option value="500-2500">500 - 2,500</option>
                    <option value="2500-10000">2,500 - 10,000</option>
                    <option value=">10000">10,000+</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                What should we know?
                <textarea
                  name="context"
                  rows={4}
                  placeholder="Share hiring goals, pain points, or timeline."
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Request a call
              </button>
              <p className="text-xs text-slate-400">
                By submitting, you agree to withWilma’s <a href="/privacy" className="text-brand-500">Privacy Policy</a> and consent to receiving product updates.
              </p>
            </form>
          </FadeIn>
        </Container>
      </Section>

      <Section padding="lg" background="default">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {offices.map((office) => (
            <FadeIn key={office.city} className="rounded-3xl border border-slate-200 bg-white p-8 shadow">
              <h3 className="text-xl font-semibold text-slate-900">{office.city}</h3>
              <p className="mt-3 text-sm text-slate-600">{office.address}</p>
              <p className="mt-3 text-sm text-slate-500">{office.hours}</p>
              <p className="mt-4 text-sm font-medium text-brand-500">{office.phone}</p>
            </FadeIn>
          ))}
          <FadeIn className="flex flex-col justify-between rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-500/10 via-white to-white p-8 shadow-lg">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-slate-900">Already a customer?</h3>
              <p className="text-sm text-slate-600">
                Visit the withWilma Help Center for best practices, release notes, and platform status updates.
              </p>
            </div>
            <ButtonLink href="/help" variant="primary" size="md" className="self-start">
              Go to Help Center
            </ButtonLink>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
