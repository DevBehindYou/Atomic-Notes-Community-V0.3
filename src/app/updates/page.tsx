import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "../revamp.css";
import { Dock, RvFooter } from "@/components/rv/Chrome";
import { UpdatesFeed } from "@/components/rv/UpdatesFeed";
import { fetchActiveNotifications } from "@/lib/atomicServer";
import { RELEASE, ROADMAP, type NotificationRow } from "@/lib/content";
import { APK_URL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Updates and status",
  description:
    "Live release notes, maintenance notices, and service status for Atomic Notes. The same messages appear in the app's notification center.",
  path: "/updates",
});

export const viewport: Viewport = {
  themeColor: "#15171B",
};

async function getActive(): Promise<{ rows: NotificationRow[]; error: string | null }> {
  try {
    const rows = (await fetchActiveNotifications()) as NotificationRow[];
    // Priority order: critical, high, normal, low. (Expiry is already filtered server-side.)
    const rank = { critical: 0, high: 1, normal: 2, low: 3 } as const;
    rows.sort((a, b) => rank[a.priority] - rank[b.priority]);
    return { rows, error: null };
  } catch {
    return { rows: [], error: "Could not load updates right now." };
  }
}

const INCIDENT_TYPES = new Set(["server_down", "maintenance", "security"]);

export default async function UpdatesPage() {
  const { rows, error } = await getActive();
  const incidents = rows.filter((r) => INCIDENT_TYPES.has(r.type));
  const status: { tone: "ok" | "warn" | "unknown"; text: string } = error
    ? { tone: "unknown", text: "Status unavailable. The update feed could not be reached." }
    : incidents.length
      ? { tone: "warn", text: `${incidents.length} active ${incidents.length === 1 ? "notice" : "notices"} about the service.` }
      : { tone: "ok", text: "No active incidents or maintenance." };

  return (
    <div className="rv">
      <Dock current="updates" />
      <main>
        <section className="rv-blog-hero" aria-labelledby="updates-title">
          <div className="rv-stars" aria-hidden="true" />
          <div className="rv-wrap rv-blog-head">
            <div style={{ minWidth: 0 }}>
              <p className="rv-num">Notification center</p>
              <h1 id="updates-title" className="rv-poster" style={{ fontSize: "clamp(56px, 7vw, 104px)", lineHeight: 0.9 }}>
                Updates <span className="rv-accent">&amp; status.</span>
              </h1>
              <p className="rv-lede" style={{ marginTop: 18 }}>
                Server incidents, releases, maintenance and announcements. The same feed appears in the app&apos;s bell.
              </p>
              <p className="rv-status-line" data-tone={status.tone} role="status">
                <span className="rv-status-dot" aria-hidden="true" />
                {status.text}
              </p>
            </div>
            <div className="rv-paper-card rv-blog-mascot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/revamp/mascots/rocco-retry.webp" alt="Rocco, a pixel mascot, retrying a sync" width={480} height={480} />
            </div>
          </div>
        </section>

        <section className="rv-sec" aria-label="Active updates" style={{ paddingTop: 24 }}>
          <div className="rv-wrap rv-updates-layout">
            <div style={{ minWidth: 0 }}>
              <h2 className="rv-h2" style={{ fontSize: "clamp(26px, 2.6vw, 34px)", marginBottom: 20 }}>
                Active now.
              </h2>
              {error && (
                <div className="rv-shelf-empty">
                  <p>{error} The app keeps working offline; check back in a minute.</p>
                </div>
              )}
              {!error && rows.length === 0 && (
                <div className="rv-shelf-empty">
                  <p>No active updates right now.</p>
                </div>
              )}
              {rows.length > 0 && <UpdatesFeed rows={rows} />}
            </div>

            <aside className="rv-updates-side" aria-label="Releases and roadmap">
              <div className="rv-panel" style={{ padding: 22 }}>
                <p className="rv-num" style={{ marginBottom: 8 }}>
                  Latest release
                </p>
                <p className="rv-poster" style={{ fontSize: 44, lineHeight: 0.9 }}>
                  {RELEASE.version}
                </p>
                <p className="rv-muted" style={{ fontSize: 14, marginTop: 8 }}>
                  Released {RELEASE.date}. {RELEASE.minAndroid} or newer.
                </p>
                <div className="rv-btns" style={{ marginTop: 16 }}>
                  <a href={APK_URL} className="rv-pill rv-pill-solid">
                    Download
                  </a>
                  <Link href="/blog" className="rv-pill">
                    Release notes
                  </Link>
                </div>
              </div>
              <div className="rv-panel" style={{ padding: 22 }}>
                <p className="rv-num" style={{ marginBottom: 12 }}>
                  Roadmap
                </p>
                <ol className="rv-roadmap">
                  {ROADMAP.map((r) => (
                    <li key={r.phase} data-state={r.state}>
                      <span className="rv-roadmap-dot" aria-hidden="true" />
                      <span>{r.title}</span>
                      <span className="rv-roadmap-tag">{r.state === "done" ? "Shipped" : r.state === "now" ? "Now" : "Next"}</span>
                    </li>
                  ))}
                </ol>
                <p className="rv-muted" style={{ fontSize: 13, marginTop: 14 }}>
                  Not on the roadmap: AI features and paid subscriptions.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <RvFooter />
    </div>
  );
}
