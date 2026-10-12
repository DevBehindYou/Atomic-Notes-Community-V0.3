# Controller document script policy

The Controller now authorizes its framework scripts using a fresh request-bound nonce. Public pages keep their existing inline-script policy; inline styles remain permitted. This is the owner-selected Controller-first step for R23, not full R23 closure or a claim that the admin API is isolated from public-page XSS.

## Architecture and change

- Verified in code: existing Next 15 middleware handles the Controller document and API paths. Document requests replace caller-supplied `x-nonce` and CSP rendering headers with a 256-bit Web Crypto nonce and script policy; the matching response has no script `unsafe-inline` or production `unsafe-eval` (`src/middleware.ts:29–60`). API same-origin rejection remains before document handling (`:24–28`).
- Verified in code: the existing Controller-only layout forces dynamic rendering (`src/app/controller/layout.tsx:3–5`). Next can authorize its SSR framework scripts from the middleware request policy. The public root layout, blog static slug generation, existing client UI, financial replay handling, Controller cookie age and session rules are unchanged.
- Verified in code: `next.config.mjs:39–43` excludes the Controller subtree from its public CSP entry while retaining shared framing/content headers and Controller no-store/no-index headers. Middleware is the single owner of Controller document CSP. Public inline styles/scripts retain their previous policy (`:8–25`). No library was added.
- Framework guidance: request/response nonce propagation requires dynamic rendering on affected pages. Applying it to the public root would change static/ISR caching. The route-scoped choice avoids that change. [Official Next 15 CSP guide](https://nextjs.org/docs/15/app/guides/content-security-policy).

## Proof and acceptance

The existing real-DOM Controller fixture uses one owned preinstalled Chrome profile, one built Next process and one generated localhost API. All 12 wallet ownership/replay/cleanup cases remain. The same process set adds a separate fixed-schema CSP proof (`tests/controller-wallet-browser.mjs:17–25,253–320`) covering:

1. A single strict Controller policy and matching SSR script nonces; preserved framing, no-store and no-index headers.
2. Caller nonce/CSP overwrite and a different nonce on a fresh document.
3. A native browser input event appends an unauthorized inline DOM script, which must be blocked with an actual browser CSP violation; an otherwise identical correctly authorized DOM script must execute. CDP evaluation only registers the probe handler; input dispatch invokes it after inspector evaluation returns. Inspector evaluation itself can bypass CSP and does not serve as the security proof.
4. Authorized hydration, actual native form submission through the two-key login, economy lookup/adjustment, existing saved-request replay cases and logout.
5. Full document navigation to public content and back; generated public notice rendering; unchanged public/API policy and static blog entries in the actual build's prerender manifest.
6. Existing rejection of cross-origin unsafe API requests, with the current authenticated browser session retained.

CI retains dependency audit, type checks, production build and route/session runtime tests. It runs the extended browser fixture and uploads `sanitized-controller-wallet-browser-proof` and `sanitized-controller-csp-proof` independently (`.github/workflows/typecheck.yml:34–56`). Proofs identify the exact public source head and only fixed case outcomes; process output is privately bounded and discarded. No production credentials, real wallets, MongoDB or deployed services are used.

Validation at PR creation: Node syntax parsing and scoped Git whitespace validation passed. Production build, runtime tests and both browser proof artifacts must pass on the exact PR head before acceptance; no local build or dependency cache refresh was performed. The parent coordinator owns exact-head review/merge and exact-main verification.

## Boundaries that remain

**Same-origin trust:** public pages and Controller APIs share an origin. An XSS on a permissive public page could issue requests to authenticated Controller APIs using the browser's existing cookie. A nonce on the Controller document does not remove this trust boundary or replace input/content safety. Public strict-script protection is a separate selected scope; origin separation is not introduced here.

**Document navigation:** CSP belongs to the loaded document. Arbitrary soft navigation from a public document cannot upgrade its policy through an RSC response. Current public navigation exposes no Controller link; privileged-entry proof uses a new full document. Do not add a public soft-navigation Controller link and claim it inherits a new strict document policy without addressing that boundary.

**Styles and public content:** React inline style attributes remain allowed. Public JSON-LD/static hydration and existing public resource policy are unchanged. No site-wide nonce migration, experimental SRI, new cookie lifetime, idle revocation, rate limiter, policy activation or deployment is included.

Generated CI browser proof is not deployed Vercel header validation, real credential testing or a complete security audit. Production deployment/cache acceptance remains separate.
