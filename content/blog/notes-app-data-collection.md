---
title: "Notes App Metadata: 8 Things It Knows Without Reading Notes"
slug: "notes-app-data-collection"
description: "Notes app metadata can reveal your routine without a single word of your notes. The 8 kinds of notes app data collection to know, and what's actually needed."
excerpt: "Encryption can hide what you wrote. It can't hide when, where, and how often you write. Here's what a notes app can know without reading a note."
author: "ashutosh-sharma"
publishedAt: "2026-10-07"
updatedAt: "2026-10-07"
category: "privacy"
tags: ["privacy", "metadata", "data-minimization", "tracking", "encryption"]
featured: false
draft: false
coverImage: "/blog/notes-app-data-collection/01-banner.png"
coverAlt: "Cover reading Notes App Metadata, beside a server log card with sync times and events but no note text"
canonical: "https://atomic-notes.devbehindyou.com/blog/notes-app-data-collection"
keywords: "notes app metadata, notes app data collection, apps that don't collect data, IP address, device model, login timestamps, sync activity, server logs, retention period, privacy policy"
readingTime: "10 min read"
---

<div class="callout">
<p class="callout-label">Quick answer</p>
<p>Notes app metadata is everything around your notes: your email, IP address, device, sign-in times, sync activity, how often you open the app, and when notes change. None of it needs a word of what you wrote, yet together it can reveal your routine, your location, and your life events. Encryption hides content. Only collecting less hides metadata.</p>
</div>

"Metadata absolutely tells you everything about somebody's life." That's Stewart Baker, a former general counsel of the NSA, as quoted by law professor David Cole in 2014. He meant it as a plain description of how surveillance works.

Notes apps don't run spy agencies. But every one that syncs keeps some notes app metadata, and most keep more than they need. That data sits in logs and analytics tools long after you forget the note.

I build Atomic Notes, so I've had to decide what our own server keeps. This guide covers the eight kinds of metadata a notes app can know about you, what each one reveals, which ones a sync service actually needs, and how to check any app.

## What is notes app metadata?

**Metadata is data about your notes, not the notes themselves.** If content is the letter, metadata is the envelope: who sent it, when, from where, and how heavy it was.

![Two boxes. Content: note titles, text, checklist items, and attachments, which end-to-end encryption can hide. Metadata: email, IP address, device model, OS and app version, sign-in times, sync activity, usage frequency, and note counts and edit times.](/blog/notes-app-data-collection/02-content-vs-metadata.png "Fig 1. Content vs metadata. Encryption protects the left box. Data minimization protects the right one.")

This split matters because the two are protected in different ways. End-to-end encryption can make your note text unreadable to the company. It does nothing for notes app metadata, because the server needs some of it just to sync. The only protection for metadata is a company that collects little, keeps it briefly, and tells you exactly what it keeps.

## The 8 things a notes app can know without reading your notes

![Eight numbered cards: email address, IP address, device model, OS and app version, sign-in times, sync activity, usage frequency, and note counts and edit times.](/blog/notes-app-data-collection/03-eight-data-points.png "Fig 2. Eight kinds of notes app data collection. None needs a single word of your notes.")

### 1. Your account email

Almost every syncing app needs an account email, and it ties every other piece of notes app metadata to your real identity. Ask whether it's ever shared, and whether deleting your account deletes it.

### 2. Your IP address

Every request carries one, so the server sees it whether it wants to or not. IP address tracking reveals your rough location and when it changes. The question is how long the app keeps it, and whether it lands in analytics.

### 3. Your device model

Device information helps spot a suspicious sign-in. It also reveals what you own and when you switch phones. Combined with screen size, fonts, and settings, it can feed device fingerprinting, which identifies you without any cookie.

### 4. Your OS and app version

Useful for support, and harmless on its own. It also shows how current your phone is, which can hint at how exposed it is to known bugs.

### 5. Your sign-in times

Login activity shows when your day starts and from where. A new sign-in from a strange country is worth flagging. A full history of every sign-in is worth questioning.

### 6. Your sync activity

Sync metadata says when you write and how much. A sync at 23:52 every night is a habit. A burst of small notes from a hospital network on a Thursday afternoon is a story.

### 7. How often you use the app

Usage analytics, the screens you open and how long you stay, is the most common extra a notes app collects. It powers product dashboards. It isn't needed to sync a single note.

### 8. Your note counts and edit times

How many notes you have, when each one changed, and roughly how big it is. Even when every note is encrypted, this part of notes app metadata shows the shape of your thinking over time.

## What can notes app metadata reveal?

