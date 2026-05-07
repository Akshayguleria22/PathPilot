import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Ignore missing css module type declarations for this side-effect import
// TypeScript may error if no "declare module '*.css'" is present in the project types
// @ts-ignore
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import BackendWake from "@/components/BackendWake";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathPilot - Your Academic Success Platform",
  description:
    "Track courses, manage habits, and achieve academic excellence with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <div className="bg-orbs" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <BackendWake />
          <ToastProvider />
          <Navbar />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
