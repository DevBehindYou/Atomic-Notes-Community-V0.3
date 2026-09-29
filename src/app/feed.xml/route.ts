import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// Keep the feed static across the Next.js 15 GET-handler cache change.
export const dynamic = "force-static";

const BASE = SITE_URL;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const link = `${BASE}/blog/${p.slug}`;
      const date = new Date(p.publishedAt);
      const pub = isNaN(date.getTime()) ? "" : date.toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${pub ? `<pubDate>${pub}</pubDate>` : ""}
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt || p.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Atomic Notes Blog</title>
    <link>${BASE}/blog</link>
    <description>Development updates, releases, and deep dives on local-first, privacy-first Atomic Notes.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
