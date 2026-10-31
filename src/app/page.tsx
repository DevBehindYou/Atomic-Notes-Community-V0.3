import type { CSSProperties } from "react";
import type { Viewport } from "next";
import Link from "next/link";
import "./revamp.css";
import { Dock, Icon, RvFooter, Ticks, type IconName, type Tick } from "@/components/rv/Chrome";
import { TryCards } from "@/components/rv/TryCards";
import { AskFaq } from "@/components/rv/AskFaq";
import { CopyRow } from "@/components/rv/CopyRow";
import { FeatChips } from "@/components/rv/FeatChips";
import { HeroAtom } from "@/components/rv/HeroAtom";
import { FeatureVideo } from "@/components/rv/FeatureVideo";
import { ReelCards, type ReelItem } from "@/components/rv/ReelCards";
import { DEFINITION, FAQ, RELEASE, REPO_URL, type NotificationRow } from "@/lib/content";
import { fetchActiveNotifications } from "@/lib/atomicServer";
import { APK_URL, DEVELOPER_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#15171B",
};

const M = (n: string) => `/mockups/mockups-01/atomic-notes-mockup-${n}.png`;
/** The app screens in the burgundy iPhone frame (public/mockups/mockups-02), as 640px WebP. */
const D = (n: string) => `/mockups/mockups-02/atomic-notes-mockup-${n}.webp`;
/** Square feature videos (public/revamp/videos): the MP4 and its WebP poster frame. */
const V = (name: string) => ({ src: `/revamp/videos/${name}.mp4`, poster: `/revamp/videos/${name}.webp` });
const A = (name: string) => `/revamp/mascots/${name}`;

async function latestUpdates(): Promise<NotificationRow[]> {
  try {
    const rows = (await fetchActiveNotifications()) as NotificationRow[];
    return rows.slice(0, 3);
  } catch {
    return [];
  }
}

