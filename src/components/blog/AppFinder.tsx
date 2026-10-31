"use client";

import { useState } from "react";

// Filters the seven private Android notes apps from the listicle by what a reader needs.
// Facts checked against each app's repository or F-Droid listing on October 7, 2026.

type App = { name: string; anchor: string; tags: string[]; line: string };

const APPS: App[] = [
  { name: "Atomic Notes", anchor: "1-atomic-notes", tags: ["sync", "own-cloud", "e2e", "public-code", "checklists"], line: "Local first, synced to your own Google Drive, optional end-to-end vault." },
  { name: "SilentNotes", anchor: "2-silentnotes", tags: ["sync", "own-cloud", "e2e", "public-code", "no-account", "checklists"], line: "Always encrypted, syncs through storage you pick." },
  { name: "CypherLeaf", anchor: "3-cypherleaf", tags: ["no-account", "offline-only", "lock", "public-code"], line: "Offline notebook with locked notes and encrypted backups." },
  { name: "NoteSR", anchor: "4-notesr", tags: ["no-account", "offline-only", "lock", "public-code"], line: "Encrypted notes and file attachments in one vault." },
  { name: "Quillpad", anchor: "5-quillpad", tags: ["sync", "own-cloud", "no-account", "public-code", "checklists"], line: "Markdown notes with optional Nextcloud sync." },
  { name: "Fossify Notes", anchor: "6-fossify-notes", tags: ["no-account", "offline-only", "public-code", "checklists", "lock"], line: "Quick notes, checklists, and home screen widgets." },
  { name: "Notes (Privacy Friendly)", anchor: "7-notes-privacy-friendly", tags: ["no-account", "offline-only", "public-code", "checklists"], line: "Text, checklist, audio, and sketch notes with few permissions." },
];

const NEEDS = [
  { id: "sync", label: "Sync between devices" },
  { id: "own-cloud", label: "Sync through my own storage" },
  { id: "e2e", label: "End-to-end encryption" },
  { id: "no-account", label: "No account at all" },
  { id: "offline-only", label: "Never touches the internet" },
  { id: "checklists", label: "Checklists" },
];

export function AppFinder() {
  const [need, setNeed] = useState<string[]>([]);
  const toggle = (id: string) => setNeed((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));
  const hits = APPS.filter((a) => need.every((n) => a.tags.includes(n)));

  return (
    <div className="bw" role="group" aria-labelledby="finder-title">
      <p className="bw-eyebrow">FIND YOURS · 7 APPS, 6 FILTERS</p>
      <h3 id="finder-title" className="bw-title">What do you need <span className="sig">from a private notes app?</span></h3>
      <p className="bw-lead">Tick what matters. The list narrows to apps that do all of it.</p>
      <div className="bw-chips" role="group" aria-label="Needs">
        {NEEDS.map((x) => (
          <button key={x.id} type="button" aria-pressed={need.includes(x.id)} className={need.includes(x.id) ? "on" : ""} onClick={() => toggle(x.id)}>{x.label}</button>
        ))}
      </div>
      <ul className="bw-results" aria-live="polite">
        {hits.length === 0 && <li className="bw-empty">No app on this list does all of that. Drop one filter.</li>}
        {hits.map((a) => (
          <li key={a.name}><a href={`#${a.anchor}`}><b>{a.name}</b><span>{a.line}</span></a></li>
        ))}
      </ul>
      <p className="bw-status"><b className="bw-score">{hits.length} / {APPS.length}</b> {need.length ? "match every filter you picked." : "Pick a filter to narrow the list."}</p>
    </div>
  );
}
