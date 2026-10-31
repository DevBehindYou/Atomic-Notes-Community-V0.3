"use client";

import { useMemo, useState } from "react";

// Flags words in pasted release notes that usually signal an AI feature. Runs entirely in the browser.
// A keyword scan, not proof: it can miss features and flag harmless uses of a word.

const TERMS: { re: RegExp; label: string }[] = [
  { re: /\bAI\b/g, label: "AI" },
  { re: /\bartificial intelligence\b/gi, label: "artificial intelligence" },
  { re: /\bassistant\b/gi, label: "assistant" },
  { re: /\bcopilot\b/gi, label: "Copilot" },
  { re: /\bgemini\b/gi, label: "Gemini" },
  { re: /\b(chat ?gpt|gpt-?\d|openai)\b/gi, label: "OpenAI / GPT" },
  { re: /\b(claude|anthropic)\b/gi, label: "Claude / Anthropic" },
  { re: /\bLLMs?\b/g, label: "LLM" },
  { re: /\blanguage models?\b/gi, label: "language model" },
  { re: /\bsummari[sz](e|es|ed|ation|ing)\b/gi, label: "summarize" },
  { re: /\brewrit(e|es|ing)\b/gi, label: "rewrite" },
  { re: /\bsmart (compose|reply|search|suggestions?)\b/gi, label: "smart features" },
  { re: /\bgenerat(e|ive|ed|ion)\b/gi, label: "generate" },
  { re: /\bsemantic search\b/gi, label: "semantic search" },
  { re: /\bmachine learning\b/gi, label: "machine learning" },
  { re: /\bMCP\b/g, label: "MCP" },
];

const SAMPLE = `Version 4.2
- New: Ask the assistant to summarize long notes.
- Smart search now understands questions.
- Fixed a crash when exporting PDFs.`;

export function AiScanner() {
  const [text, setText] = useState("");
  const hits = useMemo(() => {
    const out: { label: string; n: number }[] = [];
    for (const t of TERMS) {
      const n = (text.match(t.re) || []).length;
      if (n) out.push({ label: t.label, n });
    }
    return out;
  }, [text]);
  const total = hits.reduce((s, h) => s + h.n, 0);

  return (
    <div className="bw" role="group" aria-labelledby="ais-title">
      <p className="bw-eyebrow">TRY IT · RELEASE NOTE SCANNER</p>
      <h3 id="ais-title" className="bw-title">Did your notes app <span className="sig">just add AI?</span></h3>
      <p className="bw-lead">Paste the release notes from an app store page or changelog. Nothing leaves this page.</p>
      <label htmlFor="ais-text" className="bw-label">RELEASE NOTES</label>
      <textarea id="ais-text" value={text} onChange={(e) => setText(e.target.value)} rows={6}
                placeholder="Paste release notes here"
                style={{ display: "block", width: "100%", margin: "6px 0 10px", font: "inherit", fontSize: "0.95rem", background: "#fff", border: "2px solid var(--ink)", borderRadius: 4, padding: "10px 12px", color: "var(--ink)", resize: "vertical" }} />
      <div className="bw-row" style={{ marginBottom: 12 }}>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setText(SAMPLE)}>Try a sample</button>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setText("")} disabled={!text}>Clear</button>
      </div>
      <div className="bw-chips" aria-live="polite" style={{ marginBottom: 10 }}>
        {hits.map((h) => (<span key={h.label} className="bw-pill">{h.label} × {h.n}</span>))}
      </div>
      <p className="bw-status">
        <b className="bw-score">{total}</b>
        {!text ? "Paste something to scan it." : total === 0 ? "No AI words found. Still read the full notes before you update." : "AI-related words found. Read those lines, then check the app's settings after you update."}
      </p>
      <p className="bw-small">A keyword scan, not proof. It can miss renamed features and flag harmless uses of a word.</p>
    </div>
  );
}
