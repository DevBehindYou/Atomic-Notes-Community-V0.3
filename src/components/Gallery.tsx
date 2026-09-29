"use client";

import { useCallback, useEffect, useState } from "react";

export type Shot = { src: string; label: string };

export function Gallery({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const n = shots.length;

  const show = useCallback((i: number) => {
    setCur((i + n) % n);
    setOpen(true);
  }, [n]);
  const close = useCallback(() => setOpen(false), []);
  const step = useCallback((d: number) => setCur((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <div className="gallery">
        {shots.map((s, i) => (
          <figure className="shot" key={s.src} onClick={() => show(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.label} loading="lazy" />
            <figcaption className="cap">
              <span>{s.label}</span>
              <span className="sig">{String(i + 1).padStart(2, "0")}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className={"lb " + (open ? "open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button className="x" onClick={close} aria-label="Close">
          ✕
        </button>
        <button className="navbtn prev" onClick={() => step(-1)} aria-label="Previous">
          ‹
        </button>
        <button className="navbtn next" onClick={() => step(1)} aria-label="Next">
          ›
        </button>
        {open && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shots[cur].src} alt={shots[cur].label} />
        )}
        <div className="cap">
          {shots[cur]?.label} · {cur + 1} / {n}
        </div>
      </div>
    </>
  );
}
