"use client";

import { useEffect, useState } from "react";

// A thin Signal bar that shows how far through the article the reader is.
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setPct(total <= 0 ? 100 : Math.min(100, Math.max(0, (-r.top / total) * 100)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return <div className="read-progress" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>;
}
