"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackButton({ label = "Back", href, className }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (href) {
      router.push(href);
      return;
    }
    router.back();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleClick}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
