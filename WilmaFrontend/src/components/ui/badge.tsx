import * as React from "react"

import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "success" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants: Record<typeof variant, string> = {
    default: "bg-blue-100 text-blue-700",
    outline: "border border-blue-200 text-blue-600",
    success: "bg-emerald-100 text-emerald-700",
  } as const

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }

