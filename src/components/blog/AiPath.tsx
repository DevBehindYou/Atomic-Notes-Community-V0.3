"use client";

import { useState } from "react";

// Where a note's text travels when a notes app's AI feature runs, by provider type.
// A general model of common designs, not a description of any one app.

const MODES = [
  { id: "off", label: "AI off", stops: ["Your phone", "Your storage"], note: "Your note goes only where the app already syncs it, if anywhere." },
  { id: "device", label: "On-device model", stops: ["Your phone", "Model on the phone"], note: "The text stays on the device. Check whether the app falls back to a cloud model for bigger requests." },
  { id: "cloud", label: "Cloud AI provider", stops: ["Your phone", "App's server", "AI provider", "Provider logs"], note: "The text leaves your device for at least one other company. Its terms decide how long it's kept and whether people or training can see it." },
  { id: "own", label: "Your own API key", stops: ["Your phone", "AI provider you chose", "Provider logs"], note: "You pick the provider and its terms, but the text still leaves your device for that provider." },
] as const;

export function AiPath() {
  const [m, setM] = useState(2);
  const mode = MODES[m];
  const leaves = mode.id === "cloud" || mode.id === "own";
  return (
    <div className="bw" role="group" aria-labelledby="aip-title">
      <p className="bw-eyebrow">TRY IT · FOLLOW THE NOTE</p>
      <h3 id="aip-title" className="bw-title">Tap "summarize." <span className="sig">Where does the text go?</span></h3>
      <p className="bw-lead">Pick how the AI feature runs.</p>
      <div className="bw-chips" role="radiogroup" aria-label="AI mode">
        {MODES.map((x, i) => (
          <button key={x.id} type="button" role="radio" aria-checked={m === i} className={m === i ? "on" : ""} onClick={() => setM(i)}>{x.label}</button>
        ))}
      </div>
      <ol className="bw-track" aria-live="polite" aria-label="Stops">
        {mode.stops.map((s, i) => (
          <li key={s} className={leaves && i === mode.stops.length - 1 ? "now" : "done"}>
            <span className="bw-stop"><span className="bw-num">{String(i + 1).padStart(2, "0")}</span> {s}</span>
          </li>
        ))}
      </ol>
      <div className={"bw-panel" + (leaves ? " warn" : "")}>
        <p className="bw-label">{mode.stops.length} STOPS</p>
        <p className="bw-panel-text" style={{ marginBottom: 0 }}>{mode.note}</p>
      </div>
      <p className="bw-small" style={{ marginTop: 12 }}>A general model of how AI features are usually built. Each app&apos;s own privacy policy has the details.</p>
    </div>
  );
}
