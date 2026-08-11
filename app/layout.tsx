import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Bricolage_Grotesque({
  variable: "--font-brand-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "TestMyPrompt - Prompt Security Testing for LLM Apps",
    template: "%s | TestMyPrompt",
  },
  description:
    "Test AI prompts for injection, jailbreak, data leakage, bias, and hallucination risks before production.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "TestMyPrompt - Prompt Security Testing for LLM Apps",
    description:
      "Find prompt vulnerabilities fast with category-level findings and practical remediation guidance.",
    url: "/",
    siteName: "TestMyPrompt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TestMyPrompt - Prompt Security Testing for LLM Apps",
    description:
      "Prompt injection, jailbreak, data leakage, and hallucination risk testing for production LLM teams.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