**More than any single note.** One timestamp means nothing. A month of them is a diary of your habits. Click through the example below. It's a made-up week of sync events, the kind a server could log, with zero note content.

:::widget metadata-inference

Now picture that pattern as a chart. This is the kind of view anyone with access to the logs could build in a few minutes:

![A week of sync timestamps as a grid of days and hours. Blue blocks cluster near midnight on most weekdays, with a burst on Thursday afternoon and a few late mornings on the weekend.](/blog/notes-app-data-collection/04-week-of-sync-times.png "Fig 3. One week of timestamps. Metadata makes a pattern even when every note is encrypted.")

The EFF gives a blunt example: call metadata can show that someone spoke with an HIV testing service, then their doctor, then their health insurer within the same hour, without anyone hearing a word. Notes app metadata works the same way. The when and where often tell the story the what was meant to keep private.

## Which notes app data collection is actually necessary?

**A sync service needs a little metadata. Everything past that is a business decision.** This is the principle of data minimization, written into Article 5 of the GDPR: collect only what you need, for a stated purpose, and keep it only as long as you need it.

![A table sorting data by whether syncing notes needs it. Account email and sync times are needed. IP address and device model are needed briefly. Screen analytics, advertising IDs, and location or contacts are extra.](/blog/notes-app-data-collection/05-needed-vs-extra.png "Fig 4. Needed or just collected? The red rows are choices, not requirements.")

Here's the practical test. For every piece of data, ask two questions: would sync break without it, and how many days is it kept? A good answer names a retention period. "As long as necessary" isn't a number.

| Ask the app | A good answer sounds like |
|---|---|
| What do you store about each note? | "IDs, timestamps, and sync versions. Never the text." |
| Do you keep IP addresses? | "Only in request logs, deleted after a fixed number of days." |
| Which analytics do you run? | "None in the app," or a named, privacy-friendly tool. |
| How long do you keep logs? | A specific retention period, like 30 days. |
| What happens when I delete my account? | "Everything tied to it is deleted," with a timeline. |

## How do you check what a notes app collects?

**Read three things, and ask for a fourth.** Mapping an app's notes app metadata takes about fifteen minutes.

1. **The store label.** Google Play's data safety section lists what the developer says is collected. It's self-declared, so treat it as a starting point. My [notes app privacy guide](/blog/notes-app-privacy-red-flags) explains why.
2. **The privacy policy.** Search for "collect," "analytics," "third parties," "retain," and "IP." Vague phrases usually mean more collection, not less.
3. **A tracker scan.** Exodus Privacy lists the analytics and advertising SDKs inside an Android app. Usage analytics almost always arrives through one of these.
4. **Your own data.** In many places, privacy law lets you ask a company for a copy of what it holds about you. The answer often shows server logs nobody mentioned.

## Why do notes apps collect more than they need?

**Because metadata is cheap to keep and useful to almost every team except yours.** Product teams want usage analytics to see which features people use. Growth teams want device and location data to measure campaigns. Support wants long logs for the rare hard bug. Advertising, if the app has any, wants all of it.

None of that is sinister on its own. The problem is accumulation. Notes app data collection tends to grow one reasonable request at a time, and nobody goes back to delete old logs. Years later, the company holds a detailed timeline of your writing habits that it never set out to build.

That's why the useful question isn't "does this app collect notes app metadata?" Every syncing app does. The useful question is whether the list is short, written down, and on a deletion schedule.

## What does Atomic Notes keep?

**Metadata only, and here's the list.** Our server never stores note titles or text, with the vault on or off. This is our full notes app data collection, in plain words. It does keep what sync and security need, and some of that is personal, so it belongs in public.

![Two cards. The server keeps: account email and display name, session token hashes and user agents, note metadata, the energy ledger, and a security log deleted after 30 days. Never collected: note titles or text, analytics or ad IDs, location or contacts, and crash-reporting SDKs.](/blog/notes-app-data-collection/06-what-atomic-notes-keeps.png "Fig 5. What the Atomic Notes server actually keeps, and what it never collects.")

This is the shape of what the server stores for one note. The field names come from the server's schema, and the values here are made up:

<p class="code-label">One note's record on the Atomic Notes server · example values</p>

```json
{
  "_id": "3f2a9c41-8b2e-4c1d-9e57-0a6f2d1b7c90",
  "userId": "b81e4f02-5d7a-4c3b-a1e9-62c0f8d4a3e1",
  "kind": "todo",
  "pinned": false,
  "deleted": false,
  "encV": 1,
  "driveFileId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "localVersion": 7,
  "contentHash": "9c1f0e…",
  "syncStatus": "synced",
  "createdAt": "2026-09-30T21:14:02Z",
  "updatedAt": "2026-10-06T23:52:11Z"
}
```

