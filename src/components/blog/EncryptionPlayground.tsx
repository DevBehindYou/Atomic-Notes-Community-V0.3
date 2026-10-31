"use client";

import { useEffect, useState } from "react";

// Real AES-256-GCM in the browser, so readers can see what a server and a cloud drive would hold
// with the vault off (plain text) and on (ciphertext). The key comes from PBKDF2 because browsers
// ship it. The app itself uses Argon2id. Nothing typed here leaves the page.

const PHRASE = "gopher beckon cultivate dolphin mentor clause";
const SALT = "atomic-notes-blog-demo";

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const norm = (p: string) => p.trim().toLowerCase().replace(/\s+/g, " ");

async function keyFrom(phrase: string) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(norm(phrase)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: 200_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function seal(text: string, phrase: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFrom(phrase), new TextEncoder().encode(text)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return b64(out); // nonce(12) ++ ciphertext ++ tag(16), like the app's sealed blob
}

async function open(blob: string, phrase: string) {
  const all = unb64(blob);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.slice(0, 12) }, await keyFrom(phrase), all.slice(12));
  return new TextDecoder().decode(pt);
}

export function EncryptionPlayground() {
  const [note, setNote] = useState("Locker code 4471. Call Dr. Rao about the results.");
  const [vault, setVault] = useState(false);
  const [blob, setBlob] = useState("");
  const [tryPhrase, setTryPhrase] = useState(PHRASE);
  const [unlock, setUnlock] = useState<{ ok: boolean; text: string } | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!globalThis.crypto?.subtle) { setSupported(false); return; }
    let live = true;
    setUnlock(null);
    if (vault && note) seal(note, PHRASE).then((b) => live && setBlob(b));
    return () => { live = false; };
  }, [note, vault]);

  async function tryUnlock() {
    try {
      setUnlock({ ok: true, text: await open(blob, tryPhrase) });
    } catch {
      setUnlock({ ok: false, text: "Wrong phrase. The 16-byte tag check failed, so nothing was decrypted." });
    }
  }

  const stored = vault ? blob : note;
  return (
    <div className="bw" role="group" aria-labelledby="enc-title">
      <p className="bw-eyebrow">TRY IT · REAL AES-256-GCM IN YOUR BROWSER</p>
      <h3 id="enc-title" className="bw-title">What the cloud sees. <span className="sig">Vault off and on.</span></h3>
      <p className="bw-lead">Type a note, then switch the vault on. Nothing you type leaves this page.</p>

      <div className="bw-input" style={{ gridTemplateColumns: "1fr" }}>
        <label htmlFor="enc-note" className="bw-label">YOUR NOTE, ON YOUR PHONE</label>
        <input id="enc-note" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="bw-row" style={{ marginBottom: 14 }}>
        <div className="bw-seg" role="radiogroup" aria-label="Vault">
          <button type="button" role="radio" aria-checked={!vault} className={!vault ? "on" : ""} onClick={() => setVault(false)}>Vault off (T2T)</button>
          <button type="button" role="radio" aria-checked={vault} className={vault ? "on" : ""} onClick={() => setVault(true)}>Vault on (E2E)</button>
        </div>
        <span className={"bw-pill" + (vault ? " live" : "")}>{vault ? "ONLY YOU HOLD THE KEY" : "READABLE IN THE CLOUD"}</span>
      </div>

      {!supported ? (
        <p className="bw-status">This browser doesn't offer Web Crypto, so the live demo can't run here.</p>
      ) : (
        <div className="bw-cols">
          <div className="bw-pane">
            <p className="bw-label">SYNC SERVER SEES, IN TRANSIT</p>
            <p className={"bw-code" + (vault ? "" : " plain")}>{stored || "…"}</p>
          </div>
          <div className="bw-pane">
            <p className="bw-label">YOUR GOOGLE DRIVE STORES</p>
            <p className={"bw-code" + (vault ? "" : " plain")}>{stored ? (vault ? `{"enc_v":1,"payload":"${stored}"}` : `{"enc_v":0,"body":"${stored}"}`) : "…"}</p>
          </div>
        </div>
      )}

      {vault && supported && (
        <div className="bw-input">
          <label htmlFor="enc-phrase" className="bw-label">UNLOCK WITH A RECOVERY PHRASE · CHANGE ONE WORD TO SEE IT FAIL</label>
          <input id="enc-phrase" value={tryPhrase} onChange={(e) => { setTryPhrase(e.target.value); setUnlock(null); }} />
          <button type="button" className="btn-signal" onClick={tryUnlock}>Unlock</button>
        </div>
      )}
      <p className="bw-status" aria-live="polite">
        {unlock ? <><b className={unlock.ok ? "ok" : "bad"}>{unlock.ok ? "DECRYPTED · " : "LOCKED · "}</b>{unlock.text}</> : vault ? "Each save uses a fresh random 12-byte nonce, so the same note never encrypts the same way twice." : "With the vault off, anyone who can open the file can read it."}
      </p>
      <p className="bw-small" style={{ marginTop: 10 }}>Demo key: PBKDF2-SHA256, built into browsers. The app derives its key with Argon2id (64 MiB, 3 passes).</p>
    </div>
  );
}
