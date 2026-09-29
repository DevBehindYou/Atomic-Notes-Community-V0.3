#!/usr/bin/env node
// Suggest internal links across generated/reviewed posts by shared tags/keywords.
// Read-only: prints suggestions, never edits files.
// Usage: node scripts/internal-links.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { splitFrontmatter } from "./metadata.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const roots = ["generated", "reviewed"].map((d) => resolve(__dir, "..", d));

function fmValue(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return null;
  let v = m[1].trim();
  if (v.startsWith("[")) return v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  return v.replace(/^["']|["']$/g, "");
}

const posts = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const entry of readdirSync(root)) {
    const dir = join(root, entry);
    if (!statSync(dir).isDirectory()) continue;
    const md = join(dir, `${entry}.md`);
    if (!existsSync(md)) continue;
    const { frontmatter } = splitFrontmatter(readFileSync(md, "utf8"));
    posts.push({
      slug: fmValue(frontmatter, "slug") || entry,
      title: fmValue(frontmatter, "title") || entry,
      category: fmValue(frontmatter, "category") || "",
      tags: fmValue(frontmatter, "tags") || [],
    });
  }
}

if (posts.length < 2) {
  console.log("Fewer than 2 posts found — nothing to cross-link yet.");
  process.exit(0);
}

console.log(`Internal-link suggestions across ${posts.length} posts:\n`);
for (const a of posts) {
  const related = posts
    .filter((b) => b.slug !== a.slug)
    .map((b) => {
      const shared = (Array.isArray(a.tags) ? a.tags : []).filter((t) => (Array.isArray(b.tags) ? b.tags : []).includes(t));
      const score = shared.length + (a.category && a.category === b.category ? 1 : 0);
      return { b, score, shared };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3);
  if (!related.length) continue;
  console.log(`• ${a.slug}`);
  for (const r of related) {
    console.log(`    -> /blog/${r.b.slug}  (${r.b.category === a.category ? "same category" : ""}${r.shared.length ? " tags: " + r.shared.join(", ") : ""})`);
  }
}
