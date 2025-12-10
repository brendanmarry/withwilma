"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "../context/OrganisationContext";

type OrganisationSummary = {
  id: string;
  name: string;
  rootUrl: string;
  createdAt: string;
  updatedAt: string;
};

type JobRecord = {
  id: string;
  title: string;
  description?: string;
  location: string | null;
  employmentType: string | null;
  department: string | null;
  status: "open" | "closed";
  wilmaEnabled: boolean;
  updatedAt: string;
  sourceUrl?: string | null;
  jobSource?: {
    id: string;
    url: string;
    type: "crawl" | "upload" | "manual";
    label?: string | null;
  } | null;
  _count: {
    attachments: number;
    candidates: number;
  };
};

type JobDocumentEntry = {
  id: string;
  jobId: string | null;
  job: {
    id: string;
    title: string;
    status: "open" | "closed";
  } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  document: {
    id: string;
    sourceType: string;
    sourceUrl: string | null;
    mimeType: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  };
};

type DashboardResponse = {
  organisation: OrganisationSummary | null;
  jobs: JobRecord[];
  documents: JobDocumentEntry[];
};

type DiscoveredJobUrl = {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
};

type JobPreview = {
  title: string;
  location?: string;
  department?: string;
  employmentType?: string;
  description: string;
  normalised: Record<string, unknown>;
  validation: {
    is_valid: boolean;
    reasons?: string[];
    suggested_improvements?: string[];
  };
  sourceUrl: string;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const Modal = ({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

const JobsPage = () => {
  const router = useRouter();
  const { selectedOrganisation, isLoading: contextLoading } = useOrganisation();
  const [rootUrl, setRootUrl] = useState("");
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [documents, setDocuments] = useState<JobDocumentEntry[]>([]);
  const [jobUrl, setJobUrl] = useState("");
  const [discoveredUrls, setDiscoveredUrls] = useState<DiscoveredJobUrl[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<JobPreview | null>(null);
  const [approving, setApproving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [viewingJob, setViewingJob] = useState<JobRecord | null>(null);

  // Redirect if no organisation is selected
  useEffect(() => {
    if (!contextLoading && !selectedOrganisation) {
      router.push("/admin");
    }
  }, [selectedOrganisation, contextLoading, router]);

  // Update rootUrl when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      setRootUrl(selectedOrganisation.rootUrl);
    }
  }, [selectedOrganisation]);

  const loadDashboard = useCallback(
    async (organisationId: string) => {
      const response = await fetch(
        `/api/jobs/dashboard?organisationId=${encodeURIComponent(organisationId)}`,
      );
      if (!response.ok) {
        setJobs([]);
        setDocuments([]);
        return;
      }
      const body: DashboardResponse = await response.json();
      setJobs(body.jobs);
      setDocuments(body.documents);
    },
    [],
  );

  // Load dashboard when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      void loadDashboard(selectedOrganisation.id);
    }
  }, [selectedOrganisation, loadDashboard]);

  const handleDiscoverJobUrls = async () => {
    if (!rootUrl.trim()) {
      setStatus("Please select an organisation first");
      return;
    }
    setDiscovering(true);
    setStatus("Searching website for job postings…");
    setDiscoveredUrls([]);
    try {
      const response = await fetch("/api/jobs/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rootUrl: rootUrl.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setDiscoveredUrls(data.urls || []);
        setStatus(
          `Found ${data.urls?.length || 0} potential job posting URLs. Select one from the dropdown to review.`,
        );
      } else {
        const errorText = await response.text();
        setStatus(`Failed to discover job URLs: ${errorText}`);
      }
    } catch {
      setStatus("Failed to discover job URLs");
    } finally {
      setDiscovering(false);
    }
  };

  const handleSelectDiscoveredUrl = async (url: string) => {
    setJobUrl(url);
    setPreview(null);
    setParsing(true);
    setStatus("Parsing job posting…");
    try {
      const response = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl: url }),
      });
      if (response.ok) {
        const data: JobPreview = await response.json();
        setPreview(data);
        setStatus("Job posting parsed successfully. Review and approve below.");
      } else {
        const errorText = await response.text();
        setStatus(`Failed to parse job posting: ${errorText}`);
      }
    } catch {
      setStatus("Failed to parse job posting");
    } finally {
      setParsing(false);
    }
  };

  const handleParseJobUrl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobUrl.trim()) {
      setStatus("Please enter a job posting URL");
      return;
    }
    setParsing(true);
    setStatus("Parsing job posting…");
    setPreview(null);
    try {
      const response = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl: jobUrl.trim() }),
      });
      if (response.ok) {
        const data: JobPreview = await response.json();
        setPreview(data);
        setStatus("Job posting parsed successfully. Review and approve below.");
      } else {
        const errorText = await response.text();
        setStatus(`Failed to parse job posting: ${errorText}`);
      }
    } catch {
      setStatus("Failed to parse job posting");
    } finally {
      setParsing(false);
    }
  };

  const handleApproveJob = async () => {
    if (!preview || !rootUrl) {
      setStatus("Missing preview or organisation");
      return;
    }
    setApproving(true);
    setStatus("Approving and creating job…");
    try {
      const response = await fetch("/api/jobs/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rootUrl,
          jobUrl: preview.sourceUrl,
          title: preview.title,
          location: preview.location,
          department: preview.department,
          employmentType: preview.employmentType,
          description: preview.description,
          normalizedJson: preview.normalised,
          wilmaEnabled: true,
        }),
      });
      if (response.ok && selectedOrganisation) {
        setStatus("Job approved and enabled for Wilma");
        setPreview(null);
        setJobUrl("");
        await loadDashboard(selectedOrganisation.id);
      } else {
        setStatus("Failed to approve job");
      }
    } catch {
      setStatus("Failed to approve job");
    } finally {
      setApproving(false);
    }
  };

  const handleRefreshDashboard = async () => {
    if (!selectedOrganisation) return;
    await loadDashboard(selectedOrganisation.id);
    setStatus("Dashboard refreshed");
  };

  const handleUploadDocuments = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrganisation || !rootUrl) {
      setStatus("Select an organisation before uploading documents");
      return;
    }
    const form = new FormData(event.currentTarget);
    setUploading(true);
    setStatus("Uploading job documents…");
    try {
      const response = await fetch("/api/jobs/upload", {
        method: "POST",
        body: form,
      });
      if (response.ok && selectedOrganisation) {
        const result = await response.json();
        const jobCount = result.createdJobs?.length ?? 0;
        if (jobCount > 0) {
          setStatus(
            `Job documents uploaded. ${jobCount} job(s) created. You can now enable them in the Open Roles table below.`,
          );
        } else {
          setStatus("Job documents uploaded and attached to existing jobs");
        }
        event.currentTarget.reset();
        await loadDashboard(selectedOrganisation.id);
      } else {
        setStatus("Failed to upload job documents");
      }
    } finally {
      setUploading(false);
    }
  };

  const updateJob = useCallback(
    async (jobId: string, payload: Record<string, unknown>) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok && selectedOrganisation) {
        await loadDashboard(selectedOrganisation.id);
      } else {
        setStatus("Failed to update job");
      }
    },
    [loadDashboard, selectedOrganisation],
  );

  const toggleJobStatus = async (job: JobRecord, statusValue: "open" | "closed") => {
    if (job.status === statusValue) return;
    await updateJob(job.id, { status: statusValue });
    setStatus(`Job marked as ${statusValue}`);
  };

  const toggleWilmaEnabled = async (job: JobRecord, enabled: boolean) => {
    // Optimistically update UI
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, wilmaEnabled: enabled } : j)),
    );
    setStatus(enabled ? "Wilma enabled for job" : "Wilma disabled for job");

    // Update on server
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wilmaEnabled: enabled }),
    });

    if (response.ok && selectedOrganisation) {
      // Refresh to ensure consistency
      await loadDashboard(selectedOrganisation.id);
      // Clear status message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } else {
      // Revert on error
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, wilmaEnabled: !enabled } : j)),
      );
      setStatus("Failed to update job");
    }
  };

  const handleDeleteJob = async (job: JobRecord) => {
    if (!window.confirm(`Delete the job "${job.title}" and its related data?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });
      if (response.ok && selectedOrganisation) {
        setStatus("Job deleted");
        await loadDashboard(selectedOrganisation.id);
        setTimeout(() => setStatus(null), 3000);
      } else {
        const errorText = await response.text();
        setStatus(`Failed to delete job: ${errorText}`);
      }
    } catch (error) {
      setStatus("Failed to delete job");
      console.error("Delete job error:", error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Delete this job document?")) return;
    try {
      const response = await fetch(`/api/jobs/documents/${documentId}`, {
        method: "DELETE",
      });
      if (response.ok && selectedOrganisation) {
        setStatus("Document deleted");
        await loadDashboard(selectedOrganisation.id);
        setTimeout(() => setStatus(null), 3000);
      } else {
        const errorText = await response.text();
        setStatus(`Failed to delete document: ${errorText}`);
      }
    } catch (error) {
      setStatus("Failed to delete document");
      console.error("Delete document error:", error);
    }
  };


  const jobOptions = useMemo(() => {
    return jobs.map((job) => (
      <option key={job.id} value={job.id}>
        {job.title}
      </option>
    ));
  }, [jobs]);

  return (
    <div className="space-y-10">
      {selectedOrganisation && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Organisation: {selectedOrganisation.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{selectedOrganisation.rootUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleRefreshDashboard()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-purple-400 hover:text-purple-200"
            >
              Refresh Dashboard
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Add Job from URL</h3>
        <p className="mt-1 text-sm text-slate-400">
          Search the organisation&apos;s website for job postings or enter a URL directly. Review and
          approve to add it to Wilma&apos;s knowledge base.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm text-slate-400">Search Organisation Website</label>
              <button
                type="button"
                onClick={() => void handleDiscoverJobUrls()}
                disabled={discovering || !rootUrl}
                className="mt-1 w-full rounded-lg border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20 disabled:opacity-50"
              >
                {discovering ? "Searching…" : "🔍 Discover Job URLs"}
              </button>
            </div>
          </div>

          {discoveredUrls.length > 0 && (
            <div>
              <label className="text-sm text-slate-400">
                Select a discovered job posting ({discoveredUrls.length} found)
              </label>
              <select
                value=""
                onChange={(event) => {
                  const url = event.target.value;
                  if (url) {
                    void handleSelectDiscoveredUrl(url);
                  }
                }}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Choose a job posting URL…</option>
                {discoveredUrls.map((item) => (
                  <option key={item.url} value={item.url}>
                    {item.title} ({Math.round(item.confidence)}% match) - {item.url}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                URLs are sorted by relevance. Select one to review and approve.
              </p>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/40 px-2 text-slate-500">Or enter URL manually</span>
            </div>
          </div>

          <form onSubmit={handleParseJobUrl} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm text-slate-400">Job Posting URL</label>
              <input
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="https://company.com/careers/software-engineer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={parsing || !rootUrl}
              className="inline-flex items-center justify-center rounded-lg bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-50"
            >
              {parsing ? "Parsing…" : "Parse Job Posting"}
            </button>
          </form>
        </div>

        {preview && (
          <div className="mt-6 rounded-xl border border-purple-500/30 bg-purple-950/20 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white">{preview.title}</h4>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                  {preview.location && (
                    <span className="flex items-center gap-1">
                      📍 {preview.location}
                    </span>
                  )}
                  {preview.department && (
                    <span className="flex items-center gap-1">
                      🏢 {preview.department}
                    </span>
                  )}
                  {preview.employmentType && (
                    <span className="flex items-center gap-1">
                      💼 {preview.employmentType}
                    </span>
                  )}
                </div>
                <a
                  href={preview.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  {preview.sourceUrl}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-600"
              >
                Clear
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-slate-700 bg-black/40 p-4">
              <h5 className="mb-2 text-sm font-semibold text-white">Job Description</h5>
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-100/90 leading-relaxed">
                {preview.description}
              </div>
            </div>

            {preview.validation && (
              <div
                className={`mb-4 rounded-lg border p-4 ${preview.validation.is_valid
                  ? "border-emerald-500/30 bg-emerald-950/20"
                  : "border-amber-500/30 bg-amber-950/20"
                  }`}
              >
                <h5 className="mb-2 text-sm font-semibold text-slate-200">Validation</h5>
                {preview.validation.is_valid ? (
                  <p className="text-sm text-emerald-200">✓ Valid job description</p>
                ) : (
                  <div>
                    <p className="mb-2 text-sm text-amber-200">
                      ⚠️ Validation issues detected:
                    </p>
                    <ul className="list-inside list-disc text-xs text-amber-200/80">
                      {preview.validation.reasons?.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                    {preview.validation.suggested_improvements &&
                      preview.validation.suggested_improvements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-amber-200">Suggestions:</p>
                          <ul className="list-inside list-disc text-xs text-amber-200/80">
                            {preview.validation.suggested_improvements.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleApproveJob()}
                disabled={approving || !rootUrl}
                className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {approving ? "Approving…" : "✓ Approve & Enable for Wilma"}
              </button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Upload Job Documents</h3>
        <p className="mt-1 text-sm text-slate-400">
          Upload PDF, DOCX, or TXT files containing job descriptions. Jobs will be automatically
          created and can be enabled in the Open Roles table.
        </p>
        <form
          onSubmit={handleUploadDocuments}
          className="mt-4 flex flex-col gap-4 md:flex-row md:items-end"
        >
          <input type="hidden" name="rootUrl" value={rootUrl} />
          <label className="flex-1 text-sm text-slate-400">
            Select Job (optional - leave blank to create new job)
            <select
              name="jobId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="">Create new job from document</option>
              {jobOptions}
            </select>
          </label>
          <label className="flex-1 text-sm text-slate-400">
            PDF, DOCX, TXT files
            <input
              name="files"
              type="file"
              multiple
              className="mt-1 w-full rounded-lg border border-dashed border-slate-700 bg-slate-950 px-4 py-6 text-sm"
              accept=".pdf,.docx,.txt,.md"
              required
            />
          </label>
          <button
            type="submit"
            disabled={uploading || !rootUrl}
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Open Roles</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Employment</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Wilma</th>
                <th className="px-4 py-2">Attachments</th>
                <th className="px-4 py-2">Updated</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length ? (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className={`border-t border-slate-800 ${!job.wilmaEnabled && job.status === "open"
                      ? "bg-purple-950/10"
                      : ""
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{job.title}</div>
                      <div className="text-xs text-slate-500">
                        Source: {job.jobSource?.label ?? job.jobSource?.type ?? "—"}
                      </div>
                      {!job.wilmaEnabled && job.status === "open" && (
                        <div className="mt-1 text-xs text-purple-400">
                          ⚠️ Not enabled for Wilma
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{job.location || "—"}</td>
                    <td className="px-4 py-3">{job.employmentType || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleJobStatus(job, "open")}
                          className={`rounded-full px-3 py-1 text-xs transition ${job.status === "open"
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "border border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
                            }`}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleJobStatus(job, "closed")}
                          className={`rounded-full px-3 py-1 text-xs transition ${job.status === "closed"
                            ? "bg-rose-500/20 text-rose-200"
                            : "border border-slate-700 text-slate-300 hover:border-rose-400 hover:text-rose-200"
                            }`}
                        >
                          Closed
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <label
                        className={`inline-flex items-center gap-2 text-xs ${job.wilmaEnabled
                          ? "text-purple-200 font-medium"
                          : job.status === "closed"
                            ? "text-slate-500 cursor-not-allowed"
                            : "text-slate-300 cursor-pointer hover:text-purple-200"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={job.wilmaEnabled}
                          onChange={(event) =>
                            void toggleWilmaEnabled(job, event.target.checked)
                          }
                          disabled={job.status === "closed"}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-400 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span>{job.wilmaEnabled ? "Wilma Enabled" : "Enable Wilma"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">{job._count.attachments}</td>
                    <td className="px-4 py-3">{formatDate(job.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingJob(job)}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                        >
                          View Desc
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteJob(job)}
                          className="rounded-lg border border-rose-500/60 px-3 py-1 text-xs text-rose-200 hover:border-rose-400 hover:text-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={8}>
                    No jobs found. Add jobs via URL or upload documents to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold">Job Documents</h3>
        <p className="mt-1 text-sm text-slate-400">
          Uploaded or ingested documents associated with open roles.
        </p>
        <div className="mt-4 space-y-3">
          {documents.length ? (
            documents.map((attachment) => {
              const displayName =
                (attachment.metadata?.originalName as string | undefined) ??
                (attachment.document.metadata?.originalName as string | undefined) ??
                "Document";
              return (
                <div
                  key={attachment.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{displayName}</p>
                    <p className="text-xs text-slate-400">
                      Linked Job: {attachment.job?.title ?? "Unassigned"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded {formatDate(attachment.document.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteDocument(attachment.id)}
                    className="rounded-lg border border-rose-500/60 px-3 py-1 text-xs text-rose-200 hover:border-rose-400 hover:text-rose-100"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">
              No job documents yet. Upload supporting material to enrich Wilma&apos;s responses.
            </p>
          )}
        </div>
      </section>

      {/* View Job Description Modal */}
      <Modal
        open={!!viewingJob}
        title={viewingJob?.title || "Job Description"}
        onClose={() => setViewingJob(null)}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {viewingJob?.location && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span>📍</span>
                <span>{viewingJob.location}</span>
              </div>
            )}
            {viewingJob?.department && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span>🏢</span>
                <span>{viewingJob.department}</span>
              </div>
            )}
            {viewingJob?.employmentType && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span>💼</span>
                <span>{viewingJob.employmentType}</span>
              </div>
            )}
            {viewingJob?.jobSource?.url && (
              <a
                href={viewingJob.jobSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <span>🔗</span>
                <span>View Source</span>
              </a>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Description</h4>
            {viewingJob?.description ? (
              <div className="text-sm text-slate-800 leading-relaxed space-y-4">
                {viewingJob.description.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No description available for this job.</p>
            )}
          </div>
        </div>
      </Modal>

      {status && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 px-4 py-3 text-sm text-purple-200">
          {status}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
