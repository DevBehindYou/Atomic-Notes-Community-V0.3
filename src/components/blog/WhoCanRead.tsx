"use client";

import { useState } from "react";

// Pick what "encrypted" means for an app and see who can still read a note.

const ACTORS = ["Someone on your Wi-Fi", "Someone who steals the server disks", "The app company", "A legal request to the company", "You, on your devices"];

const MODELS: { name: string; tag: string; reads: boolean[]; note: string }[] = [
  { name: "No encryption", tag: "PLAIN", reads: [true, true, true, true, true], note: "Everyone along the path can read your notes. Rare today, but some old sync tools still work this way." },
  { name: "HTTPS only", tag: "IN TRANSIT", reads: [false, true, true, true, true], note: "TLS locks the trip. On arrival, the server holds plain text." },
  { name: "Encrypted at rest", tag: "PROVIDER KEYS", reads: [false, false, true, true, true], note: "Disks are encrypted, but the company holds the keys, so it can still decrypt." },
  { name: "End-to-end", tag: "YOUR KEY", reads: [false, false, false, false, true], note: "Notes are encrypted on your device. The company stores ciphertext it can't open." },
];

export function WhoCanRead() {
  const [m, setM] = useState(1);
  const model = MODELS[m];
  return (
    <div className="bw" role="group" aria-labelledby="wcr-title">
      <p className="bw-eyebrow">TRY IT · WHO CAN READ YOUR NOTE?</p>
      <h3 id="wcr-title" className="bw-title">Same word, <span className="sig">four different locks.</span></h3>
      <p className="bw-lead">Pick what an app means by &ldquo;encrypted&rdquo;.</p>
      <div className="bw-chips" role="radiogroup" aria-label="Encryption model">
        {MODELS.map((x, i) => (
          <button key={x.name} type="button" role="radio" aria-checked={m === i} className={m === i ? "on" : ""} onClick={() => setM(i)}>{x.name}</button>
        ))}
      </div>
      <ul className="bw-grid">
        {ACTORS.map((a, i) => (
          <li key={a} className={i === ACTORS.length - 1 ? "self" : model.reads[i] ? "can" : "cant"}>
            <b>{model.reads[i] ? "CAN READ" : "CAN'T READ"}</b>
            <span>{a}</span>
          </li>
        ))}
      </ul>
      <p className="bw-status" aria-live="polite"><b className="bw-score">{model.tag}</b> {model.note}</p>
    </div>
  );
}
