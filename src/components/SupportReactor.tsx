"use client";

import { useEffect, useState } from "react";
import { PATREON_JOIN_URL } from "@/lib/content";
import {
  DEFAULT_CENTS,
  MAX_CENTS,
  PRESET_CENTS,
  STEP_CENTS,
  formatUsd,
  quote,
  supportMessage,
} from "@/lib/supportPricing";
import { ReactorAtom } from "@/components/reactor/ReactorAtom";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function SupportReactor() {
  const [cents, setCents] = useState(DEFAULT_CENTS);
  const [pulse, setPulse] = useState(0);
  const [copied, setCopied] = useState(false);
  const reduced = usePrefersReducedMotion();

  const q = quote(cents);
  const steps = cents / STEP_CENTS;
  const full = cents === MAX_CENTS;
  const usd = formatUsd(cents);

  function choose(next: number) {
    if (next === cents) return;
    setCents(next);
    setPulse((p) => p + 1);
    setCopied(false);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(supportMessage(q));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`reactor is-monthly${full ? " is-full" : ""}`}>
      <div className="reactor-head">
        <p className="reactor-label">ATOMIC COIN REACTOR</p>
        <p className="reactor-tag">{full ? "FULL POWER" : q.membership?.name.toUpperCase()}</p>
      </div>

      <div className="reactor-body">
        <div className="reactor-visual">
          <div className="reactor-dial" role="img" aria-label={`Reactor at ${q.membership?.name ?? usd}`}>
            <ReactorAtom level={steps} pulse={pulse} reduced={reduced} />

            <svg viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="190" className="rx-ring" />
            </svg>
          </div>
        </div>

        <div className="reactor-controls">
          <p className="sr-only" aria-live="polite">
            {`${usd} a month on Patreon, ${q.membership?.name}: ${q.coins} Atomic Coins each paid month`}
          </p>

          <div className="reactor-presets" role="radiogroup" aria-label="Monthly memberships">
            {PRESET_CENTS.map((p) => {
              const tier = quote(p);
              return (
                <button key={p} type="button" role="radio" aria-checked={cents === p} onClick={() => choose(p)}>
                  <span className="rp-price">${p / 100}</span>
                  <span className="rp-name">{tier.membership ? tier.membership.name.replace("Atomic ", "") : ""}</span>
                  <span className="rp-coins">{tier.coins} COINS</span>
                </button>
              );
            })}
          </div>

          <dl className="reactor-data">
            <div>
              <dt>MONTHLY ON PATREON</dt>
              <dd>
                {usd}
                <span className="reactor-per"> / MO</span>
              </dd>
              <p className="reactor-route">{q.membership?.name.toUpperCase()}</p>
            </div>
            <div>
              <dt>EACH PAID MONTH</dt>
              <dd>{`${q.coins} COINS`}</dd>
              {q.bonusCoins > 0 ? (
                <p key={`bonus-${cents}`} className="reactor-bonus">
                  +{q.bonusCoins} BONUS COINS
                </p>
              ) : null}
            </div>
          </dl>

          <div className="reactor-cta">
            <a href={PATREON_JOIN_URL} className="reactor-go" target="_blank" rel="noreferrer">
              Join {q.membership?.name} on Patreon
            </a>
            <button type="button" className="reactor-copy" onClick={copyMessage}>
              {copied ? "Copied. Send it to the developer on Patreon" : "Copy the Patreon message"}
            </button>
            <p className="reactor-fine">
              A monthly membership: {usd} a month and {q.coins} Atomic Coins each paid month. Cancel any time on Patreon.
              After joining, send the message with your Atomic Notes account email. Coins are added by hand after the
              developer checks the payment.
            </p>
            <p className="reactor-where">PAYMENT ON PATREON · THIS PAGE ONLY PREVIEWS THE REWARD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
