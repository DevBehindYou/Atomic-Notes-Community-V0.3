"use client";

import { useState } from "react";

// The seven ideals from Ink & Switch's 2019 local-first essay, as a quick self-test for the
// notes app a reader uses today. Atomic Notes' own answers are shown on request, gaps included.

const IDEALS: { q: string; atomic: string; ok: boolean | "partly" }[] = [
  { q: "It opens and saves instantly, with no spinner while it waits for a server.", atomic: "Yes. Every note saves to on-device storage as you type.", ok: true },
  { q: "Your notes are not trapped on one device.", atomic: "Yes. Sync copies each note to your own Google Drive.", ok: true },
  { q: "It works fully with the network off.", atomic: "Yes. Writing, editing, and searching never need a connection.", ok: true },
  { q: "You can collaborate with other people in real time.", atomic: "No. Atomic Notes is a personal notes app with no shared editing.", ok: false },
  { q: "Your notes will still open in ten years, even if the company is gone.", atomic: "Partly. Notes stay on your phone and in your Drive as readable JSON files. There is no export button yet.", ok: "partly" },
  { q: "It is private and secure by default.", atomic: "Partly. No ads, trackers, or AI by default. End-to-end encryption is an optional vault you turn on.", ok: "partly" },
  { q: "You keep final ownership and control of your notes.", atomic: "Yes. The content lives on your phone and in your Drive, not in a company database.", ok: true },
];

export function LocalFirstScorecard() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(IDEALS.map(() => null));
  const [showAtomic, setShowAtomic] = useState(false);
  const answered = answers.filter((a) => a !== null).length;
  const score = answers.filter((a) => a === true).length;

  const verdict =
    answered < IDEALS.length
      ? `${IDEALS.length - answered} left to answer`
      : score >= 6
        ? "Your app is local-first in practice."
        : score >= 4
          ? "Partly local-first. Check what happens offline and on exit."
          : "Mostly cloud-first. The server owns the experience.";

  const set = (i: number, v: boolean) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)));

  return (
    <div className="bw" role="group" aria-labelledby="ideals-title">
      <p className="bw-eyebrow">SELF-TEST · THE SEVEN IDEALS</p>
      <h3 id="ideals-title" className="bw-title">How local-first is <span className="sig">your notes app?</span></h3>
      <p className="bw-lead">Answer for the app you use today. Ink & Switch lists these seven ideals for local-first software.</p>

      <ol className="bw-list">
        {IDEALS.map((it, i) => (
          <li key={i}>
            <span className="bw-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="bw-q">
              <p>{it.q}</p>
              {showAtomic && (
                <p className={"bw-atomic " + (it.ok === true ? "ok" : it.ok === false ? "bad" : "wait")}>
                  <b>ATOMIC NOTES · {it.ok === true ? "YES" : it.ok === false ? "NO" : "PARTLY"}</b> {it.atomic}
                </p>
              )}
            </div>
            <div className="bw-yn" role="radiogroup" aria-label={`Ideal ${i + 1}`}>
              <button type="button" role="radio" aria-checked={answers[i] === true} className={answers[i] === true ? "on" : ""} onClick={() => set(i, true)}>Yes</button>
              <button type="button" role="radio" aria-checked={answers[i] === false} className={answers[i] === false ? "on" : ""} onClick={() => set(i, false)}>No</button>
            </div>
          </li>
        ))}
      </ol>

      <div className="bw-meter" aria-hidden="true"><span style={{ width: `${(score / IDEALS.length) * 100}%` }} /></div>
      <div className="bw-row">
        <p className="bw-status" aria-live="polite"><b className="bw-score">{score} / {IDEALS.length}</b> {verdict}</p>
        <button type="button" className="btn-ghost bw-small-btn" aria-pressed={showAtomic} onClick={() => setShowAtomic((s) => !s)}>
          {showAtomic ? "Hide Atomic Notes answers" : "Show Atomic Notes answers"}
        </button>
      </div>
    </div>
  );
}
