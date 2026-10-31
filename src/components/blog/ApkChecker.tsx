"use client";

import { useState } from "react";

// Computes a file's SHA-256 in the browser with Web Crypto and compares it with the
// checksums published in the Atomic Notes 2.03.5 release notes, or one the reader pastes.
// The file is read locally and never uploaded.

const KNOWN: Record<string, string> = {
  "7ae44e050a0e62edc0b2162d26314675b8cd12fc6a43ab926c9ce4ced40ce0d9": "atomic-notes-2.03.5-arm64-v8a.apk",
  "9479a8937409f804d024d1a5f8b7e201739f45f50a185d8c86d7da90ad7ab19f": "atomic-notes-2.03.5-armeabi-v7a.apk",
  b2153856ae0a0d2e1951c6bb06613c3ef47876100961ac1efbbe91aac298eb36: "atomic-notes-2.03.5-x86_64.apk",
};

const MAX = 200 * 1024 * 1024;

export function ApkChecker() {
  const [hash, setHash] = useState("");
  const [name, setName] = useState("");
  const [expected, setExpected] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(f: File | undefined) {
    setErr(""); setHash(""); setName(f?.name ?? "");
    if (!f) return;
    if (f.size > MAX) { setErr("That file is over 200 MB. Use sha256sum on a computer instead."); return; }
    if (!globalThis.crypto?.subtle) { setErr("This browser can't compute SHA-256 here. Use sha256sum on a computer instead."); return; }
    setBusy(true);
    try {
      const digest = await crypto.subtle.digest("SHA-256", await f.arrayBuffer());
      setHash(Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join(""));
    } catch {
      setErr("Couldn't read that file.");
    } finally {
      setBusy(false);
    }
  }

  const want = expected.trim().toLowerCase();
  const known = hash ? KNOWN[hash] : undefined;
  const verdict = !hash ? null
    : want ? (want === hash ? { ok: true, text: "Match. The file is byte-for-byte the one the publisher listed." } : { ok: false, text: "No match. Don't install this file." })
      : known ? { ok: true, text: `Match: ${known}, as published in the Atomic Notes 2.03.5 release notes.` }
        : { ok: false, text: "Not an Atomic Notes 2.03.5 file. Paste the checksum the publisher lists to compare." };

  return (
    <div className="bw" role="group" aria-labelledby="apk-title">
      <p className="bw-eyebrow">TRY IT · CHECK A DOWNLOAD</p>
      <h3 id="apk-title" className="bw-title">Is this file <span className="sig">the real one?</span></h3>
      <p className="bw-lead">Pick an APK or any other file. Your browser computes its SHA-256 fingerprint. Nothing is uploaded.</p>
      <label className="bw-label" htmlFor="apk-file">FILE</label>
      <input id="apk-file" type="file" onChange={(e) => onFile(e.target.files?.[0])}
             style={{ display: "block", margin: "6px 0 14px", font: "inherit", fontSize: "0.95rem", maxWidth: "100%" }} />
      <div className="bw-input" style={{ margin: "0 0 14px" }}>
        <label className="bw-label" htmlFor="apk-exp">PUBLISHED CHECKSUM (OPTIONAL)</label>
        <input id="apk-exp" value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Leave empty to compare with Atomic Notes 2.03.5" spellCheck={false} />
      </div>
      <p className="bw-label">SHA-256 {name ? `· ${name}` : ""}</p>
      <p className="bw-code plain" aria-live="polite">{busy ? "Reading the file..." : hash || err || "No file picked yet."}</p>
      {verdict && (
        <div className={"bw-panel" + (verdict.ok ? "" : " warn")} style={{ marginTop: 12 }} aria-live="polite">
          <p className="bw-panel-ask">{verdict.ok ? "Fingerprint matches" : "Doesn't match"}</p>
          <p className="bw-panel-text" style={{ marginBottom: 0 }}>{verdict.text}</p>
        </div>
      )}
      <p className="bw-small" style={{ marginTop: 12 }}>A matching fingerprint proves the file wasn&apos;t changed. Check the signing certificate with apksigner too.</p>
    </div>
  );
}
