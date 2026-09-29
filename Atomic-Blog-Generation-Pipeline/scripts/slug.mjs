#!/usr/bin/env node
// Title -> stable, SEO-friendly slug. Lowercase, hyphenated, no dates, no random IDs.
// Usage: node scripts/slug.mjs "How Atomic Notes Encryption Works"
import path from "node:path";
import { fileURLToPath } from "node:url";

export function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/['".,:;!?()[\]{}]/g, "") // drop punctuation
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-") // non-alnum -> hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .replace(/-{2,}/g, "-"); // collapse
}

// Run directly?
if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const title = process.argv.slice(2).join(" ");
  if (!title) {
    console.error('Usage: node scripts/slug.mjs "Article Title"');
    process.exit(1);
  }
  console.log(slugify(title));
}
