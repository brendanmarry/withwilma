import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  className?: string;
}

export function StatCard({ label, value, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/40 bg-white/80 p-8 shadow-lg shadow-brand-500/5 backdrop-blur",
        "transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <div className="text-4xl font-semibold text-slate-900 md:text-5xl">{value}</div>
      <p className="mt-3 text-base font-medium text-brand-500">{label}</p>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
    </div>
  );
}
