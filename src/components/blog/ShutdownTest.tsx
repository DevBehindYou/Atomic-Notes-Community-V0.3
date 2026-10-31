"use client";

import { useState } from "react";

// "The company shuts down tomorrow." What each L2 app leaves you with, from its own docs (October 9, 2026).

const APPS = [
  { name: "Atomic Notes", device: "Every note, in the app's storage on your phone.", sync: "One readable .atomic JSON file per note in your own Google Drive. New syncs stop, because they run through the Atomic Notes server.", edit: "Yes, offline, on the phone.", move: "Read the JSON files in Drive. A one-tap export isn't built yet.", ease: "partly" },
  { name: "Obsidian", device: "Your vault: a folder of Markdown files.", sync: "Obsidian Sync stops. Any folder sync tool you set up keeps working.", edit: "Yes. Any Markdown editor can open the vault too.", move: "Nothing to do. It's already plain files.", ease: "easy" },
  { name: "Logseq", device: "Logseq OG: Markdown or Org files. Logseq 2.0: a local database graph.", sync: "Your own folder sync keeps working for file graphs. Logseq's own sync stops.", edit: "Yes, in the desktop app.", move: "Nothing to do for file graphs. Database graphs need an export first.", ease: "partly" },
  { name: "SiYuan", device: "A local workspace of .sy files, which are JSON documents.", sync: "An encrypted copy stays in your own S3 or WebDAV storage. The official cloud stops.", edit: "Yes, locally.", move: "Export to Markdown first, or parse the JSON.", ease: "partly" },
  { name: "SilverBullet", device: "A folder of Markdown pages.", sync: "Keeps running, because you host the server.", edit: "Yes.", move: "Nothing to do. It's plain Markdown.", ease: "easy" },
  { name: "Trilium Notes", device: "A SQLite database in the desktop app.", sync: "Keeps running, because you host the sync server.", edit: "Yes.", move: "Export to Markdown or HTML first.", ease: "partly" },
];

export function ShutdownTest() {
  const [i, setI] = useState(0);
  const a = APPS[i];
  return (
    <div className="bw" role="group" aria-labelledby="sd-title">
      <p className="bw-eyebrow">THOUGHT TEST · THE COMPANY IS GONE</p>
      <h3 id="sd-title" className="bw-title">It shut down overnight. <span className="sig">What do you still have?</span></h3>
      <p className="bw-lead">Pick an app to see what&apos;s left on your side.</p>
      <div className="bw-split">
        <div className="bw-tabs" role="tablist" aria-label="Apps" aria-orientation="vertical">
          {APPS.map((x, j) => (
            <button key={x.name} type="button" role="tab" id={`sd-tab-${j}`} aria-selected={i === j} aria-controls="sd-panel"
                    className={i === j ? "on" : ""} onClick={() => setI(j)}>{x.name}</button>
          ))}
        </div>
        <div className="bw-panel" role="tabpanel" id="sd-panel" aria-labelledby={`sd-tab-${i}`} aria-live="polite">
          <p className="bw-label">ON YOUR DEVICE</p>
          <p className="bw-panel-text">{a.device}</p>
          <p className="bw-label">THE SYNC COPY</p>
          <p className="bw-panel-text">{a.sync}</p>
          <p className="bw-label">CAN YOU KEEP WRITING?</p>
          <p className="bw-panel-text">{a.edit}</p>
          <p className="bw-label">MOVING TO ANOTHER APP</p>
          <p className="bw-panel-ask">{a.ease === "easy" ? "Easy" : "One extra step"}</p>
          <p className="bw-panel-text" style={{ marginBottom: 0 }}>{a.move}</p>
        </div>
      </div>
    </div>
  );
}
