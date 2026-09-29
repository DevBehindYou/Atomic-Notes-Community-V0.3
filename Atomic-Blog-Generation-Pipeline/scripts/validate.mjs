#!/usr/bin/env node
// Publish gate: frontmatter + style + link checks. Non-zero exit = do not publish.
// Usage: node scripts/validate.mjs generated/<slug>/<slug>.md
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { splitFrontmatter } from "./metadata.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(resolve(__dir, "../schemas/blog.schema.json"), "utf8"));

const BANNED = [
  "robust", "essential", "seamless", "seamlessly", "crucial", "leverage", "realm",
  "delve", "unleash", "supercharge", "game-changer", "game changer", "cutting-edge",
  "state-of-the-art", "revolutionary", "in today's", "ever-evolving", "fast-paced",
  "when it comes to", "at the end of the day", "it's worth noting", "needless to say",
  "look no further", "tapestry", "testament", "moreover", "furthermore",
];

// Very small YAML-ish frontmatter parser (key: value, [arrays], booleans).
function parseFrontmatter(fm) {
  const obj = {};
  for (const line of fm.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else if (val === "true" || val === "false") {
      val = val === "true";
    } else {
      val = val.replace(/^["']|["']$/g, "");
    }
    obj[key] = val;
  }
  return obj;
}

function fail(errors, msg) { errors.push(msg); }

const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/validate.mjs <file.md>"); process.exit(1); }

const raw = readFileSync(file, "utf8");
const { frontmatter, body } = splitFrontmatter(raw);
const errors = [];
const warnings = [];

// --- frontmatter ---
if (!frontmatter) fail(errors, "Missing frontmatter block.");
const fm = parseFrontmatter(frontmatter);
for (const req of schema.required) {
  const v = fm[req];
  if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
    fail(errors, `Frontmatter missing/empty: ${req}`);
  }
}
if (fm.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.slug)) fail(errors, `Bad slug: ${fm.slug}`);
if (fm.category && !schema.properties.category.enum.includes(fm.category)) {
  fail(errors, `Unknown category: ${fm.category}`);
}
if (fm.canonical && !/^https?:\/\//.test(fm.canonical)) fail(errors, "canonical must be an absolute URL.");
if (typeof fm.description === "string" && (fm.description.length < 80 || fm.description.length > 170)) {
  warnings.push(`description length ${fm.description.length} (aim 140-160).`);
}
if (fm.title && fm.title.length > 60) warnings.push(`title ${fm.title.length} chars (aim <=60).`);

// --- style ---
const emDashes = (body.match(/—/g) || []).length;
if (emDashes > 0) fail(errors, `${emDashes} em dash(es) found — replace with . , : or ().`);

const proseNoCode = body.replace(/```[\s\S]*?```/g, "");
const semis = (proseNoCode.match(/;/g) || []).length;
if (semis > 0) warnings.push(`${semis} semicolon(s) in prose (allowed only in code / TL;DR).`);

const lowerBody = body.toLowerCase();
for (const w of BANNED) {
  if (lowerBody.includes(w)) fail(errors, `Banned word/phrase: "${w}" — rewrite the sentence.`);
}

// headings: no em dash or hyphen used as a dash
for (const line of body.split("\n")) {
  if (/^#{1,6}\s/.test(line)) {
    if (line.includes("—")) fail(errors, `Heading has an em dash: ${line.trim()}`);
    if (/\s-\s/.test(line)) fail(errors, `Heading uses a hyphen as a dash: ${line.trim()}`);
  }
}

// links
const links = [...body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);
const external = links.filter((u) => /^https?:\/\//.test(u));
const internal = links.filter((u) => u.startsWith("/") || u.startsWith("./") || u.startsWith("../"));
if (external.length < 1) fail(errors, "No external source link found (need named, dated sources).");
if (internal.length < 1) warnings.push("No internal link — add at least one to another /blog post or site page.");

// --- report ---
console.log(`Validating: ${file}`);
if (warnings.length) {
  console.log("\nWARNINGS:");
  for (const w of warnings) console.log("  ! " + w);
}
if (errors.length) {
  console.log("\nERRORS:");
  for (const e of errors) console.log("  ✗ " + e);
  console.log(`\nFAILED (${errors.length} error(s)). Do not publish.`);
  process.exit(1);
}
console.log("\nPASSED. Frontmatter + style checks clean.");
