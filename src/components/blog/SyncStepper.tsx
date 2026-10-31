"use client";

import { useState } from "react";

// Walks through one Atomic Notes sync, step by step, with an optional dropped connection
// to show why retries never double-charge or duplicate a note.

type Step = { layer: string; title: string; body: string };

const HAPPY: Step[] = [
  { layer: "PHONE", title: "You stop typing", body: "The note is already saved in Hive on the device and marked dirty." },
  { layer: "PHONE", title: "Eight seconds pass", body: "Auto sync waits for a pause, so a burst of edits becomes one upload." },
  { layer: "PHONE", title: "A push leaves with a request ID", body: "The phone saves the pending push, with a fresh request ID, before sending it." },
  { layer: "SERVER", title: "Lock, check, charge once", body: "The server takes a per-user lock, checks each note's base version, and spends energy in one transaction." },
  { layer: "DRIVE", title: "One file per note", body: "The note is written to its .atomic file in your My-Atomic-Notes folder. The server keeps only metadata." },
  { layer: "PHONE", title: "Acknowledged", body: "The reply clears the dirty flag. Your other devices pull the change on their next sync." },
];

const RETRY: Step[] = [
  HAPPY[0], HAPPY[1], HAPPY[2],
  { layer: "NETWORK", title: "The connection drops", body: "The push may or may not have reached the server. The phone can't tell." },
  { layer: "PHONE", title: "Retry after 5, 15, then 45 seconds", body: "The phone resends the same saved push with the same request ID." },
  { layer: "SERVER", title: "Seen this ID? Replay the answer", body: "If the first try already landed, the server returns the stored result. No second charge, no duplicate note." },
  HAPPY[4], HAPPY[5],
];

export function SyncStepper() {
  const [flaky, setFlaky] = useState(false);
  const [i, setI] = useState(0);
  const steps = flaky ? RETRY : HAPPY;
  const s = steps[Math.min(i, steps.length - 1)];
  const mode = (f: boolean) => { setFlaky(f); setI(0); };

  return (
    <div className="bw" role="group" aria-labelledby="sync-title">
      <p className="bw-eyebrow">STEP THROUGH IT · ONE SYNC</p>
      <h3 id="sync-title" className="bw-title">From your thumb <span className="sig">to your Drive.</span></h3>
      <div className="bw-row" style={{ marginBottom: 14 }}>
        <div className="bw-seg" role="radiogroup" aria-label="Network">
          <button type="button" role="radio" aria-checked={!flaky} className={!flaky ? "on" : ""} onClick={() => mode(false)}>Good network</button>
          <button type="button" role="radio" aria-checked={flaky} className={flaky ? "on" : ""} onClick={() => mode(true)}>Connection drops</button>
        </div>
      </div>
      <ol className="bw-track" aria-label="Sync steps">
        {steps.map((x, j) => (
          <li key={j} className={j === i ? "now" : j < i ? "done" : ""}>
            <button type="button" onClick={() => setI(j)} aria-current={j === i ? "step" : undefined}>
              <span className="bw-num">{String(j + 1).padStart(2, "0")}</span> {x.layer}
            </button>
          </li>
        ))}
      </ol>
      <div className={"bw-panel" + (s.layer === "NETWORK" ? " warn" : "")} aria-live="polite">
        <p className="bw-label">STEP {i + 1} OF {steps.length} · {s.layer}</p>
        <p className="bw-panel-ask">{s.title}</p>
        <p className="bw-panel-text" style={{ marginTop: 10 }}>{s.body}</p>
      </div>
      <div className="bw-row" style={{ marginTop: 14 }}>
        <button type="button" className="btn-ghost bw-small-btn" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
        <button type="button" className="btn-signal bw-small-btn" onClick={() => setI(i + 1 >= steps.length ? 0 : i + 1)}>{i + 1 >= steps.length ? "Start again" : "Next step"}</button>
      </div>
    </div>
  );
}
