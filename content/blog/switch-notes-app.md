---
title: "Switch Notes App Safely: 7 Checks Before You Move"
slug: "switch-notes-app"
description: "Want to switch notes app without losing anything? Seven checks before you migrate notes to a new app, how popular apps export, and a step-by-step plan."
excerpt: "Exports drop attachments, encrypted notes stay locked, and services shut down. Seven checks and a plan to move notes to another app with nothing lost."
author: "ashutosh-sharma"
publishedAt: "2026-10-09"
updatedAt: "2026-10-09"
category: "local-first"
tags: ["migration", "export", "notes-apps", "backup", "data-ownership"]
featured: false
draft: false
coverImage: "/blog/switch-notes-app/01-banner.png"
coverAlt: "Cover reading Switch Notes App Safely, beside a checklist of seven checks from export format to shutdown risk"
canonical: "https://atomic-notes.devbehindyou.com/blog/switch-notes-app"
keywords: "switch notes app, migrate notes to a new app, move notes to another app, notes migration, data export, export format, attachments, note counts, rollback copy, account recovery, offline notes, cloud storage provider, secure data migration"
readingTime: "11 min read"
---

<div class="callout">
<p class="callout-label">Quick answer</p>
<p>Before you switch notes app, check seven things: the export format, attachments, encryption, account recovery, offline access, where the new app stores notes, and what happens if it shuts down. Then move in order: export, keep an untouched rollback copy, import, compare note counts, and run both apps side by side for two weeks.</p>
</div>

Switching notes apps feels like a weekend job. Export, import, done. Then a month later you go looking for a recipe, a scanned receipt, or a checklist from last spring, and it isn't there.

Most notes go missing during a move because nobody checked what the export left out. Attachments stay behind. Checklists turn into plain text. Encrypted notes come out as gibberish. Folder structure flattens.

So before you **switch notes app**, run seven checks, then follow a plan with a way back. I build Atomic Notes, and its own section near the end is blunt about how hard it is to move into and out of it today.

## Why do notes get lost when you switch apps?

**Because every app's export is a translation, and translations drop things.** The new app imports what it understands and quietly skips the rest.

![Seven check cards: export format, attachments, encryption, account recovery, offline notes, cloud storage provider, and shutdown risk.](/blog/switch-notes-app/02-seven-checks.png "Fig 1. Seven checks before any notes migration. Each one has cost someone their notes.")

The common losses are predictable:

- **Attachments.** Images, PDFs, and audio often export as separate files the new app doesn't link back.
- **Structure.** Notebooks, tags, and nested folders flatten into one long list.
- **Checklists.** Ticked items can turn into plain text with no state.
- **Dates.** Imported notes often get today's date, which breaks sorting and search.
- **Encrypted notes.** They export as ciphertext, or not at all, unless you unlock them first.

None of these show up until you need the missing note. That's why the plan below ends with counting, not importing.

## The 7 things to check before you switch notes app

**Check the old app's way out and the new app's way out before you commit.** The app you're joining today is the app you'll eventually leave.

Run through them for the move you're planning:

:::widget switch-check

### 1. The export format

**Plain text, Markdown, HTML, or JSON travel well. A proprietary file only the old app reads doesn't.** Look for a full export, not a share-one-note option.

A good data export gives you every note in one go, in a documented format, with dates and tags. Markdown is the most portable for text. JSON keeps the most detail.

### 2. Attachments

**Ask what happens to images, PDFs, and audio.** Some exports include them in a folder. Some leave links that break the day your old account closes.

Count your attachments before you move. If the new app can't hold them, keep them in a plain folder next to your notes.

### 3. Encryption on the way out

**End-to-end encrypted notes have to be decrypted somewhere to move.** Do it on your own device, unlock the vault, export, and delete that plain copy when you're done.

This is secure data migration in one sentence: the readable copy should only ever exist on hardware you own, for as long as the move takes.

### 4. Account recovery in the new app

**Know how you get back in before you put years of notes inside.** A provider that can reset your password can also read your notes. One that can't will lose them if you lose the key.

Write down the recovery key or phrase the new app gives you, on paper, before the import.

### 5. Offline notes

**Turn on airplane mode and open the new app.** Offline notes that load from the device are a sign the app keeps a real copy with you, not just a cache.

My guide to [notes apps that work without internet](/blog/why-notes-should-work-offline) has a five-minute test you can run on any app.

### 6. The cloud storage provider

**Where will the synced copy live, and who can read it?** The company's servers, a cloud you already pay for, or a server you run yourself are three different trust decisions.

If you want local first note taking with a copy you own, my comparison of [local first note taking apps](/blog/best-local-first-note-taking-apps) sorts the options by exactly this.