/** Structured data for search and answer engines: the app, the site and the FAQ. */
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: "Atomic Notes",
        description: DEFINITION,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Android 9 or newer",
        softwareVersion: RELEASE.version,
        datePublished: RELEASE.date,
        downloadUrl: APK_URL,
        installUrl: APK_URL,
        license: `${REPO_URL}/blob/main/LICENSE`,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        image: `${SITE_URL}/og-banner.png`,
        screenshot: [`${SITE_URL}${M("01")}`, `${SITE_URL}${M("25")}`, `${SITE_URL}${M("11")}`],
        featureList: [
          "Local-first notes and checklists that work offline",
          "Sync to a folder in your own Google Drive",
          "Optional end-to-end vault: Argon2id and AES-256-GCM",
          "No AI, no ads, no analytics",
          "Biometric lock, two-step codes, and blocked screenshots",
        ],
        author: { "@id": `${SITE_URL}/#author` },
        sameAs: [REPO_URL],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: "Ashutosh Sharma",
        alternateName: "DevBehindYou",
        url: DEVELOPER_URL,
        sameAs: [
          "https://github.com/DevBehindYou",
          "https://www.linkedin.com/in/devbehindyou/",
          "https://medium.com/@devbehindyou",
          "https://x.com/devbehindyou",
          "https://youtube.com/@devbehindyou",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Atomic Notes",
        alternateName: ["Atomic Notes app", "Atomic Notes for Android", "Atomic Notes by DevBehindYou"],
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#author` },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

const TICKS: Tick[] = [
  { href: "#top", label: "Home", t: "hero" },
  { href: "#built", label: "Built on", t: "built" },
  { href: "#how-it-works", label: "How it works", t: "drift" },
  { href: "#features", label: "What it does", t: "feat", sideways: true },
  { href: "#energy", label: "Try it", t: "try" },
  { href: "#reel", label: "In motion", t: "reel", sideways: true },
  { href: "#faq", label: "Ask", t: "ask" },
  { href: "#maker", label: "The maker", t: "maker" },
  { href: "#get", label: "Get it", t: "get" },
];

const STARS: [number, number][] = [
  [6, 14], [14, 62], [22, 28], [31, 80], [44, 10], [52, 88], [61, 22],
  [70, 70], [78, 12], [86, 52], [92, 84], [38, 46], [96, 30], [3, 88],
];

const TILES: [string, string, IconName][] = [
  ["Flutter", "Cross-platform app code", "app"],
  ["Hive CE", "Offline note creation", "hive"],
  ["Drive API", "Google Drive notes sync", "cloudUp"],
  ["Argon2id", "Makes your vault key", "wordsKey"],
  ["AES-256-GCM", "Locks vault notes", "sealNote"],
  ["Keystore", "Biometric app lock keys", "chip"],
];

const ROW_A = [
  [D("01"), "Home screen with a pinned note"], [D("25"), "Note editor with a checklist"], [D("28"), "Six-word recovery phrase"],
  [D("11"), "Atomic Energy and coins"], [D("03"), "Home screen with dark note cards"], [D("20"), "Cloud sync settings"],
  [D("22"), "Biometric lock and screenshot blocking"], [D("02"), "Home screen, scrolled"],
];
const ROW_B = [
  [D("05"), "Settings"], [D("21"), "Device and cloud note counts"], [D("07"), "Mascot picker"], [D("16"), "Profile"],
  [D("19"), "Two-factor setup with a QR code"], [D("24"), "Searching notes"], [D("14"), "Recycle Bin"], [D("10"), "End-to-end encryption"],
];

type Case = {
  key: string;
  label: string;
  title: string;
  tags: string;
  alt: string;
  body: string;
  noteLabel: string;
  note: string;
  minis: [IconName, string][];
};

const CASES: Case[] = [
  {
    key: "offline", label: "Offline", title: "Lost signal? Your note didn’t notice.", tags: "#Offline  #Editor",
    alt: "Video: airplane mode turns on, a note is typed and saved on the device, and the app cold-starts in under a second",
    body: "Subway tunnel, flight, basement office: the Atomic Notes app keeps writing to your phone the whole time. It’s local-first note-taking, so the network only matters when you choose to sync. Deleted something by mistake? The Recycle Bin keeps it until you empty it.",
    noteLabel: "Measured on a real phone", note: "Opens in 0.5 to 0.9 seconds after a force stop, signal or no signal.",
    minis: [["pen", "Saves every keystroke"], ["list", "Checklists in notes"], ["bin", "Recycle Bin"], ["plane", "Works in airplane mode"]],
  },
  {
    key: "sync", label: "Sync", title: "Your Drive gets the notes. Our server gets the timestamps.", tags: "#Sync  #GoogleDrive",
    alt: "Video: three notes become .atomic files in the My-Atomic-Notes Drive folder while the server keeps only IDs, flags and timestamps",
    body: "Google Drive notes sync copies each note to a My-Atomic-Notes folder in your own Drive, one .atomic file per note. Turn on the vault and the folder becomes a secure cloud backup for notes, since Drive receives ciphertext and nothing else.",
    noteLabel: "What the server keeps", note: "Note IDs, flags, and timestamps. Never your titles or text.",
    minis: [["drive", "Your own Drive folder"], ["key", "drive.file scope"], ["copy", "Conflict copies"], ["retry", "Retries itself"]],
  },
  {
    key: "privacy", label: "Privacy", title: "The key never leaves your phone.", tags: "#Privacy  #Vault",
    alt: "Video: six recovery words become an Argon2id key, a note is sealed with AES-256-GCM, and only ciphertext reaches Drive and the server",
    body: "Switch on the optional end-to-end encrypted vault and the Atomic Notes app becomes an encrypted notes app for Android. You write down six words, Argon2id turns them into a key on your phone, and AES-256-GCM note encryption seals each note before it syncs.",
    noteLabel: "The honest part", note: "Lose the six words and nobody can open your vault notes, including us.",
    minis: [["lock", "Argon2id key"], ["shield", "AES-256-GCM"], ["finger", "Biometric app lock"], ["eye", "No screenshots"]],
  },
  {
    key: "energy", label: "Energy", title: "Writing is free. Sync runs on energy.", tags: "#Energy  #FreeToStart",
    alt: "Video: Atomic Energy gains 20 a day, a standard sync costs 5, an instant one 10, and an empty sync is free",
    body: "Local notes are always free, and so are receive-only syncs. Uploads spend from a balance: it refills by 20 every 24 hours and tops out at 120, with 5 per automatic batch and 10 per instant one. Need more room? Coins lift the cap from 30 notes to 40, 50, or 100.",
    noteLabel: "The exchange rate", note: "1 Atomic Coin turns into 40 energy.",
    minis: [["ban", "No ads"], ["bolt", "+20 a day"], ["notes", "30 notes free"], ["coin", "Coins"]],
  },
];

const REEL: ReelItem[] = [
  { ...V("reel-sync"), alt: "Video: notes leave the phone and land as .atomic files in the My-Atomic-Notes folder in Google Drive", title: "Your notes. Your Drive.", desc: "Sync sends each note to a My-Atomic-Notes folder in your own Google Drive." },
  { ...V("reel-checklist"), alt: "Video: a checklist inside a note, ticked off item by item", title: "Notes and to-dos, together.", desc: "Add a checklist to any note and tick items off as you go." },
  { ...V("reel-capture"), alt: "Video: a note written with no signal saves on Done, then syncs once the phone is back online", title: "Capture now, sync later.", desc: "Notes save on your phone the moment you tap Done. Sync catches up whenever you’re online." },
  { ...V("reel-privacy"), alt: "Video: biometric lock and screenshot blocking switch on in Security, and a screenshot comes out blank", title: "Privacy in two taps.", desc: "Security holds the biometric lock and screenshot blocking, side by side." },
  { ...V("reel-images"), alt: "Video: three gallery photos drop into a note between its paragraphs", title: "Images ride along.", desc: "Add up to 3 photos from your gallery to any note. They sit inside the note, between your paragraphs." },
];

export default async function Home() {
  const updates = await latestUpdates();

  return (
    <div className="rv">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <Dock current="home" />
      <Ticks items={TICKS} label="Sections" />

      <main id="top">
        {/* ATOM STAGE: the opening screen, before the hero */}
        <HeroAtom />

        {/* HERO */}
        <section className="rv-hero rv-t-hero" aria-labelledby="hero-title">
          <div className="rv-stars" aria-hidden="true" />
          <div aria-hidden="true">
            {STARS.map(([x, y], i) => (
              <span
                key={i}
                className={i % 4 === 0 ? "rv-star rv-star-s" : "rv-star"}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}
              />
            ))}
          </div>
          <div className="rv-wrap" style={{ position: "relative" }}>
            <div className="rv-hero-grid">
              <div style={{ minWidth: 0 }}>
                <h1 id="hero-title" className="rv-poster" style={{ fontSize: "clamp(56px, 6.4vw, 92px)", lineHeight: 0.9 }}>
                  Atomic Notes
                </h1>
                <p style={{ marginTop: 14, fontSize: "clamp(24px, 2.4vw, 34px)", fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.1 }}>
                  <span className="rv-rotator" aria-hidden="true">
                    <span className="rv-rotator-list">
                      <span>Notes that stay yours.</span>
                      <span className="rv-accent">Synced to your Drive.</span>
                      <span>No ads in the app.</span>
                      <span className="rv-accent">No AI reading along.</span>
                      <span>No trackers inside.</span>
                      <span className="rv-accent">Built by one developer.</span>
                      <span>Works with no signal.</span>
                      <span>Notes that stay yours.</span>
                    </span>
                  </span>
                  <span className="rv-sr">
                    Notes that stay yours. Synced to your Drive. No ads in the app. No AI reading along. No trackers inside. Built
                    by one developer. Works with no signal.
                  </span>
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                  <a href={APK_URL} className="rv-pill rv-pill-solid">
                    Download the APK
                  </a>
                  <a href="#energy" className="rv-pill">
                    Open It
                  </a>
                </div>
              </div>
              <div className="rv-orbit">
                <svg viewBox="-200 -200 400 400" aria-hidden="true">
                  <g fill="none" strokeWidth={1.5}>
                    <ellipse rx="190" ry="68" stroke="#8F88FF" transform="rotate(30)" />
                    <ellipse rx="190" ry="68" stroke="#8F88FF" transform="rotate(-30)" />
                    <ellipse rx="190" ry="68" stroke="rgba(244,245,241,.35)" transform="rotate(90)" />
                  </g>
                  <circle cx="-164.5" cy="-95" r="6" fill="#8F88FF" />
                  <circle cx="164.5" cy="-95" r="6" fill="#F4F5F1" />
                  <circle cx="0" cy="190" r="6" fill="#8F88FF" />
                </svg>
                <div className="rv-porthole">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A("tilde-wave.webp")} alt="Tilde, a pixel mascot, waving hello" width={480} height={480} loading="lazy" />
                </div>
              </div>
              <div className="rv-hero-side" style={{ minWidth: 0 }}>
                <p className="rv-muted" style={{ fontSize: 14 }}>
                  Hi, I&apos;m Tilde.
                </p>
                <p style={{ marginTop: 8, fontSize: 20, fontWeight: 600, lineHeight: 1.35 }}>
                  I keep your notes on your phone, not on someone else&apos;s server.
                </p>
                <p className="rv-muted" style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6 }}>
                  The Atomic Notes app is a private notes app without ads, AI features, or analytics. Notes save on your phone, a
                  biometric app lock keeps them behind your fingerprint, and user-owned Google Drive storage holds the cloud copy
                  instead of our servers.
                </p>
                <p className="rv-muted" style={{ marginTop: 16, fontSize: 14, lineHeight: 1.5 }}>
                  Atomic Notes app {RELEASE.version} for {RELEASE.minAndroid} and newer. Built and maintained by one
                  developer, Ashutosh Sharma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BUILT ON */}
        <section id="built" className="rv-t-built" aria-labelledby="built-title" style={{ padding: "0 0 96px" }}>
          <div className="rv-wrap">
            <div className="rv-panel" style={{ padding: 28 }}>
              <p id="built-title" className="rv-muted" style={{ marginBottom: 22, fontSize: 14 }}>
                What the Atomic Notes app runs on
              </p>
              <ul className="rv-tiles">
                {TILES.map(([name, role, icon]) => (
                  <li key={name}>
                    <span className="rv-tile-icon">
                      <Icon name={icon} size={30} />
                    </span>
                    <span className="rv-poster" style={{ fontSize: 26, lineHeight: 1 }}>
                      {name}
                    </span>
                    <span className="rv-muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.3 }}>
                      {role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* STATEMENT, with screenshot rows that drift in opposite directions */}
        <section id="how-it-works" className="rv-drift" aria-labelledby="statement" style={{ padding: "24px 0 120px", overflow: "hidden" }}>
          <div className="rv-wrap">
            <h2 id="statement" style={{ fontSize: "clamp(28px, 3.3vw, 46px)", lineHeight: 1.2, fontWeight: 500, letterSpacing: -0.6, maxWidth: "30ch" }}>
              Your phone keeps the original. Your Drive keeps the copy.
              <span className="rv-statement-2">Turn on the vault, and your words leave the phone as ciphertext.</span>
            </h2>
          </div>
          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 16 }} aria-label="App screens">
            {[ROW_A, ROW_B].map((row, r) => (
              <div key={r} className={r === 0 ? "rv-row rv-row-a" : "rv-row rv-row-b"}>
                {row.map(([src, alt], i) => (
                  <figure className="rv-shot" key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} width={640} height={1312} loading="lazy" decoding="async" />
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* WHAT IT DOES: pinned, slides left */}
        <section id="features" className="rv-hs rv-feat" aria-labelledby="features-title">
          <div className="rv-hs-stick">
            <div className="rv-wrap rv-hs-head">
              <h2 id="features-title" className="rv-h2" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
                What the Atomic Notes app does.
              </h2>
              <FeatChips sectionId="features" items={CASES.map((c) => ({ key: c.key, label: c.label }))} />
            </div>
            <div className="rv-hs-track">
              {CASES.map((c) => (
                <article key={c.key} id={`f-${c.key}`} className="rv-fpanel" aria-labelledby={`case-${c.key}`}>
                  <div className="rv-fmedia">
                    <div className="rv-fclip">
                      <FeatureVideo src={`/revamp/videos/what-${c.key}.mp4`} poster={`/revamp/videos/what-${c.key}.webp`} label={c.alt} />
                    </div>
                  </div>
                  <div className="rv-panel rv-finfo">
                    <p className="rv-tag">{c.tags}</p>
                    <h3 id={`case-${c.key}`}>{c.title}</h3>
                    <p className="rv-fbody">{c.body}</p>
                    <div className="rv-fnote">
                      <p className="rv-muted" style={{ fontSize: 13 }}>
                        {c.noteLabel}
                      </p>
                      <p style={{ marginTop: 4, fontSize: 15, lineHeight: 1.5 }}>{c.note}</p>
                    </div>
                    <ul className="rv-fminis">
                      {c.minis.map(([icon, t]) => (
                        <li key={t}>
                          <Icon name={icon} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <div className="rv-wrap">
              <div className="rv-hs-bar">
                <span />
              </div>
            </div>
          </div>
        </section>

        {/* TRY IT: three demo cards that open like an accordion */}
        <section id="energy" className="rv-sec rv-t-try" aria-labelledby="try-title">
          <div className="rv-wrap">
            <h2 id="try-title" className="rv-h2">
              Try the Atomic Notes app or play with it.
            </h2>
            <p className="rv-lede" style={{ marginTop: 14 }}>
              Three working models of how it handles your notes. They run in your browser, and nothing you type leaves this
              page.
            </p>
            <div style={{ marginTop: 48 }}>
              <TryCards />
            </div>
          </div>
        </section>

        {/* THE APP IN MOTION: pinned, slides left like every sideways section, Tilde walks the ground */}
        <section id="reel" className="rv-hs rv-reel" aria-labelledby="reel-title">
          <div className="rv-hs-stick">
            <div className="rv-wrap">
              <h2 id="reel-title" className="rv-h2" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
                The app in motion.
              </h2>
            </div>
            <div className="rv-hs-track rv-reel-track">
              <ReelCards items={REEL} />
            </div>
            <div className="rv-wrap">
              <div className="rv-hs-bar">
                <span />
              </div>
            </div>
            <div className="rv-ground" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="rv-walker" src={A("tilde-walk.webp")} alt="" width={480} height={480} loading="lazy" />
            </div>
          </div>
        </section>

        {/* ASK */}
        <section id="faq" className="rv-sec rv-t-ask" aria-labelledby="ask-title">
          <div className="rv-wrap" style={{ maxWidth: 860 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
              <h2 id="ask-title" className="rv-h2">
                Ask me anything.
              </h2>
              <div className="rv-paper-card rv-pop" style={{ width: 140, rotate: "3deg" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("tilde-type.webp")} alt="Tilde typing into a terminal" width={480} height={480} loading="lazy" />
              </div>
            </div>
            <AskFaq />
          </div>
        </section>

        {/* THE MAKER */}
        <section id="maker" className="rv-sec rv-t-maker" aria-labelledby="maker-title">
          <div className="rv-wrap">
            <h2 id="maker-title" className="rv-h2">
              Built by one developer, after one bad evening.
            </h2>
            <p className="rv-lede" style={{ marginTop: 16 }}>
              &ldquo;I kept everything in a notes app: tasks, expenses, prescriptions, work links. One evening a stranger took
              over my X account, and my Gmail turned up on sites I never joined. I had no idea where my notes lived or who
              could reach them. So I built the Atomic Notes app to answer both.&rdquo;
            </p>
            <p className="rv-muted" style={{ marginTop: 12, fontSize: 14 }}>
              Ashutosh Sharma, DevBehindYou
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16, marginTop: 48 }}>
              <div className="rv-panel rv-reveal" style={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", background: "#15171B", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("dev-worker.webp")} alt="Ashutosh Sharma’s DevBehindYou avatar, a hooded developer at work" width={240} height={240} loading="lazy" />
              </div>
              <div className="rv-panel rv-reveal" style={{ padding: 26, background: "#3A2FF0", borderColor: "#3A2FF0", display: "flex", alignItems: "flex-end" }}>
                <p className="rv-voice" style={{ fontSize: 22, lineHeight: 1.3 }}>
                  Nothing to hide still leaves plenty to protect.
                  <span style={{ display: "block", marginTop: 12 }}>Write freely. Keep the key.</span>
                </p>
              </div>
              <div className="rv-reveal" style={{ minHeight: 260, borderRadius: 18, background: "#F4F5F1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("rocco-idle.webp")} alt="Rocco, an Atomic Notes pixel mascot, swishing its tail" width={240} height={240} loading="lazy" />
              </div>
              <div className="rv-panel rv-reveal" style={{ padding: 26, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <p className="rv-poster" style={{ fontSize: 56, lineHeight: 0.9 }}>
                  One
                  <br />
                  developer
                </p>
                <Link href="/story" className="rv-pill" style={{ alignSelf: "flex-start" }}>
                  Read how it started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LATEST UPDATES, live from the Atomic Notes Server */}
        <section id="updates" className="rv-sec" aria-labelledby="updates-title">
          <div className="rv-wrap">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
              <h2 id="updates-title" className="rv-h2">
                Latest from the build.
              </h2>
              <Link href="/updates" className="rv-pill">
                All updates
              </Link>
            </div>
            <div className="rv-updates" style={{ marginTop: 28 }}>
              {updates.length === 0 && (
                <div className="rv-panel" style={{ padding: 22 }}>
                  <p className="rv-muted">No active updates right now. Check back soon.</p>
                </div>
              )}
              {updates.map((n) => (
                <article className="rv-panel" key={n.id} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                  <p className="rv-tag">{n.type.replace(/_/g, " ")}</p>
                  <h3 style={{ fontSize: 18 }}>{n.subject}</h3>
                  <p className="rv-muted" style={{ fontSize: 15, lineHeight: 1.55 }}>
                    {n.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GET IT */}
        <section id="get" className="rv-sec rv-t-get" aria-labelledby="get-title">
          <div className="rv-wrap">
            <div
              className="rv-panel"
              style={{ position: "relative", padding: "clamp(28px, 5vw, 56px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 40, alignItems: "start" }}
            >
              <div className="rv-paper-card rv-pop rv-jumper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("tilde-jump.webp")} alt="Tilde jumping" width={480} height={480} loading="lazy" />
              </div>
              <div>
                <h2 id="get-title" className="rv-poster" style={{ fontSize: "clamp(48px, 6vw, 88px)", lineHeight: 0.9 }}>
                  Sideload it. <span className="rv-accent">Keep control.</span>
                </h2>
                <p className="rv-lede" style={{ marginTop: 18 }}>
                  Most phones need the file ending in arm64-v8a.apk. Version {RELEASE.version} installs over earlier versions and
                  keeps your notes. Needs {RELEASE.minAndroid} or newer.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
                  <a href={APK_URL} className="rv-pill rv-pill-signal">
                    Download the APK
                  </a>
                  <a href={REPO_URL} className="rv-pill" target="_blank" rel="noreferrer">
                    View the source
                  </a>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                <p className="rv-muted" style={{ fontSize: 14 }}>
                  Check the file before you install it
                </p>
                <CopyRow label="Certificate SHA-256" value={RELEASE.certSha256} />
                <CopyRow label="Check it with" value={`apksigner verify --print-certs atomic-notes-${RELEASE.version}-arm64-v8a.apk`} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <RvFooter />
    </div>
  );
}
