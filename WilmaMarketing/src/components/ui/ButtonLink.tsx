import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "link" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonLinkProps
  extends Omit<LinkProps, "href">,
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  external?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
  secondary:
    "bg-white text-brand-600 border border-brand-100 hover:border-brand-300",
  ghost:
    "bg-transparent text-brand-600 hover:bg-brand-500/10",
  link: "bg-transparent text-brand-500 hover:text-brand-600 underline-offset-4",
  outline:
    "bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  external = false,
  target,
  rel,
  ...linkProps
}: ButtonLinkProps) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target={target ?? "_self"}
        rel={rel ?? (target === "_blank" ? "noreferrer" : undefined)}
        className={classes}
      >
        {icon && iconPosition === "left" ? icon : null}
        {children}
        {icon && iconPosition === "right" ? icon : null}
      </a>
    );
  }

  return (
    <Link href={href} {...linkProps} target={target} rel={rel} className={classes}>
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </Link>
  );
}
