# Prompt — Research (Phase 1)

You are researching one Atomic Notes blog topic. Load `SOURCE-OF-TRUTH.md` and
`STYLE-RULES.md` first.

## Do
- Run at least 5 searches across distinct angles:
  1. The technical concept (local-first, E2E encryption, CRDT/sync, Flutter, Supabase, etc.)
     from primary/authoritative sources.
  2. Current stats or context (2024-2026 only), cross-checked against ≥2 independent sources.
  3. Practitioner sentiment (dev communities) — the gap between marketing and real experience.
  4. Competitor/alternative behavior where relevant (how other notes apps handle the same thing).
  5. A reality-check search for counter-arguments or failure modes.
- For Atomic-Notes-specific facts, do NOT rely on the web — read the current code + the
  Context docs (see `SOURCE-OF-TRUTH.md`). The repo is the truth for our own product.

## Output (save to generated/<slug>/sources.md)
- A ranked one-line hook for the piece (the specific angle, not the topic).
- 5-8 sources: name, URL, year, and the exact claim you'd cite from each.
- A "shipped vs planned" note for any Atomic Notes feature the piece will mention, verified
  against the code.
- Any data conflicts found (state them; do not silently pick one).

## Never
- Never invent a source, stat, or URL. Fewer real facts beat any fabricated one.
- Never claim a planned Atomic Notes feature is shipped.
- Wait for confirmation of the topic/angle before writing the outline.
