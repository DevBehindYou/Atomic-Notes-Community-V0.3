"use client";

import { useState } from "react";

// A sample week of sync events with no note content at all, and what someone could infer from them.

const LOG = [
  { at: "MON 23:52", ev: "sync push · 1 note · 2.1 KB", ip: "home Wi-Fi" },
  { at: "TUE 23:47", ev: "sync push · 1 note · 2.4 KB", ip: "home Wi-Fi" },
  { at: "WED 09:12", ev: "sign-in · new device · Pixel 8", ip: "office network" },
  { at: "WED 23:58", ev: "sync push · 1 note · 2.9 KB", ip: "home Wi-Fi" },
  { at: "THU 14:03", ev: "sync push · 6 notes · 0.4 KB each", ip: "hospital guest Wi-Fi" },
  { at: "FRI 00:21", ev: "sync push · 1 note · 3.6 KB", ip: "home Wi-Fi" },
  { at: "SAT 11:40", ev: "delete · 1 note", ip: "airport Wi-Fi" },
];

const INFER = [
  "Writes one long note almost every night near midnight: probably a journal.",
  "Lives and works in two places that never change: home and office.",
  "Bought or switched to a new phone on Wednesday.",
  "Spent Thursday afternoon at a hospital, taking short notes.",
  "Was traveling on Saturday, and deleted something before the trip.",
];

export function MetadataInference() {
  const [shown, setShown] = useState(0);
  return (
    <div className="bw" role="group" aria-labelledby="meta-title">
      <p className="bw-eyebrow">TRY IT · NO CONTENT, STILL REVEALING</p>
      <h3 id="meta-title" className="bw-title">A week of metadata. <span className="sig">Zero note text.</span></h3>
      <p className="bw-lead">This is a made-up log of the kind a sync service could keep. Not one word of any note is in it.</p>
      <div className="table-wrap" style={{ marginBottom: 14 }}>
        <table className="bw-table">
          <thead><tr><th>WHEN</th><th>EVENT</th><th>WHERE (FROM THE IP)</th></tr></thead>
          <tbody>{LOG.map((r) => <tr key={r.at}><td className="mono">{r.at}</td><td>{r.ev}</td><td>{r.ip}</td></tr>)}</tbody>
        </table>
      </div>
      <ol className="bw-infer" aria-live="polite">
        {INFER.slice(0, shown).map((x) => <li key={x}>{x}</li>)}
      </ol>
      <div className="bw-row">
        <p className="bw-status"><b className="bw-score">{shown} / {INFER.length}</b> {shown === INFER.length ? "All of that, without reading a single note." : "inferences revealed"}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn-signal bw-small-btn" disabled={shown === INFER.length} onClick={() => setShown((s) => s + 1)}>Infer next</button>
          <button type="button" className="btn-ghost bw-small-btn" onClick={() => setShown(0)}>Reset</button>
        </div>
      </div>
    </div>
  );
}
