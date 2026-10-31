"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./Chrome";

export type ShelfPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  featured: boolean;
  coverImage: string;
  coverAlt: string;
};

const fmt = (d?: string) => {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00Z`);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};
const label = (s: string) => s.replace(/[-_]/g, " ");

/**
 * The blog as an Atomic Notes home screen: each post is a paper note card, with the app's search,
 * category chips and list/grid switch. Cards link to the existing /blog/<slug> articles.
 */
export function BlogShelf({ posts }: { posts: ShelfPost[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const cats = useMemo(() => ["all", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!q || `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.category}`.toLowerCase().includes(q))
    );
  }, [posts, query, cat]);

  return (
    <div className="rv-shelf">
      <div className="rv-shelf-bar">
        <label className="rv-shelf-search">
          <span className="rv-sr">Search posts</span>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5" fill="none" stroke="#8F88FF" strokeWidth={1.8} strokeLinecap="round" />
          </svg>
          <input type="search" placeholder="Search notes from the build" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="rv-shelf-chips" role="group" aria-label="Category">
          {cats.map((c) => (
            <button key={c} type="button" className="rv-shelf-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c === "all" ? "All" : label(c)}
            </button>
          ))}
        </div>
        <div className="rv-shelf-view" role="group" aria-label="Layout">
          <button type="button" aria-pressed={view === "grid"} aria-label="Grid" onClick={() => setView("grid")}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="none" stroke="currentColor" strokeWidth={1.7} />
            </svg>
          </button>
          <button type="button" aria-pressed={view === "list"} aria-label="List" onClick={() => setView("list")}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <p className="rv-shelf-count" role="status">
        {shown.length} {shown.length === 1 ? "note" : "notes"}
        {query || cat !== "all" ? " match" : " published"}
      </p>

      {shown.length === 0 ? (
        <div className="rv-shelf-empty">
          <p>No posts match that yet.</p>
          <button
            type="button"
            className="rv-pill"
            onClick={() => {
              setQuery("");
              setCat("all");
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="rv-shelf-grid" data-view={view}>
          {shown.map((p, i) => (
            <li key={p.slug} data-featured={p.featured && view === "grid"}>
              <Link href={`/blog/${p.slug}`} className="rv-note-card">
                <span className="rv-note-top">
                  <span>Notes / {label(p.category)}</span>
                  {p.featured && (
                    <span className="rv-note-pin" title="Pinned">
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
                      </svg>
                      Pinned
                    </span>
                  )}
                </span>
                <Image
                  className="rv-note-cover"
                  src={p.coverImage}
                  alt={p.coverAlt}
                  width={1200}
                  height={630}
                  sizes={
                    p.featured && view === "grid"
                      ? "(max-width: 767px) 100vw, 60vw"
                      : view === "list"
                        ? "(max-width: 767px) 100vw, 220px"
                        : "(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 400px"
                  }
                  priority={i === 0}
                />
                <span className="rv-note-title">{p.title}</span>
                <span className="rv-note-excerpt">{p.excerpt}</span>
                {p.tags.length > 0 && (
                  <span className="rv-note-tags">
                    {p.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </span>
                )}
                <span className="rv-note-foot">
                  <span>
                    {p.updatedAt && p.updatedAt !== p.publishedAt ? "Edited" : "Published"} {fmt(p.updatedAt || p.publishedAt)}
                  </span>
                  <span>{p.readingTime}</span>
                </span>
                <span className="rv-note-open" aria-hidden="true">
                  <Icon name="arrow" color="#FFFFFF" size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
