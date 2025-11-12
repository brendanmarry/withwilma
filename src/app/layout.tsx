import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wilma — AI Recruitment Assistant",
  description:
    "Meet Wilma, the AI-powered job application companion that guides candidates through every step of the recruitment flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-50 antialiased">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-x-0 top-[-180px] h-[420px] bg-gradient-to-b from-purple-100/80 via-transparent to-transparent" />
          <main className="relative z-10 min-h-screen pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
