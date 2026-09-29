# Prompt — Draft (Phase 3)

Write the full article from the approved outline, into
`generated/<slug>/<slug>.md`, starting from the chosen `templates/*` file. Load
`STYLE-RULES.md` and `SOURCE-OF-TRUTH.md` and follow them exactly.

## Rules
- Follow the outline's H2/H3 order. Fill the frontmatter from the outline metadata.
- Open every H2 with its 25-40w extractable answer block before any detail.
- One source per ~150-200 words, named + linked at the point of use, 2024-2026.
- Include the required human markers (per ~1000w): a first-hand Atomic Notes build anchor,
  a linked data point, an opinion line, an honest limit.
- Bold the primary/secondary keywords on natural occurrences only.
- Real code blocks (fenced, language-tagged) when showing how something works. Prefer real
  snippets/patterns from the Atomic Notes codebase over invented code.
- Insert visual placeholders where a diagram/screenshot belongs:
  `> [Visual N: what it shows and why it belongs here]`
- Reinforce Atomic Notes positioning with a concrete mechanism, never a slogan.

## Hard formatting (validate.mjs will reject otherwise)
- Zero em dashes. No semicolons in prose (except the "TL;DR" label). No em dash/hyphen in headings.
- At least one internal link (to another /blog post or a site page) and enough external
  source links.

## Accuracy
- Label shipped vs planned correctly. If unsure whether a feature shipped, check the code;
  if still unsure, describe it as planned, not live.
- Do not overstate encryption or invent security claims.
