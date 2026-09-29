# Prompt — Editorial review (Phase 7, human-in-loop)

Final human read before publish. `scripts/validate.mjs` must already exit 0 (it handles the
mechanical rules) so this review focuses on truth, clarity, and usefulness.

## Checklist
- [ ] Accurate: every Atomic Notes claim matches the current code; shipped vs planned is
      correct; no overstated security or invented metrics.
- [ ] Useful: a real developer/privacy-minded reader learns something concrete, not filler.
- [ ] Stance: the piece takes a clear, defensible position and backs it with a mechanism.
- [ ] First-hand: at least one genuine build anchor (a real decision/tradeoff/bug).
- [ ] Sources: every stat named + linked, 2024-2026, real.
- [ ] Voice: terse, active, no banned words, no em dashes, burstiness present.
- [ ] Structure: Key Takeaway, tight intro, extractable H2 answer blocks, FAQ, conclusion.
- [ ] SEO: title/description/canonical/OG/keywords/schema set; internal + external links present.
- [ ] Images: cover + inline have descriptive alt; visuals placed where planned.
- [ ] Design: reads as part of Atomic Notes (Technical Editorial), not a generic blog.
- [ ] Frontmatter complete and valid; `draft: true` until approved.

## Decision
- Approve → set the real `publishedAt`, `draft: false`, move `generated/<slug>/` to
  `reviewed/<slug>/`, then publish per README.
- Reject → note the specific failures; send back to the relevant phase. Do not publish
  unreviewed content.
