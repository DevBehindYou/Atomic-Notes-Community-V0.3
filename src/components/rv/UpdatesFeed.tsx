"use client";

import { useMemo, useState } from "react";
import type { NotificationRow } from "@/lib/content";

const label = (s: string) => s.replace(/_/g, " ");

function fmt(d: string): string {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}

/** Live notices from the Atomic Notes Server, filterable by type. Same feed as the app's bell. */
export function UpdatesFeed({ rows }: { rows: NotificationRow[] }) {
  const [type, setType] = useState("all");
  const types = useMemo(() => ["all", ...Array.from(new Set(rows.map((r) => r.type)))], [rows]);
  const shown = type === "all" ? rows : rows.filter((r) => r.type === type);

  return (
    <div>
      {types.length > 2 && (
        <div className="rv-shelf-chips" role="group" aria-label="Filter by type" style={{ marginBottom: 18 }}>
          {types.map((t) => (
            <button key={t} type="button" className="rv-shelf-chip" aria-pressed={type === t} onClick={() => setType(t)}>
              {t === "all" ? "All" : label(t)}
            </button>
          ))}
        </div>
      )}
      <ol className="rv-feed">
        {shown.map((n) => (
          <li key={n.id} className="rv-notice" data-priority={n.priority}>
            <div className="rv-notice-top">
              <span className="rv-notice-type">{label(n.type)}</span>
              <span className="rv-notice-pri">{n.priority}</span>
              <time dateTime={n.created_at}>{fmt(n.created_at)}</time>
            </div>
            <h3>{n.subject}</h3>
            <p>{n.description}</p>
            {n.action && n.action_url && (
              <a
                href={n.action_url}
                className="rv-pill"
                target={n.action_url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                style={{ alignSelf: "flex-start" }}
              >
                {n.action}
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
