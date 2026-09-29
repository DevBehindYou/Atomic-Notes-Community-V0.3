# Prompt — Outline (Phase 2)

Build one outline for the confirmed topic. Use `sources.md`, `SOURCE-OF-TRUTH.md`,
`STYLE-RULES.md`. Pick the `{slug}` now (see `scripts/slug.mjs`) — it never changes after
publish.

## Metadata block (exact order)
- Primary keyword
- Secondary keywords (exactly 2)
- LSI keywords (max 10)
- Meta title (≤60 chars, includes primary keyword)
- 3 alternate titles (different angles; at least one as a question)
- URL: /blog/{slug}
- Meta description (140-160 chars, includes primary keyword)
- Author (from config/authors.json — real only)
- Category (one from config/categories.json)
- Tags (3-6)
- Schema: BlogPosting (+ FAQPage if the piece has an FAQ)
- Cover image idea + alt text
- Technical notes (internal-linking role in the cluster; shipped-vs-planned cautions)

## Body plan
- Key Takeaway block (40-60w, self-contained, one sourced or code-verified fact).
- Intro (<120w) — the angle + thesis.
- 4-6 H2 sections. For each: the 25-40w extractable answer block it will open with, the
  H3s under it, and the exact source or code fact each will cite. At least 2 H2s are real
  questions.
- Conclusion (60-80w).
- FAQ (5-6 real-user questions).

## Rules
- No em dashes or hyphens in any heading.
- Every Atomic-Notes claim tagged shipped/planned per `SOURCE-OF-TRUTH.md`.
- Choose the matching template in `templates/` (blog / technical / release / announcement).
