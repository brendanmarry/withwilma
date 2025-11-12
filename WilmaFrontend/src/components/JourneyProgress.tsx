import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Explore open opportunities" },
  { id: 2, label: "Intro chat with Wilma to learn more" },
  { id: 3, label: "Submit application" },
  { id: 4, label: "Personalised questions" },
  { id: 5, label: "Final application submission" },
];

interface JourneyProgressProps {
  currentStep: number;
  className?: string;
}

export function JourneyProgress({ currentStep, className }: JourneyProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex w-full items-center gap-3" aria-label="Application progress">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          const isLast = index === steps.length - 1;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition",
                  isActive
                    ? "border-purple-600 bg-purple-600 text-white"
                    : isComplete
                      ? "border-purple-300 bg-purple-100 text-purple-700"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {step.id}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium uppercase tracking-wide md:block",
                  isActive
                    ? "text-purple-700"
                    : isComplete
                      ? "text-purple-400"
                      : "text-slate-400",
                )}
              >
                {step.label}
              </span>
              {!isLast ? (
                <div
                  className={cn(
                    "h-[2px] flex-1 rounded-full",
                    isComplete
                      ? "bg-purple-400"
                      : isActive
                        ? "bg-purple-200"
                        : "bg-slate-200",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
