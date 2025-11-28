import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const candidateInclude = {
  job: true,
  followups: {
    include: {
      videos: true,
    },
  },
  videos: {
    include: {
      followupQuestion: true,
    },
  },
} as const;

const CandidateDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  let candidate = await prisma.candidate.findUnique({
    where: { id },
    include: candidateInclude,
  });
  if (!candidate) {
    notFound();
  }

  if (!candidate.reviewedAt) {
    candidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { reviewedAt: new Date() },
      include: candidateInclude,
    });
  }

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return null;
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return date.toISOString();
    }
  };

  const appliedOn = formatDateTime(candidate.createdAt);
  const reviewedOn = formatDateTime(candidate.reviewedAt ?? null);

  return (
    <div className="space-y-6">
      <section className="panel p-6 text-sm text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">{candidate.name}</h2>
        <p className="text-slate-600">{candidate.email}</p>
        {candidate.linkedin && (
          <a
            href={candidate.linkedin}
            className="text-[var(--brand-primary)] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn profile
          </a>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">
            Match Score:{" "}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              candidate.matchScore === null || candidate.matchScore === undefined
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
          {candidate.originalMatchScore !== null && candidate.updatedMatchScore !== null && candidate.originalMatchScore !== candidate.updatedMatchScore && (
            <>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">
                Original: <span className="text-slate-700">{candidate.originalMatchScore}</span>
              </span>
              <span className="text-xs text-slate-500">→</span>
              <span className="text-xs text-slate-500">
                Updated: <span className="text-slate-900 font-semibold">{candidate.updatedMatchScore}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  (candidate.updatedMatchScore - candidate.originalMatchScore) > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {candidate.updatedMatchScore > candidate.originalMatchScore ? "+" : ""}
                {candidate.updatedMatchScore - candidate.originalMatchScore}
              </span>
            </>
          )}
          <span className="text-xs text-slate-500">· Applied for {candidate.job.title}</span>
        </div>
        {candidate.aiGeneratedDetected && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <span className="text-amber-600">⚠️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-900">AI-Generated Content Detected</p>
                <p className="mt-1 text-xs text-amber-700">
                  One or more video responses show indicators of AI-generated or synthetic content. Please review manually.
                </p>
              </div>
            </div>
          </div>
        )}
        {candidate.cvUrl && (
          <a
            href={`/api/candidates/${candidate.id}/cv`}
            className="mt-2 inline-block text-xs text-[var(--brand-primary)] underline"
            target="_blank"
            rel="noreferrer"
          >
            View CV
          </a>
        )}
      </section>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {appliedOn && (
            <span>
              Submitted <span className="font-medium text-slate-700">{appliedOn}</span>
            </span>
          )}
          <span>·</span>
          {reviewedOn ? (
            <span>
              Reviewed <span className="font-medium text-slate-700">{reviewedOn}</span>
            </span>
          ) : (
            <span className="font-semibold text-emerald-600">New candidate</span>
          )}
        </div>

        {candidate.matchScore !== null && candidate.matchScore !== undefined && (
        <section className="panel p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Match Score Summary</h3>
          {candidate.matchSummary && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">{candidate.matchSummary}</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {candidate.matchStrengths && Array.isArray(candidate.matchStrengths) && candidate.matchStrengths.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-emerald-700 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {(candidate.matchStrengths as string[]).map((strength, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-600 mt-0.5 text-base">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.matchGaps && Array.isArray(candidate.matchGaps) && candidate.matchGaps.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-rose-700 mb-3">Gaps</h4>
                <ul className="space-y-2">
                  {(candidate.matchGaps as string[]).map((gap, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-rose-600 mt-0.5 text-base">○</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="panel p-6">
        <h3 className="text-base font-semibold text-slate-900">Follow-up Questions</h3>
        <div className="mt-4 space-y-4">
          {candidate.followups.map((item) => {
            const questionVideos = candidate.videos.filter(
              (v) => v.followupQuestionId === item.id,
            );
            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.question}</p>
                    {item.transcript ? (
                      <p className="mt-2 text-sm text-slate-700">{item.transcript}</p>
                    ) : questionVideos.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">Awaiting candidate response</p>
                    ) : null}
                  </div>
                  {questionVideos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--brand-primary)]/10 px-2 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                        {questionVideos.length} video{questionVideos.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
                {questionVideos.map((video) => {
                  const analysis =
                    (video.analysis as Record<string, unknown> | null | undefined) ?? null;
                  const aiDetection = analysis?.aiDetection as
                    | {
                        isAiGenerated?: boolean;
                        confidence?: string;
                        reasoning?: string;
                        indicators?: string[];
                      }
                    | undefined;
                  const keyPoints = Array.isArray(analysis?.keyPoints)
                    ? (analysis?.keyPoints as string[])
                    : [];
                  return (
                    <div key={video.id} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      {video.aiGeneratedDetected || aiDetection?.isAiGenerated ? (
                        <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 text-sm">⚠️</span>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-amber-900">AI-Generated Content Detected</p>
                              {aiDetection?.reasoning && (
                                <p className="mt-1 text-xs text-amber-700">{aiDetection.reasoning}</p>
                              )}
                              {aiDetection?.indicators && aiDetection.indicators.length > 0 && (
                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-700">
                                  {aiDetection.indicators.map((indicator, idx) => (
                                    <li key={idx}>{indicator}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div className="mb-3">
                        <video
                          controls
                          className="w-full rounded-lg bg-black"
                          preload="metadata"
                        >
                          <source src={`/api/candidates/${candidate.id}/videos/${video.id}`} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      {video.transcript && (
                        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
                          <p className="mb-2 text-xs font-semibold text-slate-700">Transcript</p>
                          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{video.transcript}</p>
                        </div>
                      )}
                      {analysis && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                          <p className="font-semibold text-slate-900">Recruiter Summary</p>
                          <p className="mt-1">{analysis.recruiterSummary as string}</p>
                          {keyPoints.length > 0 && (
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {keyPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {candidate.followups.length === 0 && (
            <p className="text-sm text-slate-600">No follow-up questions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CandidateDetailPage;

