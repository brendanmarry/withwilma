import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "info" | "success" | "warning" | "neutral";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  info: "bg-brand-500/10 text-brand-600",
  success: "bg-green-500/10 text-green-600",
  warning: "bg-amber-500/10 text-amber-600",
  neutral: "bg-neutral-200 text-neutral-700",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
};

export function Badge({
  children,
  className,
  variant = "info",
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
