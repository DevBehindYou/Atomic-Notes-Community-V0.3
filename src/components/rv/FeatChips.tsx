"use client";

import type { MouseEvent } from "react";

// Chips above the pinned "What it does" track. While the section is pinned, its panels slide sideways inside
// a sticky stage, so a plain #anchor would not land on the right panel. Panel i sits at progress
// 4% + 92% * i/(n-1) of the pinned range; scroll there instead. Unpinned (phones, reduced motion, older
// browsers) the panels are stacked and the anchor works as written.
export function FeatChips({ items, sectionId }: { items: { key: string; label: string }[]; sectionId: string }) {
  const go = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    const section = document.getElementById(sectionId);
    const stick = section?.querySelector<HTMLElement>(".rv-hs-stick");
    if (!section || !stick || getComputedStyle(stick).position !== "sticky") return;
    e.preventDefault();
    const n = items.length;
    const progress = 0.04 + (0.92 * i) / Math.max(1, n - 1);
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + progress * span, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <nav className="rv-chips" aria-label="Features">
      {items.map((c, i) => (
        <a key={c.key} href={`#f-${c.key}`} className="rv-feat-chip" data-i={i} onClick={(e) => go(e, i)}>
          {c.label}
        </a>
      ))}
    </nav>
  );
}