### 7. Shutdown risk

**Services end, and they don't always give much notice.** Ask what you'd still have the day after an announcement.

Pocket is a recent example. Mozilla shut it down on July 8, 2025, moved it to export-only, and set October 8, 2025 as the date after which accounts and data would be permanently deleted. People who exported early lost nothing. People who missed the window lost everything.

## How do popular apps export notes?

**Every big notes app has an export, but each one leaves something out.** Here's what you get from the apps people most often leave.

![A table of six apps showing how to export, the format you get, and what to watch: Google Keep through Google Takeout, Apple Notes as Markdown, Evernote as ENEX or HTML, Notion as Markdown and CSV, Obsidian as files already, and Atomic Notes as JSON files in Drive.](/blog/switch-notes-app/03-export-formats.png "Fig 2. Export formats from popular notes apps. Checked October 9, 2026.")

| App | How to export | What you get |
|---|---|---|
| Google Keep | Google Takeout | Each note as an HTML file and a JSON file, with attachments |
| Apple Notes | Export as Markdown (iOS 26, macOS Tahoe) | Markdown files with images, without folder structure |
| Evernote | Desktop app only, up to 100 notes at a time or whole notebooks | ENEX or HTML files |
| Notion | Settings or page menu | Markdown and CSV, HTML, or PDF |
| Obsidian | Nothing to export | Your vault is already a folder of Markdown files |
| Atomic Notes | No export button yet | One JSON file per note in your own Google Drive |

The export format decides how much work the import will be. Markdown and plain files move to almost anything. ENEX and Notion's CSV databases need an importer on the other side.

## How do you migrate notes to a new app without losing anything?

**Export, freeze a copy, import, count, then wait.** The waiting is the part people skip, and it's the part that catches missing notes.

![Six steps: export everything, keep an untouched rollback copy, import into the new app, compare note and attachment counts, use both apps for two weeks, then retire the old account.](/blog/switch-notes-app/04-migration-plan.png "Fig 3. A migration plan with a way back. The rollback copy is never opened, only kept.")

1. **Export everything** from the old app, including attachments.
2. **Keep a rollback copy.** Zip the export, put it on a USB drive or a second cloud, and don't touch it.
3. **Import into the new app** from a separate copy, never from the rollback copy.
4. **Compare note counts.** Count notes, checklists, and attachments before and after.
5. **Use both for two weeks.** Search the new app for things you know exist.
6. **Retire the old account** only when nothing has come up missing.

Count your notes with the checker below. It flags any gap:

:::widget count-check

When you move notes to another app this way, a missing note shows up in step 4 or 5, while the old account still exists to recover it from.

## What does a safe switch look like over time?

**Give the old app a few weeks of overlap before you delete anything, however tempting it is to switch notes app in one evening.** The rollback copy is your insurance after that.

![A timeline: day 0 export and rollback copy, day 1 import and count, days 2 to 14 both apps in use, day 15 old account closed, and the rollback copy kept for at least a year.](/blog/switch-notes-app/05-timeline.png "Fig 4. A two-week overlap, and a rollback copy kept for a year.")

Two weeks is enough for most people to hit the notes they use weekly: a shopping list, a work log, a recipe. Notes you open once a year, like a tax checklist or a warranty receipt, won't come up in that window, which is why the rollback copy stays for a year.

Store that copy like any other sensitive file. If your old notes were end-to-end encrypted, the export is now plain text, so put it in an encrypted archive or on a drive you keep at home, not in a shared cloud folder.

When you switch notes app on a phone, also check the small things the export never carries: home screen widgets, reminders, share links you sent people, and any app lock you set. Rebuild those by hand in the new app on day one, so the first week feels normal and you don't drift back to the old one.

One last habit: write down where everything went. A short note in the new app, "moved from X on this date, rollback copy on the blue USB drive", saves real panic a year from now.

## Can you switch to or from Atomic Notes?

**Yes, but not with one button yet, and I'd rather you knew that before you start.** Atomic Notes has no import tool and no export button today.

![A card about moving with Atomic Notes: notes live as JSON files in your own Google Drive, plain notes convert with a short script, vault notes stay encrypted, and there is no import or export button yet.](/blog/switch-notes-app/06-atomic-notes-card.png "Fig 5. Atomic Notes, honestly: your files are yours, but the tools to move them are still coming.")

Getting notes in means typing or pasting them, one by one. Getting notes out is easier than it sounds, because every synced note is already a file in a `My-Atomic-Notes` folder in your own Google Drive. Download that folder, and this short script turns plain notes into Markdown files any app can import:

