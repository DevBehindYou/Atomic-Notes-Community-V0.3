---
title: "Atomic Notes v1.18.2 Demo Build"
slug: "atomic-notes-v1-18-2"
description: "Atomic Notes v1.18.2 demo build: the Atomic Energy economy, in-app email verification and password reset, a notification center, and an offline launch fix."
excerpt: "A demo build that adds Atomic Energy, in-app email flows, a notification center, and fixes offline launch."
author: "ashutosh-sharma"
publishedAt: "2026-08-25"
updatedAt: "2026-08-25"
category: "releases"
tags: ["release-notes", "atomic-energy", "demo-build"]
featured: true
draft: false
coverImage: "/og-banner.png"
coverAlt: "Atomic Notes release cover with the atom mark on a paper background"
canonical: "https://atomic-notes-community.vercel.app/blog/atomic-notes-v1-18-2"
keywords: "atomic notes, release notes, local-first notes, atomic energy, demo build"
readingTime: "3 min read"
---

**Key Takeaway:** Atomic Notes v1.18.2 is a demo build. It adds the Atomic Energy economy, in-app email verification and password reset, an in-app notification center, and a fix so the app opens offline. Coin purchases are not live yet.

Version 1.18.2 is a demo build, not a store release. The theme is making the parts around your notes feel finished: energy that governs cloud sync, email flows that work inside the app, and a notification center. Local note-taking stays instant and free, online or off. Here is what changed, and what is still ahead.

## What shipped

This build adds the Atomic Energy system, in-app OTP email, energy-gated cloud sync, and an in-app notification center. Every item below maps to real code in the current build.

- **Atomic Energy** and Atomic Coins: a renewable allowance that governs cloud sync. You get 20 energy every 24 hours, up to a cap of 120, and 1 Atomic Coin converts to 40 energy. New accounts start with 5 coins.
- In-app email: account verification and password reset now happen with a code inside the app, sent over email. No web redirect.
- Energy-gated sync: uploading changes costs energy (an instant sync 10, a standard hourly sync 5). If an upload fails, the energy is refunded. Saving locally never costs anything.
- Notification center: a feed of announcements, with pinned and targeted notices.
- A one-time tour that explains energy, coins, and the long-press sync popup.

## What did the offline fix change

The headline fix is offline launch. The app now opens without a network, every time.

Before this build, an expired session opened while offline could stall the startup path on a blocked call and leave a blank screen. Startup no longer waits on that call, so the notes screen always loads from local storage first. Sync also stopped uploading on every keystroke. Edits save locally and reach the cloud on demand or on the hourly schedule.

## Known limitations

This is a demo build, so some parts are intentionally not live.

- Coin purchases with real money are not available yet. The Buy button says so.
- The hourly sync runs while the app is open, not as a true background job.
- Some flows still need testing on physical devices.

## How do I get the build

Sideload the signed APK from GitHub Releases. On most phones, use the arm64 build.

Download the latest build from [GitHub Releases](https://github.com/DevBehindYou/Atomic-Notes-App-V0.2/releases). For how the economy works, read the [Atomic Energy guide](/blog).

## What is next

Payments and a wider launch are the next planned milestones. Coin purchases come first, then a broader release. Both are planned, not shipped. Follow the updates for progress.
