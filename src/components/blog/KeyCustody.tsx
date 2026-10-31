"use client";

import { useState } from "react";

// Key custody for common notes setups, from each provider's own documentation (October 9, 2026).

const SETUPS = [
  { name: "iCloud Notes, standard", key: "Apple", read: "Yes. Apple holds the keys for Notes under standard data protection.", meta: "Not documented separately, since content isn't end-to-end encrypted.", recovery: "Apple can help you back into your account and your notes." },
  { name: "iCloud Notes, Advanced Data Protection", key: "Your trusted devices", read: "No. Notes content is end-to-end encrypted.", meta: "Created, modified, and viewed dates, pinned and deleted state, and drawing flags stay under standard protection.", recovery: "A recovery contact or recovery key you set up. Not offered to new UK users since February 2025." },
  { name: "Google Keep", key: "Google", read: "Yes. Keep isn't end-to-end encrypted.", meta: "Everything the service stores is under Google's keys.", recovery: "Google account recovery restores your notes." },
  { name: "Atomic Notes, T2T (default)", key: "No note key. Google holds your Drive's keys", read: "The sync server handles text in transit but doesn't store it. Your Drive holds readable files.", meta: "Note ID, type, pinned and deleted state, timestamps, and rough size.", recovery: "Sign in with Google. Your Drive files and phone copy remain." },
  { name: "Atomic Notes, vault on", key: "Your phone, from your six words", read: "No. Only ciphertext leaves the phone.", meta: "Note ID, type, pinned and deleted state, timestamps, and rough size.", recovery: "Only your six-word phrase. No reset path exists." },
];

export function KeyCustody() {
  const [i, setI] = useState(1);
  const x = SETUPS[i];
  return (
    <div className="bw" role="group" aria-labelledby="kc-title">
      <p className="bw-eyebrow">LOOK IT UP · KEY CUSTODY</p>
      <h3 id="kc-title" className="bw-title">Who holds <span className="sig">the key?</span></h3>
      <p className="bw-lead">Pick a setup to see who can read your notes, what stays visible, and how recovery works.</p>
      <div className="bw-split">
        <div className="bw-tabs" role="tablist" aria-label="Setups" aria-orientation="vertical">
          {SETUPS.map((s, j) => (
            <button key={s.name} type="button" role="tab" id={`kc-tab-${j}`} aria-selected={i === j} aria-controls="kc-panel" className={i === j ? "on" : ""} onClick={() => setI(j)}>{s.name}</button>
          ))}
        </div>
        <div className="bw-panel" role="tabpanel" id="kc-panel" aria-labelledby={`kc-tab-${i}`} aria-live="polite">
          <p className="bw-label">KEY HELD BY</p>
          <p className="bw-panel-ask" style={{ marginBottom: 14 }}>{x.key}</p>
          <p className="bw-label">CAN THE PROVIDER READ NOTES?</p>
          <p className="bw-panel-text">{x.read}</p>
          <p className="bw-label">STILL VISIBLE</p>
          <p className="bw-panel-text">{x.meta}</p>
          <p className="bw-label">RECOVERY</p>
          <p className="bw-panel-text" style={{ marginBottom: 0 }}>{x.recovery}</p>
        </div>
      </div>
      <p className="bw-small" style={{ marginTop: 12 }}>From Apple, Google, and Atomic Notes documentation, checked October 9, 2026.</p>
    </div>
  );
}
