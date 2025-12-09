"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "../context/OrganisationContext";

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="panel flex flex-col items-center gap-3 p-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
      ✨
    </div>
    <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
    <p className="max-w-md text-sm text-slate-500">{description}</p>
  </div>
);

type FAQ = {
  id: string;
  question: string;
  answer: string;
  recruiterApproved: boolean;
};

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

type OrganisationProfile = {
  overview: string;
  productsAndServices: string[];
  historyHighlights: string[];
  leadershipTeam: string[];
  fundingStatus: string;
  ownershipStructure: string;
  confidence: "high" | "medium" | "low";
  notes: string[];
  generatedAt: string;
  sourceCount: number;
};

type DocumentSummary = {
  id: string;
  sourceType: string;
  sourceUrl: string | null;
  mimeType: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

const normaliseRootUrl = (value: string): string => {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return value.trim();
  }
};

const KnowledgePage = () => {
  const router = useRouter();
  const { selectedOrganisation, refreshOrganisations, isLoading: contextLoading } =
    useOrganisation();
  const [rootUrl, setRootUrl] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [summary, setSummary] = useState<OrganisationSummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState<OrganisationProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [regeneratingFaqs, setRegeneratingFaqs] = useState<Record<string, boolean>>({});
  const [savingFaqs, setSavingFaqs] = useState<Record<string, boolean>>({});
  const [dirtyFaqs, setDirtyFaqs] = useState<Record<string, boolean>>({});

  // Redirect if no organisation is selected
  useEffect(() => {
    if (!contextLoading && !selectedOrganisation) {
      router.push("/admin");
    }
  }, [selectedOrganisation, contextLoading, router]);

  // Update rootUrl when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      const normalised = normaliseRootUrl(selectedOrganisation.rootUrl);
      setRootUrl(normalised);
    }
  }, [selectedOrganisation]);

  const currentOrganisation = useMemo(() => {
    if (!summary) return null;
    return summary;
  }, [summary]);

  const loadOrganisationProfile = useCallback(
    async (organisationId: string) => {
      setLoadingProfile(true);
      setProfile(null);
      setProfileError(null);
      try {
        const params = new URLSearchParams({ organisationId });
        const response = await fetch(`/api/knowledge/organisation-summary?${params}`);
        const body = await response.json().catch(() => null);
        if (response.ok && body?.profile) {
          setProfile(body.profile as OrganisationProfile);
        } else {
          setProfile(null);
          if (body?.reason === "no_documents") {
            setProfileError("Add knowledge sources to build the organisation overview.");
          } else if (body?.reason === "organisation_not_found") {
            setProfileError("Organisation not found.");
          } else if (body?.reason === "llm_failed") {
            setProfileError("Could not generate an overview. Try refreshing after adding more content.");
          } else {
            setProfileError("Organisation overview not available yet.");
          }
        }
      } catch {
        setProfile(null);
        setProfileError("Failed to load organisation overview.");
      } finally {
        setLoadingProfile(false);
      }
    },
    [],
  );

  const loadOrganisationKnowledge = useCallback(
    async (organisation: OrganisationSummary) => {
      setLoadingFaqs(true);
      setProfile(null);
      setProfileError(null);
      try {
        const params = new URLSearchParams({ organisationId: organisation.id });
        const response = await fetch(`/api/knowledge/faqs?${params}`);
        if (response.ok) {
          const body = await response.json();
          setFaqs(body.faqs ?? []);
          setDocuments(body.documents ?? []);
          setSummary(body.organisation);
          void loadOrganisationProfile(organisation.id);
        } else {
          setFaqs([]);
          setDocuments([]);
          setSummary(null);
          setProfile(null);
          setProfileError("Unable to load organisation data.");
        }
      } finally {
        setLoadingFaqs(false);
      }
    },
    [loadOrganisationProfile],
  );

  // Load knowledge when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      void loadOrganisationKnowledge({
        id: selectedOrganisation.id,
        name: selectedOrganisation.name,
        rootUrl: selectedOrganisation.rootUrl,
        createdAt: selectedOrganisation.createdAt,
        updatedAt: selectedOrganisation.updatedAt,
        counts: { documents: 0, faqs: 0, jobs: 0 },
      });
    }
  }, [selectedOrganisation, loadOrganisationKnowledge]);

  const ingestUrls = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rootUrl) {
      setStatus("Root URL is required");
      return;
    }
    setStatus("Starting crawl…");
    const response = await fetch("/api/ingest/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rootUrl,
        depth: 2,
      }),
    });
    if (response.ok) {
      const body = await response.json();
      setStatus(`Crawl launched. Pages processed: ${body.pagesProcessed}`);
      await refreshOrganisations();
      if (selectedOrganisation) {
        await loadOrganisationKnowledge({
          id: selectedOrganisation.id,
          name: selectedOrganisation.name,
          rootUrl: selectedOrganisation.rootUrl,
          createdAt: selectedOrganisation.createdAt,
          updatedAt: selectedOrganisation.updatedAt,
          counts: { documents: 0, faqs: 0, jobs: 0 },
        });
      }
    } else {
      setStatus("Failed to ingest URL");
    }
  };

  const handleFileUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rootUrl) {
      setStatus("Root URL is required");
      return;
    }
    const formData = new FormData(event.currentTarget);
    setUploading(true);
    setStatus("Uploading documents…");
    try {
      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setStatus("Documents queued for ingestion");
        await refreshOrganisations();
        if (selectedOrganisation) {
          await loadOrganisationKnowledge({
            id: selectedOrganisation.id,
            name: selectedOrganisation.name,
            rootUrl: selectedOrganisation.rootUrl,
            createdAt: selectedOrganisation.createdAt,
            updatedAt: selectedOrganisation.updatedAt,
            counts: { documents: 0, faqs: 0, jobs: 0 },
          });
        }
      } else {
        setStatus("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const generateFaqs = async () => {
    if (!rootUrl) {
      setStatus("Root URL is required");
      return;
    }
    setStatus("Generating FAQs…");
    const response = await fetch("/api/knowledge/generate-faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rootUrl }),
    });
    if (response.ok) {
      const body = await response.json();
      setFaqs(body.faqs ?? []);
      setDocuments(body.documents ?? []);
      setStatus("FAQs generated");
      await refreshOrganisations();
      if (selectedOrganisation) {
        await loadOrganisationKnowledge({
          id: selectedOrganisation.id,
          name: selectedOrganisation.name,
          rootUrl: selectedOrganisation.rootUrl,
          createdAt: selectedOrganisation.createdAt,
          updatedAt: selectedOrganisation.updatedAt,
          counts: { documents: 0, faqs: 0, jobs: 0 },
        });
      }
    } else {
      setStatus("Failed to generate FAQs");
    }
  };

  const refreshFromDatabase = async () => {
    if (selectedOrganisation) {
      setStatus("Refreshing knowledge base…");
      await loadOrganisationKnowledge({
        id: selectedOrganisation.id,
        name: selectedOrganisation.name,
        rootUrl: selectedOrganisation.rootUrl,
        createdAt: selectedOrganisation.createdAt,
        updatedAt: selectedOrganisation.updatedAt,
        counts: { documents: 0, faqs: 0, jobs: 0 },
      });
      setStatus("Knowledge base refreshed");
    } else {
      setStatus("No organisation selected");
    }
  };

  const deleteOrganisation = async () => {
    const confirmation = window.confirm(
      "Deleting this organisation will remove all associated knowledge, documents, jobs, and candidate data. This action cannot be undone. Continue?",
    );
    if (!confirmation) return;

    setDeleting(true);
    setStatus("Deleting organisation data…");
    try {
      const params = new URLSearchParams();
      if (selectedOrganisation) {
        params.set("organisationId", selectedOrganisation.id);
      } else if (rootUrl) {
        params.set("rootUrl", rootUrl);
      }
      const response = await fetch(`/api/organisations?${params.toString()}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStatus("Organisation deleted");
        await refreshOrganisations();
        // Redirect to organisation selection
        router.push("/admin");
      } else {
        setStatus("Failed to delete organisation");
      }
    } finally {
      setDeleting(false);
    }
  };

  const deduplicateKnowledge = async () => {
    setDeduplicating(true);
    setStatus("Deduplicating knowledge base…");
    try {
      const response = await fetch("/api/knowledge/deduplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rootUrl: rootUrl || undefined,
          organisationId: selectedOrganisation?.id || undefined,
        }),
      });
      if (response.ok) {
        const body = await response.json();
        setStatus(
          `Deduplication complete: removed ${body.result.removedDocuments} documents, ${body.result.removedDocumentChunks} document chunks, ${body.result.removedFaqs} FAQs.`,
        );
        if (selectedOrganisation) {
          await loadOrganisationKnowledge({
            id: selectedOrganisation.id,
            name: selectedOrganisation.name,
            rootUrl: selectedOrganisation.rootUrl,
            createdAt: selectedOrganisation.createdAt,
            updatedAt: selectedOrganisation.updatedAt,
            counts: { documents: 0, faqs: 0, jobs: 0 },
          });
        }
      } else {
        setStatus("Failed to deduplicate knowledge");
      }
    } finally {
      setDeduplicating(false);
    }
  };

  const updateFaq = async (faq: FAQ) => {
    await fetch(`/api/knowledge/faq/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
  };

  const saveFaq = async (faq: FAQ) => {
    setSavingFaqs((prev) => ({ ...prev, [faq.id]: true }));
    try {
      await updateFaq(faq);
      setDirtyFaqs((prev) => {
        const next = { ...prev };
        delete next[faq.id];
        return next;
      });
      setStatus("FAQ updated");
    } catch {
      setStatus("Failed to save FAQ");
    } finally {
      setSavingFaqs((prev) => {
        const next = { ...prev };
        delete next[faq.id];
        return next;
      });
    }
  };

  const regenerateFaq = async (faq: FAQ) => {
    setRegeneratingFaqs((prev) => ({ ...prev, [faq.id]: true }));
    try {
      const response = await fetch(`/api/knowledge/faq/${faq.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: faq.question }),
      });
      if (response.ok) {
        const body = await response.json();
        const updatedFaq: FAQ = {
          id: body.faq.id,
          question: body.faq.question,
          answer: body.faq.answer,
          recruiterApproved: body.faq.recruiterApproved,
        };
        setFaqs((prev) => prev.map((item) => (item.id === faq.id ? updatedFaq : item)));
        setStatus("FAQ answer regenerated");
        setDirtyFaqs((prev) => {
          const next = { ...prev };
          delete next[faq.id];
          return next;
        });
      } else {
        setStatus("Failed to regenerate FAQ answer");
      }
    } catch {
      setStatus("Failed to regenerate FAQ answer");
    } finally {
      setRegeneratingFaqs((prev) => {
        const next = { ...prev };
        delete next[faq.id];
        return next;
      });
    }
  };

  const handleApproveFaq = async (faqId: string, approved: boolean) => {
    const faqToUpdate = faqs.find((faq) => faq.id === faqId);
    if (!faqToUpdate) return;

    const updatedFaq: FAQ = { ...faqToUpdate, recruiterApproved: approved };
    setFaqs((prev) => prev.map((faq) => (faq.id === faqId ? updatedFaq : faq)));
    void updateFaq(updatedFaq);
    setDirtyFaqs((prev) => ({ ...prev, [faqId]: true }));
    setStatus("FAQ updated");
  };

  const handleRegenerateAllFaqs = async () => {
    setRegeneratingFaqs((prev) => ({ ...prev, ...prev })); // Mark all as regenerating
    for (const faqId in regeneratingFaqs) {
      await regenerateFaq({ id: faqId, question: "", answer: "", recruiterApproved: false }); // Clear answers temporarily
    }
    await refreshOrganisations(); // Refresh to get new answers
    setRegeneratingFaqs({}); // Clear regenerating state
    setStatus("All FAQs regenerated");
  };

  const handleRefreshOrganisation = async () => {
    if (selectedOrganisation) {
      setLoadingProfile(true);
      setProfile(null);
      setProfileError(null);
      try {
        const params = new URLSearchParams({ organisationId: selectedOrganisation.id });
        const response = await fetch(`/api/knowledge/organisation-summary?${params}`);
        const body = await response.json();
        if (response.ok && body?.profile) {
          setProfile(body.profile as OrganisationProfile);
          setProfileError(null);
        } else {
          setProfile(null);
          setProfileError("Failed to refresh organisation profile.");
        }
      } catch {
        setProfile(null);
        setProfileError("Failed to refresh organisation profile.");
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  if (contextLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="panel flex items-center gap-3 p-6 text-sm text-slate-500">
          <span className="text-lg">⏳</span>
          Loading organisation data…
        </div>
      </div>
    );
  }

  if (!selectedOrganisation) {
    return (
      <div className="page-heading">
        <h1>Select an organisation first</h1>
        <p className="text-slate-500">
          Head back to the organisation picker to choose which brand context you want to manage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="panel flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
            Knowledge builder
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Keep Wilma accurate and on-brand</h1>
          <p className="text-sm text-slate-500">
            Upload your playbooks, FAQs, and voice guidelines. Wilma uses this knowledge to guide candidates with complete confidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
            {documents.length} documents synced
          </span>
          <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
            {faqs.length} FAQs ready
          </span>
          <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
            {summary?.counts.jobs ?? 0} jobs connected
          </span>
        </div>
      </header>

      <section className="panel p-6">
        <div className="panel-header">
          <h2>Organisation profile</h2>
          <button
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            onClick={handleRefreshOrganisation}
            disabled={loadingProfile}
          >
            {loadingProfile ? "Refreshing…" : "Refresh summary"}
          </button>
        </div>

        {summary === null ? (
          <EmptyState title="No summary yet" description="Refresh to generate an instant overview for your recruiting team." />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-12 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="mb-2 text-sm font-semibold text-white">Overview</h3>
              <p className="text-sm text-slate-300">{profile?.overview}</p>
            </div>
            <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h4 className="text-sm font-semibold text-white">Products & Services</h4>
              {profile?.productsAndServices.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                  {profile.productsAndServices.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Not available yet.</p>
              )}
            </div>
            <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h4 className="text-sm font-semibold text-white">Company history</h4>
              {profile?.historyHighlights.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                  {profile.historyHighlights.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Add more sources to capture key milestones.
                </p>
              )}
            </div>
            <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h4 className="text-sm font-semibold text-white">Leadership</h4>
              {profile?.leadershipTeam.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                  {profile.leadershipTeam.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Upload leadership bios or team pages to populate this section.
                </p>
              )}
            </div>
            <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-white">Funding</h4>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Status:</span>{" "}
                {profile?.fundingStatus}
              </p>
            </div>
            <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-white">Ownership</h4>
              <p className="text-sm text-slate-300">{profile?.ownershipStructure}</p>
            </div>
            {profile?.notes.length > 0 && (
              <div className="lg:col-span-12 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h4 className="text-sm font-semibold text-white">Additional notes</h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                  {profile.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="panel p-6">
        <div className="panel-header">
          <div>
            <h2>Ingest organisation knowledge</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the URLs that explain your mission, product, and hiring approach. Wilma will crawl up to 25 pages per domain and keep them synced.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void ingestUrls(new FormEvent("submit"))}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              Sync knowledge
            </button>
            <button
              type="button"
              onClick={() => void handleFileUpload(new FormEvent("submit"))}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              Upload documents
            </button>
          </div>
        </div>
        <form className="mt-6 space-y-5" onSubmit={ingestUrls}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Root URL</label>
            <input
              value={rootUrl}
              onChange={(event) => setRootUrl(event.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Supports up to 10 files per upload batch.</p>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload documents"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel p-6">
        <div className="panel-header">
          <h2>Documents</h2>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
              onClick={() => refreshOrganisations()}
              disabled={loadingProfile}
            >
              Refresh
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
              onClick={() => void generateFaqs()}
              disabled={deduplicating}
            >
              Generate FAQs
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
              onClick={() => void deduplicateKnowledge()}
              disabled={deduplicating}
            >
              Deduplicate knowledge
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
              onClick={() => void deleteOrganisation()}
              disabled={deleting}
            >
              Delete organisation
            </button>
          </div>
        </div>
        {documents.length === 0 ? (
          <EmptyState title="No documents yet" description="Add a knowledge source to start training Wilma." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <article
                key={document.id}
                className="flex h-full flex-col gap-3 rounded-2xl border border-[var(--surface-subtle)] bg-white p-4 text-sm text-slate-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{document.sourceUrl ?? "Uploaded document"}</p>
                    <p className="text-xs text-slate-400">Added {new Date(document.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs text-[var(--brand-primary)]">
                    {document.sourceType ?? "upload"}
                  </span>
                </div>
                {document.sourceUrl ? (
                  <a
                    href={document.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-purple-300 hover:underline"
                  >
                    {document.sourceUrl}
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Uploaded document ({document.mimeType ?? "unknown format"})
                  </p>
                )}
                {document.metadata?.originalName && (
                  <p className="mt-1 text-xs text-slate-500">
                    Original file: {String(document.metadata.originalName)}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel p-6">
        <div className="panel-header">
          <h2>FAQs</h2>
          <button
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            onClick={handleRegenerateAllFaqs}
            disabled={loadingFaqs}
          >
            {loadingFaqs ? "Regenerating…" : "Regenerate all"}
          </button>
        </div>
        {faqs.length === 0 ? (
          <EmptyState title="No FAQs yet" description="Generate FAQs to help Wilma answer candidate questions instantly." />
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.id}
                className="rounded-2xl border border-[var(--surface-subtle)] bg-white p-5 text-sm text-slate-500"
              >
                <header className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-[var(--foreground)]">{faq.question}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-[var(--brand-primary)]">
                      {faq.recruiterApproved ? "Approved" : "Awaiting review"}
                    </span>
                  </div>
                </header>
                <div className="flex flex-wrap gap-2 pt-4">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
                    onClick={() => handleApproveFaq(faq.id, !faq.recruiterApproved)}
                    disabled={savingFaqs[faq.id]}
                  >
                    {faq.recruiterApproved ? "Needs review" : "Mark recruiter ready"}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-subtle)] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-50"
                    onClick={() => regenerateFaq(faq)}
                    disabled={regeneratingFaqs[faq.id]}
                  >
                    {regeneratingFaqs[faq.id] ? "Regenerating…" : "Regenerate"}
                  </button>
                </div>
                <textarea
                  value={faq.answer}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFaqs((prev) =>
                      prev.map((item) =>
                        item.id === faq.id ? { ...item, answer: value } : item,
                      ),
                    );
                    setDirtyFaqs((prev) => ({ ...prev, [faq.id]: true }));
                  }}
                  className="mt-3 h-32 w-full rounded-md border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-200 focus:border-purple-400 focus:outline-none"
                  rows={4}
                />
              </article>
            ))}
            {!faqs.length && (
              <p className="text-sm text-slate-400">
                Generate FAQs to populate recruiter-approved answers for Wilma.
              </p>
            )}
          </div>
        )}
      </section>

      {status && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 px-4 py-3 text-sm text-purple-200">
          {status}
        </div>
      )}
    </div>
  );
};

export default KnowledgePage;

