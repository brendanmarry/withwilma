import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

const sizeClassMap: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  size = "xl",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClassMap[size],
        className
      )}
    >
      {children}
    </div>
  );
}
