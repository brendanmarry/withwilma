import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  background?: "default" | "gray" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const Section = ({
  children,
  className,
  containerSize = "xl",
  background = "default",
  padding = "lg",
}: SectionProps) => {
  const backgroundClasses = {
    default: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-b from-white to-gray-50",
  };

  const paddingClasses = {
    none: "",
    sm: "py-8",
    md: "py-12",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
  };

  return (
    <section
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
};

export default Section;

