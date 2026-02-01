import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, helperText, ...props }, ref) => (
    <label className="space-y-2 text-sm font-medium text-gray-700">
      {label ? <span>{label}</span> : null}
      <div>
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-base shadow-sm transition placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary,#2563eb)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText ? <p className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
      </div>
    </label>
  ),
)
Input.displayName = "Input"

export { Input }

