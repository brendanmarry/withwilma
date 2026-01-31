"use client";

import { type ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";

interface FadeInProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  asChild?: boolean;
}

export function FadeIn({ children, delay = 0, className, asChild, ...props }: FadeInProps) {
  const Component = asChild ? motion.div : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
