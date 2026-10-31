"use client";

import { useState } from "react";

// A guided airplane-mode test. The reader runs each step on their own phone and records the result.

const STEPS = [
  { t: "Turn on airplane mode, then force-close the app.", why: "Clears anything the app kept in memory while it had a network." },
  { t: "Reopen the app. Do your notes appear right away?", why: "A local-first app opens from device storage. A cloud app shows a spinner or an error." },
  { t: "Create a new note and close the app again.", why: "The real test: did the app save it, or only queue it in memory?" },
  { t: "Reopen and search for a word in an older note.", why: "Search should run on the device, not on a server." },
  { t: "Edit a note and delete another.", why: "Every daily action should work offline, not just reading." },
  { t: "Turn the network back on. Do the changes sync by themselves?", why: "Good sync catches up on its own, with no manual retry." },
];

type R = "pass" | "fail" | null;

export function AirplaneTest() {
  const [res, setRes] = useState<R[]>(STEPS.map(() => null));
  const done = res.filter(Boolean).length;
  const pass = res.filter((r) => r === "pass").length;
  const verdict =
    done < STEPS.length
      ? `${STEPS.length - done} steps left`
      : pass === STEPS.length
        ? "Your notes app works without internet. It passes the test."
        : pass >= 4
          ? "It mostly works offline. Note which step failed before you trust it on a trip."
          : "It depends on the network. Keep anything urgent somewhere that works offline.";
  const set = (i: number, v: R) => setRes((r) => r.map((x, j) => (j === i ? v : x)));

  return (
    <div className="bw" role="group" aria-labelledby="air-title">
      <p className="bw-eyebrow">DO IT NOW · THE AIRPLANE TEST</p>
      <h3 id="air-title" className="bw-title">Six steps. <span className="sig">Five minutes.</span></h3>
      <p className="bw-lead">Grab your phone and run each step on the notes app you use today.</p>
      <ol className="bw-list">
        {STEPS.map((s, i) => (
          <li key={i}>
            <span className="bw-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="bw-q"><p>{s.t}</p><p className="bw-atomic">{s.why}</p></div>
            <div className="bw-yn" role="radiogroup" aria-label={`Step ${i + 1} result`}>
              <button type="button" role="radio" aria-checked={res[i] === "pass"} className={res[i] === "pass" ? "on" : ""} onClick={() => set(i, "pass")}>Worked</button>
              <button type="button" role="radio" aria-checked={res[i] === "fail"} className={res[i] === "fail" ? "on" : ""} onClick={() => set(i, "fail")}>Failed</button>
            </div>
          </li>
        ))}
      </ol>
      <div className={"bw-meter" + (done === STEPS.length && pass < 4 ? " high" : "")} aria-hidden="true"><span style={{ width: `${(pass / STEPS.length) * 100}%` }} /></div>
      <div className="bw-row">
        <p className="bw-status" aria-live="polite"><b className="bw-score">{pass} / {STEPS.length}</b> {verdict}</p>
        <button type="button" className="btn-ghost bw-small-btn" onClick={() => setRes(STEPS.map(() => null))}>Start over</button>
      </div>
    </div>
  );
}
