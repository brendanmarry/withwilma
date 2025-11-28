import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerSize } from "./Container";

type SectionPadding = "none" | "sm" | "md" | "lg" | "xl";
type SectionBackground = "default" | "muted" | "brand" | "gradient";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  containerSize?: ContainerSize;
  id?: string;
  padding?: SectionPadding;
  background?: SectionBackground;
}

const paddingMap: Record<SectionPadding, string> = {
  none: "",
  sm: "py-10 md:py-12",
  md: "py-14 md:py-18",
  lg: "py-20 md:py-24",
  xl: "py-28 md:py-36",
};

const backgroundMap: Record<SectionBackground, string> = {
  default: "bg-white",
  muted: "bg-neutral-100",
  brand: "bg-brand-500 text-white",
  gradient:
    "bg-[linear-gradient(180deg,rgba(244,244,255,0.9)_0%,rgba(232,230,255,0.7)_50%,rgba(244,244,255,0.9)_100%)]",
};

export function Section({
  children,
  className,
  containerClassName,
  containerSize = "xl",
  padding = "lg",
  background = "default",
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative", backgroundMap[background], paddingMap[padding], className)}
    >
      <Container className={containerClassName} size={containerSize}>
        {children}
      </Container>
    </section>
  );
}
