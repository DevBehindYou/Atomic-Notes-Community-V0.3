import type { Metadata } from "next";

// Belt-and-suspenders with the X-Robots-Tag header in next.config: emit a
// <meta name="robots" content="noindex,nofollow"> for the whole /controller
// subtree so the secret panel never lands in a search index.
// The public site's description, keywords, canonical and social cards are cleared here, so this page
// carries nothing that links it to the product pages or invites a share preview.
export const metadata: Metadata = {
  title: { absolute: "Atomic Controller" },
  description: null,
  keywords: null,
  authors: null,
  creator: null,
  applicationName: null,
  alternates: null,
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false, nocache: true },
};

export default function ControllerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
