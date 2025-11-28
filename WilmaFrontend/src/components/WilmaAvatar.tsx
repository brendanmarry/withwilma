"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface WilmaAvatarProps {
  audioAnalyser?: AnalyserNode | null;
}

export function WilmaAvatar({ audioAnalyser }: WilmaAvatarProps) {
  const [glowLevel, setGlowLevel] = useState(0);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const updateGlow = () => {
      if (audioAnalyser) {
        let buffer = dataRef.current;
        if (!buffer) {
          buffer = new Uint8Array(audioAnalyser.frequencyBinCount);
          dataRef.current = buffer;
        }
        audioAnalyser.getByteTimeDomainData(buffer as any);
        const avg = buffer.reduce((sum, value) => sum + Math.abs(value - 128), 0) / buffer.length;
        const normalized = Math.min(avg / 45, 1);
        setGlowLevel(normalized);
      } else {
        setGlowLevel(0);
      }
      animationFrame = window.requestAnimationFrame(updateGlow);
    };

    animationFrame = window.requestAnimationFrame(updateGlow);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [audioAnalyser]);

  const glowStyle = useMemo(
    () => ({
      opacity: 0.4 + glowLevel * 0.5,
      transform: `scale(${1 + glowLevel * 0.04})`,
      boxShadow: `0 0 ${28 + glowLevel * 52}px rgba(148, 116, 255, ${0.35 + glowLevel * 0.35})`,
    }),
    [glowLevel],
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#120B27]">
      <div className="absolute inset-0">
        <Image
          src="/wilma-video-presenter.svg"
          alt="Wilma AI assistant"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 m-6 rounded-[34px] bg-purple-500/15 blur-2xl transition-transform duration-100"
        style={glowStyle}
      />
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />
      <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white backdrop-blur">
        Wilma
      </div>
    </div>
  );
}
