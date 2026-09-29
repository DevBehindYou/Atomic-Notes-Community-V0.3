# Prompt — SEO (Phase 5)

Optimize the drafted article for search + answer engines without keyword stuffing. Load
`config/site.config.json`.

## Frontmatter to finalize (validated by schema)
- `title` (≤60 chars, primary keyword, compelling not clickbait)
- `description` (140-160 chars, primary keyword, a real promise the article keeps)
- `slug` (unchanged from outline)
- `keywords` (primary + secondaries + top LSI, comma list)
- `category`, `tags`
- `canonical` = {baseUrl}/blog/{slug}
- `coverImage`, `coverAlt` (descriptive alt, not keyword soup)
- `excerpt` (1-2 sentences for the card)

## On-page
- One H1 (the title). Logical H2/H3 hierarchy, no skipped levels.
- At least 2 H2s phrased as real search/AI-prompt questions.
- Primary keyword in the first 100 words, ≥2 H2s, the meta title, and the URL — naturally.
- Descriptive alt text on every image.
- Internal links to related /blog posts and relevant site pages (run internal-links.mjs).
- The structured data is `BlogPosting` (+ `FAQPage` when an FAQ exists) — the website emits
  it from frontmatter; make sure `author`, `publishedAt`, `updatedAt`, `coverImage` are set
  and real.

## Rules
- Never fabricate a publish date, author, or metric to look more authoritative.
- Readability wins over density. No stuffing.
