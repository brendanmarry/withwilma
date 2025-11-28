interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
}

export function TestimonialCard({ quote, author, role, company }: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/90 p-8 shadow-lg shadow-brand-500/10 backdrop-blur">
      <blockquote className="flex-1 text-lg text-slate-700">“{quote}”</blockquote>
      <figcaption className="mt-6 text-sm font-medium text-slate-500">
        <span className="text-base font-semibold text-slate-900">{author}</span>
        <span className="block">{role}</span>
        {company ? <span className="block text-slate-400">{company}</span> : null}
      </figcaption>
    </figure>
  );
}
