import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: "Golf Handicap Tracker",
  description: "Track your golf rounds and calculate your official USGA handicap index using the World Handicap System. Fast, accurate, and easy to use.",
  keywords: ["golf", "handicap", "USGA", "golf tracker", "handicap calculator"],
  openGraph: {
    title: "Golf Handicap Tracker",
    description: "Track golf rounds and calculate USGA handicap index",
    type: "website",
  },
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
