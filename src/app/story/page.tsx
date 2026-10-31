import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "../revamp.css";
import { Dock, RvFooter, Ticks, type Tick } from "@/components/rv/Chrome";
import { pageMetadata } from "@/lib/seo";
import { DEVELOPER_URL, SITE_URL } from "@/lib/site";

const MEDIUM_URL = "https://medium.com/@devbehindyou/building-a-privacy-first-notes-app-alone-6828f7e98922";

export const metadata: Metadata = pageMetadata({
  title: "The story behind Atomic Notes",
  description:
    "Why one developer built a privacy-first notes app alone: an evening of account break-ins, a notes app that knew too much, and a build that keeps your words with you.",
  path: "/story",
  socialTitle: "The story behind Atomic Notes",
  socialDescription: "I don't have a team or millions in funding. I just want to build a notes app that respects you.",
});

export const viewport: Viewport = {
  themeColor: "#15171B",
};

const A = (name: string) => `/revamp/mascots/${name}`;
const C = (name: string) => `/revamp/clips/clip-${name}.webp`;

const TICKS: Tick[] = [
  { href: "#s01", label: "Opening", t: "a0" },
  { href: "#act1", label: "Before Atomic Notes", t: "act1", sideways: true },
  { href: "#a2", label: "The evening", t: "a2" },
  { href: "#act3", label: "Building it", t: "act3", sideways: true },
  { href: "#a4", label: "Strangers", t: "a4" },
  { href: "#act5", label: "Keeping it alive", t: "act5", sideways: true },
  { href: "#s17", label: "Sign-off", t: "a6" },
];

const TAPS = ["Searches", "Websites you visit", "Conversations", "Places you go", "Things you consider buying", "Messages you never sent"];
const ENDS = ["AI training", "Behaviour profiles", "Ad targeting"];
const AGREE = ["Want to use an app?", "Want to connect with friends?", "Want to store your memories?"];
const LINES = [92, 100, 96, 88, 100, 64, 98, 100, 90, 72, 100, 58];
const STEPS = ["Notice it", "Question it", "Stop looking", "Call it normal"];
const STAIRS = [
  { n: "5", what: "Tasks and ideas", h: 14 },
  { n: "10", what: "Expenses", h: 26 },
  { n: "50", what: "Bank details", h: 46 },
  { n: "100", what: "Prescriptions", h: 66 },
  { n: "~200", what: "Work links, passwords", h: 88 },
];
const ALERTS = [
  { app: "X", when: "16:02", text: "A login from a new location was detected" },
  { app: "X", when: "16:09", text: "Your password was changed" },
  { app: "Google", when: "16:15", text: "Sign-in from an unfamiliar location" },
  { app: "X", when: "17:40", text: "Your account has been suspended" },
];
const LOST = ["An X account, years old", "A clean Gmail inbox", "Years of conversations", "Professional connections", "A part of my identity"];
const PROTECT = ["Your work", "Your health", "Your memories", "Your money", "Your thoughts", "Your identity"];
const NOTS = ["Business plan", "Pitch deck", "Investors", "Product roadmap"];
const FLOW = [
  { n: "1", t: "Your phone", d: "Holds your notes first. With the vault on, AES-256-GCM seals each note here; the key never leaves the phone." },
  { n: "2", t: "Sync server", d: "Coordinates accounts, versions and status. It doesn't keep note text." },
  { n: "3", t: "Your Google Drive", d: "The cloud copy lives in storage you already own and manage." },
];
const FEATURES = [
  "Local-first notes", "Notes and checklists", "Google Drive sync", "Optional end-to-end vault", "Biometric lock", "Screenshot protection",
  "Two-step codes", "Search, filters, pins", "Recycle Bin", "Conflict copies", "Device and cloud controls", "Atomic Energy and Coins",
];
const ASKED = [
  { q: "Is it on the Play Store?", a: "Not yet. A Play Store release is planned once the production build, security checks and store requirements are ready." },
  { q: "Is it free?", a: "Yes. No subscription, no ads. Every account holds 30 notes, and sync runs on a free daily energy allowance." },
  { q: "Why Google-only sign-in?", a: "Google sign-in grants access to the app’s own Drive folder. Email and password login is on the roadmap." },
  { q: "Will there be a web version?", a: "Yes, it’s on the roadmap with the same privacy model, including vault notes decrypted in the browser." },
  { q: "Will it work with screen readers?", a: "That’s the goal: proper labels, meaningful descriptions and a logical focus order, tested with real users." },
  { q: "How does energy work?", a: "Up to 120 energy, +20 every 24 hours. A standard sync costs 5, an instant sync 10, receiving changes is free." },
];
const LICENCE: [string, string, boolean][] = [
  ["Read the code", "Yes", true],
  ["Review and report issues", "Yes", true],
  ["Reuse the code", "Restricted", false],
  ["Redistribute it", "Restricted", false],
];
const BILL = ["Domain", "Hosting", "Database", "Monitoring", "Backups", "Security reviews", "Testing devices", "Development tools", "AI development tools", "Release pipelines", "Google Play registration"];
const PATH = ["Explore the website", "Read how it works", "Inspect the code", "Try the app", "Question the architecture"];
const HELP = [
  "Try the app and tell me where it fails", "Report a bug", "Suggest a feature", "Flag a confusing screen", "Help test accessibility",
  "Share the project", "Review the code, report security issues responsibly", "Write about user-owned data",
];
const ROADMAP = [
  ["Supporter Billboard", "A space on this website for the people who believed early."],
  ["Contributors Wall", "For code, testing, bug reports, accessibility help and community work."],
  ["Recognition in the app", "By display name, alias, or anonymously. Your choice."],
];

