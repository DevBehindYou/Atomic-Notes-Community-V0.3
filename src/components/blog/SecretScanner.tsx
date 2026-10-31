"use client";

import { useMemo, useState } from "react";

// Flags text that looks like a secret: password lines, recovery phrases, card numbers, backup codes.
// Runs only in the browser. Heuristics, so it can miss things and flag harmless lines.

function luhn(d: string) {
  let s = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; }
  return s % 10 === 0;
}

type Hit = { kind: string; line: number; text: string };

function scan(text: string): Hit[] {
  const hits: Hit[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const mask = (s: string) => (s.length > 6 ? s.slice(0, 3) + "•".repeat(Math.min(12, s.length - 3)) : "•••");
    if (/\b(pass(word)?|pwd|pw|pin|passcode|login)\b\s*[:=-]/i.test(line)) hits.push({ kind: "Password line", line: i + 1, text: mask(line) });
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+\s*[:/|]\s*\S{4,}$/.test(line)) hits.push({ kind: "Email + password", line: i + 1, text: mask(line) });
    const words = line.toLowerCase().split(/\s+/);
    if ((words.length === 12 || words.length === 18 || words.length === 24 || words.length === 6) && words.every((w) => /^[a-z]{3,8}$/.test(w)))
      hits.push({ kind: "Recovery phrase?", line: i + 1, text: words[0] + " " + "••• ".repeat(3).trim() });
    for (const m of line.matchAll(/\b(?:\d[ -]?){13,19}\b/g)) {
      const d = m[0].replace(/\D/g, "");
      if (d.length >= 13 && d.length <= 19 && luhn(d)) hits.push({ kind: "Card number", line: i + 1, text: "•••• " + d.slice(-4) });
    }
    // A line that is only a short code, like 4821-9930, in a note that mentions backup or recovery codes.
    if (/^[a-z0-9]{4,5}[- ][a-z0-9]{4,5}$/i.test(line) && /\d/.test(line) && /(backup|recovery|2fa|code)/i.test(text))
      hits.push({ kind: "Backup code", line: i + 1, text: line.slice(0, 2) + "•••" });
  });
  return hits;
}

const SAMPLE = `Wifi password: tealhouse-2291
bank login: maria.k / Spring2019!
2FA backup codes
4821-9930
7712-0045
card 4111 1111 1111 1111 exp 08/29
maple river candle orbit falcon quiet ladder pepper stone violet harbor mint`;

export function SecretScanner() {
  const [text, setText] = useState("");
  const hits = useMemo(() => scan(text), [text]);
  return (
    <div className="bw" role="group" aria-labelledby="ss-title">
      <p className="bw-eyebrow">TRY IT · SECRET SCANNER</p>
      <h3 id="ss-title" className="bw-title">What&apos;s hiding <span className="sig">in your notes?</span></h3>
      <p className="bw-lead">Paste a note. It&apos;s checked in this page only and never sent anywhere. Results are masked.</p>
      <label htmlFor="ss-text" className="bw-label">NOTE TEXT</label>
      <textarea id="ss-text" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Paste a note here" spellCheck={false}
                style={{ display: "block", width: "100%", margin: "6px 0 10px", font: "inherit", fontSize: "0.95rem", background: "#fff", border: "2px solid var(--ink)", borderRadius: 4, padding: "10px 12px", color: "var(--ink)", resize: "vertical" }} />
      <div className="bw-row" style={{ marginBottom: 12 }}>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setText(SAMPLE)}>Try a fake sample</button>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setText("")} disabled={!text}>Clear</button>
      </div>
      <ul className="bw-log" aria-live="polite">
        {text && hits.length === 0 && <li><span>Nothing that looks like a secret. Still read it once yourself.</span><b className="ok">CLEAR</b></li>}
        {hits.map((h, i) => (<li key={i}><span>Line {h.line}: {h.text}</span><b className="bad">{h.kind.toUpperCase()}</b></li>))}
      </ul>
      <p className="bw-status" style={{ marginTop: 10 }}><b className="bw-score">{hits.length}</b>{!text ? "Paste a note to scan it." : hits.length ? "Move these into a password manager or onto paper, then delete the note." : ""}</p>
      <p className="bw-small">Pattern matching, not proof. It can miss secrets and flag harmless lines.</p>
    </div>
  );
}
