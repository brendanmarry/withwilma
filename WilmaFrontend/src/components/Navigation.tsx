"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_SITE_URL, RECRUITER_APP_URL } from "@/lib/external-links";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { href: string; label: string }[] = [];

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--surface-subtle)] bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white">
              <span className="text-sm font-semibold">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Wilma</span>
          </Link>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-[var(--brand-primary)] font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div> */}

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/recruiter/login"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-full p-2 text-gray-700 hover:text-[var(--brand-primary)] transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--surface-subtle)] bg-white"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-full px-4 py-2 text-gray-600 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/recruiter/login"
                className="block w-full rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

