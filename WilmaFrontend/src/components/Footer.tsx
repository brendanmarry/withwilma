import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const MAIN_SITE = "http://localhost:3002"; // Or use env variable

  const footerLinks = {
    Product: [
      { label: "Features", href: `${MAIN_SITE}/#features` },
      { label: "How it Works", href: `${MAIN_SITE}/#how-it-works` },
      { label: "Apply Now", href: `${MAIN_SITE}/apply` },
    ],
    Company: [
      { label: "About", href: `${MAIN_SITE}/about` },
      { label: "Blog", href: `${MAIN_SITE}/blog` },
      { label: "Careers", href: `${MAIN_SITE}/careers` },
      { label: "Contact", href: `${MAIN_SITE}/contact` },
    ],
    Resources: [
      { label: "Documentation", href: `${MAIN_SITE}/docs` },
      { label: "Help Center", href: `${MAIN_SITE}/help` },
      { label: "API", href: `${MAIN_SITE}/docs/api` },
      { label: "Admin", href: "/admin" }, // Keep Admin local? Or moved?
    ],
    Legal: [
      { label: "Privacy", href: `${MAIN_SITE}/privacy` },
      { label: "Terms", href: `${MAIN_SITE}/terms` },
      { label: "Cookie Policy", href: `${MAIN_SITE}/cookies` },
      { label: "Licenses", href: `${MAIN_SITE}/licenses` },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-[var(--surface-subtle)] bg-[var(--surface-muted)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white">
                <span className="text-sm font-semibold">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Wilma</span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              Wilma is your application assistant, elevating candidate quality and
              delivering rich video insights so screeners connect with real
              people—not AI-polished resumes.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors duration-200 hover:text-[var(--brand-primary)]"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors duration-200 hover:text-[var(--brand-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--surface-subtle)]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} Wilma. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 transition-colors duration-200 hover:text-[var(--brand-primary)]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 transition-colors duration-200 hover:text-[var(--brand-primary)]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

