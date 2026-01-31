import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MAIN_SITE_URL } from "@/lib/external-links";

// Helper to make internal marketing links point to the main website
const getHref = (href: string) => {
  if (href.startsWith("http")) return href;
  // If it's a hash link on home page
  if (href.startsWith("/#")) return `${MAIN_SITE_URL}${href.replace("/", "")}`;
  // If it's a regular marketing page
  if (href.startsWith("/")) return `${MAIN_SITE_URL}${href}`;
  return href;
};

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#overview" },
      { label: "Feature Deep Dive", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Employer Login", href: "/employer/login" }, // This stays local if we are on the app? Or should it go to app?
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "AI Interviews", href: "/features#ai-interviews" },
      { label: "Candidate Scoring", href: "/features#candidate-scoring" },
      { label: "Knowledge Ingestion", href: "/features#knowledge" },
      { label: "Recruiter Intelligence", href: "/features#recruiter" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials = [
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "https://github.com", icon: Github, label: "GitHub" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-100">
      <Container className="grid gap-12 py-16 md:grid-cols-5" size="xl">
        <div className="space-y-5">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-white">
              W
            </div>
            withWilma
          </Link>
          <p className="max-w-sm text-sm text-slate-300">
            withWilma helps teams build brilliant candidate experiences with AI-driven interviews,
            scoring, and recruiter intelligence—all in one cohesive platform.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            {socials.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-brand-500 hover:bg-brand-500/20 hover:text-white"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-4 md:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-200">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={getHref(link.href)}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} withWilma. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href={getHref("/privacy")} className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href={getHref("/cookies")} className="transition hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
