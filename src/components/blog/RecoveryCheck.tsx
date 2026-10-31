"use client";

import { useState } from "react";

// What each S2 app can do for you after a loss, from its own security docs (October 9, 2026).

const LOSSES = [
  { id: "secret", label: "My password or phrase" },
  { id: "device", label: "My phone" },
  { id: "both", label: "Both" },
] as const;

type Loss = (typeof LOSSES)[number]["id"];
type Outcome = { ok: "yes" | "partly" | "no"; text: string };

const APPS: { name: string; out: Record<Loss, Outcome> }[] = [
  { name: "Atomic Notes (vault on)", out: {
    secret: { ok: "partly", text: "A phone that already has the vault open keeps reading it. No new device can ever open those notes, so copy them out of the vault now." },
    device: { ok: "yes", text: "Sign in on a new phone and type your six words. Vault notes sync back from your Drive and open." },
    both: { ok: "no", text: "Vault notes are gone for good. Nobody holds a copy of the key, including the developer." } } },
  { name: "Notesnook", out: {
    secret: { ok: "yes", text: "Use the recovery key you saved at sign-up to get back in with your notes." },
    device: { ok: "yes", text: "Log in anywhere with your password. Notes sync down and decrypt." },
    both: { ok: "no", text: "Without the password and the recovery key, Notesnook can't decrypt anything." } } },
  { name: "Standard Notes", out: {
    secret: { ok: "no", text: "Standard Notes can't reset it for you. Without the password, the encrypted notes stay locked." },
    device: { ok: "yes", text: "Sign in on another device and everything syncs back." },
    both: { ok: "no", text: "Without the password, nothing can be decrypted." } } },
  { name: "Cryptee", out: {
    secret: { ok: "no", text: "Cryptee can't decrypt your files without your encryption key." },
    device: { ok: "yes", text: "It runs in a browser, so any device with your login and key works." },
    both: { ok: "no", text: "Without the encryption key, the files stay encrypted." } } },
  { name: "Joplin", out: {
    secret: { ok: "partly", text: "The master password can't be recovered. A device that still holds decrypted notes can export them." },
    device: { ok: "yes", text: "Install Joplin, connect the same sync target, and enter the master password." },
    both: { ok: "no", text: "The encrypted copy in your sync target stays locked for good." } } },
];

const WORD = { yes: "RECOVERABLE", partly: "PARTLY", no: "LOST" };

export function RecoveryCheck() {
  const [app, setApp] = useState(0);
  const [loss, setLoss] = useState<Loss>("secret");
  const o = APPS[app].out[loss];
  return (
    <div className="bw" role="group" aria-labelledby="rc-title">
      <p className="bw-eyebrow">TRY IT · RECOVERY CHECK</p>
      <h3 id="rc-title" className="bw-title">You lost something. <span className="sig">Can you get back in?</span></h3>
      <p className="bw-lead">Pick an app, then pick what you lost.</p>
      <p className="bw-label" id="rc-app">App</p>
      <div className="bw-chips" role="radiogroup" aria-labelledby="rc-app" style={{ marginTop: 6 }}>
        {APPS.map((a, i) => (
          <button key={a.name} type="button" role="radio" aria-checked={app === i} className={app === i ? "on" : ""} onClick={() => setApp(i)}>{a.name}</button>
        ))}
      </div>
      <p className="bw-label" id="rc-loss">I lost</p>
      <div className="bw-seg" role="radiogroup" aria-labelledby="rc-loss" style={{ margin: "6px 0 16px" }}>
        {LOSSES.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={loss === l.id} className={loss === l.id ? "on" : ""} onClick={() => setLoss(l.id)}>{l.label}</button>
        ))}
      </div>
      <div className={"bw-panel" + (o.ok === "no" ? " warn" : "")} aria-live="polite">
        <p className="bw-label">{APPS[app].name.toUpperCase()}</p>
        <p className="bw-panel-ask">{WORD[o.ok]}</p>
        <p className="bw-panel-text" style={{ marginBottom: 0 }}>{o.text}</p>
      </div>
      <p className="bw-small" style={{ marginTop: 12 }}>From each app&apos;s security documentation, October 9, 2026. A general guide, not a promise of support.</p>
    </div>
  );
}