<p class="code-label">atomic_to_md.py · run next to the downloaded My-Atomic-Notes folder</p>

```python
import json, pathlib, re

src = pathlib.Path("My-Atomic-Notes")       # the folder you downloaded from Google Drive
out = pathlib.Path("markdown"); out.mkdir(exist_ok=True)
sealed = 0
for f in sorted(src.glob("*.atomic")):
    note = json.loads(f.read_text(encoding="utf-8"))
    if note.get("encV", 0) >= 1:            # vault note: ciphertext, only the app can open it
        sealed += 1
        continue
    title = note["title"] or note["id"]
    lines = [f"# {title}", ""]
    if note["kind"] == "todo":
        for i in note["items"]:             # older files may use t/d instead of text/done
            done, text = i.get("done", i.get("d")), i.get("text", i.get("t", ""))
            lines.append(f"- [{'x' if done else ' '}] {text}")
    else:
        lines.append(note["body"])
    name = re.sub(r'[\\/:*?"<>|]', "-", title)[:80]
    path = out / f"{name}.md"
    if path.exists():
        path = out / f"{name} {note['id'][:8]}.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Done. {sealed} vault notes skipped.")
```

Two honest limits. Vault notes are ciphertext in those files, so the script skips them, and only the app with your six-word phrase can open them. A real export button is planned, and this guide will be updated when it ships.

My take: the best time to plan your exit from a notes app is the day you join it. An app that makes leaving easy has nothing to hide, and I'm holding my own app to that standard.

## FAQ

<div class="faq-list">
<details>
<summary>How do I switch notes app without losing notes?</summary>
<p>Export everything, keep an untouched rollback copy somewhere else, import from a separate copy, and compare note and attachment counts. Then use both apps for two weeks before closing the old account, so anything missing still has somewhere to come from.</p>
</details>
<details>
<summary>What is the best format to migrate notes to a new app?</summary>
<p>Markdown for text, because almost every notes app imports it and any editor can open it. JSON keeps the most detail, such as dates and checklist state. Proprietary formats like ENEX need an importer that understands them.</p>
</details>
<details>
<summary>How do I move notes to another app if they're encrypted?</summary>
<p>Unlock them in the old app on your own device, export, import into the new app, then delete the plain export. Exports of locked end-to-end encrypted notes are usually unreadable anywhere else, so do this before you close the old account.</p>
</details>
<details>
<summary>Do attachments survive a notes migration?</summary>
<p>Often not completely. Some exports put attachments in a separate folder the new app doesn't link back to notes. Count them before and after, and keep the original attachment folder with your rollback copy.</p>
</details>
<details>
<summary>What should I do if my notes app is shutting down?</summary>
<p>Export immediately, not at the deadline. Shutdowns often move to export-only mode and then delete everything on a fixed date, as Pocket did in 2025. Keep the export in two places, then pick a new app using the seven checks above.</p>
</details>
<details>
<summary>Can I export my notes from Atomic Notes?</summary>
<p>There's no export button yet. Every synced note is a JSON file in your own Google Drive, so you can download the folder and convert plain notes to Markdown with a short script. Vault notes stay encrypted and need the app to open.</p>
</details>
</div>

## Keep reading

- [6 best local first note taking apps](/blog/best-local-first-note-taking-apps)
- [Notes app security: 10 privacy mistakes to fix](/blog/notes-app-privacy-mistakes)
- [What is a local first notes app?](/blog/what-is-a-local-first-notes-app)

<div class="callout ink">
<p class="callout-label">Atomic Notes by DevBehindYou</p>
<p>Your notes live on your phone and in your own Google Drive as plain JSON files you can always download. No lock-in by format, no ads, and no AI. <a href="/">See how it works</a>.</p>
</div>

## Sources

- [Pocket is saying goodbye: what you need to know. Mozilla Support](https://support.mozilla.org/en-US/kb/future-of-pocket)
- [How to download your Google data. Google Account Help](https://support.google.com/accounts/answer/3024190?hl=en)
- [Import and export Markdown files in Apple Notes. MacRumors](https://www.macrumors.com/how-to/ios-import-export-markdown-apple-notes/)
- [Export notes and notebooks as ENEX or HTML. Evernote Help](https://help.evernote.com/hc/en-us/articles/209005557-Export-notes-and-notebooks-as-ENEX-or-HTML)
- [Export your content. Notion Help](https://www.notion.com/help/export-your-content)
- [Right to data portability, GDPR Article 20](https://gdpr-info.eu/art-20-gdpr/)
- [Atomic Notes source code. GitHub](https://github.com/DevBehindYou/Atomic-Notes-App-V0.2)
