#!/usr/bin/env node
// Compute word count + reading time for an article's body (frontmatter excluded).
// Usage: node scripts/metadata.mjs generated/<slug>/<slug>.md
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WPM = 220;

export function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: "", body: raw };
  return { frontmatter: m[1], body: m[2] };
}

export function wordCount(body) {
  const text = body
    .replace(/```[\s\S]*?```/g, " ") // drop code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[[^\]]*\]\([^)]*\)/g, (s) => s.replace(/\]\([^)]*\)/, "")) // keep link text
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

export function readingTime(words) {
  return `${Math.max(1, Math.ceil(words / WPM))} min read`;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/metadata.mjs <file.md>");
    process.exit(1);
  }
  const { body } = splitFrontmatter(readFileSync(file, "utf8"));
  const words = wordCount(body);
  console.log(`words: ${words}`);
  console.log(`readingTime: ${readingTime(words)}`);
}
