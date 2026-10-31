"use client";

import { useState } from "react";

// Compares item counts before and after a notes migration and flags any gap.

const ROWS = [
  { id: "notes", label: "Notes" },
  { id: "checklists", label: "Checklists" },
  { id: "attachments", label: "Attachments" },
  { id: "folders", label: "Notebooks or folders" },
];

type Counts = Record<string, { before: string; after: string }>;

export function CountCheck() {
  const [c, setC] = useState<Counts>(Object.fromEntries(ROWS.map((r) => [r.id, { before: "", after: "" }])));
  const set = (id: string, k: "before" | "after", v: string) => setC((s) => ({ ...s, [id]: { ...s[id], [k]: v.replace(/[^\d]/g, "").slice(0, 6) } }));
  const results = ROWS.map((r) => {
    const b = c[r.id].before, a = c[r.id].after;
    if (b === "" || a === "") return { ...r, state: "wait" as const, diff: 0 };
    const diff = Number(a) - Number(b);
    return { ...r, state: diff === 0 ? ("ok" as const) : ("bad" as const), diff };
  });
  const filled = results.filter((r) => r.state !== "wait");
  const bad = results.filter((r) => r.state === "bad");

  return (
    <div className="bw" role="group" aria-labelledby="cc-title">
      <p className="bw-eyebrow">STEP 4 · COUNT CHECK</p>
      <h3 id="cc-title" className="bw-title">Did everything <span className="sig">make it across?</span></h3>
      <p className="bw-lead">Type the counts from the old app and the new one. Any gap gets flagged.</p>
      <div style={{ overflowX: "auto" }}>
        <table className="bw-table" style={{ minWidth: 0 }}>
          <thead><tr><th>ITEM</th><th>OLD APP</th><th>NEW APP</th><th>RESULT</th></tr></thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                {(["before", "after"] as const).map((k) => (
                  <td key={k}>
                    <input aria-label={`${r.label}, ${k === "before" ? "old app" : "new app"}`} inputMode="numeric" value={c[r.id][k]} onChange={(e) => set(r.id, k, e.target.value)}
                           style={{ width: 72, font: "inherit", padding: "6px 8px", border: "2px solid var(--ink)", borderRadius: 4, background: "#fff", color: "var(--ink)" }} />
                  </td>
                ))}
                <td className="mono"><span className={r.state === "ok" ? "ok" : r.state === "bad" ? "bad" : "wait"}>{r.state === "wait" ? "..." : r.state === "ok" ? "MATCH" : `${r.diff > 0 ? "+" : ""}${r.diff}`}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="bw-status" aria-live="polite" style={{ marginTop: 12 }}>
        <b className="bw-score">{filled.length - bad.length} / {ROWS.length}</b>
        {filled.length === 0 ? "Fill in a row to compare." : bad.length ? `Gap in ${bad.map((b) => b.label.toLowerCase()).join(", ")}. Find what's missing before you close the old account.` : "Everything you've counted matches."}
      </p>
      <p className="bw-small">A higher count in the new app can mean duplicates or split notes. Check those too.</p>
    </div>
  );
}
