"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X, Settings, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_SITE_URL, EMPLOYER_APP_URL } from "@/lib/external-links";
import { useAuth } from "@/context/auth-context";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const navLinks: { href: string; label: string }[] = [];

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--surface-subtle)] bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href={user ? "/employer/home" : "/"} className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white">
                <span className="text-sm font-semibold">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">withWilma</span>
            </Link>

            {user?.organisation && (
              <div className="flex items-center space-x-3 border-l pl-4 border-gray-200 py-1">
                {user.organisation.branding?.logoUrl ? (
                  <img
                    src={user.organisation.branding.logoUrl}
                    alt={user.organisation.name}
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700 max-w-[150px] truncate">
                  {user.organisation.name}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/employer/home" className="text-sm font-medium text-gray-600 hover:text-purple-600">
                  Home
                </Link>
                <Link href="/employer/onboarding" className="text-sm font-medium text-gray-600 hover:text-purple-600">
                  Company & Culture
                </Link>
                <Link href="/employer/jobs" className="text-sm font-medium text-gray-600 hover:text-purple-600">
                  Active Jobs
                </Link>
                <Link href="/employer/candidates" className="text-sm font-medium text-gray-600 hover:text-purple-600">
                  Candidate Applications
                </Link>
              </>
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-[var(--brand-primary)] font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/employer/settings/account" className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/employer/login"
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                Login
              </Link>
            )}
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
              {user ? (
                <>
                  <Link href="/employer/home" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link href="/employer/onboarding" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Company & Culture</Link>
                  <Link href="/employer/jobs" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Active Jobs</Link>
                  <Link href="/employer/candidates" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Candidate Applications</Link>
                  <Link href="/employer/settings/account" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                </>
              ) : (
                <>
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
                    href="/employer/login"
                    className="block w-full rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

