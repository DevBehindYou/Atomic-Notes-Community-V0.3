import type { Metadata } from "next";

// Shared SEO pieces, ported from the live site's src/lib/seo.ts so titles, cards and feed links match.

export const SITE_NAME = "Atomic Notes";
export const TWITTER_HANDLE = "@devbehindyou";
export const OG_IMAGE = {
  url: "/og-banner.png",
  width: 1200,
  height: 630,
  alt: "Atomic Notes, local-first notes for Android",
};

/** RSS discovery link. Pages that set `alternates` replace the root one, so each includes this. */
export const FEED_ALTERNATE = { "application/rss+xml": [{ url: "/feed.xml", title: "Atomic Notes Blog" }] };

/**
 * Metadata for a standalone page. Next.js replaces (not merges) the root `openGraph` and
 * `twitter` objects when a page sets its own, so every page sets the full card here instead
 * of inheriting the home page's title and URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  socialDescription,
}: {
  title: string;
  description: string;
  path: string;
  socialTitle?: string;
  socialDescription?: string;
}): Metadata {
  const card = socialTitle ?? `${title} | ${SITE_NAME}`;
  const cardDescription = socialDescription ?? description;
  return {
    title,
    description,
    alternates: { canonical: path, types: FEED_ALTERNATE },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: card,
      description: cardDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: card,
      description: cardDescription,
      images: [OG_IMAGE.url],
    },
  };
}
