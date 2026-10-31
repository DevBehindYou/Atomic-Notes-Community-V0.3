"use client";

import { useState } from "react";

// Filters the eight offline Android notes apps from the L4 listicle.
// Facts from each app's F-Droid listing, manifest, or repository on October 9, 2026.

type App = { name: string; anchor: string; tags: string[]; line: string };

const APPS: App[] = [
  { name: "Atomic Notes", anchor: "1-atomic-notes", tags: ["sync", "lock", "encryption", "checklists"], line: "Offline first, synced to your own Google Drive later." },
  { name: "Material Notes", anchor: "2-material-notes", tags: ["no-internet", "no-account", "lock", "markdown", "checklists"], line: "No internet permission, locks, scheduled exports." },
  { name: "Open Notes", anchor: "3-open-notes", tags: ["no-internet", "no-account", "lock", "markdown", "checklists", "reminders"], line: "Markdown, reminders, screenshot block, ZIP backup." },
  { name: "sNotz", anchor: "4-snotz", tags: ["no-internet", "no-account", "lock", "checklists", "reminders"], line: "Quick notes and checklists with widgets." },
  { name: "Easy Notes", anchor: "5-easy-notes", tags: ["no-internet", "no-account", "encryption", "markdown"], line: "Markdown with images and an encrypted vault." },
  { name: "Orgzly Revived", anchor: "6-orgzly-revived", tags: ["sync", "no-account", "reminders", "plain-files"], line: "Org mode plain text, WebDAV or Dropbox sync." },
  { name: "Notes (Bill Farmer)", anchor: "7-notes-by-bill-farmer", tags: ["no-account", "markdown", "plain-files"], line: "Markdown saved as ordinary text files." },
  { name: "Butterfly", anchor: "8-butterfly", tags: ["sync", "no-account", "handwriting"], line: "Handwriting and sketches, optional WebDAV." },
];

const NEEDS = [
  { id: "no-internet", label: "No internet permission" },
  { id: "no-account", label: "No account" },
  { id: "sync", label: "Sync later" },
  { id: "lock", label: "App or note lock" },
  { id: "encryption", label: "Encryption" },
  { id: "markdown", label: "Markdown" },
  { id: "checklists", label: "Checklists" },
  { id: "reminders", label: "Reminders" },
  { id: "plain-files", label: "Plain text files" },
  { id: "handwriting", label: "Handwriting" },
];

export function OfflineFinder() {
  const [need, setNeed] = useState<string[]>([]);
  const toggle = (id: string) => setNeed((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));
  const hits = APPS.filter((a) => need.every((n) => a.tags.includes(n)));

  return (
    <div className="bw" role="group" aria-labelledby="of-title">
      <p className="bw-eyebrow">FIND YOURS · 8 APPS, 10 FILTERS</p>
      <h3 id="of-title" className="bw-title">What should your offline notes app <span className="sig">do for you?</span></h3>
      <p className="bw-lead">Tick what matters. Only apps that do all of it stay on the list.</p>
      <div className="bw-chips" role="group" aria-label="Needs">
        {NEEDS.map((x) => (
          <button key={x.id} type="button" aria-pressed={need.includes(x.id)} className={need.includes(x.id) ? "on" : ""} onClick={() => toggle(x.id)}>{x.label}</button>
        ))}
      </div>
      <ul className="bw-results" aria-live="polite">
        {hits.length === 0 && <li className="bw-empty">None of the eight does all of that. Drop one filter.</li>}
        {hits.map((a) => (
          <li key={a.name}><a href={`#${a.anchor}`}><b>{a.name}</b><span>{a.line}</span></a></li>
        ))}
      </ul>
      <p className="bw-status"><b className="bw-score">{hits.length} / {APPS.length}</b> {need.length ? "match every filter you picked." : "Pick a filter to narrow the list."}</p>
    </div>
  );
}
