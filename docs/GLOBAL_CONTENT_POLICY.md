# R23 global resource policy

Main `57199ae0c749e6041776b9fa1240122cd96a3bc6` has no public CSP and only
frame-ancestors on Controller routes. Test-only baseline
`8f05af03a4bbd089da88120a10f28abac37a9614` rebuilds that source and fails the
six route-boundary checks (plus their parent); 25 existing runtime entries pass.

Apply shared CSP, nosniff, DENY framing and a public referrer policy to all routes.
Default, scripts, fonts, connections, base URLs and form targets are restricted
to self; objects, frames and frame ancestors are blocked. Existing image support
retains self/data/HTTPS. Development alone permits eval and WebSocket connections.
Controller keeps its stricter no-referrer, no-store and noindex protections.

This is partial R23 hardening. Static Next hydration/JSON-LD and the existing
React inline styles retain unsafe-inline. Inline script injection and same-origin
malicious scripts are not blocked. This is not a strict nonce policy or an ASVS
Level 2 compliance claim. Image hosts are not individually allowlisted.
Escaping and sanitizing content remain required.

[Next.js 15's CSP guide](https://nextjs.org/docs/15/app/guides/content-security-policy)
documents static-compatible policy configuration and the rendering implications
of nonces. A stricter nonce/hash policy needs separate rendering/caching and
performance proof; this change does not force every route to dynamic rendering.

After: TypeScript, production build and all 32 production-runtime entries pass.
Local browser checks cover /, /support-atomic-notes, /blog, /updates and the
unauthenticated Controller at exact CSS widths 1280 and 375, with ten screenshot
and DOM records. No horizontal document overflow or broken visible images were
observed. The initial viewport override rounded one pixel high; adjusted overrides
were verified using innerWidth before saving the final evidence.
The energy simulation responds 20→15 and Reset; empty Controller Continue shows
client validation. No console warnings/errors were captured in this sample.
The updates failure state is expected with backend access disabled. Runtime auth
and admin tests use only test-owned fake backend state, never production.

Risk: future external scripts, browser API calls or embeds require explicit CSP
review. Non-embedded outbound links still work; third-party pages/payment flows,
authenticated visual Controller pages, Vercel headers and full accessibility/
performance remain unverified. No production settings, data, credentials or
notifications change. Rollback: revert this header PR. Final CI is recorded in
the PR and aggregate report.
