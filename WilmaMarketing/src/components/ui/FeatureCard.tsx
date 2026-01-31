import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  highlight?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  highlight = false,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        highlight && "border-brand-200 bg-brand-500/5",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-base text-slate-600">{description}</p>
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent opacity-0 transition-opacity duration-300 group-hover:border-brand-400/40 group-hover:opacity-100" />
    </div>
  );
}
