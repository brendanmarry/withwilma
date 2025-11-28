import { cn } from "@/lib/utils";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  className?: string;
}

export function StepCard({ step, title, description, className }: StepCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-lg font-semibold text-brand-500">
        {step}
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-4 text-base text-slate-600">{description}</p>
    </div>
  );
}