No title, no body, no checklist items. With the vault on, `encV` is 1 and the note's file in your Drive holds only ciphertext. With it off, the text goes to your Drive in readable form, passing through the server on the way without being stored.

The rest of the list:

- **Account:** your email and display name, from your Google sign-in.
- **Sessions:** a SHA-256 hash of each session token, never the token itself, plus the device's user agent and an expiry date. You can see and revoke sessions.
- **Energy ledger:** changes to your Atomic Energy and coin balance.
- **Security log:** sign-ins and sync events, deleted automatically after 30 days. Deleted notes' records are cleared after 30 days too.
- **Not collected:** analytics, advertising IDs, location, contacts, and crash reports. The app ships none of those SDKs.

Two honest footnotes. Our hosting provider sees IP addresses with every request, like any web service. And this website uses a cookieless page analytics tool, separate from the app, which never sees your notes.

## Are there apps that don't collect data at all?

**Yes, if they never sync.** An app with no internet permission can't send anything anywhere, so it collects nothing on a server. Several private Android notes apps work this way, and I list them in the [best private notes apps for Android](/blog/best-privacy-first-notes-apps-android).

The catch is the same one every time: no sync means no backup and no second device, unless you copy files yourself. Any app that syncs keeps some notes app metadata, because sync can't work without it. Apps that don't collect data in the strict sense don't sync. The realistic goal for a syncing app is the smallest possible list, with a short retention period, published in plain words.

## FAQ

<div class="faq-list">
<details>
<summary>What is notes app metadata?</summary>
<p>It's the data around your notes rather than the notes themselves: your account email, IP address, device, sign-in times, sync activity, how often you use the app, and when each note changes. It can reveal a lot about you even when every note is encrypted.</p>
</details>
<details>
<summary>Does end-to-end encryption hide notes app metadata?</summary>
<p>No. End-to-end encryption hides what you wrote. The server still needs some metadata to sync, such as note IDs, versions, and timestamps. The best protection for metadata is collecting as little as possible and deleting it on a fixed schedule.</p>
</details>
<details>
<summary>Can a notes app track my location?</summary>
<p>Without location permission, it can't read your GPS. It still sees your IP address with every sync, which gives a rough location. Check whether the app stores IP addresses, for how long, and whether it sends them to analytics or advertising tools.</p>
</details>
<details>
<summary>How do I find out what data a notes app has on me?</summary>
<p>Read its privacy policy and store data safety label first. Then ask the company for a copy of your data, which privacy laws in many regions require it to provide. The response usually lists logs and metadata the policy only hinted at.</p>
</details>
<details>
<summary>Are there notes apps that don't collect data?</summary>
<p>Yes. Apps without internet permission keep everything on your phone and collect nothing on a server. The trade-off is no sync. Syncing apps always keep some metadata, so look for a short, published list and fixed retention periods.</p>
</details>
</div>

## Keep reading

- [Notes app privacy: 9 red flags to check](/blog/notes-app-privacy-red-flags)
- [Encrypted notes explained: T2T vs end to end encryption](/blog/encrypted-notes-explained)
- [Local first architecture: the 4 layers behind Atomic Notes](/blog/atomic-notes-architecture)
- [7 note taking apps with no AI reading your notes](/blog/best-note-taking-apps-without-ai)
- [Why encryption alone does not make notes private](/blog/encrypted-notes-privacy)

<div class="callout ink">
<p class="callout-label">Atomic Notes by DevBehindYou</p>
<p>No analytics SDKs, no ad IDs, and no note text on the server. The metadata we do keep is listed above and in our privacy policy, with logs deleted after 30 days. <a href="/privacy">Read the privacy policy</a>.</p>
</div>

## Sources

- [Why metadata matters. Electronic Frontier Foundation, Surveillance Self-Defense](https://ssd.eff.org/module/why-metadata-matters)
- [We kill people based on metadata. David Cole, The New York Review of Books, May 2014](https://www.nybooks.com/online/2014/05/10/we-kill-people-based-metadata/)
- [GDPR Article 5: principles relating to processing of personal data](https://gdpr-info.eu/art-5-gdpr/)
- [Provide information for Google Play's data safety section. Play Console Help](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [What Exodus Privacy does. Exodus Privacy](https://exodus-privacy.eu.org/en/page/what/)
- [Atomic Notes privacy policy](https://atomic-notes.devbehindyou.com/privacy)
