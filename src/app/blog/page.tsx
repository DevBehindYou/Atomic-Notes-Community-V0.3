import type { Metadata, Viewport } from "next";
import "../revamp.css";
import { getAllPosts } from "@/lib/blog";
import { Dock, RvFooter } from "@/components/rv/Chrome";
import { BlogShelf, type ShelfPost } from "@/components/rv/BlogShelf";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Development updates, release notes, and technical deep dives on Atomic Notes: local-first, privacy-first notes with optional end-to-end encryption.",
  path: "/blog",
  socialTitle: "Atomic Notes Blog",
});

export const viewport: Viewport = {
  themeColor: "#15171B",
};

export default function BlogIndex() {
  // Featured posts first, then newest first. Articles and their slugs are unchanged.
  const posts: ShelfPost[] = getAllPosts()
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || p.description,
      category: p.category,
      tags: p.tags,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      readingTime: p.readingTime,
      featured: p.featured,
      coverImage: p.coverImage,
      coverAlt: p.coverAlt,
    }));

  // Structured data: the blog and its posts, so search and answer engines can list them.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: "Atomic Notes Blog",
    description:
      "Development updates, release notes, and technical deep dives on Atomic Notes: local-first, privacy-first notes with optional end-to-end encryption.",
    inLanguage: "en-US",
    publisher: { "@type": "Person", name: "Ashutosh Sharma", alternateName: "DevBehindYou" },
    blogPost: getAllPosts().map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt || undefined,
      dateModified: p.updatedAt || p.publishedAt || undefined,
      image: `${SITE_URL}${p.coverImage}`,
    })),
  };

  return (
    <div className="rv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
      <Dock current="blog" />
      <main>
        <section className="rv-blog-hero" aria-labelledby="blog-title">
          <div className="rv-stars" aria-hidden="true" />
          <div className="rv-wrap rv-blog-head">
            <div style={{ minWidth: 0 }}>
              <p className="rv-num">The Atomic Notes blog</p>
              <h1 id="blog-title" className="rv-poster" style={{ fontSize: "clamp(56px, 7vw, 104px)", lineHeight: 0.9 }}>
                Building in the <span className="rv-accent">open.</span>
              </h1>
              <p className="rv-lede" style={{ marginTop: 18 }}>
                Development updates, release notes, and technical deep dives on local-first, privacy-first notes. Honest about
                what ships and what is still planned.
              </p>
            </div>
            <div className="rv-paper-card rv-blog-mascot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/revamp/mascots/tilde-type.webp" alt="Tilde typing into a terminal" width={480} height={480} />
            </div>
          </div>
        </section>

        <section className="rv-sec" aria-label="Posts" style={{ paddingTop: 24 }}>
          <div className="rv-wrap">
            {posts.length === 0 ? (
              <div className="rv-panel" style={{ padding: 24 }}>
                <p className="rv-muted">No posts published yet. Check back soon.</p>
              </div>
            ) : (
              <BlogShelf posts={posts} />
            )}
            <div className="rv-blog-rss">
              <p className="rv-muted" style={{ fontSize: 15 }}>
                New posts land in the RSS feed first.
              </p>
              <a href="/feed.xml" className="rv-pill">
                Follow by RSS
              </a>
            </div>
          </div>
        </section>
      </main>
      <RvFooter />
    </div>
  );
}
