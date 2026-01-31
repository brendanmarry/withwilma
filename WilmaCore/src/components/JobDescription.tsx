import { Job } from "@/lib/types";

interface JobDescriptionProps {
  job: Job;
}

const SectionTitle = ({ children }: { children: string }) => (
  <h3 className="text-base font-semibold text-slate-900">{children}</h3>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 pl-5">
    {items.map((item, index) => (
      <li key={index} className="list-disc text-sm leading-relaxed text-slate-700">
        {item}
      </li>
    ))}
  </ul>
);

export function JobDescription({ job }: JobDescriptionProps) {
  const normalised = job.normalizedJson ?? undefined;
  const hasStructured =
    !!normalised?.summary ||
    (normalised?.responsibilities?.length ?? 0) > 0 ||
    (normalised?.requirements?.length ?? 0) > 0 ||
    (normalised?.nice_to_have?.length ?? 0) > 0;

  const fallbackText =
    normalised?.clean_text?.trim() || job.description || normalised?.summary || "";

  return (
    <div className="space-y-6 text-sm leading-relaxed text-slate-700">
      <div className="space-y-2">
        <SectionTitle>About the role</SectionTitle>
        <p className="whitespace-pre-wrap text-slate-700">
          {(normalised?.summary ?? job.description ?? "").trim() || "Details coming soon."}
        </p>
      </div>

      {normalised?.responsibilities && normalised.responsibilities.length > 0 ? (
        <div className="space-y-2">
          <SectionTitle>Responsibilities</SectionTitle>
          <BulletList items={normalised.responsibilities} />
        </div>
      ) : null}

      {normalised?.requirements && normalised.requirements.length > 0 ? (
        <div className="space-y-2">
          <SectionTitle>Requirements</SectionTitle>
          <BulletList items={normalised.requirements} />
        </div>
      ) : null}

      {normalised?.nice_to_have && normalised.nice_to_have.length > 0 ? (
        <div className="space-y-2">
          <SectionTitle>Nice to have</SectionTitle>
          <BulletList items={normalised.nice_to_have} />
        </div>
      ) : null}

      {normalised?.company_values_alignment ? (
        <div className="space-y-2">
          <SectionTitle>Values Alignment</SectionTitle>
          <p className="whitespace-pre-wrap text-slate-700">
            {normalised.company_values_alignment}
          </p>
        </div>
      ) : null}

      <div className="space-y-2 rounded-xl bg-white/60 p-4 ring-1 ring-slate-200">
        <SectionTitle>Full description</SectionTitle>
        <div className="whitespace-pre-wrap text-slate-700">{fallbackText}</div>
      </div>

      <div className="grid gap-3 rounded-xl bg-slate-100 p-4 text-xs text-slate-600 sm:grid-cols-2">
        {job.location ? (
          <div>
            <span className="font-semibold text-slate-800">Location:</span> {job.location}
          </div>
        ) : null}
        {job.employmentType ? (
          <div>
            <span className="font-semibold text-slate-800">Employment type:</span>{" "}
            {job.employmentType}
          </div>
        ) : null}
        {normalised?.seniority_level ? (
          <div>
            <span className="font-semibold text-slate-800">Seniority level:</span>{" "}
            {normalised.seniority_level}
          </div>
        ) : null}
        {job.sourceUrl ? (
          <div className="truncate">
            <span className="font-semibold text-slate-800">Source:</span>{" "}
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 underline"
            >
              {job.sourceUrl}
            </a>
          </div>
        ) : null}
      </div>

      {!hasStructured && fallbackText ? (
        <p className="text-xs text-slate-500">
          (Shown from the original document while structured fields generate.)
        </p>
      ) : null}
    </div>
  );
}
