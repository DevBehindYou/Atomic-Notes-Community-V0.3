# Atomic Blog Generation Pipeline

A developer/content tool for producing accurate, engaging, SEO-ready articles for the
**Atomic Notes** website. It is **separate from the Atomic Notes app runtime**. It never
touches users' notes, and it adds **no** AI/analytics/tracking dependency to the app.

Adapted from the DevBehindYou / TheFirstRanker blog builders (8-phase markdown/SOP flow,
strict humanizer + zero-hallucination rules), retuned for Atomic Notes' privacy-first,
local-first positioning where **accuracy beats marketing** and **shipped is never
confused with planned**.

## What it produces

Markdown articles with validated frontmatter, ready to drop into the Atomic Notes website
blog (`Atomic-Community-Base` → `/blog`). Each article lives in its own folder under
`generated/` → `reviewed/`, then is published into the website's `content/blog/`.

## Folder structure

```
Atomic-Blog-Generation-Pipeline/
├── README.md                     ← this file
├── SOURCE-OF-TRUTH.md            ← what to trust when writing about Atomic Notes
├── STYLE-RULES.md                ← voice, banned words, formatting, accuracy rules
├── config/
│   ├── site.config.json          ← domain, design tokens, routes, defaults
│   ├── categories.json           ← the fixed category taxonomy
│   └── authors.json              ← author profiles (real; no fabricated bylines)
├── prompts/
│   ├── research.md   outline.md   article.md
│   ├── seo.md        fact-check.md editorial-review.md
├── templates/
│   ├── blog-template.md          release-template.md
│   ├── technical-template.md     announcement-template.md
├── schemas/
│   └── blog.schema.json          ← required frontmatter contract
├── scripts/
│   ├── slug.mjs        ← title -> stable slug
│   ├── metadata.mjs    ← reading time, word count, frontmatter scaffold
│   ├── validate.mjs    ← frontmatter + style + link + accuracy gate
│   └── internal-links.mjs ← suggest internal links across generated posts
├── topics/
│   └── backlog.md      ← the topic queue (starts with the 10 seed topics)
├── drafts/     ← work-in-progress (never published)
├── generated/  ← first drafts out of the pipeline (per-article folder)
├── reviewed/   ← human-approved, ready to publish
├── assets/     ← cover images / inline visuals per article
└── logs/       ← per-run validation + generation logs
```

## The workflow (human-in-loop; nothing auto-publishes)

```
Topic (topics/backlog.md)
  → Research           (prompts/research.md)   → sources collected, dated 2024-2026
  → Outline            (prompts/outline.md)    → metadata block + H2/H3 plan + slug (set once)
  → Draft              (prompts/article.md)    → follows a template in templates/
  → Fact verification  (prompts/fact-check.md) → every stat re-checked; shipped vs planned correct
  → SEO                (prompts/seo.md)         → title/description/OG/keywords/schema
  → Internal linking   (scripts/internal-links.mjs)
  → Metadata           (scripts/metadata.mjs)   → reading time, frontmatter
  → Validate           (scripts/validate.mjs)   → GATE: must pass before review
  → Editorial review   (prompts/editorial-review.md)
  → Human approval     → move generated/<slug>/ to reviewed/<slug>/
  → Publish            → copy <slug>.md into the website content/blog/, commit, deploy
```

## Quick start

```bash
cd Atomic-Blog-Generation-Pipeline
node scripts/slug.mjs "How Atomic Notes Encryption Works"      # -> how-atomic-notes-encryption-works
node scripts/metadata.mjs generated/<slug>/<slug>.md           # reading time + word count
node scripts/validate.mjs generated/<slug>/<slug>.md           # style/frontmatter/link gate
```

Generating an article is an LLM-driven step: feed the prompts in order
(`research → outline → article → fact-check → seo → editorial-review`) along with
`SOURCE-OF-TRUTH.md`, `STYLE-RULES.md`, and the chosen `templates/*`. The scripts are the
deterministic guardrails around that.

## Generating an article (step by step)

