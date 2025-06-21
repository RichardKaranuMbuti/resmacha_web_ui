// app/layout.tsx

import { AuthProvider } from '@src/context/AuthProvider';
import { ScrapingProvider } from '@src/context/ScrapingContext';
import { MatchingProvider } from '@src/context/MatchingContext';
import "@src/styles/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resmacha - AI-Powered Job Matching That Actually Works",
  description: "Skip the endless scrolling. Upload your resume, set your preferences, and let our AI agents find jobs where you're truly a great fit. Smart reasoning, not just keyword matching.",
  keywords: [
    "AI job search", 
    "intelligent job matching", 
    "resume optimization", 
    "job fit scoring", 
    "automated job hunting", 
    "AI recruitment", 
    "smart career matching",
    "job search automation",
    "AI-powered recruiting",
    "personalized job recommendations"
  ],
  authors: [{ name: "Resmacha Team" }],
  openGraph: {
    title: "Resmacha - AI Job Matching That Goes Beyond Keywords",
    description: "Our AI agents don't just match keywords - they reason like humans to find jobs where you'll actually succeed. Upload your resume and discover your perfect fit.",
    type: "website",
    siteName: "Resmacha",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resmacha - Smart AI Job Matching",
    description: "Stop wasting time on irrelevant job posts. Let AI agents find positions where you're genuinely a great fit.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ScrapingProvider>
            <MatchingProvider>
              {children}
            </MatchingProvider>
          </ScrapingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}