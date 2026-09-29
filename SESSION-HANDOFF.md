# Community session checkpoint - September 19, 2026

This repository has **uncommitted** changes. Nothing was committed, pushed or
deployed; no live integration or production deployment is verified. Resume only
on a new user request.

Intended site: `https://atomic-notes-community.vercel.app`. Its Server origin is
`https://atomic-notes-server-gde2e.vercel.app` (no `/api` suffix in
`ATOMIC_SERVER_URL`). Atlas and Google Cloud are not configured yet.

## Verified where

- Last hosted pass: commit `28eba4033c29a465a7b990674cb64828400131d4`
  (`logs_94448706353.zip`). It does not cover the current tree.
- Working tree, run locally on September 18-19: `npx tsc --noEmit`,
  `npm run build`, `npm run test:smoke` (19 tests, three groups) and `npm audit`
  (zero vulnerabilities) all pass. Not yet run on GitHub Actions.

## Changes

- Session secret fallback removed; cookie shape/age/signature checks; password
  type checks; login answers 503 without both passwords and a 32-byte secret;
  Server calls time out after 15 s (September 15).
- Cross-origin guard (`src/middleware.ts`) now compares the request's `Origin`
  with `Host` / `X-Forwarded-Host`. The earlier `nextUrl.origin` comparison
  rejected the operator's own same-origin login in a production server.
- `src/lib/site.ts` supplies `SITE_URL` (from `NEXT_PUBLIC_SITE_URL`) and
  `APK_URL`; canonical, sitemap, feed and blog links use them. The stale
  `atomic-notes.vercel.app` origin, the dead `releases/tag/ci-latest` default and
  the "SUPABASE" banner text are gone.
- Smoke tests now cover forged/future/expired cookies, wrong-typed passwords,
  weak/missing secret, cross-origin mutations, and a fake Server that checks the
  exact admin/public routes, headers and bodies (and that the admin key never
  reaches the browser).

## Still open

Verification against a real deployed Server (deployment guide, section 10). The
landing page still says "signed APK" and links "View the project" to
`DevBehindYou/Project-Atomic-Notes`; confirm that repository is current/public
and that a signed release exists before publishing. Match `ADMIN_API_KEY` to the
Server's; set both controller passwords and a unique `SESSION_SECRET` of at least
32 bytes; never expose them as `NEXT_PUBLIC_` variables. Full context:
`Project-Docs/09-agent-handoff.md`; environment names: `.env.example`.
