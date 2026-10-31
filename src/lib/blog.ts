import { readdirSync, readFileSync, existsSync, openSync, readSync, closeSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked, Renderer, type Tokens } from "marked";

// Blog posts are first-party markdown authored via the Atomic Blog Generation
// Pipeline and committed to content/blog/*.md. Read at build time (SSG).
//
// Beyond plain markdown, a post may use:
//   :::widget <name>       on its own line, to place an interactive component (see BlogWidget)
//   ![alt](/blog/x.png "Caption")   alone in a paragraph, rendered as a <figure> with a caption
// and raw HTML blocks for callouts and FAQ <details>, which marked passes through.

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

export type Segment = { kind: "html"; html: string } | { kind: "widget"; name: string };
export type TocItem = { id: string; text: string };
export type Post = PostMeta & { html: string; segments: Segment[]; toc: TocItem[] };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const WIDGET_LINE = /^:::widget[ \t]+([a-z0-9-]+)[ \t]*$/gm;

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
    coverAlt: s("coverAlt", "Atomic Notes banner with three phone screens: the encryption vault, the notes grid, and Atomic Energy"),
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

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Pixel size of a local PNG under public/, so figures reserve their space and the page doesn't jump. */
function pngSize(src: string): { w: number; h: number } | null {
  if (!src.startsWith("/") || !src.toLowerCase().endsWith(".png")) return null;
  const file = path.join(PUBLIC_DIR, src);
  if (!existsSync(file)) return null;
  const buf = Buffer.alloc(24);
  const fd = openSync(file, "r");
  try {
    readSync(fd, buf, 0, 24, 0);
  } finally {
    closeSync(fd);
  }
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A markdown renderer for one post: anchored headings, captioned figures, scrollable tables. */
function postRenderer(toc: TocItem[]) {
  const used = new Map<string, number>();
  const md = new Marked();
  md.use({
    renderer: {
      heading(this: Renderer, { tokens, depth, text }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const base = slugify(text) || "section";
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        if (depth === 2) toc.push({ id, text: inner.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`;
      },
      paragraph(this: Renderer, token: Tokens.Paragraph) {
        const only = token.tokens.length === 1 ? token.tokens[0] : null;
        if (only?.type !== "image") return false;
        const img = only as Tokens.Image;
        const size = pngSize(img.href);
        const dims = size ? ` width="${size.w}" height="${size.h}"` : "";
        const caption = img.title ? `<figcaption>${escapeAttr(img.title)}</figcaption>` : "";
        return `<figure class="figure"><img src="${escapeAttr(img.href)}" alt="${escapeAttr(img.text)}"${dims} loading="lazy" decoding="async" />${caption}</figure>\n`;
      },
      table(this: Renderer, token: Tokens.Table) {
        return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  });
  return md;
}

/** Splits a post body into markdown runs and widget slots, rendering each run to HTML. */
async function render(body: string): Promise<{ segments: Segment[]; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const md = postRenderer(toc);
  const segments: Segment[] = [];
  let last = 0;
  for (const m of body.matchAll(WIDGET_LINE)) {
    const chunk = body.slice(last, m.index);
    if (chunk.trim()) segments.push({ kind: "html", html: await md.parse(chunk) });
    segments.push({ kind: "widget", name: m[1] });
    last = (m.index ?? 0) + m[0].length;
  }
  const tail = body.slice(last);
  if (tail.trim()) segments.push({ kind: "html", html: await md.parse(tail) });
  return { segments, toc };
}

/** One published post with rendered HTML, or null. */
export async function getPost(slug: string): Promise<Post | null> {
  const found = readAll().find((p) => p.meta.slug === slug && !p.meta.draft);
  if (!found) return null;
  const { segments, toc } = await render(found.body);
  const html = segments.map((s) => (s.kind === "html" ? s.html : "")).join("");
  return { ...found.meta, html, segments, toc };
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
