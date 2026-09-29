import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { Phone } from "@/components/Phone";
import { Gallery, type Shot } from "@/components/Gallery";
import { EnergyDemo } from "@/components/EnergyDemo";
import {
  COMPARISON,
  DEFINITION,
  ENERGY_RULES,
  FACTS,
  FAQ,
  PERFORMANCE,
  RELEASE,
  REPO_URL,
  ROADMAP,
  TIERS,
  VISIBILITY,
  type NotificationRow,
} from "@/lib/content";
import { fetchActiveNotifications } from "@/lib/atomicServer";
import { APK_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const M = (n: string) => `/mockups/atomic-notes-mockup-image-${n}.png`;

// The screen tour. Image 17 (a recovery phrase) is left out on purpose.
const SHOTS: Shot[] = [
  { src: M("03"), label: "Notes" },
  { src: M("05"), label: "Editor · Note" },
  { src: M("04"), label: "Editor · Checklist" },
  { src: M("06"), label: "Select & Delete" },
  { src: M("12"), label: "Encryption vault" },
  { src: M("14"), label: "Atomic Energy" },
  { src: M("15"), label: "Convert Coins" },
  { src: M("13"), label: "Energy popup" },
  { src: M("18"), label: "Notifications" },
  { src: M("09"), label: "Biometric lock" },
  { src: M("08"), label: "Cloud Sync" },
  { src: M("07"), label: "Device and cloud" },
  { src: M("02"), label: "Settings" },
  { src: M("01"), label: "Profile" },
  { src: M("10"), label: "Danger Zone" },
];

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
        screenshot: [`${SITE_URL}${M("03")}`, `${SITE_URL}${M("12")}`, `${SITE_URL}${M("14")}`],
        featureList: [
          "Local-first notes and checklists that work offline",
          "Sync to a folder in your own Google Drive",
          "Optional end-to-end vault: Argon2id and AES-256-GCM",
          "No AI, no ads, no analytics",
          "Biometric lock, two-step codes and blocked screenshots",
        ],
        author: { "@id": `${SITE_URL}/#author` },
        sameAs: [REPO_URL],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: "Ashutosh Sharma",
        alternateName: "DevBehindYou",
        url: "https://devbehindyou.vercel.app",
        sameAs: ["https://github.com/DevBehindYou", "https://medium.com/@devbehindyou", "https://x.com/devbehindyou"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Atomic Notes",
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

/* ---------- small line icons, drawn to match the app's hairline style ---------- */
type IconName = "device" | "drive" | "lock" | "shield" | "bell" | "switch" | "bolt" | "eye";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    device: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M10.5 18.5h3" />
      </>
    ),
    drive: (
      <>
        <path d="M8.5 3.5h7l6 10.5-3.5 6H6l-3.5-6z" />
        <path d="M8.5 3.5 14.5 14M15.5 3.5 9.5 14M2.5 14h19" />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10.5" width="15" height="11" rx="2" />
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 14.5v3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2.5 20 5.5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    bell: (
      <>
        <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
        <path d="M10 20.5a2 2 0 0 0 4 0" />
      </>
    ),
    switch: (
      <>
        <rect x="2.5" y="7" width="19" height="10" rx="5" />
        <circle cx="16.5" cy="12" r="3" />
      </>
    ),
    bolt: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />,
    eye: (
      <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M4 20 20 4" />
      </>
    ),
  };
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const FEATURES: { icon: IconName; k: string; t: string; d: string; points: string[] }[] = [
  {
    icon: "device",
    k: "LOCAL-FIRST",
    t: "Notes that save as you type",
    d: "Text notes and checklists are one kind of object, saved to your phone on every keystroke. No spinner, no lost work, no waiting on the network.",
    points: ["Pin, filter and multi-select", "Recycle Bin for deleted notes", "Works the same offline"],
  },
  {
    icon: "drive",
    k: "YOUR DRIVE",
    t: "Sync to your own Google Drive",
    d: "Each note becomes one .atomic file in a My-Atomic-Notes folder in your Drive. The server keeps ids, flags and timestamps, never your titles or text.",
    points: ["drive.file scope: sees only its own files", "Syncs after you stop typing", "Conflict copies instead of overwrites"],
  },
  {
    icon: "lock",
    k: "END-TO-END",
    t: "A vault, if you want one",
    d: "Six words you write down become a key on your phone through Argon2id. AES-256-GCM seals every note before it leaves the device.",
    points: ["Drive and server see ciphertext", "Lock it on one device any time", "The key never leaves your phone"],
  },
  {
    icon: "shield",
    k: "DEVICE LOCKS",
    t: "Guards for the phone in your hand",
    d: "Fingerprint or face unlock at launch, a 6-digit code from any authenticator app, and blocked screenshots and screen recording.",
    points: ["Biometric lock", "Two-step verification (TOTP)", "Android secure storage for secrets"],
  },
  {
    icon: "bell",
    k: "NOTIFICATIONS",
    t: "Straight from the team",
    d: "The bell collects release news, maintenance notices and feature updates. Tap one to mark it read, or dismiss it. Pinned notices stay until they're resolved.",
    points: ["Read and dismiss per message", "Filtered to your app version", "Refreshes when you open the app"],
  },
  {
    icon: "switch",
    k: "YOUR SWITCHES",
    t: "Your data, your call",
    d: "Turn cloud sync off and notes stay on the phone. See what's on the device versus in the cloud. Wipe either side on its own.",
    points: ["Cloud sync on or off", "Device and cloud counts", "Separate local and cloud wipe"],
  },
];

export default async function Home() {
  const updates = await latestUpdates();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
      />
      <SiteNav />
      <main id="top">
        {/* HERO */}
        <section className="hero lp-hero dotgrid">
          <div className="wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="eyebrow">
                LOCAL-FIRST NOTES FOR ANDROID · v{RELEASE.version}
              </p>
              <h1>
                <span className="offset" data-text="ATOMIC NOTES">
                  ATOMIC NOTES
                </span>
              </h1>
              <p className="lp-tagline">
                Your Notes, Your Drive, <span className="sig">Always Yours.</span>
              </p>
              <p className="lp-lead">
                Notes live on your phone first. Sync goes to a folder in your own Google Drive. Turn on the vault
                and every note is sealed on the device before it leaves it.
              </p>
              <div className="hero-actions">
                <a href={APK_URL} className="btn-signal">
                  Download the APK
                </a>
                <a href="#how-it-works" className="btn-ghost">
                  See how it works
                </a>
              </div>
              <ul className="lp-chips" aria-label="Promises">
                <li className="on">No AI</li>
                <li>No ads</li>
                <li>No trackers</li>
                <li>AES-256-GCM</li>
                <li>Source available</li>
              </ul>
            </div>
            <div className="lp-stack" aria-hidden="true">
              <Phone src={M("12")} alt="" shadow="ink" className="lp-p1" eager />
              <Phone src={M("03")} alt="" className="lp-p2" eager />
              <Phone src={M("14")} alt="" shadow="ink" className="lp-p3" eager />
            </div>
          </div>
        </section>

        {/* WHAT IT IS: the answer-first block */}
        <section id="what" className="lp-what">
          <div className="wrap lp-what-grid">
            <Reveal>
              <p className="eyebrow">WHAT IS ATOMIC NOTES?</p>
              <h2>
                A notes app that <span className="sig">answers to you.</span>
              </h2>
              <p className="lp-answer">{DEFINITION}</p>
            </Reveal>
            <Reveal>
              <dl className="facts">
                {FACTS.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* STORY */}
        <section id="why" className="lp-story">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">WHY IT EXISTS</p>
              <h2>
                Built after a <span className="sig">bad afternoon.</span>
              </h2>
            </Reveal>
            <div className="lp-story-grid">
              <Reveal className="lp-story-text">
                <p>
                  The developer used a mainstream notes app the way most people do. Ideas, mostly. Also a few account
                  passwords and private notes he never should have typed there. Then one ordinary day the emails
                  started: <em>&ldquo;New sign-in from a location you don&apos;t usually use.&rdquo;</em> One
                  account, then another. What followed was a frantic afternoon of password resets, token revocations
                  and locked-out services.
                </p>
                <p>
                  The lesson wasn&apos;t &ldquo;switch notes apps.&rdquo; So Atomic Notes became the app he wished
                  he&apos;d had. Your notes live on your device first. The cloud is an option you control, and
                  it&apos;s your own Google Drive. The business model can never be &ldquo;mine the contents of your
                  notes.&rdquo;
                </p>
                <p>
                  <b>The revival.</b> Atomic Notes was first built about three years ago and shelved on purpose,
                  because the tooling couldn&apos;t yet do it justice. It can now. The rebuild brought a new design
                  system, a sync engine that writes to your Drive, a full performance pass and an end-to-end vault.
                </p>
              </Reveal>
              <Reveal>
                <blockquote className="lp-quote">
                  <p>
                    Stop using apps that take your data hostage and use it for their own private, profit-driven ends.
                  </p>
                  <cite>The lesson behind Atomic Notes</cite>
                </blockquote>
              </Reveal>
            </div>
          </div>
        </section>

        {/* THESIS */}
        <section id="privacy" className="lp-dark">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">THE PROBLEM</p>
              <h2>
                Your notes became <span className="sig-light">training data.</span>
              </h2>
              <p className="lp-lead lp-lead-dark">
                Across mainstream productivity apps, &ldquo;free&rdquo; now tends to mean your content is the product.
                The terms can change after you&apos;ve written your notes. In August 2023 Zoom faced a backlash over
                terms that appeared to allow AI training on customer data (
                <a href="https://techcrunch.com/2023/08/08/zoom-data-mining-for-ai-terms-gdpr-eprivacy/" target="_blank" rel="noreferrer">
                  TechCrunch
                </a>
                ). In June 2024 Adobe rewrote its terms after users revolted over wording about accessing their content
                (
                <a href="https://blog.adobe.com/en/publish/2024/06/10/updating-adobes-terms-of-use" target="_blank" rel="noreferrer">
                  Adobe
                </a>
                ).
              </p>
            </Reveal>
            <Reveal>
              <div className="cmp-table" role="table" aria-label="Most free notes apps compared with Atomic Notes">
                <div className="cmp-row cmp-head" role="row">
                  <span role="columnheader">Most &ldquo;free&rdquo; notes apps</span>
                  <span role="columnheader">Atomic Notes</span>
                </div>
                {COMPARISON.map((c) => (
                  <div className="cmp-row" role="row" key={c.them}>
                    <span role="cell" className="them">
                      <i aria-hidden="true">✕</i>
                      {c.them}
                    </span>
                    <span role="cell" className="us">
                      <i aria-hidden="true">→</i>
                      {c.us}
                    </span>
                  </div>
                ))}
              </div>
              <p className="lp-note">
                Every claim here can be checked in the{" "}
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  public source code
                </a>
                . The dependency list in <span className="mono">pubspec.yaml</span> is the whole list of libraries the
                app ships.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">FEATURES</p>
              <h2>
                Everything a notes app needs. <span className="sig">Nothing it doesn&apos;t.</span>
              </h2>
            </Reveal>

            <Reveal className="lp-showcase">
              <div className="lp-showcase-copy">
                <p className="num">01 · NOTES AND CHECKLISTS</p>
                <h3>Write first. The network can wait.</h3>
                <p>
                  Every change lands in on-device storage as you type. Closing the app or losing signal can&apos;t
                  lose your work, and the app opens just as fast in airplane mode. A checklist is a note, so both
                  share one editor, one list and one limit.
                </p>
              </div>
              <div className="lp-showcase-phones">
                <Phone src={M("03")} alt="Atomic Notes home screen with a grid of notes and checklists" />
                <Phone src={M("04")} alt="Atomic Notes checklist editor" shadow="ink" />
              </div>
            </Reveal>

            <div className="grid g3 lp-feature-grid">
              {FEATURES.map((f) => (
                <Reveal key={f.k} className="feature">
                  <div className="feature-top">
                    <Icon name={f.icon} />
                    <span className="num">{f.k}</span>
                  </div>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                  <ul>
                    {f.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>

            <Reveal className="lp-showcase lp-showcase-flip">
              <div className="lp-showcase-copy">
                <p className="num">02 · THE VAULT</p>
                <h3>Sealed on your phone. Ciphertext everywhere else.</h3>
                <p>
                  Turn the vault on and write down six words. Argon2id (64 MiB of memory, 3 passes) turns them into a
                  key on the device, and AES-256-GCM seals each note before it syncs. A new phone asks for the words
                  once. Lose them, and no one can decrypt your vault notes, including us. That&apos;s the point.
                </p>
              </div>
              <div className="lp-showcase-phones">
                <Phone src={M("12")} alt="Atomic Notes encryption screen showing the vault is on" />
                <Phone src={M("09")} alt="Atomic Notes security screen with the biometric lock switch" shadow="ink" />
              </div>
            </Reveal>

            <Reveal className="lp-atomi">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/atomi.gif" alt="Atomi, the blinking dot-grid mascot of Atomic Notes" width={400} height={480} loading="lazy" />
              <div>
                <p className="num">03 · MEET ATOMI</p>
                <h3>A mascot that tells you the sync status.</h3>
                <p>
                  Atomi lives on the home screen. It tells you whether everything is synced, when the next automatic
                  sync runs, and that your changes are safe on the phone when you&apos;re offline.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="lp-how">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">HOW IT WORKS</p>
              <h2>
                Phone first. <span className="sig">Drive second.</span> Server in between.
              </h2>
              <p className="lp-lead">
                The phone is the source of truth. The server checks your energy, keeps the sync in order and writes
                files to your Drive. It never stores note text.
              </p>
            </Reveal>
            <Reveal>
              <ol className="steps">
                <li>
                  <span className="num">01</span>
                  <h3>Write</h3>
                  <p>Your note saves to the phone as you type. It&apos;s marked as waiting to sync.</p>
                </li>
                <li>
                  <span className="num">02</span>
                  <h3>Seal</h3>
                  <p>With the vault on, the note is encrypted with AES-256-GCM before it leaves the phone.</p>
                </li>
                <li>
                  <span className="num">03</span>
                  <h3>Sync</h3>
                  <p>The server charges energy once, then writes up to 8 note files to your Drive at a time.</p>
                </li>
                <li>
                  <span className="num">04</span>
                  <h3>Arrive</h3>
                  <p>Your other devices pull what changed, 10 files per page, and merge it into their own copy.</p>
                </li>
              </ol>
            </Reveal>
            <div className="lp-how-grid">
              <Reveal>
                <h3 className="lp-h3">What each party can see</h3>
                <div className="table-wrap">
                  <table className="see-table">
                    <thead>
                      <tr>
                        <th scope="col"></th>
                        <th scope="col">Vault off</th>
                        <th scope="col">Vault on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VISIBILITY.map((v) => (
                        <tr key={v.who}>
                          <th scope="row">{v.who}</th>
                          <td>{v.off}</td>
                          <td className="on">{v.on}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
              <Reveal>
                <h3 className="lp-h3">Built to survive bad networks</h3>
                <ul className="lp-list">
                  <li>A sync cut off by a closed app finishes on the next launch, with no second charge.</li>
                  <li>A dropped connection is retried after 5, 15 and 45 seconds.</li>
                  <li>If the same note changed on two phones, you get a &ldquo;(conflict copy)&rdquo;, not a loss.</li>
                </ul>
                <dl className="facts facts-compact">
                  {PERFORMANCE.map((p) => (
                    <div key={p.k}>
                      <dt>{p.k}</dt>
                      <dd>{p.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="lp-small">Measured on a real phone against production, 27 September 2026.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ENERGY */}
        <section id="energy">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">ATOMIC ENERGY · TRY IT</p>
              <h2>
                Writing is free. <span className="sig">Energy powers sync.</span>
              </h2>
              <p className="lp-lead">
                Energy refills on its own every day. Atomic Coins top it up or buy more room for notes. No
                subscriptions, and nothing that touches your content.
              </p>
            </Reveal>
            <div className="lp-energy-grid">
              <Reveal>
                <EnergyDemo />
              </Reveal>
              <Reveal>
                <dl className="facts facts-rules">
                  {ENERGY_RULES.map((r) => (
                    <div key={r.k}>
                      <dt>{r.k}</dt>
                      <dd>{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="lp-small">
                  New accounts get 5 Atomic Coins. If a sync fails and no note gets through, its energy is refunded.
                  Coins can&apos;t be bought in the app yet, but early supporters get them:{" "}
                  <Link href="/support-atomic-notes">support on Patreon</Link>.
                </p>
              </Reveal>
            </div>
            <Reveal>
              <h3 className="lp-h3" style={{ marginTop: 44 }}>
                Note capacity tiers
              </h3>
              <div className="tiers">
                {TIERS.map((t, i) => (
                  <div className={"tier" + (i === 0 ? " tier-free" : "")} key={t.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.icon} alt="" width={72} height={72} loading="lazy" />
                    <p className="tier-name">{t.name}</p>
                    <p className="tier-meta">
                      <span>{t.notes} notes</span>
                      <span className="sig">{t.cost}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="lp-small">
                Checklists count the same as notes. A tier is a one-time spend, and the server enforces the limit.
              </p>
            </Reveal>
          </div>
        </section>

        {/* INTERFACE */}
        <section id="interface">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">THE INTERFACE</p>
              <h2>
                Ink on paper. One <span className="sig">signal.</span>
              </h2>
              <p className="lp-lead">
                The Technical Editorial design system: ink #15171B on paper #F4F5F1 with one accent, Signal #3A2FF0.
                Tap any screen to zoom. Some screens are from the August 2026 build.
              </p>
            </Reveal>
            <Gallery shots={SHOTS} />
          </div>
        </section>

        {/* ROADMAP + UPDATES */}
        <section id="roadmap">
          <div className="wrap lp-two">
            <Reveal>
              <p className="eyebrow">ROADMAP</p>
              <h2>
                Where it&apos;s <span className="sig">going.</span>
              </h2>
              <ul className="tl" style={{ marginTop: 22 }}>
                {ROADMAP.map((r) => (
                  <li key={r.phase}>
                    <span className="num">{r.phase}</span>
                    <span style={{ flex: 1 }}>{r.title}</span>
                    <span className={"tag " + (r.state === "done" ? "done" : r.state === "now" ? "now" : "")}>
                      {r.state === "done" ? "Shipped" : r.state === "now" ? "Now" : "Next"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="lp-small">Not on the roadmap: AI features and paid subscriptions. Both were rejected.</p>
            </Reveal>
            <Reveal>
              <div className="lp-updates-head">
                <div>
                  <p className="eyebrow">LATEST UPDATES</p>
                  <h2>
                    From <span className="sig">the build.</span>
                  </h2>
                </div>
                <Link href="/updates" className="btn-ghost">
                  All updates
                </Link>
              </div>
              <div className="grid" style={{ marginTop: 22 }}>
                {updates.length === 0 && <div className="module">No active updates right now. Check back soon.</div>}
                {updates.map((n) => (
                  <div className="module update" key={n.id}>
                    <p className="num">
                      {n.type.replace(/_/g, " ")} · {n.priority}
                    </p>
                    <h3>{n.subject}</h3>
                    <p>{n.description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">FAQ</p>
              <h2>
                Straight <span className="sig">answers.</span>
              </h2>
            </Reveal>
            <div className="faq">
              {FAQ.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>
                    <h3>{f.q}</h3>
                    <span aria-hidden="true" className="faq-mark">
                      +
                    </span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* GET IT */}
        <section id="get" className="lp-dark lp-get">
          <div className="wrap lp-get-grid">
            <Reveal>
              <p className="eyebrow">GET ATOMIC NOTES</p>
              <h2>
                Sideload it. <span className="sig-light">Keep control.</span>
              </h2>
              <p className="lp-lead lp-lead-dark">
                Download the signed APK from GitHub Releases. Most phones need the file ending in{" "}
                <span className="mono">arm64-v8a.apk</span>. Version {RELEASE.version} installs over earlier versions and
                keeps your notes. Needs {RELEASE.minAndroid} or newer.
              </p>
              <div className="hero-actions">
                <a href={APK_URL} className="btn-signal">
                  Download the APK
                </a>
                <a href={REPO_URL} className="btn-ghost btn-ghost-dark" target="_blank" rel="noreferrer">
                  View the project
                </a>
              </div>
            </Reveal>
            <Reveal>
              <div className="verify">
                <p className="num">VERIFY BEFORE YOU INSTALL</p>
                <p className="verify-k">Certificate SHA-256</p>
                <code>{RELEASE.certSha256}</code>
                <p className="verify-k">Certificate SHA-1</p>
                <code>{RELEASE.certSha1}</code>
                <p className="verify-k">Check with</p>
                <code>apksigner verify --print-certs atomic-notes-{RELEASE.version}-arm64-v8a.apk</code>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
