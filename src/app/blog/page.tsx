import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getFeatured } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Development updates, release notes, and technical deep dives on Atomic Notes: local-first, privacy-first notes with optional end-to-end encryption.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Atomic Notes Blog",
    description: "Local-first, privacy-first. Development updates and deep dives.",
    images: ["/og-banner.png"],
    type: "website",
  },
};

function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}


function Card({ p, big = false }: { p: import("@/lib/blog").PostMeta; big?: boolean }) {
  return (
    <Link href={`/blog/${p.slug}`} className={"post-card" + (big ? " post-card-big" : "")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.coverImage} alt={p.coverAlt} loading="lazy" className="post-cover" />
      <div className="post-body">
        <p className="mono-label">
          <span className="sig">{p.category}</span> · {fmtDate(p.publishedAt)} · {p.readingTime}
        </p>
        <h3 className="post-title">{p.title}</h3>
        <p className="post-excerpt">{p.excerpt}</p>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = getFeatured();
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <main>
      <SiteNav current="blog" />
      <section className="wrap" style={{ paddingTop: 42 }}>
        <p className="eyebrow">THE ATOMIC NOTES BLOG</p>
        <h1 style={{ fontSize: "clamp(2.6rem,7vw,4.4rem)" }}>
          Building in the <span className="sig">open.</span>
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Development updates, release notes, and technical deep dives on local-first,
          privacy-first notes. Honest about what ships and what is still planned.
        </p>
      </section>

      {posts.length === 0 && (
        <section className="wrap">
          <div className="module" style={{ marginTop: 24 }}>No posts published yet. Check back soon.</div>
        </section>
      )}

      {featured && (
        <section className="wrap" style={{ paddingTop: 26 }}>
          <p className="mono-label">FEATURED</p>
          <div className="hairline" style={{ margin: "8px 0 16px" }} />
          <Card p={featured} big />
        </section>
      )}

      {rest.length > 0 && (
        <section className="wrap" style={{ paddingTop: 34, paddingBottom: 60 }}>
          <p className="mono-label">LATEST</p>
          <div className="hairline" style={{ margin: "8px 0 16px" }} />
          <div className="post-grid">
            {rest.map((p) => (
              <Card key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