function Stage({ id, cls, title, children, ground }: { id: string; cls: string; title: string; children: ReactNode; ground?: ReactNode }) {
  return (
    <section id={id} className={`rv-hs ${cls}`} aria-labelledby={`${id}-title`}>
      <div className="rv-hs-stick">
        <div className="rv-wrap">
          <h2 id={`${id}-title`} className="rv-stage-title">
            {title}
          </h2>
        </div>
        <div className="rv-hs-track">{children}</div>
        <div className="rv-wrap">
          <div className="rv-hs-bar">
            <span />
          </div>
        </div>
        {ground}
      </div>
    </section>
  );
}

// Structured data: the story as an article by the developer.
const STORY_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The story behind Atomic Notes",
  description:
    "Why one developer built a privacy-first notes app alone: an evening of account break-ins, a notes app that knew too much, and a build that keeps your words with you.",
  url: `${SITE_URL}/story`,
  mainEntityOfPage: `${SITE_URL}/story`,
  image: `${SITE_URL}/og-banner.png`,
  inLanguage: "en-US",
  author: { "@type": "Person", name: "Ashutosh Sharma", alternateName: "DevBehindYou", url: DEVELOPER_URL },
  publisher: { "@type": "Person", name: "Ashutosh Sharma", url: DEVELOPER_URL },
  about: { "@type": "SoftwareApplication", name: "Atomic Notes", operatingSystem: "Android" },
};

