"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CANDIDATE_APP_URL, RECRUITER_APP_URL } from "@/lib/external-links";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--surface-subtle)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white">
            W
          </div>
          <span>Wilma</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-200 hover:text-brand-500"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-brand-500"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="http://localhost:3000/recruiter/login" size="sm" external>
            Login
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--surface-subtle)] bg-white/80 text-slate-700 shadow-sm shadow-brand-500/10 transition-colors duration-200 hover:text-brand-500 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[var(--surface-subtle)] bg-white/90 backdrop-blur"
          >
            <div className="space-y-2 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-[var(--surface-subtle)] bg-white/80 px-4 py-3 text-base font-medium text-slate-700 shadow-sm shadow-brand-500/5 transition hover:border-brand-200 hover:text-brand-500"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-[var(--surface-subtle)] bg-white/80 px-4 py-3 text-base font-medium text-slate-700 shadow-sm shadow-brand-500/5 transition hover:border-brand-200 hover:text-brand-500"
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <ButtonLink href="http://localhost:3000/recruiter/login" size="md" external>
                  Login
                </ButtonLink>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
