"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createHeroAtom } from "./heroAtomEngine";

/**
 * One word, split into letters that fly in from the core and can be knocked by electrons. The fly-in is
 * pure CSS (see .rv-wl in revamp.css) so it starts on first paint instead of waiting for hydration:
 * --k is how many letters sit between this one and the atom, which sets both the distance and the delay.
 * [nearEnd] is the end of the word closest to the atom.
 */
function Word({ text, className, nearEnd, lead = 0 }: { text: string; className: string; nearEnd: "start" | "end"; lead?: number }) {
  const letters = [...text];
  return (
    <span className={`rv-welcome-word ${className}`} aria-hidden="true">
      {letters.map((ch, i) => (
        <span
          key={i}
          className="rv-wl"
          style={{ "--k": nearEnd === "end" ? letters.length - 1 - i : i, "--lead": lead } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/** The opening stage of Home: a big glass atom whose electrons can be grabbed and thrown, between the welcome words. */
export function HeroAtom() {
  const host = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const h = host.current, a = anchor.current, c = canvas.current;
    if (!h || !a || !c) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // letter centres in host pixels, for the electron knocks
    let centres: { el: HTMLElement; x: number; y: number; r: number }[] = [];
    const cooldown = new WeakMap<HTMLElement, number>();
    const quietUntil = performance.now() + 1500; // let the CSS fly-in finish before letters can be knocked
    const measure = () => {
      const hr = h.getBoundingClientRect();
      centres = [...h.querySelectorAll<HTMLElement>(".rv-wl")].map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left - hr.left + r.width / 2, y: r.top - hr.top + r.height / 2, r: Math.max(r.width, r.height) * 0.55 };
      });
    };
    const knock = (pts: { x: number; y: number; vx: number; vy: number }[]) => {
      if (mq.matches || performance.now() < quietUntil) return;
      const now = performance.now();
      for (const p of pts) {
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 120) continue;
        for (const c of centres) {
          if (Math.hypot(c.x - p.x, c.y - p.y) > c.r + 14) continue;
          if ((cooldown.get(c.el) ?? 0) > now) continue;
          cooldown.set(c.el, now + 700);
          const push = Math.min(1, speed / 1600);
          c.el.style.setProperty("--kx", `${(p.vx / speed) * 34 * push}px`);
          c.el.style.setProperty("--ky", `${(p.vy / speed) * 34 * push}px`);
          c.el.style.setProperty("--kr", `${(p.vx >= 0 ? 1 : -1) * 18 * push}deg`);
          c.el.classList.remove("is-knocked");
          void c.el.offsetWidth; // restart the animation
          c.el.classList.add("is-knocked");
        }
      }
    };

    const atom = createHeroAtom(c, h, a, {
      reduced: mq.matches,
      onCursor: (state) => window.dispatchEvent(new CustomEvent("rv-cursor", { detail: state })),
      onFly: knock,
    });
    const ro = new ResizeObserver(measure);
    ro.observe(h);
    document.fonts?.ready.then(measure).catch(() => {});
    const settle = window.setTimeout(measure, 1600); // after the entrance
    measure();
    const onChange = () => atom.setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      window.clearTimeout(settle);
      ro.disconnect();
      atom.destroy();
    };
  }, []);

  return (
    <div ref={host} className="rv-atom-stage">
      <div className="rv-stars" aria-hidden="true" />
      <p className="rv-sr">Welcome to Notes</p>
      <div className="rv-welcome">
        <div className="rv-welcome-side rv-welcome-left">
          <Word text="Welcome" className="rv-welcome-big rv-from-right" nearEnd="end" />
          <Word text="to" className="rv-welcome-to rv-from-right" nearEnd="end" lead={3} />
        </div>
        <div className="rv-welcome-side rv-welcome-right">
          <Word text="Notes" className="rv-welcome-big rv-from-left" nearEnd="start" />
        </div>
      </div>
      <canvas ref={canvas} className="rv-atom-canvas" aria-hidden="true" />
      <div ref={anchor} className="rv-atom-anchor" aria-hidden="true" />
    </div>
  );
}
