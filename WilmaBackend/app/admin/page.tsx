"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "./context/OrganisationContext";

type OrganisationSummary = {
  id: string;
  name: string;
  rootUrl: string;
  createdAt: string;
  updatedAt: string;
};

const AdminIndexPage = () => {
  const router = useRouter();
  const { selectedOrganisation, setSelectedOrganisation, organisations, isLoading } =
    useOrganisation();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if organisation is already selected
  useEffect(() => {
    if (!isLoading && selectedOrganisation) {
      router.push("/admin/knowledge");
    }
  }, [selectedOrganisation, isLoading, router]);

  const handleSelectOrganisation = (org: OrganisationSummary) => {
    setSelectedOrganisation(org);
    router.push("/admin/knowledge");
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Select Organisation</h1>
        <p className="text-slate-400">
          Choose an organisation to manage its knowledge base, open roles, and candidate reviews.
        </p>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-slate-400">Search Organisations</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or URL..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {organisations.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="mb-4 text-slate-400">No organisations found.</p>
          <p className="text-sm text-slate-500">
            Create an organisation by ingesting content or uploading job descriptions.
          </p>
        </div>
      ) : filteredOrganisations.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-slate-400">No organisations match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOrganisations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrganisation(org)}
              className="group rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left transition hover:border-purple-500/50 hover:bg-slate-900/60"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-200">
                  {org.name}
                </h3>
                <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-200">
                  Select →
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-400">{org.rootUrl}</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {organisations.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Quick Actions</h3>
          <p className="text-xs text-slate-400">
            After selecting an organisation, you can manage its knowledge base, open roles, and
            review candidates from the navigation above.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminIndexPage;
