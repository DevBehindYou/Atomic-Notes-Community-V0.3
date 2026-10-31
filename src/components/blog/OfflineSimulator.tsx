"use client";

import { useEffect, useRef, useState } from "react";

// Two notes apps side by side with one network switch. The cloud-first one saves by asking a
// server; the local-first one saves to the device and queues the upload. Nothing leaves the page.

type Entry = { text: string; status: string };

const SERVER_DELAY = 900;

export function OfflineSimulator() {
  const [online, setOnline] = useState(true);
  const [draft, setDraft] = useState("Buy batteries for the field recorder");
  const [cloud, setCloud] = useState<Entry[]>([]);
  const [local, setLocal] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [say, setSay] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pending = local.filter((e) => e.status === "WAITING TO SYNC").length;

  function save() {
    const text = draft.trim();
    if (!text || busy) return;
    // Local-first: the device write is the save. The upload waits for a network.
    setLocal((l) => [{ text, status: online ? "SAVED · SYNCED" : "WAITING TO SYNC" }, ...l].slice(0, 4));
    // Cloud-first: the save is a request. No network, no save.
    setBusy(true);
    setCloud((c) => [{ text, status: "SAVING…" }, ...c].slice(0, 4));
    timer.current = setTimeout(() => {
      setCloud((c) => [{ text, status: online ? "SAVED ON SERVER" : "FAILED · NOT SAVED" }, ...c.slice(1)]);
      setBusy(false);
      setSay(online
        ? "Both apps saved the note. The local-first one finished first."
        : "The cloud-first app could not save. The local-first app saved on the device and queued the upload.");
    }, SERVER_DELAY);
    setDraft("");
  }

  function toggle() {
    const next = !online;
    setOnline(next);
    if (next && pending) {
      setLocal((l) => l.map((e) => (e.status === "WAITING TO SYNC" ? { ...e, status: "SAVED · SYNCED" } : e)));
      setSay(`Network back. The local-first app sent ${pending} queued ${pending === 1 ? "note" : "notes"}.`);
    } else {
      setSay(next ? "Network on." : "Network off. Try saving a note now.");
    }
  }

  function reset() {
    setCloud([]);
    setLocal([]);
    setOnline(true);
    setDraft("Buy batteries for the field recorder");
    setSay("Reset.");
  }

  return (
    <div className="bw" role="group" aria-labelledby="sim-title">
      <p className="bw-eyebrow">TRY IT · THE NETWORK SWITCH</p>
      <h3 id="sim-title" className="bw-title">Turn the network off. <span className="sig">Keep writing.</span></h3>
      <p className="bw-lead">Type a note and press save. Then switch the network off and save again.</p>

      <div className="bw-row">
        <div className="bw-seg" role="radiogroup" aria-label="Network">
          <button type="button" role="radio" aria-checked={online} className={online ? "on" : ""} onClick={() => !online && toggle()}>Network on</button>
          <button type="button" role="radio" aria-checked={!online} className={!online ? "on" : ""} onClick={() => online && toggle()}>Network off</button>
        </div>
        <span className={"bw-pill" + (online ? " live" : "")}>{online ? "ONLINE" : "AIRPLANE MODE"}</span>
      </div>

      <div className="bw-input">
        <label htmlFor="sim-note" className="bw-label">NEW NOTE</label>
        <input id="sim-note" value={draft} maxLength={80} onChange={(e) => setDraft(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && save()} placeholder="Type a note" />
        <button type="button" className="btn-signal" onClick={save} disabled={busy || !draft.trim()}>Save note</button>
      </div>

      <div className="bw-cols">
        {[
          { name: "CLOUD-FIRST APP", note: "No offline cache. The server is the source of truth.", list: cloud },
          { name: "LOCAL-FIRST APP", note: "The device is the source of truth. The cloud is a copy.", list: local },
        ].map((p) => (
          <div key={p.name} className="bw-pane">
            <p className="bw-label">{p.name}</p>
            <p className="bw-small">{p.note}</p>
            <ul className="bw-log">
              {p.list.length === 0 && <li className="bw-empty">No notes yet.</li>}
              {p.list.map((e, i) => (
                <li key={i}>
                  <span>{e.text}</span>
                  <b className={e.status.startsWith("FAILED") ? "bad" : e.status.startsWith("WAIT") || e.status.startsWith("SAVING") ? "wait" : "ok"}>{e.status}</b>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bw-row">
        <p className="bw-status" aria-live="polite">{say || " "}</p>
        <button type="button" className="btn-ghost bw-small-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
