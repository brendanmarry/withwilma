"use client";

import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";
import { OrganisationProvider, useOrganisation } from "./context/OrganisationContext";

const navItems = [
  { href: "/admin/knowledge", label: "Knowledge Base Builder" },
  { href: "/admin/jobs", label: "Open Roles" },
  { href: "/admin/candidates", label: "Candidate Review" },
];

const AdminHeader = () => {
  const { selectedOrganisation, setSelectedOrganisation } = useOrganisation();

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Wilma Admin Console</h1>
          <p className="text-sm text-slate-400">
            Configure knowledge base, manage roles, and review applications.
          </p>
          {selectedOrganisation && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Organisation:</span>
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-200">
                {selectedOrganisation.name}
              </span>
              <button
                onClick={() => {
                  setSelectedOrganisation(null);
                  window.location.href = "/admin";
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Change
              </button>
            </div>
          )}
        </div>
        <nav className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                "bg-slate-900 text-slate-200 hover:bg-slate-800",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <OrganisationProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminHeader />
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </div>
    </OrganisationProvider>
  );
};

export default AdminLayout;

