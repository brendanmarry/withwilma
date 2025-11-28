import { FadeIn } from "@/components/animations/FadeIn";

const logos = [
  { name: "Acme Ventures", alt: "Acme Ventures logo" },
  { name: "Elevate HR", alt: "Elevate HR logo" },
  { name: "Northwind Labs", alt: "Northwind Labs logo" },
  { name: "Aurora Capital", alt: "Aurora Capital logo" },
  { name: "Summit Talent", alt: "Summit Talent logo" },
  { name: "Atlas Robotics", alt: "Atlas Robotics logo" },
];

export function LogoCloud() {
  return (
    <FadeIn className="grid grid-cols-2 gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg shadow-brand-500/10 backdrop-blur sm:grid-cols-3 md:grid-cols-6">
      {logos.map((logo) => (
        <div
          key={logo.name}
          className="flex h-16 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-400 shadow-sm"
        >
          {logo.name}
        </div>
      ))}
    </FadeIn>
  );
}
