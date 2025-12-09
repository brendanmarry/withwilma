"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "./context/OrganisationContext";

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="panel flex flex-col items-center gap-3 p-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
      ✨
    </div>
    <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
    <p className="max-w-md text-sm text-slate-500">{description}</p>
  </div>
);

type OrganisationSummary = {
  id: string;
  name: string;
  rootUrl: string;
  createdAt: string;
  updatedAt: string;
  counts: {
    documents: number;
    faqs: number;
    jobs: number;
  };
};

const AdminIndexPage = () => {
  const router = useRouter();
  const { selectedOrganisation, setSelectedOrganisation, organisations, isLoading } =
    useOrganisation();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if organisation is already selected
  useEffect(() => {
    if (!isLoading && selectedOrganisation) {
      router.push("/admin/candidates");
    }
  }, [selectedOrganisation, isLoading, router]);

  const handleSelectOrganisation = (org: OrganisationSummary) => {
    setSelectedOrganisation(org);
    router.push("/admin/candidates");
  };

  const filteredOrganisations = organisations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.rootUrl.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-slate-400">Loading organisations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="page-heading">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
          Organisations
        </div>
        <h1>Select an organisation to manage Wilma</h1>
        <p>
          Choose which brand context you’d like to work on. We’ll keep the experience seamless as you ingest knowledge,
          configure roles, and review candidates.
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="panel p-6 flex-1">
          <label className="mb-2 block text-sm font-semibold text-slate-600">Search organisations</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or URL..."
            className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
          />
        </div>
        <button
          onClick={() => router.push("/admin/organisations/new")}
          className="h-full rounded-xl bg-[var(--brand-primary)] px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]"
        >
          New Organisation
        </button>
      </div>

      {organisations.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
            ✨
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">No organisations yet</h3>
          <p className="max-w-md text-sm text-slate-500 mb-4">
            Create your first organisation by analyzing your website to extract values and culture.
          </p>
          <button
            onClick={() => router.push("/admin/organisations/new")}
            className="rounded-lg bg-[var(--brand-primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-dark)]"
          >
            Create Organisation
          </button>
        </div>
      ) : filteredOrganisations.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a different search term or clear the filter to see all organisations."
        />
      ) : (
        <div className="card-grid md">
          {filteredOrganisations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrganisation(org)}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-[var(--surface-subtle)] bg-white p-6 text-left transition hover:border-[var(--brand-primary)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{org.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{org.rootUrl}</p>
                </div>
                <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
                  Select
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                <span>
                  Documents <strong>{org.counts.documents}</strong>
                </span>
                <span>
                  Jobs <strong>{org.counts.jobs}</strong>
                </span>
                <span>
                  FAQs <strong>{org.counts.faqs}</strong>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {organisations.length > 0 && (
        <div className="panel p-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Quick tips</h3>
          <ul className="flex flex-wrap gap-3 text-xs text-slate-500">
            <li className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
              Ingest documents in the Knowledge tab
            </li>
            <li className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
              Enable roles before sending to candidates
            </li>
            <li className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
              Review candidate clips in the Candidates tab
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminIndexPage;
