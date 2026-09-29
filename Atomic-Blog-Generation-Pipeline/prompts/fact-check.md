# Prompt — Fact + claim verification (Phase 4)

Before SEO and review, verify every claim. This is the accuracy gate. Load
`SOURCE-OF-TRUTH.md`.

## External facts
- Re-read every citation. The source must be real, the claim must match the source, and the
  URL must have actually been retrieved (not constructed). Delete anything that fails.
- Every stat dated 2024-2026, named source, linked at point of use.
- Reconcile any conflicting numbers rather than silently choosing one.

## Atomic Notes facts (check against current code, not memory or old docs)
- For each product claim, confirm shipped vs planned per `SOURCE-OF-TRUTH.md`. Fix any that
  describe a planned feature as live.
- Verify constants: note limit 20, energy cap 120, +20/24h, 1 coin = 40, sync 5/10,
  AES-256-GCM + Argon2id, 6-word phrase. Correct any drift.
- Security wording: encryption is opt-in; T2T is plaintext by design; lost phrase =
  unrecoverable. No invented audits/certifications/CVEs.

## Output
- A short `generated/<slug>/factcheck.md`: each claim → verdict (verified / fixed / cut) →
  source. If any claim can't be verified, it must be cut or rewritten, not softened.
