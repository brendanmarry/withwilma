"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface WilmaAvatarProps {
  audioAnalyser?: AnalyserNode | null;
}

export function WilmaAvatar({ audioAnalyser }: WilmaAvatarProps) {
  const [mouthScale, setMouthScale] = useState(1);
  const dataRef = useRef<Uint8Array>();

  useEffect(() => {
    let animationFrame: number;

    const updateMouth = () => {
      if (audioAnalyser) {
        const buffer = dataRef.current ?? new Uint8Array(audioAnalyser.frequencyBinCount);
        audioAnalyser.getByteTimeDomainData(buffer);
        dataRef.current = buffer;
        const avg = buffer.reduce((sum, value) => sum + Math.abs(value - 128), 0) / buffer.length;
        const normalized = Math.min(avg / 40, 1);
        setMouthScale(1 + normalized * 0.8);
      } else {
        setMouthScale(1);
      }
      animationFrame = window.requestAnimationFrame(updateMouth);
    };

    animationFrame = window.requestAnimationFrame(updateMouth);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [audioAnalyser]);

  const mouthTransform = useMemo(() => `scaleY(${mouthScale.toFixed(3)})`, [mouthScale]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-600 to-indigo-500">
      <Image src="/wilma-avatar.svg" alt="Wilma avatar illustration" fill className="object-cover" priority />
      <div
        className="absolute left-1/2 top-[64%] h-12 w-20 -translate-x-1/2 origin-center rounded-full bg-[#F8A8C7]/90 transition-transform duration-100"
        style={{ transform: mouthTransform }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white backdrop-blur">
        Wilma
      </div>
    </div>
  );
}
