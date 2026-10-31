import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "../revamp.css";
import { Dock, RvFooter } from "@/components/rv/Chrome";
import { SupportReactor } from "@/components/SupportReactor";
import { CoinMath } from "@/components/rv/CoinMath";
import { PATREON_JOIN_URL, TIERS } from "@/lib/content";
import { MEMBERSHIPS, formatUsd } from "@/lib/supportPricing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support Atomic Notes: power the build, get Atomic Coins",
  description:
    "Help keep Atomic Notes independent. Support it monthly on Patreon, and get Atomic Coins as a thank-you. Your notes stay yours either way.",
  path: "/support-atomic-notes",
  socialTitle: "Support Atomic Notes: power the build",
});

export const viewport: Viewport = {
  themeColor: "#15171B",
};

const GOES_TO: { t: string; d: string }[] = [
  { t: "Sync infrastructure", d: "The server and database that keep your devices in step." },
  { t: "Testing and bug fixes", d: "Real phones, real networks, and the bugs they find." },
  { t: "Security and reliability", d: "The vault, sync safety, and the boring work that keeps them sound." },
  { t: "Future releases", d: "New features, more platforms, and wider distribution." },
];

const STEPS: { t: string; d: ReactNode }[] = [
  {
    t: "Find your email",
    d: (
      <>
        It&apos;s the Google email you sign in to Atomic Notes with. In the app, open <b>Atomic Energy</b> and tap{" "}
        <b>Get Atomic Coins</b> to see it.
      </>
    ),
  },
  {
    t: "Send your email",
    d: (
      <>
        On Patreon, send the developer a message. Never send a password, recovery phrase, or sign-in code.
      </>
    ),
  },
  {
    t: "Get your coins",
    d: (
      <>
        The developer checks the payment and adds the coins to that account by hand, so it can take a little time. They show up
        in Atomic Energy after the next refresh.
      </>
    ),
  },
];

const COINS: [string, string][] = [
  ["Convert", "1 Atomic Coin adds 40 energy, enough for 8 automatic syncs"],
  ["Antimatter", "10 coins, room for 40 notes"],
  ["Monopole", "20 more coins, room for 50 notes"],
  ["Strangelet", "30 more coins, room for 100 notes"],
];

const FAQ: { q: string; a: string }[] = [
  { q: "Do I need to support to use Atomic Notes?", a: "No. Writing, editing, and keeping notes on your phone never depends on a payment or a membership." },
  { q: "What do Atomic Coins do?", a: "They're in-app credits. You can turn them into Atomic Energy for cloud sync, or use them to make room for more notes." },
  {
    q: "Are coins added instantly?",
    a: "Not yet. The developer adds them by hand after checking the payment and the account email, so they can take a little time. These steps will be updated if delivery becomes automatic.",
  },
  {
    q: "What if I sent the wrong account email?",
    a: "Message the developer on Patreon, with your payment reference. Never share your password, recovery phrase, or a one-time code.",
  },
  { q: "Can I cancel a Patreon membership?", a: "Yes, at any time on Patreon. Monthly coins are tied to each month that's actually paid." },
];

