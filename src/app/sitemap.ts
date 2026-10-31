import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { RELEASE } from "@/lib/content";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const newest = posts.map((p) => p.lastModified).filter(Boolean).sort().pop();

  return [
    { url: BASE, lastModified: RELEASE.date, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/story`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/updates`, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE}/support-atomic-notes`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...posts,
  ];
}
