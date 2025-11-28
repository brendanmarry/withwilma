"use client";

import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight, Menu, X } from "lucide-react";
import { useOrganisation } from "./context/OrganisationContext";
import { OrganisationProvider } from "./context/OrganisationContext";
import { useState } from "react";
import { CANDIDATE_APP_URL, MAIN_SITE_URL } from "@/lib/external-links";
import AdminFooter from "./components/AdminFooter";

const navItems = [
  { href: "/admin/knowledge", label: "Knowledge" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/candidates", label: "Candidates" },
];

const AppSwitcher = () => {
  const { selectedOrganisation, setSelectedOrganisation } = useOrganisation();

  if (!selectedOrganisation) {
    return null;
  }

  return (
    <button
      onClick={() => {
        setSelectedOrganisation(null);
        window.location.href = "/admin";
      }}
      className="text-xs font-medium text-[var(--brand-primary)] underline-offset-2 hover:underline"
    >
      Change organisation
    </button>
  );
};

const AdminHeader = () => {
  const { selectedOrganisation } = useOrganisation();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--surface-subtle)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white">
            W
          </div>
          <span>Wilma Admin</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-[var(--brand-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {selectedOrganisation ? (
            <div className="flex items-center gap-2 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs text-[var(--brand-primary)]">
              <span>{selectedOrganisation.name}</span>
              <AppSwitcher />
            </div>
          ) : null}
          <Link
            href={MAIN_SITE_URL}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[var(--brand-primary)]"
            prefetch={false}
            target="_blank"
            rel="noreferrer"
          >
            Main site
          </Link>
          <Link
            href={CANDIDATE_APP_URL}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)]"
            prefetch={false}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowRight className="h-4 w-4" />
            Candidate UI
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--surface-subtle)] bg-white text-slate-700 shadow-sm transition hover:text-[var(--brand-primary)] md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--surface-subtle)] bg-white md:hidden">
          <div className="space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-base font-medium text-slate-700 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              {selectedOrganisation ? (
                <div className="flex items-center justify-between rounded-2xl border border-[var(--surface-subtle)] bg-[var(--brand-primary-soft)] px-4 py-3 text-sm font-medium text-[var(--brand-primary)]">
                  <span>{selectedOrganisation.name}</span>
                  <AppSwitcher />
                </div>
              ) : null}
              <Link
                href={MAIN_SITE_URL}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--surface-subtle)] px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                onClick={() => setOpen(false)}
                prefetch={false}
                target="_blank"
                rel="noreferrer"
              >
                Main site
              </Link>
              <Link
                href={CANDIDATE_APP_URL}
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
                onClick={() => setOpen(false)}
                prefetch={false}
                target="_blank"
                rel="noreferrer"
              >
                Candidate UI
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <OrganisationProvider>
      <div className="admin-shell flex min-h-screen flex-col">
        <AdminHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          <div className="space-y-8">{children}</div>
        </main>
        <AdminFooter />
      </div>
    </OrganisationProvider>
  );
};

export default AdminLayout;