export default function SupportPage() {
  return (
    <div className="rv">
      <Dock current="support" />
      <main>
        {/* HERO */}
        <section className="rv-blog-hero" aria-labelledby="support-title">
          <div className="rv-stars" aria-hidden="true" />
          <div className="rv-wrap rv-blog-head">
            <div style={{ minWidth: 0 }}>
              <p className="rv-num">Independent development</p>
              <h1 id="support-title" className="rv-poster" style={{ fontSize: "clamp(56px, 7vw, 104px)", lineHeight: 0.9 }}>
                Help keep Atomic Notes <span className="rv-accent">independent.</span>
              </h1>
              <p className="rv-lede" style={{ marginTop: 18 }}>
                Atomic Notes is a source-available, local-first notes app built by one developer, with no ads, no trackers,
                and no AI. Your support funds sync infrastructure, security work, real-device testing, and future releases. As
                a thank-you, supporters get Atomic Coins.
              </p>
              <p className="rv-status-line" data-tone="ok">
                <span className="rv-status-dot" aria-hidden="true" />
                Your notes stay yours, whether or not you support.
              </p>
              <div className="rv-btns" style={{ marginTop: 26 }}>
                <a href="#reactor" className="rv-pill rv-pill-solid">
                  Open the reactor
                </a>
                <a href="#monthly" className="rv-pill">
                  Compare memberships
                </a>
                <a href="#how" className="rv-pill">
                  How coins arrive
                </a>
              </div>
            </div>
            <div className="rv-paper-card rv-blog-mascot" style={{ width: 170 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/revamp/mascots/atom-to-coin.webp" alt="An atom turning into one Atomic Coin" width={240} height={240} />
            </div>
          </div>
        </section>

        {/* REACTOR */}
        <section id="reactor" className="rv-sec rv-support-sec" aria-labelledby="reactor-title">
          <div className="rv-wrap">
            <h2 id="reactor-title" className="rv-h2">
              Power the build.
            </h2>
            <p className="rv-lede" style={{ marginTop: 12, marginBottom: 30 }}>
              Pick an amount and see your Atomic Coins. $2, $4, and $10 are the monthly memberships on Patreon.
            </p>
            <div className="rx-grid">
              <SupportReactor />
              <aside className="rx-side" aria-label="Where support goes">
                <p className="rx-side-label">WHERE SUPPORT GOES</p>
                <ol className="rx-goes">
                  {GOES_TO.map((g, i) => (
                    <li key={g.t}>
                      <span className="rx-goes-num">{String(i + 1).padStart(2, "0")}</span>
                      <h3>{g.t}</h3>
                      <p>{g.d}</p>
                    </li>
                  ))}
                </ol>
                <div className="rx-side-row">
                  <div>
                    <p className="rx-side-label">MONTHLY ON PATREON</p>
                    <ul className="rx-tiers">
                      {MEMBERSHIPS.map((m) => (
                        <li key={m.id} className={`rx-tier rx-tier-${m.id}`}>
                          <span className="rx-tier-name">{m.name.replace("Atomic ", "")}</span>
                          <span className="rx-tier-price">{formatUsd(m.cents).replace(".00", "")}</span>
                          <span className="rx-tier-coins">{m.coins} / MONTH</span>
                        </li>
                      ))}
                    </ul>
                    <a href="#monthly" className="rx-side-link">
                      Compare memberships
                    </a>
                  </div>
                  <div className="rx-promise">
                    <p className="rx-side-label">YOUR NOTES STAY YOURS</p>
                    <p>
                      No subscription is required to write, keep, or open your notes. Coins only add sync energy and room for
                      more notes.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* MEMBERSHIPS */}
        <section id="monthly" className="rv-sec rv-support-sec" aria-labelledby="monthly-title">
          <div className="rv-wrap">
            <h2 id="monthly-title" className="rv-h2">
              Choose your orbit.
            </h2>
            <p className="rv-lede" style={{ marginTop: 12 }}>
              Three memberships, each with Atomic Coins for every month that&apos;s paid. Cancel on Patreon at any time.
            </p>
            <div className="rv-tier-grid">
              {MEMBERSHIPS.map((m) => (
                <article key={m.id} className="rv-tier" data-tier={m.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.cover} alt="" width={920} height={400} loading="lazy" className="rv-tier-cover" />
                  <div className="rv-tier-body">
                    <p className="rv-tier-level">
                      Tier {m.level}: {m.tagline}
                      {m.badge ? <span className="rv-tier-badge">{m.badge}</span> : null}
                    </p>
                    <h3>{m.name}</h3>
                    <p className="rv-tier-price">
                      {formatUsd(m.cents).replace(".00", "")}
                      <span> a month</span>
                    </p>
                    <p className="rv-tier-coins">{m.coins} Atomic Coins each paid month</p>
                    <p className="rv-tier-impact">{m.impact}</p>
                    <ul className="rv-tier-list">
                      {m.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <a href={PATREON_JOIN_URL} className="rv-pill rv-pill-signal" target="_blank" rel="noreferrer" style={{ marginTop: "auto", alignSelf: "flex-start" }}>
                      {m.cta}
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="rv-article" style={{ maxWidth: "none", marginTop: 32 }}>
              <div className="table-wrap">
                <table>
                  <caption className="rv-sr">Patreon memberships compared</caption>
                  <thead>
                    <tr>
                      <th scope="col">Membership</th>
                      <th scope="col">Price</th>
                      <th scope="col">Coins each paid month</th>
                      <th scope="col">Also included</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERSHIPS.map((m) => (
                      <tr key={m.id}>
                        <th scope="row" style={{ background: "transparent", color: "#F4F5F1", fontFamily: "inherit", fontSize: 15, fontWeight: 600 }}>
                          {m.name}
                        </th>
                        <td>{formatUsd(m.cents)} a month</td>
                        <td>{m.coins}</td>
                        <td>{m.benefits.slice(1).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* HOW COINS ARRIVE */}
        <section id="how" className="rv-sec rv-support-sec" aria-labelledby="how-title">
          <div className="rv-wrap">
            <h2 id="how-title" className="rv-h2">
              How the coins reach you.
            </h2>
            <ol className="rv-steps-row">
              {STEPS.map((s, i) => (
                <li key={s.t} className="rv-panel">
                  <span className="rv-step-n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
            <div className="rv-two" style={{ marginTop: 24, alignItems: "stretch" }}>
              <div className="rv-paper" style={{ padding: 26, boxShadow: "8px 8px 0 #3A2FF0" }}>
                <p className="rv-mono" style={{ color: "#3A2FF0", marginBottom: 8 }}>
                  Important
                </p>
                <h3 style={{ fontSize: 22, marginBottom: 10 }}>Use the exact account email</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#2b2e34" }}>
                  Coins go to the email you write, not to your Patreon name. A wrong or misspelled email means the coins
                  can&apos;t reach you. If you signed in with more than one Google account, use the one that holds your notes.
                </p>
              </div>
              <div className="rv-panel" style={{ padding: 26 }}>
                <p className="rv-num" style={{ marginBottom: 12 }}>
                  Good to know
                </p>
                <ul className="rv-tier-list">
                  <li>Patreon handles the payment. Atomic Notes never sees your card, PayPal, or bank details.</li>
                  <li>Patreon charges its own fees, under its own terms.</li>
                  <li>Coins are added by hand after the payment is checked, so they can take a little time.</li>
                  <li>Writing notes stays free. Coins only buy sync energy and room for more notes.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT COINS DO */}
        <section className="rv-sec rv-support-sec" aria-labelledby="coins-title">
          <div className="rv-wrap">
            <h2 id="coins-title" className="rv-h2">
              One coin, 40 energy.
            </h2>
            <CoinMath
              convert={COINS[0]}
              free={TIERS[0].notes}
              tiers={COINS.slice(1).map(([name, line], i) => ({ name, line, notes: TIERS[i + 1].notes, icon: TIERS[i + 1].icon }))}
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="rv-sec rv-support-sec" aria-labelledby="sfaq-title">
          <div className="rv-wrap" style={{ maxWidth: 860 }}>
            <h2 id="sfaq-title" className="rv-h2">
              Straight answers.
            </h2>
            <div className="rv-article" style={{ maxWidth: "none" }}>
              <div className="faq-list" style={{ marginTop: 24 }}>
                {FAQ.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p style={{ color: "rgba(244,245,241,.78)", lineHeight: 1.65 }}>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="rv-btns" style={{ marginTop: 28 }}>
              <a href="#reactor" className="rv-pill rv-pill-signal">
                Open the reactor
              </a>
              <a href={PATREON_JOIN_URL} className="rv-pill" target="_blank" rel="noreferrer">
                Join on Patreon
              </a>
            </div>
            <p className="rv-poster rv-accent" style={{ fontSize: 40, marginTop: 40 }}>
              Every electron helps.
            </p>
          </div>
        </section>
      </main>
      <RvFooter />
    </div>
  );
}
