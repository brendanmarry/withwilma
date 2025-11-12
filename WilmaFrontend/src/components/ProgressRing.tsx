import { cn } from "@/lib/utils"

interface ProgressRingProps {
  children?: React.ReactNode
  progress: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({
  children,
  progress,
  size = 180,
  strokeWidth = 10,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("text-purple-500 transition-all", progress >= 99 && "text-emerald-500")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      {children}
    </div>
  )
}