export default function StoryPage() {
  return (
    <div className="rv">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STORY_LD).replace(/</g, "\u003c") }} />
      <Dock current="story" />
      <Ticks items={TICKS} label="Parts of the story" />

      <main>
        {/* 01 · OPENING */}
        <section id="s01" className="rv-hero rv-t-a0" aria-labelledby="s01-title">
          <div className="rv-stars" aria-hidden="true" />
          <div className="rv-wrap">
            <div className="rv-hero-grid rv-hero-grid-2">
              <div style={{ minWidth: 0 }}>
                <p className="rv-num">01 · The story behind Atomic Notes</p>
                <h1 id="s01-title" className="rv-poster" style={{ fontSize: "clamp(56px, 7.4vw, 112px)", lineHeight: 0.9 }}>
                  I don&apos;t have a team or <span className="rv-accent">millions in funding.</span>
                </h1>
                <p className="rv-voice" style={{ fontSize: "clamp(28px, 3.2vw, 46px)", marginTop: 24, maxWidth: "24ch" }}>
                  I just want to build a notes app that respects you.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 36 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A("dev-worker.webp")} alt="" width={44} height={44} style={{ borderRadius: 999 }} />
                  <p style={{ fontSize: 15, lineHeight: 1.4 }}>
                    <strong style={{ fontWeight: 600 }}>Ashutosh Sharma</strong>
                    <br />
                    <span className="rv-muted">DevBehindYou. A 12-minute read.</span>
                  </p>
                  <a href={MEDIUM_URL} className="rv-pill" style={{ marginLeft: 8 }} target="_blank" rel="noreferrer">
                    Read the original on Medium
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
                <div className="rv-porthole rv-porthole-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A("dev-worker.webp")} alt="DevBehindYou, the developer's hooded avatar, at work" width={360} height={360} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACT 1 · pinned, slides left: before Atomic Notes (02–04) */}
        <Stage id="act1" cls="rv-act1" title="Before Atomic Notes.">
          <article className="rv-spanel" aria-labelledby="s02-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">02</p>
              <h3 id="s02-title" className="rv-ptitle">
                Every tap <span>has a price.</span>
              </h3>
              <p className="rv-pbody">
                Every search you make. Every place you go. Even the things you type and decide not to send. Somewhere, someone
                wants to turn that information into something valuable.
              </p>
              <ul className="rv-chips" style={{ marginTop: "auto" }}>
                {TAPS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rv-scol rv-scol-center" style={{ gap: 14 }}>
              <p className="rv-muted" style={{ fontSize: 14 }}>
                Where it ends up
              </p>
              {ENDS.map((e) => (
                <div key={e} className="rv-paper" style={{ padding: "18px 22px", boxShadow: "6px 6px 0 #3A2FF0" }}>
                  <p className="rv-poster" style={{ fontSize: 34, lineHeight: 1 }}>
                    {e}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s03-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">03</p>
              <h3 id="s03-title" className="rv-ptitle">
                Privacy, buried <span>in a checkbox.</span>
              </h3>
              <p className="rv-pbody">
                We click &ldquo;I Agree.&rdquo; Not always because we agree, but because it feels like the only way to take part
                in modern life. And with every agreement, we may give up a little more control.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                {AGREE.map((a) => (
                  <p key={a} className="rv-mono" style={{ fontSize: 14 }}>
                    {a} <span className="rv-accent">Agree.</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="rv-scol rv-scol-center">
              <div className="rv-paper" aria-hidden="true" style={{ padding: 24, boxShadow: "6px 6px 0 #3A2FF0" }}>
                <p className="rv-mono" style={{ marginBottom: 14, color: "#4A4D55" }}>
                  Terms of service, 48 pages
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {LINES.map((w, i) => (
                    <div key={i} style={{ height: 6, borderRadius: 3, background: "#C6C6CB", width: `${w}%` }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <span style={{ flex: "0 0 22px", height: 22, borderRadius: 5, background: "#3A2FF0" }} />
                  <span style={{ fontSize: 15 }}>I have read and agree</span>
                  <span style={{ marginLeft: "auto", background: "#3A2FF0", color: "#FFFFFF", borderRadius: 999, padding: "10px 18px", fontWeight: 600, fontSize: 14 }}>
                    I Agree
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s04-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">04</p>
              <h3 id="s04-title" className="rv-ptitle">
                How we get used <span>to being watched.</span>
              </h3>
              <p className="rv-voice" style={{ fontSize: 24, maxWidth: "30ch" }}>
                Not because the camera disappeared. Because living with it felt easier than fighting it.
              </p>
              <ul className="rv-chips" style={{ marginTop: "auto" }}>
                <li>&ldquo;I have nothing to hide.&rdquo;</li>
                <li>&ldquo;Everyone collects data anyway.&rdquo;</li>
                <li>&ldquo;Nothing bad has happened to me.&rdquo;</li>
              </ul>
            </div>
            <ol className="rv-scol rv-scol-center rv-steps" style={{ gap: 10 }}>
              {STEPS.map((s, i) => (
                <li key={s}>
                  <span className="rv-mono" style={{ color: i === 3 ? "#D8D6FF" : "#4A4D55" }}>
                    0{i + 1}
                  </span>
                  <span className="rv-poster" style={{ fontSize: 32, lineHeight: 1 }}>
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        </Stage>

        {/* ACT 2 · the evening (05–07) */}
        <div id="a2" className="rv-t-a2">
          <section id="s05" className="rv-sec" aria-labelledby="s05-title">
            <div className="rv-wrap">
              <p className="rv-num">05</p>
              <h2 id="s05-title" className="rv-ch-title">
                Five notes became <span>two hundred.</span>
              </h2>
              <p className="rv-body" style={{ marginTop: 24 }}>
                Tasks and ideas first. Then monthly expenses, bank mini statements, prescriptions, work links, and the occasional
                password. Things that mean nothing to anyone else, but together tell a detailed story about who you are.
              </p>
              <div className="rv-stairs" aria-hidden="true" style={{ marginTop: 48 }}>
                {STAIRS.map((st, i) => (
                  <div className="rv-stair" key={st.n}>
                    <span className="rv-muted" style={{ fontSize: 14, lineHeight: 1.3 }}>
                      {st.what}
                    </span>
                    <div
                      className="rv-bar"
                      style={{ height: `${st.h}%`, "--w": `${Math.max(st.h, 26)}%`, background: i === 4 ? "#3A2FF0" : `rgba(244,245,241,${(0.12 + i * 0.07).toFixed(2)})` } as CSSProperties}
                    >
                      <span className="rv-poster" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1, color: i === 4 ? "#FFFFFF" : "#F4F5F1" }}>
                        {st.n}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="rv-muted" style={{ marginTop: 14, fontSize: 14 }}>
                Notes in one app, over a few months
              </p>
            </div>
          </section>

          <section id="s06" className="rv-sec" aria-labelledby="s06-title" style={{ background: "#0B0C0E" }}>
            <div className="rv-wrap rv-two">
              <div style={{ minWidth: 0 }}>
                <p className="rv-num">06</p>
                <h2 id="s06-title" className="rv-ch-title">
                  The evening everything <span style={{ color: "#FF8A80" }}>went wrong.</span>
                </h2>
                <p className="rv-body" style={{ marginTop: 24 }}>
                  An ordinary working day. Then an email: a login to my X account from a new location. A different country. An IP I
                  didn&apos;t recognise. Then another email: my password had been changed.
                </p>
                <p className="rv-body" style={{ marginTop: 16 }}>
                  I was sitting at work, sweating, watching security alerts arrive one after another.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                {ALERTS.map((a, i) => (
                  <div className="rv-alert" key={a.when}>
                    <span className="rv-dot" aria-hidden="true" style={{ opacity: 0.4 + i * 0.2 }} />
                    <div style={{ minWidth: 0 }}>
                      <p className="rv-mono rv-muted">
                        {a.app}, {a.when}
                      </p>
                      <p style={{ marginTop: 4, fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="s07" className="rv-sec" aria-labelledby="s07-title">
            <div className="rv-wrap rv-two" style={{ alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <p className="rv-num">07</p>
                <h2 id="s07-title" className="rv-ch-title">
                  What one hack <span>takes with it.</span>
                </h2>
                <p className="rv-body" style={{ marginTop: 24 }}>
                  My X account was permanently suspended. My Gmail address was used to sign up on sites I never chose. Other
                  accounts were affected.
                </p>
                <p className="rv-body" style={{ marginTop: 16 }}>
                  I want to be clear: I can&apos;t say my notes app caused it. But it made me face what I&apos;d been ignoring: I
                  had no idea where my notes lived or who could reach them.
                </p>
              </div>
              <div className="rv-paper rv-reveal" style={{ padding: 28, boxShadow: "8px 8px 0 #3A2FF0" }}>
                <p className="rv-mono" style={{ marginBottom: 16, color: "#4A4D55" }}>
                  Lost in one evening
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 18 }}>
                  {LOST.map((l) => (
                    <li key={l} style={{ textDecoration: "line-through", textDecorationColor: "#BA1A1A", textDecorationThickness: 2 }}>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rv-wrap" style={{ marginTop: 72 }}>
              <div className="rv-reveal" style={{ background: "#3A2FF0", borderRadius: 22, padding: "clamp(28px, 5vw, 48px)", boxShadow: "8px 8px 0 #8F88FF" }}>
                <p className="rv-voice" style={{ fontSize: "clamp(30px, 3.6vw, 50px)", color: "#FFFFFF", maxWidth: "26ch" }}>
                  Privacy isn&apos;t about having something to hide. It&apos;s about having something to protect.
                </p>
                <ul className="rv-chips" style={{ marginTop: 28 }}>
                  {PROTECT.map((p) => (
                    <li key={p} style={{ borderColor: "rgba(255,255,255,.7)", color: "#FFFFFF" }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* ACT 3 · pinned, slides left like every sideways act: building it (08–11), Rocco waddles along */}
        <Stage
          id="act3"
          cls="rv-act3"
          title="Building it."
          ground={
            <div className="rv-ground rv-ground-sm" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="rv-walker" src={A("rocco-waddle.webp")} alt="" width={480} height={480} loading="lazy" />
            </div>
          }
        >
          <article className="rv-spanel" aria-labelledby="s08-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">08</p>
              <h3 id="s08-title" className="rv-ptitle">
                How Atomic Notes <span>began.</span>
              </h3>
              <ul style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {NOTS.map((n) => (
                  <li
                    key={n}
                    className="rv-poster"
                    style={{ fontSize: "clamp(30px, 3vw, 44px)", lineHeight: 1.05, color: "rgba(244,245,241,.5)", textDecoration: "line-through", textDecorationColor: "#8F88FF", textDecorationThickness: 3 }}
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rv-scol rv-scol-center" style={{ position: "relative" }}>
              <div style={{ background: "#0B0C0E", border: "1px solid rgba(244,245,241,.18)", borderRadius: 16, overflow: "hidden", boxShadow: "6px 6px 0 #3A2FF0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid rgba(244,245,241,.12)" }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(244,245,241,.3)" }} />
                  ))}
                  <span className="rv-mono rv-muted" style={{ marginLeft: 8 }}>
                    new project
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: 15, lineHeight: 1.7, padding: "20px 22px 76px", color: "#D8D6FF" }}>
                  {"// Fine. If I can't find a notes app"}
                  <br />
                  {"// that works the way I want,"}
                  <br />
                  {"// I'll build one myself."}
                  <br />
                  <span className="rv-accent">void</span> main() =&gt; runApp(AtomicNotes());
                </p>
              </div>
              <div className="rv-paper-card rv-sticker" style={{ right: 20, bottom: 0, width: 128 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("atom-formation.webp")} alt="An atom forming from a proton, a neutron and an electron" width={240} height={240} loading="lazy" />
              </div>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s09-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">09</p>
              <h3 id="s09-title" className="rv-ptitle">
                It was supposed to be <span>just for me.</span>
              </h3>
              <p className="rv-pbody">
                I showed it to a few colleagues. I expected &ldquo;nice UI.&rdquo; Instead, people asked me to install it on their
                phones. Then a question changed everything.
              </p>
              <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                <span className="rv-mono" style={{ border: "1px solid rgba(244,245,241,.3)", borderRadius: 999, padding: "8px 14px" }}>
                  Phone
                </span>
                <span style={{ flex: 1, borderTop: "2px dashed #8F88FF" }} />
                <span className="rv-poster rv-accent" style={{ fontSize: 34 }}>
                  ?
                </span>
                <span style={{ flex: 1, borderTop: "2px dashed #8F88FF" }} />
                <span className="rv-mono" style={{ border: "1px solid rgba(244,245,241,.3)", borderRadius: 999, padding: "8px 14px" }}>
                  Desktop
                </span>
              </div>
            </div>
            <div className="rv-scol rv-scol-center" style={{ gap: 14 }}>
              <div className="rv-paper" style={{ padding: "18px 20px", borderRadius: "18px 18px 18px 4px" }}>
                <p className="rv-mono" style={{ marginBottom: 6, color: "#4A4D55" }}>
                  A colleague
                </p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>&ldquo;Can you install this on my phone?&rdquo;</p>
              </div>
              <div className="rv-paper" style={{ padding: "18px 20px", borderRadius: "18px 18px 18px 4px", boxShadow: "6px 6px 0 #3A2FF0" }}>
                <p className="rv-mono" style={{ marginBottom: 6, color: "#4A4D55" }}>
                  Another colleague
                </p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>&ldquo;How do I get my notes on my desktop?&rdquo;</p>
              </div>
              <div className="rv-paper-card" style={{ width: 112, alignSelf: "flex-end" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("tilde-type.webp")} alt="Tilde typing into a terminal" width={480} height={480} loading="lazy" />
              </div>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s10-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">10</p>
              <h3 id="s10-title" className="rv-ptitle">
                Where your notes <span>actually go.</span>
              </h3>
              <ol style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {FLOW.map((f) => (
                  <li key={f.n} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span className="rv-mono rv-accent" style={{ flex: "0 0 auto" }}>
                      {f.n}
                    </span>
                    <span style={{ fontSize: 15, lineHeight: 1.5 }}>
                      <strong style={{ fontWeight: 600 }}>{f.t}.</strong> {f.d}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rv-scol" style={{ padding: 0, gap: 12 }}>
              <div className="rv-media">
                <div className="rv-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={C("sync")} alt="Clip: notes syncing into the My-Atomic-Notes folder" width={300} height={360} loading="lazy" decoding="async" />
                </div>
              </div>
              <p className="rv-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                With the vault off, synced notes are readable in your own Drive and pass through the sync server during transfer.
                The server doesn&apos;t keep the text.
              </p>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s11-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">11</p>
              <h3 id="s11-title" className="rv-ptitle">
                One small app. <span>A lot of thought behind it.</span>
              </h3>
              <ul className="rv-chips" style={{ marginTop: "auto" }}>
                {FEATURES.map((f) => (
                  <li key={f} style={{ fontSize: 13, padding: "6px 12px" }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rv-scol" style={{ padding: 0, gap: 12 }}>
              <div className="rv-media">
                <div className="rv-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={C("glance")} alt="Clip: the home screen switching from list to grid" width={300} height={339} loading="lazy" decoding="async" />
                </div>
              </div>
              <p className="rv-voice" style={{ fontSize: 20 }}>
                One thing I deliberately left out: AI. Sometimes a note is just a note.
              </p>
            </div>
          </article>
        </Stage>

        {/* ACT 4 · strangers (12–13) */}
        <div id="a4" className="rv-t-a4">
          <section id="s12" className="rv-sec" aria-labelledby="s12-title" style={{ borderTop: 0 }}>
            <div className="rv-wrap">
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
                <div style={{ flex: "1 1 520px", minWidth: 0 }}>
                  <p className="rv-num">12</p>
                  <h2 id="s12-title" className="rv-ch-title">
                    One Reddit post. <span>I wasn&apos;t alone.</span>
                  </h2>
                  <p className="rv-body" style={{ marginTop: 24 }}>
                    I posted Atomic Notes on r/droidapptesters, expecting maybe a few upvotes. It became my #1 post of all time.
                    Strangers asked when they could use it.
                  </p>
                </div>
                <div className="rv-paper-card rv-pop" style={{ width: 140, rotate: "-3deg" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A("tilde-jump.webp")} alt="Tilde jumping for joy" width={480} height={480} loading="lazy" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16, marginTop: 48 }}>
                {ASKED.map((q) => (
                  <article key={q.q} className="rv-panel rv-reveal" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p className="rv-tag">Asked on Reddit</p>
                    <h3 style={{ fontSize: 19, lineHeight: 1.3 }}>{q.q}</h3>
                    <p style={{ fontSize: 15, color: "rgba(244,245,241,.72)", lineHeight: 1.55 }}>{q.a}</p>
                  </article>
                ))}
              </div>
              <p className="rv-voice" style={{ fontSize: "clamp(26px, 3vw, 40px)", marginTop: 56, maxWidth: "34ch" }}>
                A good app isn&apos;t one that works for the developer who built it. It&apos;s one people with different needs can
                actually use.
              </p>
            </div>
          </section>

          <section id="s13" className="rv-sec" aria-labelledby="s13-title">
            <div className="rv-wrap rv-two">
              <div style={{ minWidth: 0 }}>
                <p className="rv-num">13</p>
                <h2 id="s13-title" className="rv-ch-title">
                  Trust you <span>can inspect.</span>
                </h2>
                <p className="rv-body" style={{ marginTop: 24 }}>
                  The source is public on GitHub, so you can check how it works instead of taking my word for it. To be precise:
                  it&apos;s source-available, not open source. You can read and review it; reuse and redistribution are restricted.
                </p>
              </div>
              <div className="rv-paper rv-reveal" style={{ padding: 26, boxShadow: "8px 8px 0 #3A2FF0" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid #C6C6CB", paddingBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 14, overflowWrap: "anywhere" }}>DevBehindYou/Atomic-Notes-App-V0.2</span>
                  <span className="rv-mono" style={{ background: "#15171B", color: "#F4F5F1", borderRadius: 999, padding: "5px 12px" }}>
                    Source-available
                  </span>
                </div>
                <dl>
                  {LICENCE.map(([k, v, yes], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: i < LICENCE.length - 1 ? "1px solid #C6C6CB" : undefined }}>
                      <dt style={{ fontSize: 16 }}>{k}</dt>
                      <dd className="rv-mono" style={{ margin: 0, color: yes ? "#3A2FF0" : "#4A4D55" }}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </div>

        {/* ACT 5 · pinned, slides left: keeping it alive (14–16) */}
        <Stage id="act5" cls="rv-act5" title="Keeping it alive.">
          <article className="rv-spanel" aria-labelledby="s14-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">14</p>
              <h3 id="s14-title" className="rv-ptitle">
                The bill <span>nobody sees.</span>
              </h3>
              <p className="rv-pbody">
                I&apos;m the developer, the tester, the designer, the person writing the docs and the person paying the bills.
                Right now, even the Google Play fee is something I have to think carefully about.
              </p>
              <p className="rv-voice" style={{ fontSize: 28, marginTop: "auto" }}>
                Servers don&apos;t run on passion.
              </p>
            </div>
            <div className="rv-scol rv-scol-center">
              <div className="rv-paper" aria-label="Receipt of project costs" style={{ padding: "22px 24px", borderRadius: "14px 14px 4px 4px" }}>
                <p className="rv-mono" style={{ textAlign: "center", marginBottom: 14 }}>
                  Atomic Notes running costs
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {BILL.map((b) => (
                    <li key={b} style={{ display: "flex", gap: 8, fontFamily: "var(--font-mono), monospace", fontSize: 13 }}>
                      <span>{b}</span>
                      <span aria-hidden="true" style={{ flex: 1, borderBottom: "1px dotted #4A4D55", transform: "translateY(-4px)" }} />
                      <span>Paid</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, fontWeight: 500, borderTop: "1.5px dashed #15171B", marginTop: 14, paddingTop: 12 }}>
                  Paid by: one developer&apos;s salary.
                </p>
              </div>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s15-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">15</p>
              <h3 id="s15-title" className="rv-ptitle">
                Support, <span>not sympathy.</span>
              </h3>
              <p className="rv-pbody">Please don&apos;t support Atomic Notes because you feel sorry for me. Look at the project first.</p>
              <ol className="rv-chips">
                {PATH.map((p, i) => (
                  <li key={p}>
                    <span className="rv-accent">0{i + 1}</span> {p}
                  </li>
                ))}
              </ol>
              <p className="rv-voice" style={{ fontSize: 24, marginTop: "auto" }}>
                Is this something I would genuinely want to exist?
              </p>
            </div>
            <div className="rv-scol" style={{ padding: "12px 8px", justifyContent: "center" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/support-atomic-notes" className="rv-pill rv-pill-signal">
                  Support the build
                </Link>
                <Link href="/#get" className="rv-pill">
                  Try the app first
                </Link>
              </div>
              <p className="rv-muted" style={{ marginTop: 12, fontSize: 14 }}>
                No money? You can still help
              </p>
              <ul className="rv-chips">
                {HELP.map((h) => (
                  <li key={h} style={{ fontSize: 13, padding: "6px 12px" }}>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rv-spanel" aria-labelledby="s16-title">
            <div className="rv-panel rv-scol">
              <p className="rv-pnum">16 · Planned</p>
              <h3 id="s16-title" className="rv-ptitle">
                Big companies have investors. <span>Independent projects have believers.</span>
              </h3>
              <div className="rv-paper-card" style={{ width: 140, marginTop: "auto" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A("atom-to-coin.webp")} alt="An atom turning into one Atomic Coin" width={240} height={240} loading="lazy" />
              </div>
            </div>
            <div className="rv-scol rv-scol-center" style={{ gap: 12 }}>
              {ROADMAP.map(([t, d], i) => (
                <div key={t} className="rv-panel" style={{ padding: "18px 20px", boxShadow: i === 0 ? "6px 6px 0 #3A2FF0" : undefined }}>
                  <h4 className="rv-poster" style={{ fontSize: 30, lineHeight: 1 }}>
                    {t}
                  </h4>
                  <p style={{ marginTop: 6, fontSize: 15, lineHeight: 1.5, color: "rgba(244,245,241,.72)" }}>{d}</p>
                </div>
              ))}
            </div>
          </article>
        </Stage>

        {/* 17 · SIGN-OFF */}
        <section id="s17" className="rv-sec rv-t-a6" aria-labelledby="s17-title" style={{ textAlign: "center" }}>
          <div className="rv-wrap" style={{ maxWidth: 860 }}>
            <div className="rv-paper-card rv-pop" style={{ width: 160, margin: "0 auto", borderRadius: 999 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("tilde-wave.webp")} alt="Tilde waving goodbye" width={480} height={480} loading="lazy" style={{ transform: "translateY(-20%) scale(1.3)" }} />
            </div>
            <p className="rv-num" style={{ marginTop: 40 }}>
              17
            </p>
            <h2 id="s17-title" className="rv-voice" style={{ fontSize: "clamp(38px, 4.8vw, 66px)", lineHeight: 1.05, fontWeight: 300 }}>
              Your Notes. Your Drive. Always Yours.
            </h2>
            <p className="rv-poster rv-accent" style={{ fontSize: "clamp(36px, 4vw, 52px)", marginTop: 24 }}>
              Every electron helps.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("dev-worker.webp")} alt="" width={36} height={36} style={{ borderRadius: 999 }} />
              <p style={{ fontSize: 15, color: "rgba(244,245,241,.72)" }}>DevBehindYou, still learning, still building</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 40 }}>
              <Link href="/#get" className="rv-pill rv-pill-signal">
                Download the APK
              </Link>
              <Link href="/support-atomic-notes" className="rv-pill">
                Support
              </Link>
              <a href={MEDIUM_URL} className="rv-pill" target="_blank" rel="noreferrer">
                Read on Medium
              </a>
            </div>
          </div>
        </section>
      </main>

      <RvFooter />
    </div>
  );
}
