import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wilma - AI-Powered Recruitment Assistant",
  description:
    "Meet Wilma, your intelligent recruitment assistant. Streamline job applications with additional AI-powered candidate questions, scoring, and video responses.",
  keywords: [
    "recruitment",
    "application assistant",
    "AI",
    "hiring",
    "HR",
    "candidate screening",
    "ATS",
  ],
  authors: [{ name: "Wilma Team" }],
  openGraph: {
    title: "Wilma - AI-Powered Recruitment Assistant",
    description: "Streamline hiring with additional AI-powered candidate questions, scoring, and video responses",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
