"use client";

import { useState } from "react";

// Average time to guess a random secret, with and without slow key derivation.
// Guess rates are illustrative assumptions, stated in the UI. Entropy assumes truly random choices.

const SECRETS = [
  { name: "8 characters, lowercase and digits", bits: 8 * Math.log2(36) },
  { name: "12 characters, any keyboard symbol", bits: 12 * Math.log2(94) },
  { name: "4 random words (Diceware, 7,776)", bits: 4 * Math.log2(7776) },
  { name: "6 random words (Atomic Notes, 1,024)", bits: 6 * Math.log2(1024) },
  { name: "6 random words (Diceware, 7,776)", bits: 6 * Math.log2(7776) },
];

const KDFS = [
  { name: "Fast hash, no stretching", perGpu: 1e10 },
  { name: "Memory-hard (Argon2id-class)", perGpu: 1e3 },
];

function fmt(sec: number) {
  if (sec < 1) return "under a second";
  const u: [number, string][] = [[31557600e9, "billion years"], [31557600e6, "million years"], [31557600e3, "thousand years"], [31557600, "years"], [86400, "days"], [3600, "hours"], [60, "minutes"], [1, "seconds"]];
  for (const [s, name] of u) if (sec >= s) { const v = sec / s; return `${v >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(1)} ${name}`; }
  return "under a second";
}

export function GuessTime() {
  const [secret, setSecret] = useState(3);
  const [kdf, setKdf] = useState(1);
  const [gpus, setGpus] = useState(2);
  const machines = [1, 100, 10000][gpus];
  const s = SECRETS[secret];
  const rate = KDFS[kdf].perGpu * machines;
  const avg = Math.pow(2, s.bits - 1) / rate;
  return (
    <div className="bw" role="group" aria-labelledby="gt-title">
      <p className="bw-eyebrow">TRY IT · GUESSING TIME</p>
      <h3 id="gt-title" className="bw-title">How long to guess <span className="sig">your secret?</span></h3>
      <p className="bw-lead">Pick a secret, how the app stretches it, and how much hardware an attacker brings.</p>
      <p className="bw-label" id="gt-s">Secret</p>
      <div className="bw-chips" role="radiogroup" aria-labelledby="gt-s" style={{ marginTop: 6 }}>
        {SECRETS.map((x, i) => (
          <button key={x.name} type="button" role="radio" aria-checked={secret === i} className={secret === i ? "on" : ""} onClick={() => setSecret(i)}>{x.name}</button>
        ))}
      </div>
      <div className="bw-row" style={{ alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <p className="bw-label" id="gt-k">Key derivation</p>
          <div className="bw-seg" role="radiogroup" aria-labelledby="gt-k" style={{ marginTop: 6 }}>
            {KDFS.map((x, i) => (
              <button key={x.name} type="button" role="radio" aria-checked={kdf === i} className={kdf === i ? "on" : ""} onClick={() => setKdf(i)}>{i === 0 ? "Fast" : "Slow"}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="bw-label" id="gt-g">Attacker GPUs</p>
          <div className="bw-seg" role="radiogroup" aria-labelledby="gt-g" style={{ marginTop: 6 }}>
            {["1", "100", "10,000"].map((x, i) => (
              <button key={x} type="button" role="radio" aria-checked={gpus === i} className={gpus === i ? "on" : ""} onClick={() => setGpus(i)}>{x}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="bw-cols">
        <div className="bw-pane">
          <p className="bw-label">STRENGTH</p>
          <p className="bw-big">{Math.round(s.bits)} BITS</p>
          <p className="bw-small">if every character or word is chosen at random</p>
        </div>
        <div className="bw-pane" aria-live="polite">
          <p className="bw-label">AVERAGE TIME TO GUESS</p>
          <p className={"bw-big" + (avg > 31557600 * 100 ? " ok" : "")}>{fmt(avg).toUpperCase()}</p>
          <p className="bw-small">{KDFS[kdf].name.toLowerCase()}</p>
        </div>
      </div>
      <p className="bw-small">Assumes {KDFS[0].perGpu.toLocaleString("en-US")} guesses per second per GPU against a fast hash and {KDFS[1].perGpu.toLocaleString("en-US")} against a memory-hard key. Real rates vary with hardware and settings. A password you picked yourself is weaker than these numbers.</p>
    </div>
  );
}
