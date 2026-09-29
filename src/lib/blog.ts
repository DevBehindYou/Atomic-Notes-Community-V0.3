import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Blog posts are first-party markdown authored via the Atomic Blog Generation
// Pipeline and committed to content/blog/*.md. Read at build time (SSG).

export type PostMeta = {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  coverImage: string;
  coverAlt: string;
  canonical: string;
  keywords: string;
  readingTime: string;
};

export type Post = PostMeta & { html: string };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function toMeta(data: Record<string, unknown>, fallbackSlug: string): PostMeta {
  const s = (k: string, d = "") => (typeof data[k] === "string" ? (data[k] as string) : d);
  return {
    title: s("title"),
    slug: s("slug", fallbackSlug),
    description: s("description"),
    excerpt: s("excerpt"),
    author: s("author", "ashutosh-sharma"),
    publishedAt: s("publishedAt"),
    updatedAt: s("updatedAt") || undefined,
    category: s("category", "development"),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    featured: data.featured === true,
    draft: data.draft === true,
    coverImage: s("coverImage", "/og-banner.png"),
    coverAlt: s("coverAlt", "Atomic Notes"),
    canonical: s("canonical"),
    keywords: s("keywords"),
    readingTime: s("readingTime", ""),
  };
}

function readAll(): { meta: PostMeta; body: string }[] {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(path.join(BLOG_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return { meta: toMeta(data, f.replace(/\.md$/, "")), body: content };
    });
}

/** Published posts (draft excluded), newest first. */
export function getAllPosts(): PostMeta[] {
  return readAll()
    .map((p) => p.meta)
    .filter((m) => !m.draft && m.slug)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getFeatured(): PostMeta | null {
  const posts = getAllPosts();
  return posts.find((p) => p.featured) ?? posts[0] ?? null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** One published post with rendered HTML, or null. */
export async function getPost(slug: string): Promise<Post | null> {
  const found = readAll().find((p) => p.meta.slug === slug && !p.meta.draft);
  if (!found) return null;
  const html = await marked.parse(found.body);
  return { ...found.meta, html: html as string };
}

export function relatedPosts(slug: string, category: string, tags: string[], limit = 3): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const shared = p.tags.filter((t) => tags.includes(t)).length;
      return { p, score: shared + (p.category === category ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
