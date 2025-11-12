"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "../context/OrganisationContext";

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

  const loadOrganisationKnowledge = useCallback(
    async (organisation: OrganisationSummary) => {
      setLoadingFaqs(true);
      try {
        const params = new URLSearchParams({ organisationId: organisation.id });
        const response = await fetch(`/api/knowledge/faqs?${params}`);
        if (response.ok) {
          const body = await response.json();
          setFaqs(body.faqs ?? []);
          setDocuments(body.documents ?? []);
          setSummary(body.organisation);
        } else {
          setFaqs([]);
          setDocuments([]);
          setSummary(null);
        }
      } finally {
        setLoadingFaqs(false);
      }
    },
    [],
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

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">Organisation Context</h2>
        <p className="mt-2 text-sm text-slate-400">
          Provide the organisation&apos;s primary website root. Wilma will use this
          URL to build and maintain the knowledge base.
        </p>
        <form onSubmit={ingestUrls} className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm text-slate-400">Root URL</label>
            <input
              value={rootUrl}
              onChange={(event) => setRootUrl(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
              placeholder="https://company.com"
              required
              list="organisation-roots"
            />
            {selectedOrganisation && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {selectedOrganisation.name} ({selectedOrganisation.rootUrl})
              </p>
            )}
          </div>
          <div className="flex items-end md:col-span-1">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Generate / Improve Knowledge Base
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Upload Documents</h3>
        <form
          onSubmit={handleFileUpload}
          className="mt-4 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <label className="flex-1 text-sm text-slate-400">
            PDF, DOCX, TXT files
            <input
              name="files"
              type="file"
              multiple
              className="mt-2 w-full rounded-lg border border-dashed border-slate-700 bg-slate-950 px-4 py-6 text-sm"
              accept=".pdf,.docx,.txt"
              required
            />
          </label>
          <input type="hidden" name="rootUrl" value={rootUrl} />
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>


      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Organisation Overview</h3>
            {loadingFaqs ? (
              <p className="text-sm text-slate-400">Loading organisation data…</p>
            ) : currentOrganisation ? (
              <div className="mt-2 text-sm text-slate-300">
                <p className="font-semibold text-white">
                  {currentOrganisation.name}
                </p>
                <p className="text-slate-400">{currentOrganisation.rootUrl}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="rounded-full bg-slate-800 px-3 py-1">
                    Documents: {currentOrganisation.counts.documents}
                  </span>
                  <span className="rounded-full bg-slate-800 px-3 py-1">
                    FAQs: {currentOrganisation.counts.faqs}
                  </span>
                  <span className="rounded-full bg-slate-800 px-3 py-1">
                    Jobs: {currentOrganisation.counts.jobs}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No knowledge base has been created for this organisation yet.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshFromDatabase()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-purple-400 hover:text-purple-200"
            >
              Refresh from Database
            </button>
            <button
              type="button"
              onClick={() => void generateFaqs()}
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Generate FAQs
            </button>
            <button
              type="button"
              disabled={deduplicating}
              onClick={() => void deduplicateKnowledge()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-purple-400 hover:text-purple-200 disabled:opacity-50"
            >
              {deduplicating ? "Deduplicating…" : "Deduplicate Knowledge"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void deleteOrganisation()}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete Organisation"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        {loadingFaqs ? (
          <p className="mt-4 text-sm text-slate-400">Loading FAQs…</p>
        ) : (
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <input
                  value={faq.question}
                  onChange={(event) =>
                    setFaqs((prev) =>
                      prev.map((item) =>
                        item.id === faq.id
                          ? { ...item, question: event.target.value }
                          : item,
                      ),
                    )
                  }
                  onBlur={() => updateFaq(faq)}
                  className="w-full rounded-md border border-transparent bg-transparent text-sm font-semibold text-white focus:border-purple-400 focus:outline-none"
                />
                <textarea
                  value={faq.answer}
                  onChange={(event) =>
                    setFaqs((prev) =>
                      prev.map((item) =>
                        item.id === faq.id
                          ? { ...item, answer: event.target.value }
                          : item,
                      ),
                    )
                  }
                  onBlur={() => updateFaq(faq)}
                  className="mt-3 w-full rounded-md border border-transparent bg-slate-900/40 p-3 text-sm text-slate-200 focus:border-purple-400 focus:outline-none"
                  rows={4}
                />
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={faq.recruiterApproved}
                    onChange={(event) => {
                      const updated = { ...faq, recruiterApproved: event.target.checked };
                      setFaqs((prev) =>
                        prev.map((item) => (item.id === faq.id ? updated : item)),
                      );
                      void updateFaq(updated);
                    }}
                  />
                  Recruiter approved
                </label>
              </div>
            ))}
            {!faqs.length && (
              <p className="text-sm text-slate-400">
                Generate FAQs to populate recruiter-approved answers for Wilma.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Knowledge Sources</h3>
        {loadingFaqs ? (
          <p className="mt-4 text-sm text-slate-400">Loading documents…</p>
        ) : documents.length ? (
          <div className="mt-4 space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-xs uppercase text-slate-200">
                    {doc.sourceType}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(doc.createdAt).toLocaleString()}
                  </span>
                </div>
                {doc.sourceUrl ? (
                  <a
                    href={doc.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-purple-300 hover:underline"
                  >
                    {doc.sourceUrl}
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Uploaded document ({doc.mimeType ?? "unknown format"})
                  </p>
                )}
                {doc.metadata?.originalName && (
                  <p className="mt-1 text-xs text-slate-500">
                    Original file: {String(doc.metadata.originalName)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No documents have been processed for this organisation yet.
          </p>
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

