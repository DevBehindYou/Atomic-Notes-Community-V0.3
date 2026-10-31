"use client";

import { useState } from "react";

// Each L4 app's Android permissions in plain English, from its F-Droid listing or AndroidManifest.xml (October 9, 2026).

const MEANING: Record<string, { label: string; text: string; net?: boolean }> = {
  internet: { label: "Full network access", text: "The app can open connections to any server. This is the one that lets notes leave the phone.", net: true },
  netstate: { label: "View network connections", text: "The app can check whether you're online. It can't send anything with this alone." },
  biometric: { label: "Use biometric hardware", text: "Fingerprint or face unlock for an app or note lock." },
  notifications: { label: "Show notifications", text: "Reminders and alerts." },
  boot: { label: "Run at startup", text: "Re-arms reminders after the phone restarts." },
  foreground: { label: "Foreground service", text: "Keeps a visible task running, such as a backup or a scheduled reminder." },
  storage: { label: "Shared storage", text: "Reads or writes files outside the app, usually for backups or a notes folder." },
  allfiles: { label: "Manage all files", text: "Broad access to shared storage, used by apps that keep notes as files in a folder you pick." },
  camera: { label: "Camera", text: "Takes photos, for example to attach an image or scan a code." },
  mic: { label: "Microphone", text: "Records audio for voice notes or recordings." },
  calendar: { label: "Calendar", text: "Reads and adds calendar events, for scheduled items." },
  alarms: { label: "Exact alarms", text: "Fires a reminder at a precise time." },
  wake: { label: "Prevent sleep", text: "Keeps the phone awake for a moment to finish a task." },
  shortcuts: { label: "Install shortcuts", text: "Adds home screen shortcuts to notes." },
};

const APPS: { name: string; perms: string[] }[] = [
  { name: "Atomic Notes", perms: ["internet", "netstate", "biometric"] },
  { name: "Material Notes", perms: ["biometric"] },
  { name: "Open Notes", perms: ["netstate", "notifications", "boot", "foreground", "biometric", "wake"] },
  { name: "sNotz", perms: ["notifications", "biometric", "storage", "camera"] },
  { name: "Easy Notes", perms: ["biometric"] },
  { name: "Orgzly Revived", perms: ["internet", "netstate", "calendar", "alarms", "notifications", "boot", "allfiles", "biometric"] },
  { name: "Notes (Bill Farmer)", perms: ["internet", "allfiles", "shortcuts"] },
  { name: "Butterfly", perms: ["internet", "netstate", "storage", "camera", "mic"] },
];

export function PermissionReader() {
  const [i, setI] = useState(0);
  const app = APPS[i];
  const online = app.perms.includes("internet");
  return (
    <div className="bw" role="group" aria-labelledby="pr-title">
      <p className="bw-eyebrow">READ IT · PERMISSIONS IN PLAIN ENGLISH</p>
      <h3 id="pr-title" className="bw-title">Can this app <span className="sig">reach the internet?</span></h3>
      <p className="bw-lead">Pick an app to see every permission it asks Android for.</p>
      <div className="bw-chips" role="radiogroup" aria-label="Apps">
        {APPS.map((a, j) => (
          <button key={a.name} type="button" role="radio" aria-checked={i === j} className={i === j ? "on" : ""} onClick={() => setI(j)}>{a.name}</button>
        ))}
      </div>
      <div className="bw-panel" aria-live="polite" style={{ marginBottom: 14 }}>
        <p className="bw-label">{app.name.toUpperCase()}</p>
        <p className="bw-panel-ask">{online ? "Yes, it can go online" : "No internet permission"}</p>
        <p className="bw-panel-text" style={{ marginBottom: 0 }}>
          {online ? "It can work offline, but it's able to reach servers for sync or extras." : "Nothing in this app can send your notes off the phone."}
        </p>
      </div>
      <ul className="bw-log">
        {app.perms.map((p) => (
          <li key={p}><span>{MEANING[p].text}</span><b className={MEANING[p].net ? "bad" : ""}>{MEANING[p].label.toUpperCase()}</b></li>
        ))}
      </ul>
      <p className="bw-small" style={{ marginTop: 8 }}>From each app&apos;s F-Droid listing or AndroidManifest.xml, October 9, 2026. Small internal permissions are left out.</p>
    </div>
  );
}
