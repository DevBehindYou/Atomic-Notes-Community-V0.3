"use client";

import { useState } from "react";

// A ten-question self-audit matching the ten mistakes in the P3 post. Answers stay in the page.

const QS = [
  { q: "My phone's screen lock is a six-digit PIN or longer, or a passphrase.", fix: "Switch to a six-digit PIN or a passphrase, and lock after 30 seconds.", n: 1 },
  { q: "My notes app has its own app lock turned on.", fix: "Turn on the fingerprint or face lock inside the notes app.", n: 2 },
  { q: "No passwords sit in my ordinary notes.", fix: "Move them into a password manager, then delete the note.", n: 3 },
  { q: "No recovery phrase or backup code is saved in a note that syncs.", fix: "Write them on paper, store it offline, and delete the note.", n: 4 },
  { q: "I know every shared link to my notes, and none is stale.", fix: "Open sharing settings and revoke every link you don't need today.", n: 5 },
  { q: "My notes don't show in widgets, screenshots, or the recent apps preview.", fix: "Remove note widgets and turn on a no-screenshots mode if your app has one.", n: 6 },
  { q: "The cloud account behind my notes has a unique password and two-step verification.", fix: "Change the password and add two-step verification today.", n: 7 },
  { q: "No old exports of my notes are lying around in Downloads, email, or shared folders.", fix: "Search for old exports and delete or encrypt them.", n: 8 },
  { q: "I installed my notes app from an app store or the developer's official release page.", fix: "Reinstall from the official source and compare the published checksum.", n: 9 },
  { q: "I know who holds the encryption key for my synced notes.", fix: "Check whether sync is end-to-end encrypted. If not, treat the cloud copy as readable.", n: 10 },
];

export function HabitAudit() {
  const [ans, setAns] = useState<(boolean | null)[]>(QS.map(() => null));
  const done = ans.filter((a) => a !== null).length;
  const good = ans.filter((a) => a === true).length;
  const fixes = QS.filter((_, i) => ans[i] === false);
  const verdict =
    done < QS.length ? `${QS.length - done} left to answer`
      : good >= 9 ? "Strong habits. Repeat this every three months."
        : good >= 6 ? "Decent, with gaps. Start with the fixes below."
          : "Your notes are easier to reach than you'd like. The fixes below take minutes each.";
  const set = (i: number, v: boolean) => setAns((a) => a.map((x, j) => (j === i ? v : x)));

  return (
    <div className="bw" role="group" aria-labelledby="ha-title">
      <p className="bw-eyebrow">SELF-AUDIT · 10 HABITS, 1 MINUTE</p>
      <h3 id="ha-title" className="bw-title">How safe are <span className="sig">your notes, really?</span></h3>
      <p className="bw-lead">Answer for your own phone and notes app. Nothing is saved or sent.</p>
      <ol className="bw-list">
        {QS.map((it, i) => (
          <li key={i}>
            <span className="bw-num">{String(it.n).padStart(2, "0")}</span>
            <div className="bw-q"><p>{it.q}</p></div>
            <div className="bw-yn" role="radiogroup" aria-label={`Habit ${it.n}`}>
              <button type="button" role="radio" aria-checked={ans[i] === true} className={ans[i] === true ? "on" : ""} onClick={() => set(i, true)}>True</button>
              <button type="button" role="radio" aria-checked={ans[i] === false} className={ans[i] === false ? "on" : ""} onClick={() => set(i, false)}>Not yet</button>
            </div>
          </li>
        ))}
      </ol>
      <div className={"bw-meter" + (done === QS.length && good < 6 ? " high" : done === QS.length && good < 9 ? " mid" : "")} aria-hidden="true"><span style={{ width: `${(good / QS.length) * 100}%` }} /></div>
      <div className="bw-row">
        <p className="bw-status" aria-live="polite"><b className="bw-score">{good} / {QS.length}</b> {verdict}</p>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setAns(QS.map(() => null))}>Start over</button>
      </div>
      {fixes.length > 0 && (
        <div className="bw-panel warn" style={{ marginTop: 14 }}>
          <p className="bw-label">YOUR FIXES</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
            {fixes.map((f) => (<li key={f.n}><b>Mistake {f.n}:</b> {f.fix}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
