import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => (
    <label className="space-y-2 text-sm font-medium text-gray-700">
      {label ? <span>{label}</span> : null}
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base shadow-sm transition placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    </label>
  ),
)
Textarea.displayName = "Textarea"

export { Textarea }

