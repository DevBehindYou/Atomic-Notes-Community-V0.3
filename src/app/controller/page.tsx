"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { NOTIFICATION_TYPES, PRIORITIES } from "@/lib/content";

type Row = {
  id: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  action: string | null;
  action_url: string | null;
  target_audience: string | null;
  target_user_id: string | null;
  recipients: number | null;
  reads: number;
  created_at: string;
};

type Stats = {
  total_users: number;
  active_24h: number;
  new_7d: number;
  total_notes: number;
  vaults: number;
  coins_circulating: number;
  energy_outstanding: number;
  active_notifications: number;
  tx_24h: number;
  coins_granted_24h: number;
  energy_spent_24h: number;
  ledger_by_kind: Record<string, number>;
};

type Health = {
  env: Record<string, boolean>;
  db: boolean;
  dbError: string | null;
  time: string;
};

type Tab = "overview" | "notifications" | "economy" | "health";

export default function ControllerPage() {
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/controller/session")
      .then((r) => r.json())
      .then((d) => setAdmin(Boolean(d.admin)))
      .catch(() => setAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <Shell>
        <p className="mono-label">CHECKING SESSION…</p>
      </Shell>
    );
  }
  return admin ? <Dashboard onLogout={(notice) => {
    setLogoutNotice(notice ?? null);
    setAdmin(false);
  }} /> : <Login notice={logoutNotice} onIn={() => { setLogoutNotice(null); setAdmin(true); }} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="wrap" style={{ minHeight: "100vh", padding: "34px 22px 80px" }}>
      <p className="eyebrow">ATOMIC · CONTROLLER</p>
      <div className="hairline" style={{ margin: "10px 0 18px" }} />
      {children}
    </main>
  );
}

