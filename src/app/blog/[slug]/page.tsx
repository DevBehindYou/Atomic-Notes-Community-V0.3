import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs, relatedPosts, type PostMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamicParams = false; // unknown slugs -> 404

const BASE = SITE_URL;

const AUTHORS: Record<string, { name: string; role: string; url: string }> = {
  "ashutosh-sharma": {
    name: "Ashutosh Sharma",
    role: "Founder & Solo Developer, Atomic Notes",
    url: "https://devbehindyou.vercel.app",
  },
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Not found" };
  const url = `${BASE}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: post.canonical || url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      images: [post.coverImage],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [post.coverImage] },
  };
}

function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const author = AUTHORS[post.author] ?? { name: post.author, role: "", url: BASE };
  const url = `${BASE}/blog/${post.slug}`;
  const related = relatedPosts(post.slug, post.category, post.tags);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${BASE}${post.coverImage}`,
    author: { "@type": "Person", name: author.name, url: author.url },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "Atomic Notes",
      logo: { "@type": "ImageObject", url: `${BASE}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <main>
      <SiteNav current="blog" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="wrap" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 760 }}>
        <Link href="/blog" className="mono-label" style={{ display: "inline-block", marginBottom: 16 }}>
          ← Back to blog
        </Link>
        <p className="mono-label">
          <span className="sig">{post.category}</span> · {fmtDate(post.publishedAt)} · {post.readingTime}
        </p>
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.6rem)", marginTop: 8 }}>{post.title}</h1>
        <p className="lead" style={{ marginTop: 12 }}>{post.description}</p>
        <p className="mono" style={{ fontSize: ".72rem", color: "var(--slate)", marginTop: 10 }}>
          By {author.name}{author.role ? ` · ${author.role}` : ""}
          {post.updatedAt && post.updatedAt !== post.publishedAt ? ` · Updated ${fmtDate(post.updatedAt)}` : ""}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.coverImage} alt={post.coverAlt} className="article-cover" />

        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="hairline" style={{ margin: "34px 0 14px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {post.tags.map((t) => (
            <span key={t} className="mono-label" style={{ border: "1px solid var(--line)", borderRadius: 20, padding: "4px 12px" }}>
              {t}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          <a className="btn-ghost" target="_blank" rel="noreferrer"
             href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}>
            Share on X
          </a>
          <Link href="/blog" className="btn-ghost">All posts</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="wrap" style={{ paddingBottom: 60 }}>
          <p className="mono-label">RELATED</p>
          <div className="hairline" style={{ margin: "8px 0 16px" }} />
          <div className="post-grid">
            {related.map((p: PostMeta) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.coverImage} alt={p.coverAlt} loading="lazy" className="post-cover" />
                <div className="post-body">
                  <p className="mono-label"><span className="sig">{p.category}</span> · {p.readingTime}</p>
                  <h3 className="post-title">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
