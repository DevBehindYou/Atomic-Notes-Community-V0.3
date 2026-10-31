"use client";

import { useState } from "react";

// The nine red flags from the privacy guide as a checklist for the reader's own notes app.

const FLAGS = [
  "You can't write a single note without creating an account.",
  "There is no way to export every note in an open format.",
  "It says \"encrypted\" but never says who holds the key.",
  "It asks for contacts, location, call logs, or other permissions notes don't need.",
  "It shows ads or ships advertising SDKs.",
  "A tracker scan lists analytics or tracking SDKs.",
  "AI features read your notes and can't be switched off.",
  "Exports are in a format only this app can open.",
  "It can't say, in one sentence, where your notes are stored.",
];

export function RedFlagChecker() {
  const [on, setOn] = useState<boolean[]>(FLAGS.map(() => false));
  const count = on.filter(Boolean).length;
  const level = count >= 4 ? "high" : count >= 2 ? "mid" : "low";
  const verdict =
    count === 0
      ? "No red flags ticked. Still read the policy before you move private notes in."
      : count === 1
        ? "One flag. Usable, but find out why it's there."
        : count <= 3
          ? `${count} flags. Use it with care and keep your most private notes elsewhere.`
          : `${count} flags. Keep private writing out of this app.`;

  const toggle = (i: number) => setOn((o) => o.map((x, j) => (j === i ? !x : x)));

  return (
    <div className="bw" role="group" aria-labelledby="flags-title">
      <p className="bw-eyebrow">CHECK YOUR APP · 9 FLAGS</p>
      <h3 id="flags-title" className="bw-title">Tick every flag <span className="sig">your notes app raises.</span></h3>
      <p className="bw-lead">Have the app's store page, settings, and privacy policy open. Each flag takes about a minute to check.</p>

      <ul className="bw-checks">
        {FLAGS.map((f, i) => (
          <li key={i}>
            <label className={on[i] ? "on" : ""}>
              <input type="checkbox" checked={on[i]} onChange={() => toggle(i)} />
              <span className="bw-num">{String(i + 1).padStart(2, "0")}</span>
              <span>{f}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className={"bw-meter " + level} aria-hidden="true"><span style={{ width: `${(count / FLAGS.length) * 100}%` }} /></div>
      <div className="bw-row">
        <p className="bw-status" aria-live="polite"><b className="bw-score">{count} / {FLAGS.length}</b> {verdict}</p>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setOn(FLAGS.map(() => false))}>Clear</button>
      </div>
    </div>
  );
}
