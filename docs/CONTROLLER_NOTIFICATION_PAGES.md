# Controller notification-history pages

The Controller forwards a validated 1–50 limit and opaque cursor to the Server's
admin list route and preserves next_cursor. The dashboard starts with 50 rows,
offers Load more, deduplicates overlapping ids, and resets to the first page
after Refresh or an existing mutation. A failed request preserves loaded rows
and provides Retry for that same request. Late responses are ignored after a
newer request or unmount. Loading and error states no longer imply an empty
history. Public/App notification delivery and admin mutations are unchanged.

An older Server without next_cursor remains readable; it cannot supply genuine
server pagination. The optimized paged Server is the intended consumer contract
(Server PR #13). Existing auth, same-origin protections and admin-key isolation
remain. Invalid cursors/limits are rejected after Controller authentication and
before forwarding to the list endpoint.

## Proof and limits

Test-only baseline 65b13db: four pagination regressions plus their parent fail,
with 25 other runtime entries passing. After: TypeScript, production build and
all 30 runtime entries pass. Sampled browser QA checks home/support/blog/Updates/
synthetic authenticated Controller at exact 1280px and 375px. All ten screenshots
visually inspected; no document overflow or broken visible images. Captured
warning/error log is empty. Updates failure is expected with the fixture backend.

Synthetic history: 50 rows remain after next-page 503; Retry reaches 70 distinct
rows despite one overlapping id; Load more disappears when exhausted. Both
desktop and phone widths checked. Refresh resets 70→50, and a delayed previous
page cannot replace that result or publish its error. Fixture-only session from
prior local QA is reused; no real credentials are typed or inspected. No admin
publication, grants, deletions, database or production operations. Temporary
viewport is reset and owned tab/preview is closed.

CI must pass independently. This does not establish live authenticated access,
large-history database latency, an indexed query plan or a fully bounded browser
DOM: repeated Load more intentionally accumulates rows. R27 remains partial;
user search/log tooling and representative scale proof remain open. Compiler
security PR #7 is a review-base dependency; global CSP is separate PR #6.
Rollback matching Server and Controller pagination PRs together if needed.
