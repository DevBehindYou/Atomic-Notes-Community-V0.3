"use client";

import { useState } from "react";

// How long a day of note saves spends waiting on the network, cloud-first vs local-first.
// The round-trip times are illustrative assumptions, shown in the UI, not measurements.

const NETS = [
  { name: "Good Wi-Fi", rtt: 0.08, fail: 0 },
  { name: "Busy 4G", rtt: 0.35, fail: 0.02 },
  { name: "Weak signal", rtt: 1.6, fail: 0.15 },
  { name: "Train tunnel", rtt: 6, fail: 0.6 },
  { name: "Airplane mode", rtt: 0, fail: 1 },
];

export function WaitCalculator() {
  const [net, setNet] = useState(2);
  const [saves, setSaves] = useState(40);
  const n = NETS[net];
  const failed = Math.round(saves * n.fail);
  const waited = n.fail === 1 ? 0 : (saves - failed) * n.rtt;
  const fmt = (s: number) => (s < 60 ? `${s.toFixed(s < 10 ? 1 : 0)} s` : `${(s / 60).toFixed(1)} min`);

  return (
    <div className="bw" role="group" aria-labelledby="wait-title">
      <p className="bw-eyebrow">TRY IT · THE WAITING TAX</p>
      <h3 id="wait-title" className="bw-title">How long do you wait <span className="sig">for a server?</span></h3>
      <p className="bw-lead">Pick a network and how many times a day you save a note.</p>
      <div className="bw-chips" role="radiogroup" aria-label="Network">
        {NETS.map((x, i) => (
          <button key={x.name} type="button" role="radio" aria-checked={net === i} className={net === i ? "on" : ""} onClick={() => setNet(i)}>{x.name}</button>
        ))}
      </div>
      <div className="bw-input" style={{ gridTemplateColumns: "1fr auto" }}>
        <label htmlFor="wait-saves" className="bw-label">SAVES PER DAY · {saves}</label>
        <input id="wait-saves" type="range" min={5} max={200} step={5} value={saves} onChange={(e) => setSaves(+e.target.value)} />
      </div>
      <div className="bw-cols">
        <div className="bw-pane">
          <p className="bw-label">CLOUD-FIRST APP</p>
          <p className="bw-big">{n.fail === 1 ? "0 SAVED" : fmt(waited)}</p>
          <p className="bw-small">{n.fail === 1 ? `All ${saves} saves fail or wait for a network.` : `spent waiting${failed ? `, and ${failed} saves fail` : ""}.`}</p>
        </div>
        <div className="bw-pane">
          <p className="bw-label">LOCAL-FIRST APP</p>
          <p className="bw-big ok">0 S</p>
          <p className="bw-small">{`All ${saves} saves finish on the device. Sync waits, you don't.`}</p>
        </div>
      </div>
      <p className="bw-small">Assumes one round trip per save: {NETS.map((x) => `${x.name.toLowerCase()} ${x.fail === 1 ? "no network" : `${x.rtt} s`}`).join(", ")}. Real apps vary.</p>
    </div>
  );
}
