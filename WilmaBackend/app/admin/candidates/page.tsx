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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300"
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
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div>
            <h2 className="text-lg font-semibold">Organisation: {selectedOrganisation.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{selectedOrganisation.rootUrl}</p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-white">Candidates</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-400">
              Filter by Role:
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
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
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white">{candidate.name}</h4>
                  <p className="text-sm text-slate-400">{candidate.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Role: {candidate.job.title} · Match Score:{" "}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        candidate.matchScore === undefined
                          ? "bg-slate-700 text-slate-400"
                          : candidate.matchScore >= 70
                            ? "bg-emerald-500/20 text-emerald-300"
                            : candidate.matchScore >= 50
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {candidate.matchScore ?? "Pending"}
                    </span>
                  </div>
                  {candidate.matchSummary && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                      {candidate.matchSummary}
                    </p>
                  )}
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-purple-300 hover:underline"
                    >
                      LinkedIn profile
                    </a>
                  )}
                </div>
                <div className="flex gap-2 text-sm">
                  <Link
                    href={`/admin/candidates/${candidate.id}`}
                    className="rounded-lg bg-slate-800 px-3 py-2 text-slate-100 hover:bg-slate-700"
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
                    className="rounded-lg bg-rose-500 px-3 py-2 text-white hover:bg-rose-400"
                  >
                    Send Rejection Email
                  </button>
                  <button
                    onClick={() => void handleScheduleClick(candidate.id)}
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-400"
                  >
                    Schedule Interview Email
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!candidates.length && (
            <p className="text-sm text-slate-400">
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
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-8 text-center">
                <p className="text-slate-400">Generating email template…</p>
              </div>
            )}

            {emailDraft && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/40">
                {/* Email Header */}
                <div className="border-b border-slate-700 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-400">From:</span>
                      <input
                        type="email"
                        defaultValue="recruiter@company.com"
                        placeholder="your-email@company.com"
                        className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-400">To:</span>
                      <div className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white">
                        {selectedCandidate.email}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-16 shrink-0 text-xs font-medium text-slate-400">Subject:</span>
                      <input
                        type="text"
                        value={emailDraft.subject}
                        onChange={(e) =>
                          setEmailDraft({ ...emailDraft, subject: e.target.value })
                        }
                        className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
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
                    className="w-full resize-none rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Email body..."
                  />
                </div>

                {/* Calendar Link Placeholder (for schedule emails) */}
                {scheduleModal && (
                  <div className="border-t border-slate-700 bg-slate-950/50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>📅 Calendar Link:</span>
                      <span className="rounded bg-purple-500/20 px-2 py-1 text-purple-200">
                        [Calendar booking link will be inserted here]
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-slate-700 p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={sendEmail}
                      className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400"
                    >
                      📧 Send Email
                    </button>
                    {scheduleModal && (
                      <button
                        onClick={() => void generateEmail("schedule", selectedCandidate || undefined)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-purple-400 hover:text-purple-200"
                      >
                        Regenerate
                      </button>
                    )}
                    {rejectModal && (
                      <button
                        onClick={() => void generateEmail("reject", selectedCandidate || undefined)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-purple-400 hover:text-purple-200"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Clicking &quot;Send Email&quot; will open your default email client with this draft.
                  </p>
                </div>
              </div>
            )}

            {!emailDraft && !loadingEmail && (
              <div className="text-center">
                <p className="mb-4 text-sm text-slate-400">
                  {scheduleModal
                    ? `Generating interview email template for ${selectedCandidate?.name}...`
                    : `Generate a rejection email template for ${selectedCandidate?.name} (${selectedCandidate?.job.title})`}
                </p>
                <button
                  onClick={() => void generateEmail(scheduleModal ? "schedule" : "reject", selectedCandidate || undefined)}
                  className="rounded-lg bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-400"
                >
                  Generate Template
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Select a candidate first.</p>
        )}
      </Modal>
    </div>
  );
};

export default CandidatesPage;

