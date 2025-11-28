"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "../context/OrganisationContext";

type CandidateListItem = {
  id: string;
  name: string;
  email: string;
  linkedin?: string;
  matchScore?: number;
  matchSummary?: string;
  matchStrengths?: string[];
  matchGaps?: string[];
  createdAt: string;
  reviewedAt: string | null;
  job: {
    id: string;
    title: string;
  };
};

type JobOption = {
  id: string;
  title: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--surface-subtle)] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const CandidatesPage = () => {
  const router = useRouter();
  const { selectedOrganisation, isLoading: contextLoading } = useOrganisation();
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<{
    subject: string;
    body: string;
    schedulingLink: string;
  } | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const schedulingLink = "https://cal.com/you"; // Placeholder calendar link

  const loadJobs = useCallback(async (target: string) => {
    const response = await fetch(`/api/jobs?rootUrl=${encodeURIComponent(target)}`);
    if (response.ok) {
      const data: JobOption[] = await response.json();
      setJobs(data);
    } else {
      setJobs([]);
    }
  }, []);

  const loadCandidates = useCallback(async (target: string, jobId?: string) => {
    const params = new URLSearchParams({ rootUrl: target });
    if (jobId) {
      params.set("jobId", jobId);
    }
    const response = await fetch(`/api/admin/candidates?${params.toString()}`);
    if (response.ok) {
      const body = await response.json();
      setCandidates(body.items);
    } else {
      setCandidates([]);
    }
  }, []);

  // Redirect if no organisation is selected
  useEffect(() => {
    if (!contextLoading && !selectedOrganisation) {
      router.push("/admin");
    }
  }, [selectedOrganisation, contextLoading, router]);

  // Load jobs and candidates when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      void loadJobs(selectedOrganisation.rootUrl);
      void loadCandidates(selectedOrganisation.rootUrl);
      setSelectedJobId(""); // Reset filter when organisation changes
    }
  }, [selectedOrganisation, loadJobs, loadCandidates]);

  // Reload candidates when job filter changes
  useEffect(() => {
    if (selectedOrganisation) {
      void loadCandidates(selectedOrganisation.rootUrl, selectedJobId || undefined);
    }
  }, [selectedJobId, selectedOrganisation, loadCandidates]);

  useEffect(() => {
    if (!selectedOrganisation) return;
    const handleFocus = () => {
      void loadCandidates(selectedOrganisation.rootUrl, selectedJobId || undefined);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus, { passive: true });
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [selectedOrganisation, selectedJobId, loadCandidates]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  const formatDateTime = useCallback(
    (value: string | null | undefined) => {
      if (!value) return null;
      try {
        return dateFormatter.format(new Date(value));
      } catch {
        return value;
      }
    },
    [dateFormatter],
  );

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === scheduleModal || candidate.id === rejectModal),
    [candidates, scheduleModal, rejectModal],
  );

  const generateEmail = async (type: "schedule" | "reject", candidate?: CandidateListItem) => {
    const targetCandidate = candidate || selectedCandidate;
    if (!targetCandidate || !selectedOrganisation) return;
    setLoadingEmail(true);
    try {
      const response = await fetch(`/api/admin/email/${type === "schedule" ? "schedule" : "reject"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          candidateName: targetCandidate.name,
          roleTitle: targetCandidate.job.title,
          companyName: selectedOrganisation.name,
          recruiterName: "Recruiter",
          schedulingLink: type === "schedule" ? schedulingLink : undefined,
        }),
      });
      if (response.ok) {
        const template = await response.json();
        setEmailDraft({
          subject: template.subject,
          body: template.body,
          schedulingLink: type === "schedule" ? schedulingLink : "",
        });
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  const sendEmail = () => {
    if (!selectedCandidate || !emailDraft) return;

    // Create mailto link with subject and body
    const subject = encodeURIComponent(emailDraft.subject);
    const body = encodeURIComponent(emailDraft.body);
    const mailtoLink = `mailto:${selectedCandidate.email}?subject=${subject}&body=${body}`;

    // Open default email client
    window.location.href = mailtoLink;
  };

  const handleScheduleClick = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate || !selectedOrganisation) return;
    
    setScheduleModal(candidateId);
    setRejectModal(null);
    setEmailDraft(null);
    // Auto-generate email when modal opens - pass candidate directly to avoid state timing issues
    setTimeout(() => {
      void generateEmail("schedule", candidate);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {selectedOrganisation && (
        <section className="panel p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Organisation: {selectedOrganisation.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{selectedOrganisation.rootUrl}</p>
          </div>
        </section>
      )}

      <section className="panel p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Candidates</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">
              Filter by Role:
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              >
                <option value="">All Roles</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`rounded-xl border bg-white p-4 transition-shadow ${
                candidate.reviewedAt
                  ? "border-slate-200"
                  : "border-[var(--brand-primary)]/30 shadow-lg shadow-[var(--brand-primary)]/10"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-slate-900">{candidate.name}</h4>
                    {!candidate.reviewedAt && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{candidate.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {formatDateTime(candidate.createdAt) && (
                      <span>
                        Submitted{" "}
                        <span className="font-medium text-slate-700">
                          {formatDateTime(candidate.createdAt)}
                        </span>
                      </span>
                    )}
                    <span>·</span>
                    {candidate.reviewedAt ? (
                      <span>
                        Reviewed{" "}
                        <span className="font-medium text-slate-700">
                          {formatDateTime(candidate.reviewedAt)}
                        </span>
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-600">Awaiting review</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      Role: {candidate.job.title} · Match Score:{" "}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        candidate.matchScore === undefined
                          ? "bg-slate-100 text-slate-600"
                          : candidate.matchScore >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : candidate.matchScore >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {candidate.matchScore ?? "Pending"}
                    </span>
                  </div>
                  {candidate.matchSummary && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {candidate.matchSummary}
                    </p>
                  )}
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-[var(--brand-primary)] hover:underline"
                    >
                      LinkedIn profile
                    </a>
                  )}
                </div>
                <div className="flex gap-2 text-sm">
                  <Link
                    href={`/admin/candidates/${candidate.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setRejectModal(candidate.id);
                      setScheduleModal(null);
                      setEmailDraft(null);
                      // Auto-generate rejection email - pass candidate directly to avoid state timing issues
                      setTimeout(() => {
                        void generateEmail("reject", candidate);
                      }, 100);
                    }}
                    className="rounded-lg bg-rose-500 px-3 py-2 font-medium text-white hover:bg-rose-600"
                  >
                    Send Rejection Email
                  </button>
                  <button
                    onClick={() => void handleScheduleClick(candidate.id)}
                    className="rounded-lg bg-emerald-500 px-3 py-2 font-medium text-white hover:bg-emerald-600"
                  >
                    Schedule Interview Email
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!candidates.length && (
            <p className="text-sm text-slate-600">
              Candidate applications processed by Wilma will appear here.
            </p>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(scheduleModal || rejectModal)}
        title={
          scheduleModal
            ? "Schedule Interview Email"
            : rejectModal
              ? "Rejection Email"
              : ""
        }
        onClose={() => {
          setScheduleModal(null);
          setRejectModal(null);
          setEmailDraft(null);
        }}
      >
        {selectedCandidate ? (
          <div className="space-y-4">
            {loadingEmail && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">Generating email template…</p>
              </div>
            )}

            {emailDraft && (
              <div className="rounded-lg border border-slate-200 bg-white">
                {/* Email Header */}
                <div className="border-b border-slate-200 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-600">From:</span>
                      <input
                        type="email"
                        defaultValue="recruiter@company.com"
                        placeholder="your-email@company.com"
                        className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-600">To:</span>
                      <div className="flex-1 rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900">
                        {selectedCandidate.email}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-600">Subject:</span>
                      <input
                        type="text"
                        value={emailDraft.subject}
                        onChange={(e) =>
                          setEmailDraft({ ...emailDraft, subject: e.target.value })
                        }
                        className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-4">
                  <textarea
                    value={emailDraft.body}
                    onChange={(e) =>
                      setEmailDraft({ ...emailDraft, body: e.target.value })
                    }
                    rows={16}
                    className="w-full resize-none rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    placeholder="Email body..."
                  />
                </div>

                {/* Calendar Link Placeholder (for schedule emails) */}
                {scheduleModal && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>📅 Calendar Link:</span>
                      <span className="rounded bg-[var(--brand-primary)]/10 px-2 py-1 text-[var(--brand-primary)]">
                        [Calendar booking link will be inserted here]
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={sendEmail}
                      className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
                    >
                      📧 Send Email
                    </button>
                    {scheduleModal && (
                      <button
                        onClick={() => void generateEmail("schedule", selectedCandidate || undefined)}
                        className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      >
                        Regenerate
                      </button>
                    )}
                    {rejectModal && (
                      <button
                        onClick={() => void generateEmail("reject", selectedCandidate || undefined)}
                        className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Clicking &quot;Send Email&quot; will open your default email client with this draft.
                  </p>
                </div>
              </div>
            )}

            {!emailDraft && !loadingEmail && (
              <div className="text-center">
                <p className="mb-4 text-sm text-slate-600">
                  {scheduleModal
                    ? `Generating interview email template for ${selectedCandidate?.name}...`
                    : `Generate a rejection email template for ${selectedCandidate?.name} (${selectedCandidate?.job.title})`}
                </p>
                <button
                  onClick={() => void generateEmail(scheduleModal ? "schedule" : "reject", selectedCandidate || undefined)}
                  className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-primary-hover)]"
                >
                  Generate Template
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Select a candidate first.</p>
        )}
      </Modal>
    </div>
  );
};

export default CandidatesPage;

