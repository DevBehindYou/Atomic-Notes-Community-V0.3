# Source of Truth — writing accurately about Atomic Notes

When an article states anything about Atomic Notes itself, trust in this order. If two
sources disagree, the higher one wins and the lower is stale.

```
1. Current source code (Project-Atomic-Notes-New / Project-Atomic-Notes lib/, supabase/)
2. Newest build-progress doc (Context/Atomic_Notes_Build_Progress.md)
3. Current roadmap (Context/Atomic_Notes_Roadmap.md)
4. Current project context (Context/Atomic_Notes_Context.md)
5. Current website (Atomic-Community-Base)
6. Older documentation (may describe superseded architecture — do not resurrect)
```

If older content conflicts with the current implementation, the current implementation
wins. Never reintroduce a superseded system just because an old doc mentions it (e.g. the
old single-base64-blob storage, or a random-wrapped-DEK vault — both replaced).

## Shipped vs planned (verify against code before every article)

Every claim must be labeled honestly. As of the latest build:

**SHIPPED**
- Local-first notes + checklists; instant local save; fully offline capable.
- Per-note cloud sync (opt-in), last-write-wins on server `updated_at`, tombstones.
- Opt-in end-to-end encryption: AES-256-GCM + Argon2id, 6-word recovery phrase, per-user
  salt, server stores only a verifier (cannot read notes). Off by default (T2T plaintext
  path) until the user enables the vault.
- Auth: email + password, in-app OTP email verification + password reset (via Resend SMTP).
- Atomic Energy + Atomic Coins: cap 120, +20 energy every 24h (server clock), 1 coin = 40
  energy, 5-coin welcome gift. Sync is energy-gated: instant 10, standard 5/hour; refunded
  on failed upload. Local note-taking is never gated.
- In-app Notification Center (pinned + targeted notifications).
- No ads, no analytics, no trackers, no crash SDK. Minimal Android permissions.

**PLANNED / NOT YET SHIPPED (never say these are live)**
- Coin purchases with real money (Lemon Squeezy / Razorpay). The Buy button is a
  "coming soon" sheet; no payment backend exists yet.
- Official app-store listings (Play / App Store / Amazon).
- A true background sync scheduler (the hourly charge happens when a sync runs, not via a
  background job).

## Verified constants (do not drift)

- Note allowance: 20 per account (server-enforced).
- Energy cap 120; daily grant +20 / 24h (rolling, server UTC).
- 1 Atomic Coin = 40 energy. Sync cost: standard 5, instant 10.
- Encryption: AES-256-GCM, Argon2id (64 MB / 3 iterations), 6-word phrase, 1024-word list.
- Stack: Flutter (Dart) app; Supabase (Postgres + Auth + RLS + Realtime + Edge later).
- Design: ink #15171B, paper #F4F5F1, signal #3A2FF0; Bebas Neue / Hanken Grotesk / JetBrains Mono.

## Security-claim rules

- Do not overstate encryption. It is opt-in; plaintext (T2T) notes are readable by the
  operator by design until the vault is on. Say so plainly.
- A lost recovery phrase means unrecoverable vault notes, by design. Never imply recovery.
- Do not invent audits, certifications, penetration tests, or CVE numbers.

## Licensing (since 28 September 2026)

- The App (`Atomic-Notes-App-V0.2`) and this website are **source-available**: the code is public to read and verify, under the proprietary Atomic Notes Source-Available License. All rights reserved.
- Never call Atomic Notes "open source" or "MIT licensed". Versions before 28 September 2026 were MIT, and only those old copies keep that grant.
- The Server and the legacy App (v1) are proprietary and private. Do not link to them.
