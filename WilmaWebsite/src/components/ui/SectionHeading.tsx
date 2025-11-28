import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto text-center",
        align === "right" && "ml-auto text-right",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-500">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-lg text-slate-600 md:text-xl">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
