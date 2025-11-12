import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const CandidateDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      followups: true,
      videos: true,
    },
  });
  if (!candidate) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">{candidate.name}</h2>
        <p>{candidate.email}</p>
        {candidate.linkedin && (
          <a
            href={candidate.linkedin}
            className="text-purple-300 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn profile
          </a>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Match Score:{" "}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              candidate.matchScore === null || candidate.matchScore === undefined
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
          <span className="text-xs text-slate-500">· Applied for {candidate.job.title}</span>
        </div>
        {candidate.cvUrl && (
          <a
            href={`/api/candidates/${candidate.id}/cv`}
            className="mt-2 inline-block text-xs text-slate-300 underline"
            target="_blank"
            rel="noreferrer"
          >
            View CV
          </a>
        )}
      </section>

      {candidate.matchScore !== null && candidate.matchScore !== undefined && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Match Score Summary</h3>
          {candidate.matchSummary && (
            <div className="mb-4 rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-300">{candidate.matchSummary}</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {candidate.matchStrengths && Array.isArray(candidate.matchStrengths) && candidate.matchStrengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {(candidate.matchStrengths as string[]).map((strength, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.matchGaps && Array.isArray(candidate.matchGaps) && candidate.matchGaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-rose-300 mb-2">Gaps</h4>
                <ul className="space-y-1">
                  {(candidate.matchGaps as string[]).map((gap, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">○</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-base font-semibold text-white">Follow-up Questions</h3>
        <div className="mt-4 space-y-4">
          {candidate.followups.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">{item.question}</p>
              {item.transcript ? (
                <p className="mt-2 text-sm text-slate-300">{item.transcript}</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Awaiting candidate response</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-base font-semibold text-white">Video Responses</h3>
        <div className="mt-4 space-y-4">
          {candidate.videos.map((video) => {
            const analysis =
              (video.analysis as Record<string, unknown> | null | undefined) ?? null;
            const keyPoints = Array.isArray(analysis?.keyPoints)
              ? (analysis?.keyPoints as string[])
              : [];
            return (
              <div
                key={video.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <a
                  className="text-sm font-semibold text-purple-300 hover:underline"
                  href={video.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Video
                </a>
                <p className="mt-2 text-sm text-slate-200">{video.transcript}</p>
                {analysis && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">Recruiter Summary</p>
                    <p>{analysis.recruiterSummary as string}</p>
                    {keyPoints.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {keyPoints.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!candidate.videos.length && (
            <p className="text-sm text-slate-400">
              Video responses will appear here once the candidate uploads them.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CandidateDetailPage;

