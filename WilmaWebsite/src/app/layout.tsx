import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Wilma | AI-Powered Recruitment Platform",
    template: "%s | Wilma",
  },
  description:
    "Wilma is the AI recruitment co-pilot that delivers intelligent interviews, candidate scoring, and recruiter insights in one powerful platform.",
  keywords: [
    "AI recruitment",
    "AI interviews",
    "candidate scoring",
    "talent acquisition",
    "recruiting software",
  ],
  openGraph: {
    title: "Wilma | AI-Powered Recruitment Platform",
    description:
      "Deliver unforgettable candidate experiences with AI-driven interviews, scoring, and recruiter intelligence.",
    type: "website",
    url: "https://wilma.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wilma | AI-Powered Recruitment Platform",
    description:
      "Unlock faster, smarter hiring with AI-driven interviews, candidate scoring, and recruiter intelligence.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-slate-50 text-slate-900">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
