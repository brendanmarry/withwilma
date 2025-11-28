import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

const BaseTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[120px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base shadow-sm transition placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
BaseTextarea.displayName = "BaseTextarea";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, helperText, ...props }, ref) => {
  if (!label) {
    return <BaseTextarea ref={ref} {...props} />;
  }

  return (
    <label className="space-y-2 text-sm font-medium text-gray-700">
      <span>{label}</span>
      <BaseTextarea ref={ref} {...props} />
      {helperText ? <span className="block text-xs font-normal text-gray-500">{helperText}</span> : null}
    </label>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

