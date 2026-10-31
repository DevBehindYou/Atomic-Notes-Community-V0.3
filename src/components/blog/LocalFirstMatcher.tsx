"use client";

import { useState } from "react";

// Ranks the six local first note taking apps from the L2 listicle against three answers.
// Fit scores (0 to 3) are editorial judgments from each app's docs, checked October 9, 2026.

type Fit = { android: number; desktop: number; noServer: number; selfHost: number; noSync: number; files: number; db: number };
type App = { name: string; anchor: string; line: string; fit: Fit };

const APPS: App[] = [
  { name: "Atomic Notes", anchor: "1-atomic-notes", line: "Android first, synced to your own Google Drive.", fit: { android: 3, desktop: 0, noServer: 3, selfHost: 0, noSync: 2, files: 2, db: 2 } },
  { name: "Obsidian", anchor: "2-obsidian", line: "Markdown files on every platform, optional paid encrypted sync.", fit: { android: 2, desktop: 3, noServer: 3, selfHost: 1, noSync: 3, files: 3, db: 1 } },
  { name: "Logseq", anchor: "3-logseq", line: "Outlines and journals, as files (OG) or a database (2.0).", fit: { android: 2, desktop: 3, noServer: 2, selfHost: 0, noSync: 3, files: 3, db: 2 } },
  { name: "SiYuan", anchor: "4-siyuan", line: "Block-based workspace, encrypted sync to the cloud or your own storage.", fit: { android: 2, desktop: 3, noServer: 2, selfHost: 2, noSync: 3, files: 1, db: 3 } },
  { name: "SilverBullet", anchor: "5-silverbullet", line: "Programmable Markdown wiki on a server you run.", fit: { android: 1, desktop: 3, noServer: 1, selfHost: 3, noSync: 2, files: 3, db: 1 } },
  { name: "Trilium Notes", anchor: "6-trilium-notes", line: "Deep note trees, synced to your own Trilium server.", fit: { android: 1, desktop: 3, noServer: 0, selfHost: 3, noSync: 3, files: 0, db: 3 } },
];

const QUESTIONS = [
  { id: "device", label: "Where do you write most?", options: [
    { id: "android", label: "Android phone" }, { id: "desktop", label: "Computer" }, { id: "both", label: "Both" }] },
  { id: "sync", label: "Who should run the sync?", options: [
    { id: "noServer", label: "Nobody, use storage I have" }, { id: "selfHost", label: "My own server" }, { id: "noSync", label: "No sync" }] },
  { id: "format", label: "How should notes be stored?", options: [
    { id: "files", label: "Plain files" }, { id: "db", label: "Don't mind a database" }] },
];

type Answers = Record<string, string | null>;

function score(a: App, ans: Answers) {
  const f = a.fit;
  let s = 0;
  if (ans.device === "both") s += Math.min(f.android, f.desktop) * 2;
  else if (ans.device) s += f[ans.device as keyof Fit] * 2;
  if (ans.sync) s += f[ans.sync as keyof Fit];
  if (ans.format) s += f[ans.format as keyof Fit];
  return s;
}

export function LocalFirstMatcher() {
  const [ans, setAns] = useState<Answers>({ device: null, sync: null, format: null });
  const answered = Object.values(ans).filter(Boolean).length;
  const ranked = [...APPS].map((a) => ({ a, s: score(a, ans) })).sort((x, y) => y.s - x.s);

  return (
    <div className="bw" role="group" aria-labelledby="lfm-title">
      <p className="bw-eyebrow">MATCH ME · 3 QUESTIONS, 6 APPS</p>
      <h3 id="lfm-title" className="bw-title">Which local first app <span className="sig">fits how you work?</span></h3>
      <p className="bw-lead">Pick one answer per row. The list re-ranks as you go.</p>
      {QUESTIONS.map((q) => (
        <div key={q.id} style={{ marginBottom: 14 }}>
          <p className="bw-label" id={`lfm-${q.id}`}>{q.label}</p>
          <div className="bw-chips" role="radiogroup" aria-labelledby={`lfm-${q.id}`} style={{ margin: "6px 0 0" }}>
            {q.options.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={ans[q.id] === o.id} className={ans[q.id] === o.id ? "on" : ""}
                      onClick={() => setAns((s) => ({ ...s, [q.id]: s[q.id] === o.id ? null : o.id }))}>{o.label}</button>
            ))}
          </div>
        </div>
      ))}
      <ol className="bw-results" aria-live="polite">
        {answered === 0 && <li className="bw-empty">Answer a question to rank the six apps.</li>}
        {answered > 0 && ranked.slice(0, 3).map(({ a }, i) => (
          <li key={a.name}><a href={`#${a.anchor}`}><b>{String(i + 1).padStart(2, "0")} · {a.name}</b><span>{a.line}</span></a></li>
        ))}
      </ol>
      <p className="bw-small">Fit scores are my judgment from each app&apos;s docs, checked October 9, 2026. Device fit counts double.</p>
    </div>
  );
}
