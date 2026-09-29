import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchActiveNotifications } from "@/lib/atomicServer";
import type { NotificationRow } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Updates and status",
  description:
    "Live release notes, maintenance notices and service status for Atomic Notes. The same messages appear in the app's notification center.",
  alternates: { canonical: "/updates" },
};

async function getActive(): Promise<{ rows: NotificationRow[]; error: string | null }> {
  try {
    const rows = (await fetchActiveNotifications()) as NotificationRow[];
    // Priority order: critical, high, normal, low. (Expiry is already
    // filtered server-side — see the Server's routes/public.ts.)
    const rank = { critical: 0, high: 1, normal: 2, low: 3 } as const;
    rows.sort((a, b) => rank[a.priority] - rank[b.priority]);
    return { rows, error: null };
  } catch (e) {
    return { rows: [], error: "Could not load updates right now." };
  }
}

function priorityBorder(p: NotificationRow["priority"]): string {
  switch (p) {
    case "critical":
      return "border-l-4 border-l-[#BA1A1A]";
    case "high":
      return "border-l-4 border-l-high";
    case "normal":
      return "border-l-4 border-l-signal";
    default:
      return "border-l-4 border-l-line";
  }
}

function fmt(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UpdatesPage() {
  const { rows, error } = await getActive();

  return (
    <main className="min-h-screen">
      <SiteNav current="updates" />

      <section className="mx-auto max-w-3xl px-5 py-10">
        <p className="mono-label text-signal">NOTIFICATION CENTER</p>
        <h1 className="font-display mt-2 text-5xl">Updates & status.</h1>
        <p className="mt-3 text-slate">
          Server incidents, releases, maintenance, and announcements. The same
          feed appears in the app.
        </p>

        <div className="mt-8 space-y-3">
          {error && <div className="module p-5 text-slate">{error}</div>}
          {!error && rows.length === 0 && (
            <div className="module p-5 text-slate">No active updates right now.</div>
          )}
          {rows.map((n) => (
            <article key={n.id} className={"module p-5 " + priorityBorder(n.priority)}>
              <div className="flex items-center gap-3">
                <span className="mono-label text-signal">
                  {n.type.replace(/_/g, " ")}
                </span>
                <span className="mono-label">· {n.priority}</span>
                <span className="mono-label ml-auto">{fmt(n.created_at)}</span>
              </div>
              <h2 className="font-display mt-2 text-2xl">{n.subject}</h2>
              <p className="mt-2 text-slate">{n.description}</p>
              {n.action && n.action_url && (
                <a
                  href={n.action_url}
                  className="ghost-btn mt-4"
                  target={n.action_url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {n.action}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
