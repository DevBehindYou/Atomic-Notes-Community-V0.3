# Style Rules — Atomic Notes blog

Adapted from the DevBehindYou BlogHumanizer. Applies to every word. The goal: reads like a
real developer wrote it from first-hand experience, is technically credible, and is
truthful about what ships.

## Voice
- E-E-A-T first: show first-hand build experience (a real decision, a bug, a tradeoff), a
  practitioner-level claim with reasoning, named sources, and stakeable accuracy.
- Terse, confident, declarative. Few hedges. Replace "might/could/possibly" with a
  data-backed statement, or cut it.
- Person: "you" for how-to, "I/we" for analysis. Active voice 85%+. Don't drift mid-piece.
- One clear, defensible stance per article. Address the strongest counter-argument once,
  then return to the stance.
- Open on the reader's real scenario or the cost of getting it wrong. First 50 words decide it.

## Accuracy (non-negotiable, stricter than a generic blog)
- Label everything shipped / testing / demo / planned / experimental correctly. Never call
  a planned feature live. See `SOURCE-OF-TRUTH.md`.
- No fabricated stats, benchmarks, testimonials, adoption numbers, or citations.
- Security claims: precise, not marketing. Encryption is opt-in; T2T is plaintext by
  design; a lost recovery phrase is unrecoverable. Say these plainly.
- Sources dated 2024-2026, named, linked at the point of use. If unverifiable, cut it.

## Structure
- **Key Takeaway / TLDR** (40-60 words) after H1, before intro. Self-contained.
- **Intro** under 120 words. Sentence 1 = a strong angle (not "In today's world…"). Thesis
  by sentence 3. End on a transition.
- **Body**: 4-6 H2. Each opens with a 25-40 word extractable answer block, then detail.
  At least 2 H2s phrased as real questions. Paragraphs 2-4 sentences. Each H2 has one
  opinion / "here's what actually works" line and ends with a transition.
- **Conclusion** 60-80 words. No "in conclusion/summary".
- **FAQ** 5-6 questions a person would actually type; answers 40-45 words, self-contained.
- Reading length target 1200-2000 words (shorter is fine for release notes).

## Burstiness
- Vary sentence length within every paragraph: ~30% short (≤8w), 50% medium (9-20w),
  20% long (21-35w). Never 3 similar-length sentences in a row.

## Formatting (hard rules — enforced by validate.mjs)
- **Zero em dashes (—).** Use a period, comma, colon, or parentheses.
- **No semicolons in prose** (keep them in code blocks). One exception: the "TL;DR" label.
- **No em dashes or hyphens in headings.**
- Bullets only for genuinely parallel items/steps/specs. No decorative nesting.
- Real code blocks with language fences. Tables for comparisons. Blockquotes for real quotes.

## Banned words / phrases (rewrite the thought, not the token)
robust, essential, seamless, seamlessly, crucial, leverage, navigate (figurative), realm,
delve, dive in, unlock, unleash, elevate, empower, supercharge, game-changer, cutting-edge,
state-of-the-art, revolutionary, in today's world/landscape, ever-evolving, fast-paced,
"in the world of", "when it comes to", "at the end of the day", "it's worth noting",
"needless to say", "look no further", "the power of", tapestry, testament, "not just X,
it's Y", journey (figurative), moreover, furthermore, "as we all know". Avoid opening FAQ
answers with "Great question" or "It depends".

## Required human markers (per ~1000 words)
- 1 first-hand build anchor (a real decision/bug/tradeoff in Atomic Notes).
- 1 concrete attributed data point (named, linked, 2024-2026).
- 1 opinionated, defensible line.
- 1 honest limit ("what we don't do yet", "where this breaks").

## Keywords
- Primary keyword ~1-2% density, bold on natural occurrences. Secondary ~0.5%. LSI natural,
  bold first use only. Never sacrifice readability for density.

## Atomic Notes positioning to reinforce (truthfully)
local-first, offline-first, privacy-first, data ownership, no ads/trackers/AI-on-your-notes,
opt-in encryption, Flutter + Supabase engineering, building in the open. Do not turn these
into slogans; back each with a concrete mechanism from the code.
