"use client";

import { useState } from "react";

// Common privacy-policy phrases next to what they can allow and the question worth asking.
// Educational, not legal advice: the meaning always depends on the full policy.

const PHRASES = [
  {
    phrase: "We may share information with trusted partners.",
    means: "Data can leave the company. \"Partners\" can include analytics, advertising, cloud, and AI vendors.",
    ask: "Which partners, which data, and can I opt out?",
  },
  {
    phrase: "We use your content to improve our services.",
    means: "Your notes may be read by software, or in some cases by staff, to build or test features.",
    ask: "Does this include training AI models, and is it opt-in?",
  },
  {
    phrase: "Your data is encrypted in transit and at rest.",
    means: "HTTPS on the wire and encrypted disks. The company still holds the keys and can read your notes.",
    ask: "Is it end-to-end encrypted, and who holds the key?",
  },
  {
    phrase: "We do not sell your personal information.",
    means: "Selling is one narrow act. Sharing for ads or analytics can still happen.",
    ask: "Do you share personal information for advertising?",
  },
  {
    phrase: "We collect aggregated or de-identified data.",
    means: "Usage data is still collected. Combined with other data, it can sometimes point back to you.",
    ask: "What exactly is collected, and how long is it kept?",
  },
  {
    phrase: "We retain data as long as necessary.",
    means: "There is no fixed deletion date. Deleted notes may survive in backups.",
    ask: "How many days until deleted notes and backups are gone?",
  },
];

export function PolicyDecoder() {
  const [open, setOpen] = useState(0);
  const p = PHRASES[open];
  return (
    <div className="bw" role="group" aria-labelledby="decoder-title">
      <p className="bw-eyebrow">TRY IT · PRIVACY POLICY DECODER</p>
      <h3 id="decoder-title" className="bw-title">What the policy says. <span className="sig">What it can mean.</span></h3>
      <p className="bw-lead">Pick a phrase you've seen in a notes app's privacy policy.</p>

      <div className="bw-split">
        <div className="bw-tabs" role="tablist" aria-label="Policy phrases" aria-orientation="vertical">
          {PHRASES.map((x, i) => (
            <button key={i} type="button" role="tab" id={`pd-tab-${i}`} aria-selected={open === i} aria-controls="pd-panel"
                    className={open === i ? "on" : ""} onClick={() => setOpen(i)}>
              &ldquo;{x.phrase}&rdquo;
            </button>
          ))}
        </div>
        <div className="bw-panel" role="tabpanel" id="pd-panel" aria-labelledby={`pd-tab-${open}`}>
          <p className="bw-label">IT CAN MEAN</p>
          <p className="bw-panel-text">{p.means}</p>
          <p className="bw-label">ASK THE APP</p>
          <p className="bw-panel-ask">{p.ask}</p>
        </div>
      </div>
      <p className="bw-small" style={{ marginTop: 14 }}>A general guide, not legal advice. The full policy decides what a phrase allows.</p>
    </div>
  );
}
