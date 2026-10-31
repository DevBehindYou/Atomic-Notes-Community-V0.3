"use client";

import { useState } from "react";

// What a leaked "logins" note can unlock. Email resets most other accounts, so it multiplies the reach.
// An illustrative model of typical account recovery, not a description of any one service.

const ITEMS = [
  { id: "email", label: "Email password", reach: ["Reset almost any other account", "Read every reset link and code sent to you"] },
  { id: "bank", label: "Bank or card login", reach: ["See balances and statements", "Try transfers, with help from your security answers"] },
  { id: "carrier", label: "Phone carrier login", reach: ["Request a SIM swap", "Receive your text message codes"] },
  { id: "social", label: "Social media", reach: ["Message your contacts as you", "Scam friends and family"] },
  { id: "cloud", label: "Cloud storage", reach: ["Download your photos and documents", "Find more personal data"] },
  { id: "answers", label: "Security answers", reach: ["Pass phone verification with support lines", "Reset accounts that still use questions"] },
  { id: "id", label: "ID or tax numbers", reach: ["Open new accounts in your name"] },
];

export function BlastRadius() {
  const [on, setOn] = useState<string[]>(["email"]);
  const toggle = (id: string) => setOn((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const hits = ITEMS.filter((i) => on.includes(i.id));
  const reach = hits.flatMap((i) => i.reach);
  const viaEmail = on.includes("email") ? ITEMS.filter((i) => !on.includes(i.id) && ["bank", "social", "cloud"].includes(i.id)).map((i) => i.label) : [];
  const level = on.includes("email") || on.length >= 3 ? "high" : on.length ? "mid" : "";

  return (
    <div className="bw" role="group" aria-labelledby="br-title">
      <p className="bw-eyebrow">TRY IT · THE BLAST RADIUS</p>
      <h3 id="br-title" className="bw-title">Your logins note leaks. <span className="sig">How far does it reach?</span></h3>
      <p className="bw-lead">Tick what&apos;s written in your note today.</p>
      <div className="bw-chips" role="group" aria-label="What the note holds">
        {ITEMS.map((i) => (
          <button key={i.id} type="button" aria-pressed={on.includes(i.id)} className={on.includes(i.id) ? "on" : ""} onClick={() => toggle(i.id)}>{i.label}</button>
        ))}
      </div>
      <div className={"bw-meter" + (level ? " " + level : "")} aria-hidden="true"><span style={{ width: `${Math.min(100, (reach.length + viaEmail.length * 2) * 9)}%` }} /></div>
      <div className={"bw-panel" + (level === "high" ? " warn" : "")} aria-live="polite">
        <p className="bw-label">SOMEONE WITH THIS NOTE CAN</p>
        {reach.length === 0 ? (
          <p className="bw-panel-text" style={{ marginBottom: 0 }}>Nothing ticked. Keep it that way.</p>
        ) : (
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
            {reach.map((r) => (<li key={r}>{r}</li>))}
            {viaEmail.length > 0 && <li><b>Through your email:</b> reset {viaEmail.join(", ").toLowerCase()}, even though they aren&apos;t in the note.</li>}
          </ul>
        )}
      </div>
      <p className="bw-small" style={{ marginTop: 12 }}>A typical picture of how account recovery works. Two-step verification on each account cuts this down a lot.</p>
    </div>
  );
}
