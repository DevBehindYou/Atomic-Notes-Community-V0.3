"use client";

import { useState } from "react";

// Which threats each encryption setup stops. A general model for notes apps, not a review of any one service.

const SETUPS = [
  { id: "https", label: "HTTPS only" },
  { id: "rest", label: "HTTPS + at rest (provider keys)" },
  { id: "e2e", label: "End-to-end" },
] as const;

type Setup = (typeof SETUPS)[number]["id"];

const THREATS: { t: string; stops: Setup[]; why: string }[] = [
  { t: "Someone on the same Wi-Fi", stops: ["https", "rest", "e2e"], why: "HTTPS hides the trip." },
  { t: "A stolen server disk", stops: ["rest", "e2e"], why: "Encrypted disks are useless without the keys." },
  { t: "A hacker inside the provider", stops: ["e2e"], why: "Inside, the provider's keys are within reach." },
  { t: "The provider, or a legal demand to it", stops: ["e2e"], why: "Only a key the provider never had keeps it out." },
  { t: "Someone holding your unlocked phone", stops: [], why: "Your phone shows the notes decrypted. Use a screen lock and an app lock." },
  { t: "Analytics SDKs in the app", stops: [], why: "They report usage outside note encryption. Pick an app without them." },
];

export function ThreatMatrix() {
  const [s, setS] = useState<Setup>("rest");
  const stopped = THREATS.filter((x) => x.stops.includes(s)).length;
  return (
    <div className="bw" role="group" aria-labelledby="tm-title">
      <p className="bw-eyebrow">TRY IT · THREAT MATRIX</p>
      <h3 id="tm-title" className="bw-title">Who can still <span className="sig">read your notes?</span></h3>
      <p className="bw-lead">Pick an encryption setup. Red means that threat can still get to your notes.</p>
      <div className="bw-chips" role="radiogroup" aria-label="Encryption setup">
        {SETUPS.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={s === x.id} className={s === x.id ? "on" : ""} onClick={() => setS(x.id)}>{x.label}</button>
        ))}
      </div>
      <ul className="bw-grid" aria-live="polite">
        {THREATS.map((x) => {
          const ok = x.stops.includes(s);
          return (
            <li key={x.t} className={ok ? "cant" : "can"}>
              <b>{ok ? "STOPPED" : "CAN STILL READ"}</b>
              <span>{x.t}</span>
              <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>{x.why}</span>
            </li>
          );
        })}
      </ul>
      <p className="bw-status"><b className="bw-score">{stopped} / {THREATS.length}</b> threats stopped by this setup.</p>
    </div>
  );
}
