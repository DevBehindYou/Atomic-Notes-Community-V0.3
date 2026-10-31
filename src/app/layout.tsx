import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DEVELOPER_URL, SITE_URL } from "@/lib/site";
import { FEED_ALTERNATE } from "@/lib/seo";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const DESCRIPTION =
  "Atomic Notes is a private, offline-first Android notes app with Google Drive sync, an optional E2E encrypted vault, and no ads or tracking.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atomic Notes: Offline, E2E Vault & Google Drive Sync",
    template: "%s | Atomic Notes",
  },
  description: DESCRIPTION,
  applicationName: "Atomic Notes",
  authors: [{ name: "Ashutosh Sharma (DevBehindYou)", url: DEVELOPER_URL }],
  creator: "DevBehindYou",
  keywords: [
    "Atomic Notes app",
    "notes app for Android",
    "Google Drive notes sync",
    "encrypted note taking app",
    "notes app without ads",
    "notes app with password",
    "Atomic Notes by DevBehindYou",
  ],
  alternates: {
    canonical: "/",
    types: FEED_ALTERNATE,
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    type: "website",
    siteName: "Atomic Notes",
    url: "/",
    title: "Atomic Notes: Your Notes, Your Drive, Always Yours.",
    description: DESCRIPTION,
    images: [{ url: "/og-banner.png", width: 1200, height: 630, alt: "Atomic Notes, local-first notes for Android" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devbehindyou",
    creator: "@devbehindyou",
    title: "Atomic Notes: Your Notes, Your Drive, Always Yours.",
    description: DESCRIPTION,
    images: ["/og-banner.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F5F1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" className={`${bebas.variable} ${hanken.variable} ${mono.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
