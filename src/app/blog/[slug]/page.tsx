import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../revamp.css";
import { getPost, getAllSlugs, getAllPosts, relatedPosts, type PostMeta } from "@/lib/blog";
import { DEVELOPER_URL, SITE_URL } from "@/lib/site";
import { FEED_ALTERNATE, SITE_NAME, TWITTER_HANDLE } from "@/lib/seo";
import { Dock, Icon, RvFooter } from "@/components/rv/Chrome";
import { BlogWidget } from "@/components/blog/BlogWidget";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

export const dynamicParams = false; // unknown slugs -> 404

const BASE = SITE_URL;

export const viewport: Viewport = {
  themeColor: "#15171B",
};

const AUTHORS: Record<string, { name: string; role: string; url: string }> = {
  "ashutosh-sharma": {
    name: "Ashutosh Sharma",
    role: "Founder & Solo Developer, Atomic Notes",
    url: DEVELOPER_URL,
  },
};

/** Absolute URL on this deployment's origin. Absolute inputs are returned unchanged. */
const absoluteUrl = (p: string) => (/^https?:\/\//i.test(p) ? p : `${BASE}${p.startsWith("/") ? "" : "/"}${p}`);

/**
 * The front matter canonical is kept only when it is on this site's own origin. Posts migrated from
 * another host keep their path but point at the origin this deployment serves, so a domain move only
 * needs NEXT_PUBLIC_SITE_URL changed, never the posts.
 */
function canonicalFor(post: PostMeta): string {
  const fallback = `${BASE}/blog/${post.slug}`;
  if (!post.canonical) return fallback;
  try {
    const u = new URL(post.canonical);
    return u.origin === new URL(BASE).origin ? post.canonical : `${BASE}${u.pathname}`;
  } catch {
    return fallback;
  }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found" };
  const url = `${BASE}/blog/${post.slug}`;
  const image = { url: absoluteUrl(post.coverImage), alt: post.coverAlt };
  const author = AUTHORS[post.author];
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: canonicalFor(post),
      types: FEED_ALTERNATE,
    },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
      title: post.title,
      description: post.description,
      url,
      images: [image],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      section: post.category,
      tags: post.tags,
      authors: author ? [author.url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00Z`);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

const label = (s: string) => s.replace(/[-_]/g, " ");

/** Heading text arrives HTML-escaped from the markdown renderer; React escapes again, so decode first. */
const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const author = AUTHORS[post.author] ?? { name: post.author, role: "", url: BASE };
  const url = `${BASE}/blog/${post.slug}`;
  const related = relatedPosts(post.slug, post.category, post.tags);
  const all = getAllPosts();
  const at = all.findIndex((p) => p.slug === post.slug);
  const newer = at > 0 ? all[at - 1] : null;
  const older = at >= 0 && at < all.length - 1 ? all[at + 1] : null;
  const updated = post.updatedAt && post.updatedAt !== post.publishedAt ? post.updatedAt : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        headline: post.title,
        description: post.description,
        image: absoluteUrl(post.coverImage),
        author: { "@type": "Person", name: author.name, url: author.url },
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        inLanguage: "en-US",
        articleSection: post.category,
        keywords: post.keywords || post.tags.join(", "),
        publisher: {
          "@type": "Organization",
          name: "Atomic Notes",
          url: BASE,
          logo: { "@type": "ImageObject", url: `${BASE}/icon.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="rv">
      <ReadingProgress targetId="article-body" />
      <Dock current="blog" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <main>
        <header className="rv-post-head">
          <div className="rv-stars" aria-hidden="true" />
          <div className="rv-wrap rv-post-head-grid">
            <div style={{ minWidth: 0 }}>
              <nav aria-label="Breadcrumb" className="rv-crumbs">
                <Link href="/blog">Blog</Link>
                <span aria-hidden="true">/</span>
                <span>{label(post.category)}</span>
              </nav>
              <h1 className="rv-post-title">{post.title}</h1>
              <p className="rv-lede" style={{ marginTop: 18 }}>
                {post.description}
              </p>
              <div className="rv-post-meta">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/revamp/mascots/dev-worker.webp" alt="" width={40} height={40} />
                <p>
                  <a href={author.url} rel="author">
                    {author.name}
                  </a>
                  <br />
                  <span className="rv-muted">
                    <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time>
                    {updated && (
                      <>
                        {", updated "}
                        <time dateTime={updated}>{fmtDate(updated)}</time>
                      </>
                    )}
                    {post.readingTime ? `. ${post.readingTime}.` : "."}
                  </span>
                </p>
              </div>
            </div>
            <figure className="rv-post-cover">
              <Image
                src={post.coverImage}
                alt={post.coverAlt}
                width={1200}
                height={630}
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </figure>
          </div>
        </header>

        <div className="rv-wrap rv-post-layout">
          {post.toc.length >= 3 && (
            <aside className="rv-toc-side" aria-label="In this article">
              <details className="rv-toc" open>
                <summary>In this article</summary>
                <ol>
                  {post.toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>{decode(t.text)}</a>
                    </li>
                  ))}
                </ol>
              </details>
            </aside>
          )}

          <article className="rv-article" aria-labelledby="post-title-sr">
            <h2 id="post-title-sr" className="rv-sr">
              {post.title}
            </h2>
            <div className="prose" id="article-body">
              {post.segments.map((s, i) =>
                s.kind === "html" ? <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} /> : <BlogWidget key={i} name={s.name} />
              )}
            </div>

            <footer className="rv-post-foot">
              {post.tags.length > 0 && (
                <ul className="rv-note-tags rv-post-tags" aria-label="Tags">
                  {post.tags.map((t) => (
                    <li key={t}>#{t}</li>
                  ))}
                </ul>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a
                  className="rv-pill"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
                >
                  Share on X
                </a>
                <Link href="/blog" className="rv-pill">
                  All posts
                </Link>
                <a href="/feed.xml" className="rv-pill">
                  RSS
                </a>
              </div>
              {(newer || older) && (
                <nav className="rv-post-pager" aria-label="More posts">
                  {older ? (
                    <Link href={`/blog/${older.slug}`} className="rv-pager-link">
                      <span className="rv-muted">Older</span>
                      <span>{older.title}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {newer && (
                    <Link href={`/blog/${newer.slug}`} className="rv-pager-link rv-pager-next">
                      <span className="rv-muted">Newer</span>
                      <span>{newer.title}</span>
                    </Link>
                  )}
                </nav>
              )}
            </footer>
          </article>
        </div>

        {related.length > 0 && (
          <section className="rv-sec" aria-labelledby="related-title">
            <div className="rv-wrap">
              <h2 id="related-title" className="rv-h2" style={{ fontSize: "clamp(26px, 2.6vw, 36px)" }}>
                Keep reading.
              </h2>
              <ul className="rv-shelf-grid" data-view="grid" style={{ marginTop: 24 }}>
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="rv-note-card">
                      <span className="rv-note-top">
                        <span>Notes / {label(p.category)}</span>
                      </span>
                      <Image
                        className="rv-note-cover"
                        src={p.coverImage}
                        alt={p.coverAlt}
                        width={1200}
                        height={630}
                        sizes="(max-width: 767px) 100vw, 400px"
                      />
                      <span className="rv-note-title">{p.title}</span>
                      <span className="rv-note-excerpt">{p.excerpt || p.description}</span>
                      <span className="rv-note-foot">
                        <span>{fmtDate(p.updatedAt || p.publishedAt)}</span>
                        <span>{p.readingTime}</span>
                      </span>
                      <span className="rv-note-open" aria-hidden="true">
                        <Icon name="arrow" color="#FFFFFF" size={16} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <RvFooter />
    </div>
  );
}