function Login({ onIn, notice }: { onIn: () => void; notice: string | null }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!pw1) return setErr("Enter the first key.");
    setErr(null);
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/controller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw1, password2: pw2 }),
      });
      if (r.ok) {
        onIn();
      } else {
        // Don't reveal which key was wrong — reset to the start. A lockout or an unreachable
        // Server says so instead.
        const d = await r.json().catch(() => ({}));
        setErr(r.status === 429 || r.status === 503 ? d.error ?? "Try again later." : "Invalid credentials.");
        setStep(1);
        setPw1("");
        setPw2("");
      }
    } catch {
      setErr("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const formStyle = { marginTop: 18, display: "grid", gap: 12, maxWidth: 360 } as const;

  return (
    <Shell>
      {notice && <p role="alert">{notice}</p>}
      <h1 style={{ fontSize: "2.4rem" }}>Restricted.</h1>
      <p style={{ color: "var(--slate)", marginTop: 8 }}>
        {step === 1 ? "Enter the first key." : "Enter the second key."}
      </p>
      <p className="mono-label" style={{ marginTop: 6 }}>
        STEP {step} / 2
      </p>
      {step === 1 ? (
        <form onSubmit={next} style={formStyle}>
          <input
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            placeholder="First key"
            className={inputCls}
            autoFocus
          />
          {err && <p style={{ color: "var(--error)", fontSize: ".85rem" }}>{err}</p>}
          <button type="submit" className="btn">
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={submit} style={formStyle}>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Second key"
            className={inputCls}
            autoFocus
          />
          {err && <p style={{ color: "var(--error)", fontSize: ".85rem" }}>{err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => { setStep(1); setErr(null); }} className="btn-ghost">
              Back
            </button>
            <button type="submit" disabled={busy} className="btn-signal" style={{ flex: 1 }}>
              {busy ? "Checking…" : "Unlock"}
            </button>
          </div>
        </form>
      )}
    </Shell>
  );
}

function Dashboard({ onLogout }: { onLogout: (notice?: string) => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [retryCursor, setRetryCursor] = useState<string | undefined>();
  const rowsRequest = useRef(0);
  const [msg, setMsg] = useState<string | null>(null);

  // A 401 means this session was ended (Log out on another browser): back to the login screen.
  const get = useCallback(async (url: string) => {
    const r = await fetch(url);
    if (r.status === 401) {
      onLogout();
      throw new Error("signed out");
    }
    if (!r.ok) throw new Error("request_failed");
    return r.json();
  }, [onLogout]);

  const loadStats = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([get("/api/controller/stats"), get("/api/controller/health")]);
      if (s.stats) setStats(s.stats);
      if (h.env) setHealth(h);
    } catch {
      setMsg("Could not load stats.");
    }
  }, [get]);

  const loadRows = useCallback(async (cursor?: string) => {
    const request = ++rowsRequest.current;
    setRowsLoading(true);
    setRowsError(null);
    try {
      const d = await get(`/api/controller/notifications?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
      if (request !== rowsRequest.current) return;
      if (!Array.isArray(d.rows) || (cursor && d.next_cursor === cursor)) throw new Error("invalid_page");
      setRows((previous) => {
        if (!cursor) return d.rows;
        const known = new Set(previous.map((row) => row.id));
        return [...previous, ...d.rows.filter((row: Row) => !known.has(row.id))];
      });
      setNextCursor(typeof d.next_cursor === "string" ? d.next_cursor : null);
    } catch {
      if (request !== rowsRequest.current) return;
      setRetryCursor(cursor);
      setRowsError("Could not load notifications. Retry this request.");
    } finally {
      if (request === rowsRequest.current) setRowsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadStats();
    loadRows();
    return () => { rowsRequest.current++; };
  }, [loadStats, loadRows]);

  async function logout() {
    try {
      const response = await fetch("/api/controller/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout_failed");
      const result = await response.json();
      onLogout(result.revoked === true ? undefined
        : "Signed out of this browser. Other Controller sessions could not be revoked. Sign in and retry Log out everywhere when the Server is reachable.");
    } catch {
      setMsg("Could not confirm logout. Please retry; other sessions may still be active.");
    }
  }

  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "2.4rem" }}>Control Center.</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { loadStats(); loadRows(); }} className="btn-ghost">
            Refresh
          </button>
          <button onClick={logout} className="btn-ghost" title="Ends every Controller session, on every browser">
            Log out everywhere
          </button>
        </div>
      </div>
      {msg && <p style={{ color: "var(--error)", marginTop: 8, fontSize: ".85rem" }}>{msg}</p>}

      <div className="tabs">
        {(["overview", "notifications", "economy", "health"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview stats={stats} />}
      {tab === "notifications" && (
        <>
          <NewNotification onCreated={loadRows} onMsg={setMsg} />
          <NotifList rows={rows} onChanged={() => loadRows()} onMsg={setMsg}
            loading={rowsLoading} error={rowsError} nextCursor={nextCursor}
            onMore={() => { if (nextCursor) void loadRows(nextCursor); }}
            onRetry={() => { void loadRows(retryCursor); }} />
        </>
      )}
      {tab === "economy" && <Economy stats={stats} onMsg={setMsg} onDone={loadStats} />}
      {tab === "health" && <HealthPanel stats={stats} health={health} />}
    </Shell>
  );
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="module">
      <p className="num">{label}</p>
      <p className="stat">{value}</p>
      {sub && (
        <p className="mono" style={{ fontSize: ".64rem", color: "var(--slate)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Overview({ stats }: { stats: Stats | null }) {
  if (!stats) return <p className="mono-label">LOADING KPIS…</p>;
  return (
    <>
      <div className="kpis">
        <Kpi label="TOTAL USERS" value={stats.total_users} sub="accounts with a wallet" />
        <Kpi label="ACTIVE · 24H" value={stats.active_24h} sub="opened the app today" />
        <Kpi label="NEW · 7D" value={stats.new_7d} sub="signed up this week" />
        <Kpi label="TOTAL NOTES" value={stats.total_notes} sub="live, in cloud" />
        <Kpi label="ENCRYPTED VAULTS" value={stats.vaults} sub="E2E enabled" />
        <Kpi label="ACTIVE NOTICES" value={stats.active_notifications} sub="in the App's bell" />
      </div>
      <div className="kpis" style={{ marginTop: 14 }}>
        <Kpi label="COINS IN CIRCULATION" value={stats.coins_circulating} />
        <Kpi label="ENERGY OUTSTANDING" value={stats.energy_outstanding} />
        <Kpi label="TRANSACTIONS · 24H" value={stats.tx_24h} sub="ledger entries" />
        <Kpi label="ENERGY SPENT · 24H" value={stats.energy_spent_24h} sub="on syncs" />
      </div>
    </>
  );
}

function Economy({
  stats,
  onMsg,
  onDone,
}: {
  stats: Stats | null;
  onMsg: (m: string) => void;
  onDone: () => void;
}) {
  return (
    <>
      <div className="kpis">
        <Kpi label="COINS CIRCULATING" value={stats?.coins_circulating ?? "…"} />
        <Kpi label="ENERGY OUTSTANDING" value={stats?.energy_outstanding ?? "…"} />
        <Kpi label="COINS GRANTED · 24H" value={stats?.coins_granted_24h ?? "…"} />
        <Kpi label="ENERGY SPENT · 24H" value={stats?.energy_spent_24h ?? "…"} />
      </div>
      {stats?.ledger_by_kind && (
        <div className="module" style={{ marginTop: 14 }}>
          <p className="num">LEDGER BY KIND (ALL TIME)</p>
          <div style={{ marginTop: 8 }}>
            {Object.entries(stats.ledger_by_kind).map(([k, v]) => (
              <div key={k} className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", padding: "3px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <EnergyAdjust onMsg={onMsg} onDone={onDone} />
    </>
  );
}

function HealthPanel({ stats, health }: { stats: Stats | null; health: Health | null }) {
  const check = (ok: boolean, label: string) => (
    <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      <span style={{ color: ok ? "var(--signal)" : "var(--error)" }}>{ok ? "●" : "○"}</span>
      <span style={{ fontSize: ".8rem" }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: ".7rem", color: "var(--slate)" }}>{ok ? "OK" : "MISSING"}</span>
    </div>
  );
  return (
    <>
      <div className="module">
        <p className="num">CONFIGURATION</p>
        <div style={{ marginTop: 8 }}>
          {health ? (
            <>
              {check(health.env.atomic_server_url, "ATOMIC_SERVER_URL")}
              {check(health.env.admin_api_key, "ADMIN_API_KEY")}
              {check(health.env.admin_password, "ADMIN_PASSWORD")}
              {check(health.env.admin_password_2, "ADMIN_PASSWORD_2")}
              {check(health.env.session_secret, "SESSION_SECRET")}
              {check(health.env.apk_url, "NEXT_PUBLIC_APK_URL")}
              {check(health.db, `Database reachable${health.dbError ? " — " + health.dbError : ""}`)}
            </>
          ) : (
            <p className="mono-label">LOADING…</p>
          )}
        </div>
      </div>
      <div className="module" style={{ marginTop: 14 }}>
        <p className="num">DATA</p>
        <div style={{ marginTop: 8 }}>
          {check(Boolean(stats), "Server stats (/api/admin/stats)")}
          <p className="mono" style={{ fontSize: ".68rem", color: "var(--slate)", marginTop: 10 }}>
            Web traffic (page views, sessions) is not tracked in-panel — the app
            and site ship no analytics by design. Enable Vercel Analytics on the
            project for privacy-friendly traffic numbers.
          </p>
        </div>
      </div>
    </>
  );
}

function NewNotification({
  onCreated,
  onMsg,
}: {
  onCreated: () => void;
  onMsg: (m: string) => void;
}) {
  const [type, setType] = useState<string>("general");
  const [priority, setPriority] = useState<string>("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [audience, setAudience] = useState<string>("all");
  const [targetEmail, setTargetEmail] = useState("");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!subject || !description) {
      onMsg("Subject and description are required.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/controller/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          priority,
          subject,
          description,
          action: action || null,
          action_url: actionUrl || null,
          target_audience: targetEmail.trim() ? "all" : audience,
          target_email: targetEmail.trim() || null,
          dismissible: !pinned,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setSubject("");
      setDescription("");
      setAction("");
      setActionUrl("");
      setTargetEmail("");
      setPinned(false);
      const size = typeof d.audience_size === "number" ? d.audience_size : null;
      const forNewAccounts = !targetEmail.trim() && audience === "new";
      onMsg(
        forNewAccounts
          ? "Notification published. Every account created from now on will see it."
          : size === null
            ? "Notification published."
            : `Notification published to ${size} ${size === 1 ? "user" : "users"}.`
      );
      onCreated();
    } catch (e) {
      onMsg(e instanceof Error ? e.message : "Failed to create.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="module" style={{ marginBottom: 18 }}>
      <p className="num">NEW NOTIFICATION</p>
      <p className="mono" style={{ fontSize: ".68rem", color: "var(--slate)", marginTop: 6 }}>
        Shows in the App&apos;s bell. Everyone: every user, and also this site&apos;s home and /updates
        pages. Active / Inactive: users who did / did not open the App in the last 7 days, decided when
        you publish. An email sends it to that one user only.
      </p>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <label>
          <span className="mono-label">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mono-label">Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject / headline" className={inputCls} style={{ marginTop: 12 }} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputCls} style={{ marginTop: 12 }} />
      <div className="grid g2" style={{ marginTop: 12 }}>
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="CTA label (optional)" className={inputCls} />
        <input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="CTA url (optional)" className={inputCls} />
      </div>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <label>
          <span className="mono-label">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className={inputCls}
            disabled={Boolean(targetEmail.trim())}
          >
            <option value="all">Everyone</option>
            <option value="active">Active — opened in 7 days</option>
            <option value="inactive">Inactive — not in 7 days</option>
            <option value="new">New accounts — created from now on</option>
          </select>
        </label>
        <label>
          <span className="mono-label">Direct to user (optional email)</span>
          <input
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            placeholder="user@email — overrides audience"
            className={inputCls}
          />
        </label>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
        <span className="mono-label">Pinned — users can&apos;t dismiss</span>
      </label>
      <button onClick={create} disabled={busy} className="btn-signal" style={{ marginTop: 14 }}>
        {busy ? "Publishing…" : "Publish"}
      </button>
    </section>
  );
}

function NotifList({ rows, onChanged, onMsg, loading, error, nextCursor, onMore, onRetry }: {
  rows: Row[]; onChanged: () => void; onMsg: (m: string) => void;
  loading: boolean; error: string | null; nextCursor: string | null;
  onMore: () => void; onRetry: () => void;
}) {
  return (
    <section>
      <p className="num">ALL NOTIFICATIONS</p>
      <div className="hairline" style={{ margin: "8px 0 12px" }} />
      <p className="mono-label" aria-live="polite">{rows.length} notifications loaded</p>
      {loading && <p role="status">Loading notifications…</p>}
      {error && <div role="alert" style={{ marginTop: 12 }}>
        <p style={{ color: "var(--error)" }}>{error}</p>
        <button onClick={onRetry} disabled={loading} className="btn-ghost">Retry</button>
      </div>}
      {!loading && !error && rows.length === 0 && <p style={{ color: "var(--slate)" }}>None yet.</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((n) => (
          <NotifRow key={n.id} n={n} onChanged={onChanged} onMsg={onMsg} />
        ))}
      </div>
      {nextCursor && <button onClick={onMore} disabled={loading} className="btn-ghost" style={{ marginTop: 14 }}>
        {loading ? "Loading…" : "Load more"}
      </button>}
    </section>
  );
}

function NotifRow({ n, onChanged, onMsg }: { n: Row; onChanged: () => void; onMsg: (m: string) => void }) {
  async function patch(status: string) {
    await fetch("/api/controller/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: n.id, status }),
    });
    onChanged();
  }
  async function remove() {
    const r = await fetch(`/api/controller/notifications?id=${encodeURIComponent(n.id)}`, { method: "DELETE" });
    if (r.ok) {
      onMsg("Deleted.");
      onChanged();
    }
  }
  const btn = { padding: "8px 12px" };
  return (
    <div className="module">
      <div className="mono" style={{ fontSize: ".7rem", color: "var(--slate)" }}>
        {n.type} · {n.priority} · {n.status} · {n.target_user_id ? "one user" : n.target_audience ?? "all"}
        {n.recipients !== null && n.recipients !== undefined ? ` (${n.recipients})` : ""} · read by {n.reads ?? 0}
      </div>
      <p style={{ fontFamily: "var(--display)", fontSize: "1.25rem", marginTop: 4 }}>{n.subject}</p>
      <p style={{ color: "var(--slate)", fontSize: ".9rem" }}>{n.description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <button onClick={() => patch("resolved")} className="btn-ghost" style={btn}>Resolve</button>
        <button onClick={() => patch("expired")} className="btn-ghost" style={btn}>Expire</button>
        <button onClick={() => patch("active")} className="btn-ghost" style={btn}>Reactivate</button>
        <button onClick={remove} className="btn-ghost" style={{ ...btn, borderColor: "var(--error)", color: "var(--error)" }}>Delete</button>
      </div>
    </div>
  );
}

type CoinDetails = {
  enabled: boolean; non_expiring_coins: number; next_expiry_coins: number; next_expiry_at: string | null;
  next_cursor: string | null; server_time: string;
  rows: { id: string; source: string; amount: number; remaining: number; credited_at: string; expires_at: string | null }[];
};
type Adjustment = { request_id: string; user_id: string; coins_delta: number; energy_delta: number; note?: string };
const PENDING_ADJUSTMENT = "atomic-controller-pending-adjustment-v1";
type FoundUser = {
  user_id: string;
  email: string;
  username: string | null;
  email_confirmed: boolean;
  last_sign_in_at: string | null;
  auth_created_at: string;
  has_wallet: boolean;
  coins: number;
  energy: number;
  energy_cap: number;
  last_daily_grant_at: string | null;
  coin_details?: CoinDetails | null;
};

function fmtDate(d: string | null | undefined): string {
  if (!d) return "never";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EnergyAdjust({ onMsg, onDone }: { onMsg: (m: string) => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<FoundUser | null>(null);
  const [coins, setCoins] = useState("0");
  const [energy, setEnergy] = useState("0");
  const [note, setNote] = useState("");
  const [looking, setLooking] = useState(false);
  const [busy, setBusy] = useState(false);
  const applying = useRef(false);
  const [pending, setPending] = useState<Adjustment | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PENDING_ADJUSTMENT);
      if (saved) setPending(JSON.parse(saved) as Adjustment);
    } catch { onMsg("Saved adjustment could not be read. Resolve browser storage before issuing credits."); }
  }, [onMsg]);

  async function submit(payload: Adjustment) {
    if (applying.current) return;
    applying.current = true; setBusy(true);
    try {
      // A persisted ID must exist before any request. Failure to persist stops the mutation.
      localStorage.setItem(PENDING_ADJUSTMENT, JSON.stringify(payload));
      setPending(payload);
      const r = await fetch("/api/controller/energy", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 400) { localStorage.removeItem(PENDING_ADJUSTMENT); setPending(null); }
        throw new Error(d.error || "failed");
      }
      localStorage.removeItem(PENDING_ADJUSTMENT); setPending(null);
      setCoins("0"); setEnergy("0"); setNote("");
      // Saved operation results can be historical; refresh current balances before displaying them.
      if (found?.user_id === payload.user_id) {
        try {
          const fresh = await fetch(`/api/controller/user?email=${encodeURIComponent(found.email)}`);
          const refreshed: FoundUser | null = fresh.ok ? await fresh.json() : null;
          setFound((current) => current?.user_id === payload.user_id ? refreshed : current);
        } catch { setFound((current) => current?.user_id === payload.user_id ? null : current); }
      }
      onMsg("Balance adjusted."); onDone();
    } catch (e) {
      onMsg(`${e instanceof Error ? e.message : "Failed to adjust."} Retry the saved adjustment to confirm its outcome.`);
    } finally { applying.current = false; setBusy(false); }
  }

  async function moreBatches() {
    if (!found?.coin_details?.next_cursor || busy) return;
    const target = found;
    setBusy(true);
    try {
      const r = await fetch(`/api/controller/coins?user_id=${encodeURIComponent(target.user_id)}&cursor=${encodeURIComponent(target.coin_details!.next_cursor!)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load batches");
      setFound((current) => current?.user_id === target.user_id ? { ...current, coin_details: {
        ...d, rows: [...current.coin_details!.rows, ...d.rows.filter((row: { id: string }) => !current.coin_details!.rows.some((old) => old.id === row.id))],
      } } : current);
    } catch (e) { onMsg(e instanceof Error ? e.message : "Could not load batches"); }
    finally { setBusy(false); }
  }

  async function lookup() {
    if (busy || applying.current) return;
    if (!email.trim()) return onMsg("Enter an email to look up.");
    setLooking(true);
    setFound(null);
    try {
      const r = await fetch(`/api/controller/user?email=${encodeURIComponent(email.trim())}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "not found");
      setFound(d);
    } catch (e) {
      onMsg(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLooking(false);
    }
  }

  async function apply() {
    if (!found) return;
    // Whole numbers only: a fraction would leave a wallet holding part of a coin.
    const coinsDelta = Number(coins.trim() || "0");
    const energyDelta = Number(energy.trim() || "0");
    if (!Number.isInteger(coinsDelta) || !Number.isInteger(energyDelta)) {
      return onMsg("Deltas must be whole numbers.");
    }
    if (Math.abs(coinsDelta) > 100000 || Math.abs(energyDelta) > 100000) return onMsg("Each adjustment must be between -100000 and 100000.");
    if (coinsDelta === 0 && energyDelta === 0) return onMsg("Nothing to adjust.");
    // This changes a real wallet: say exactly what will happen first.
    const plan = [coinsDelta && `${coinsDelta > 0 ? "+" : ""}${coinsDelta} coins`, energyDelta && `${energyDelta > 0 ? "+" : ""}${energyDelta} energy`]
      .filter(Boolean)
      .join(" and ");
    if (!window.confirm(`Apply ${plan} to ${found.email}? Energy stops at ${found.energy_cap}, coins at 0.`)) return;
    try {
      const saved = localStorage.getItem(PENDING_ADJUSTMENT);
      if (saved) { setPending(JSON.parse(saved) as Adjustment); return onMsg("Resolve the saved adjustment before starting another."); }
      await submit({ request_id: crypto.randomUUID(), user_id: found.user_id,
        coins_delta: coinsDelta, energy_delta: energyDelta, ...(note.trim() ? { note: note.trim() } : {}) });
    } catch { onMsg("Browser storage is unavailable. No adjustment sent."); }
  }

  return (
    <section className="module" style={{ marginTop: 14 }}>
      <p className="num">USER LOOKUP · ADJUST</p>
      {pending && <div role="status" className="module" style={{ marginTop: 12, overflowWrap: "anywhere" }}>
        <p>Unconfirmed adjustment for account {pending.user_id}: {pending.coins_delta} coins, {pending.energy_delta} energy.
          Retry this saved request before starting another; it may already have succeeded.</p>
        <button className="btn" disabled={busy} onClick={() => submit(pending)}>Retry saved adjustment</button>
      </div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") lookup();
          }}
          placeholder="Search user by email"
          className={inputCls}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button onClick={lookup} disabled={looking || busy} className="btn">
          {looking ? "…" : "Look up"}
        </button>
      </div>

      {found && (
        <>
          <div className="module" style={{ background: "#fff", marginTop: 12 }}>
            <div className="mono" style={{ fontSize: ".72rem", color: "var(--slate)" }}>
              {found.email}
              {found.username ? ` · ${found.username}` : ""}
              {found.email_confirmed ? "" : " · UNVERIFIED"}
            </div>
            <div className="kpis" style={{ marginTop: 10 }}>
              <div>
                <p className="num">COINS</p>
                <p className="stat">{found.coins}</p>
              </div>
              <div>
                <p className="num">ENERGY</p>
                <p className="stat">
                  {found.energy}
                  <span style={{ fontSize: ".9rem", color: "var(--slate)" }}> / {found.energy_cap}</span>
                </p>
              </div>
            </div>
            <div className="mono" style={{ fontSize: ".7rem", color: "var(--slate)", marginTop: 10, display: "grid", gap: 3 }}>
              <span>Last login · {fmtDate(found.last_sign_in_at)}</span>
              <span>Last daily grant · {fmtDate(found.last_daily_grant_at)}</span>
              <span>Joined · {fmtDate(found.auth_created_at)}</span>
              {!found.has_wallet && (
                <span style={{ color: "var(--high)" }}>
                  No wallet yet — an adjustment creates one.
                </span>
              )}
            </div>
          </div>

          {found.coin_details?.enabled && <div className="module" style={{ marginTop: 12 }}>
            <p className="num">COIN EXPIRY</p>
            <p>{found.coin_details.non_expiring_coins} coins never expire.</p>
            {found.coin_details.next_expiry_at && <p>{found.coin_details.next_expiry_coins} coins next expire {fmtDate(found.coin_details.next_expiry_at)} (local time).</p>}
            <p>New credits expire six calendar months after Server credit time. Earliest expiry is spent first; old balances remain non-expiring.</p>
            <p>Last checked {fmtDate(found.coin_details.server_time)}. Refresh lookup for current balances.</p>
            <details><summary>Credit batches</summary>
              {found.coin_details.rows.map((batch) => <div key={batch.id} style={{ borderTop: "1px solid var(--slate)", padding: "10px 0" }}>
                <p>{batch.remaining} of {batch.amount} coins remaining · {batch.source}</p>
                <p>Credited {fmtDate(batch.credited_at)}<br />{batch.expires_at ? `Expiry ${fmtDate(batch.expires_at)}` : "Never expires"} (local time)</p>
              </div>)}
              {found.coin_details.next_cursor && <button className="btn" onClick={moreBatches} disabled={busy}>Load more batches</button>}
            </details>
          </div>}
          <div className="grid g2" style={{ marginTop: 12 }}>
            <label>
              <span className="mono-label">Coins delta (+/-)</span>
              <input value={coins} onChange={(e) => setCoins(e.target.value)} className={inputCls} />
            </label>
            <label>
              <span className="mono-label">Energy delta (+/-)</span>
              <input value={energy} onChange={(e) => setEnergy(e.target.value)} className={inputCls} />
            </label>
          </div>
          <label style={{ display: "block", marginTop: 12 }}>
            <span className="mono-label">Message in the user&apos;s Activity list (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              placeholder="Balance adjusted by Atomic Notes"
              className={inputCls}
            />
          </label>
          <button onClick={apply} disabled={busy || pending !== null} className="btn-signal" style={{ marginTop: 14 }}>
            {busy ? "Applying…" : "Apply adjustment"}
          </button>
        </>
      )}
    </section>
  );
}

const inputCls = "w-full rounded-std border-2 border-ink bg-white px-3 py-2 outline-none";