1. Pick a topic from `topics/backlog.md` (or add one). Confirm it's worth writing.
2. **Research** with `prompts/research.md`. Save sources into `generated/<slug>/sources.md`.
3. **Outline** with `prompts/outline.md`. Set the `{slug}` now; it never changes after publish.
4. **Draft** with `prompts/article.md` + the right `templates/*` into `generated/<slug>/<slug>.md`.
5. **Fact-check** with `prompts/fact-check.md` — re-verify every claim against `SOURCE-OF-TRUTH.md`.
6. **SEO** with `prompts/seo.md`; fill frontmatter.
7. `node scripts/internal-links.mjs` then `node scripts/metadata.mjs` then `node scripts/validate.mjs`.
8. **Editorial review** with `prompts/editorial-review.md`; a human reads it end to end.
9. On approval, move `generated/<slug>/` → `reviewed/<slug>/`.
10. **Publish** (see below).

## Reviewing an article

A human must read every article before publish. The review checklist is
`prompts/editorial-review.md`. `validate.mjs` must exit 0 first (it enforces the
mechanical rules so the human review focuses on truth, clarity, and usefulness).

## Publishing an article

The website (`Atomic-Community-Base`) reads published posts from `content/blog/*.md`.
To publish:

1. Ensure the article is in `reviewed/<slug>/<slug>.md` and `validate.mjs` passes.
2. Copy `<slug>.md` (and any `assets/`) into `../content/blog/` and `../public/blog/<slug>/`.
   (This tool lives inside `Atomic-Community-Base/`, so the site content is one level up.
   It is excluded from the Vercel deploy via `.vercelignore` and never served.)
3. Set `draft: false` and a real `publishedAt` in the frontmatter.
4. Commit + push the website repo; Vercel builds. The post then appears at
   `/blog/<slug>`, in the sitemap, and in the RSS feed automatically.

**Drafts (`draft: true`) never appear** in `/blog`, the sitemap, or the feed.

## Updating an article

Edit the published `<slug>.md`, bump `updatedAt`, keep the **same slug**. Re-run
`validate.mjs`. Commit + redeploy. `dateModified` in the structured data updates.

## Unpublishing an article

Set `draft: true` (removes it from `/blog`, sitemap, feed) or delete the file. If a
published slug must change, add a redirect in the website's `next.config` first — never
silently break a live URL.

## Slug behavior

`scripts/slug.mjs`: lowercase, hyphen-separated, no dates, no random IDs, stable after
publish. See `SOURCE-OF-TRUTH.md` for the URL conventions.

## SEO / sitemap / RSS behavior

Handled by the website, not this tool: each post renders a unique `<title>`, meta
description, canonical, Open Graph + Twitter cards, and `BlogPosting` JSON-LD; the sitemap
and `feed.xml` include only non-draft posts. This tool's job is to produce correct,
validated frontmatter so the website can do that.

## Image workflow

Cover + inline visuals go in `generated/<slug>/assets/` during drafting, then into the
website's `public/blog/<slug>/` on publish. Every image needs descriptive alt text
(`coverAlt` in frontmatter; inline images carry alt inline). Keep images optimized.

## Validation

`node scripts/validate.mjs <file>` checks: required frontmatter (schema), zero em dashes,
banned words, heading hygiene (no em dash/hyphen in headings), a real internal link, at
least one external source link, and reading-time presence. Non-zero exit = do not publish.

## Troubleshooting

- **validate fails on frontmatter:** compare against `schemas/blog.schema.json`.
- **em dash / banned word hits:** rewrite the sentence (see `STYLE-RULES.md`); do not just
  swap the token.
- **article contradicts the app:** the app's current source code wins — fix the article
  (`SOURCE-OF-TRUTH.md`).

## Non-negotiables

- Never process users' private notes.
- Never claim a planned feature is shipped.
- Never fabricate stats, sources, benchmarks, testimonials, or author bylines.
- Never add analytics/tracking to the Atomic Notes app as part of blog work.
