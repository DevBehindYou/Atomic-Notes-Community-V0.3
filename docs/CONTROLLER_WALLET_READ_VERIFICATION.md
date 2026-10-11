# Controller wallet read ownership

This is a source and disposable-fixture correction. CI acceptance and failing-before evidence must be recorded against exact commits before merge. It changes no wallet API, request-ID replay contract, economy policy, database, dependency or production configuration.

## Reproduced source risk

The Controller's economy view previously accepted every lookup result. Enter could start another lookup while the button was disabled; a later response for the previous input could replace the intended account. Changing the input also retained the previously resolved account. Coin pages and the post-adjustment balance refresh matched only `user_id`, which cannot distinguish an older A view from a newer A view after A → B → A.

Read ownership must therefore include the input/view generation, not just the account ID. A stale read may not update the resolved account, page cursor, message or loading state. Unmount retires that view. An adjustment's persisted request ID and settlement remain independent: changing views cannot discard an ambiguous operation, credit another account or create a fresh request when retrying.

## Actual browser fixture

`tests/controller-wallet-browser.mjs` runs the built production Next application, actual Controller React components and an isolated headless Chrome profile. Node 22's built-in HTTP, fetch and WebSocket provide a small CDP driver; Chrome must already exist on the Linux CI runner. It never downloads a browser or adds a package dependency.

The backend is generated in memory and binds to loopback. Only synthetic users and fixture keys exist. Deferred responses exercise order and lifecycle races through actual email input, Enter, tabs, page and adjustment buttons. It does not replace React hooks or manufacture a copied component implementation. A localhost-only browser proxy prevents unrelated external network access.

The fixed case inventory is:

| Case | Acceptance |
|---|---|
| `browser_setup` | Actual built Controller and owned browser become ready. |
| `input_retires_account` | Editing the lookup input removes the old target and disables/removes Apply without any adjustment. |
| `reverse_lookup` | B then late A leaves only B's wallet visible. |
| `stale_failure_completion` | Late A failure/completion neither reports its error nor clears B's loading state. |
| `same_owner_page_generation` | A → B → A rejects the first A page and preserves the new A balances and rows. |
| `same_owner_refresh_generation` | A → B → A input changes reject the previous A adjustment refresh; a new lookup is required. |
| `unmount_retires_read` | Late lookup failure after changing tabs does not update the Dashboard message or a remounted wallet. |
| `settled_adjustment_input_change` | Exact persisted A operation settles independently of changed input, removes its pending marker and makes only one adjustment request. |
| `ambiguous_adjustment_unmount` | Ambiguous A operation remains persisted after unmount; explicit retry reuses its request ID and does not credit twice. |
| `current_page_deduplication` | A current page adds new rows once, deduplicates overlap and honors exhaustion. |
| `cleanup` | Owned Next/Chrome processes stop, loopback backend closes and browser profile is removed. |

Each case has a bounded deadline; closed/aborted deferred requests are handled. Process output is captured only in bounded private memory, discarded on cleanup and never uploaded. The sole artifact is `sanitized-controller-wallet-browser-proof`, containing a fixed case/status schema, verified-format CI source head and scope. Errors, stack traces, screenshots, HTML, cookies, storage payloads and environment values are excluded.

## Required acceptance and boundaries

1. Publish a tests-only baseline with stable DOM selectors but unchanged behavior. Retain the immutable fixed failing-before artifact; do not rewrite delivered JavaScript or weaken assertions.
2. Run the same cases on the repaired exact source. Require all eleven statuses to pass, including cleanup, alongside existing dependency audit, TypeScript, production build and runtime/admin-session checks.
3. Review the source independently, merge only the passing conflict-free head, and verify the resulting main workflow before mirroring.

The generated fake backend proves read/view ownership and the Controller's persisted adjustment request behavior. It does not prove production MongoDB debit/credit atomicity, actual coin-expiry activation, real credentials, every browser, network distributions or production rollout. R27 remains partial: broad investigation/search capabilities and representative query/latency acceptance are separate. This work does not tighten the existing inline script/style policy or close R23.
