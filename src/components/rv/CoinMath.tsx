"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Tier = { name: string; line: string; notes: number; icon: string };

const SYNCS = 8; // 40 energy at 5 per automatic sync
const ENERGY = 40;

/**
 * "One coin, 40 energy." as two small machines. The Convert card drops a coin into an 8-cell energy meter
 * (one cell per automatic sync) while the count runs to 40. Each tier card fills a 100-dot grid up to its note
 * room, the free 30 first. Both play once when the section scrolls into view; resting on the Convert card
 * plays it again. Reduced motion shows the finished state.
 */
export function CoinMath({ convert, tiers, free }: { convert: [string, string]; tiers: Tier[]; free: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [run, setRun] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      setCount(ENERGY);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const top = Math.max(...tiers.map((t) => t.notes));

  return (
    <div ref={root} className="rv-coinmath" data-on={on}>
      <div
        className="rv-panel rv-cm-convert"
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || !on || count !== ENERGY) return;
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          setCount(0);
          setRun((r) => r + 1);
        }}
      >
        <dl className="rv-cm-copy">
          <dt>{convert[0]}</dt>
          <dd>{convert[1]}</dd>
        </dl>
        <div className="rv-cm-machine" key={run} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rv-cm-coin" src="/icons/atomic-coin.svg" alt="" width={88} height={88} />
          <span className="rv-cm-wire">
            <i />
          </span>
          {/* the count climbs 5 as each cell lights, so the number and the meter can never drift apart */}
          <span
            className="rv-cm-meter"
            onAnimationStart={(e) => {
              if (e.animationName === "rv-cm-cell") setCount((c) => Math.min(ENERGY, c + ENERGY / SYNCS));
            }}
          >
            {Array.from({ length: SYNCS }, (_, i) => (
              <span key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
          <span className="rv-cm-count">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
            </svg>
            {count}
          </span>
        </div>
      </div>

      {tiers.map((t, n) => (
        <div key={t.name} className="rv-panel rv-cm-tier" style={{ "--n": n } as CSSProperties}>
          <div className="rv-cm-tier-top" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.icon} alt="" width={56} height={56} />
            <span className="rv-cm-big">{t.notes}</span>
          </div>
          {/* one dot per note of room: the free ones, then what the tier adds */}
          <span className="rv-cm-dots" aria-hidden="true">
            {Array.from({ length: top }, (_, i) => (
              <i
                key={i}
                data-k={i < free ? "free" : i < t.notes ? "add" : undefined}
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          </span>
          <dl className="rv-cm-copy">
            <dt>{t.name}</dt>
            <dd>{t.line}</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}
