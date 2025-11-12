"use client";

import { useEffect, useState } from "react";

import { VideoCall } from "@/components/VideoCall";
import { cn } from "@/lib/utils";

interface LocalVideoPreviewProps {
  className?: string;
}

export function LocalVideoPreview({ className }: LocalVideoPreviewProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div
        className={cn(
          "flex h-[420px] w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-sm text-slate-500",
          className,
        )}
      >
        Preparing camera…
      </div>
    );
  }

  return <VideoCall className={cn("h-[420px] w-full rounded-3xl shadow-lg", className)} />;
}
