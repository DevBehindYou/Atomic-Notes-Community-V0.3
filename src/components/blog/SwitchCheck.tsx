"use client";

import { useState } from "react";

// The seven pre-move checks from the S5 post as a readiness score. Answers stay in the page.

const CHECKS = [
  { q: "The old app has a full export in a format like Markdown, HTML, or JSON.", fix: "Find the full export before anything else. A share-one-note button isn't an export." },
  { q: "I know how many attachments I have and where they'll go.", fix: "Count images and PDFs now, and plan a folder for any the new app can't hold." },
  { q: "Encrypted notes are unlocked on my own device for the export.", fix: "Unlock them first, export on your device, and delete the plain copy after the move." },
  { q: "I've written down the new app's recovery key or phrase on paper.", fix: "Set up recovery before importing years of notes." },
  { q: "The new app opens and saves my notes in airplane mode.", fix: "Test offline before you rely on it." },
  { q: "I know where the new app's synced copy lives and who can read it.", fix: "Check the cloud storage provider and who holds the key." },
  { q: "I know how I'd get my notes out of the new app if it shut down.", fix: "Find the new app's export now, before you need it." },
];

export function SwitchCheck() {
  const [ans, setAns] = useState<(boolean | null)[]>(CHECKS.map(() => null));
  const done = ans.filter((a) => a !== null).length;
  const yes = ans.filter((a) => a === true).length;
  const verdict = done < CHECKS.length ? `${CHECKS.length - done} left to answer`
    : yes === CHECKS.length ? "Ready to move. Keep a rollback copy anyway."
      : yes >= 5 ? "Nearly ready. Close the gaps below first."
        : "Not ready yet. A move now is likely to lose something.";
  const set = (i: number, v: boolean) => setAns((a) => a.map((x, j) => (j === i ? v : x)));
  const gaps = CHECKS.filter((_, i) => ans[i] === false);

  return (
    <div className="bw" role="group" aria-labelledby="sc-title">
      <p className="bw-eyebrow">BEFORE YOU MOVE · 7 CHECKS</p>
      <h3 id="sc-title" className="bw-title">Are you ready <span className="sig">to switch?</span></h3>
      <p className="bw-lead">Answer for the move you&apos;re planning. Nothing is saved or sent.</p>
      <ol className="bw-list">
        {CHECKS.map((c, i) => (
          <li key={i}>
            <span className="bw-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="bw-q"><p>{c.q}</p></div>
            <div className="bw-yn" role="radiogroup" aria-label={`Check ${i + 1}`}>
              <button type="button" role="radio" aria-checked={ans[i] === true} className={ans[i] === true ? "on" : ""} onClick={() => set(i, true)}>Yes</button>
              <button type="button" role="radio" aria-checked={ans[i] === false} className={ans[i] === false ? "on" : ""} onClick={() => set(i, false)}>Not yet</button>
            </div>
          </li>
        ))}
      </ol>
      <div className={"bw-meter" + (done === CHECKS.length && yes < 5 ? " high" : done === CHECKS.length && yes < 7 ? " mid" : "")} aria-hidden="true"><span style={{ width: `${(yes / CHECKS.length) * 100}%` }} /></div>
      <p className="bw-status" aria-live="polite"><b className="bw-score">{yes} / {CHECKS.length}</b> {verdict}</p>
      {gaps.length > 0 && (
        <div className="bw-panel warn" style={{ marginTop: 14 }}>
          <p className="bw-label">BEFORE YOU MOVE</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
            {gaps.map((g) => (<li key={g.q}>{g.fix}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
