# Controller coin expiry support

1 October 2026. Deploy Server PR #8 first. Expiry activation is separately gated on the Server and remains unapproved for production.

User lookup shows non-expiring coins, next expiry and paginated credit history when enabled. Dates use local time. Server balances are authoritative. Public terms, notifications and payment copy are unchanged.

Before sending an adjustment the browser saves its UUID and immutable body in localStorage. An ambiguous response remains visible after reload; Retry saved adjustment resubmits the same ID, while new adjustments are blocked. A successful response or explicit validation failure clears the saved request. Current balances are fetched again after acknowledgement because replay results may be historical. No token, Controller key or email is saved in this pending record; it contains account ID, deltas and the optional activity note. Clear browser storage only after resolving its outcome, or that retry protection is lost.

The proxy requires a request UUID and verifies the Server advertises coin_request_replay before forwarding. Older Servers fail safely without receiving a coin adjustment. Existing Controller authentication, same-origin checks and admin-key boundary apply to the new batch reader.

Validation uses a localhost fake Server, not real users or coins. Browser proof exercises 1280px/375px layouts and response loss followed by reload/retry. API contract tests cover auth, exact ID forwarding, opaque cursor forwarding, missing IDs and unsupported Servers.
