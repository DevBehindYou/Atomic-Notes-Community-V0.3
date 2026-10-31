"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FeatureVideo } from "./FeatureVideo";

export type ReelItem = { src: string; poster: string; alt: string; title: string; desc: string };

type Box = { left: number; top: number; w: number; h: number; vid: number };
type Open = { i: number; to: Box; time: number };

const OPEN_DELAY = 220; // ms the pointer must rest on a card before it opens, so sweeping across cards stays calm
const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const EASE_IN = "cubic-bezier(0.4, 0, 0.7, 0.2)";
const PAD = 20;
const TEXT_W = 320;

/** Where the larger card sits: centred on its card, kept inside the viewport, as large as a short window allows. */
function placeOver(r: DOMRect): Box {
  const vid = Math.round(Math.min(540, innerHeight - PAD * 2 - 32, innerWidth - TEXT_W - PAD * 3 - 80));
  const w = vid + TEXT_W + PAD * 3 + 16;
  const h = vid + PAD * 2;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  return {
    left: Math.round(clamp(r.left + r.width / 2 - w / 2, 16, innerWidth - w - 16)),
    top: Math.round(clamp(r.top + r.height / 2 - h / 2, 16, innerHeight - h - 16)),
    w,
    h,
    vid,
  };
}

/** The transform that lays the larger card over its small card: same centre, same width. */
function onCard(card: DOMRect, to: Box) {
  const dx = card.left + card.width / 2 - (to.left + to.w / 2);
  const dy = card.top + card.height / 2 - (to.top + to.h / 2);
  return `translate(${dx}px, ${dy}px) scale(${card.width / to.w})`;
}

/**
 * The "app in motion" cards. With a mouse, resting on a card opens a larger copy of it over the page: it grows
 * out of the card and keeps playing the same video from the same moment. Moving off it, scrolling or Escape
 * shrinks it back onto its card while it fades out. Touch screens and small windows keep the plain cards.
 */
export function ReelCards({ items }: { items: readonly ReelItem[] }) {
  const cards = useRef<(HTMLElement | null)[]>([]);
  const pop = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const popVideo = useRef<HTMLVideoElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closing = useRef(false);
  const pointer = useRef({ x: -1, y: -1 });
  const media = useRef<{ hover: MediaQueryList; reduce: MediaQueryList } | null>(null);

  useEffect(() => {
    // The larger card lives in the page root: the sliding track is transformed, which would trap a fixed layer.
    setHost(cards.current[0]?.closest<HTMLElement>(".rv") ?? null);
    media.current = {
      hover: matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px) and (min-height: 420px)"),
      reduce: matchMedia("(prefers-reduced-motion: reduce)"),
    };
    // Scrolling slides the cards under a still pointer: that must never count as resting on one.
    const onScroll = () => {
      if (timer.current) clearTimeout(timer.current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const cardVideo = (i: number) => cards.current[i]?.querySelector("video") ?? null;

  const openCard = useCallback(function openCard(i: number) {
    const card = cards.current[i];
    if (!card) return;
    // still shrinking the last one: try again once it has gone
    if (closing.current) {
      timer.current = setTimeout(() => openCard(i), 120);
      return;
    }
    setOpen({ i, to: placeOver(card.getBoundingClientRect()), time: cardVideo(i)?.currentTime ?? 0 });
  }, []);

  const close = useCallback(() => {
    const el = pop.current;
    if (!el || !open || closing.current) return;
    closing.current = true;
    el.style.pointerEvents = "none";
    const v = popVideo.current;
    const small = cardVideo(open.i);
    if (v && small) small.currentTime = v.currentTime; // the small card picks up where the large one stopped
    const card = cards.current[open.i]?.getBoundingClientRect();
    const reduce = media.current?.reduce.matches;
    const opts = { duration: reduce ? 160 : 320, easing: EASE_IN, fill: "forwards" as const };
    dim.current?.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    const anim = el.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: reduce || !card ? "none" : onCard(card, open.to), opacity: 0 },
      ],
      opts,
    );
    anim.onfinish = () => {
      closing.current = false;
      setOpen(null);
    };
  }, [open]);

  // Grow out of the card once the larger card is in the page.
  useLayoutEffect(() => {
    const el = pop.current;
    if (!open || !el) return;
    const v = popVideo.current;
    if (v) {
      v.currentTime = open.time;
      v.play().catch(() => {});
    }
    const card = cards.current[open.i]?.getBoundingClientRect();
    const reduce = media.current?.reduce.matches;
    const opts = { duration: reduce ? 160 : 420, easing: EASE_OUT };
    dim.current?.animate([{ opacity: 0 }, { opacity: 1 }], opts);
    const anim = el.animate(
      [
        { transform: reduce || !card ? "none" : onCard(card, open.to), opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      opts,
    );
    anim.onfinish = () => {
      // If the larger card opened somewhere the pointer isn't, close it again rather than leave it hanging.
      const r = el.getBoundingClientRect();
      const { x, y } = pointer.current;
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) close();
    };
    // `close` changes identity with `open`; this effect should only run when a card opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.i, open?.to]);

  // While open: Escape, scrolling and resizing close it, and the pointer is tracked for the check above.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onMove = (e: PointerEvent) => (pointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("wheel", close, { passive: true });
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", close);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  const item = open ? items[open.i] : null;

  return (
    <>
      {items.map((it, i) => (
        <article
          className="rv-rcard"
          key={it.title}
          ref={(el) => {
            cards.current[i] = el;
          }}
          onPointerMove={(e) => {
            // Opens once a real mouse stops moving on the card. Moves with no distance are the browser's own
            // after a scroll or after the larger card closes, so they don't count.
            pointer.current = { x: e.clientX, y: e.clientY };
            if (e.pointerType !== "mouse" || !media.current?.hover.matches || open) return;
            if (!e.movementX && !e.movementY) return;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => openCard(i), OPEN_DELAY);
          }}
          onPointerLeave={() => {
            if (timer.current) clearTimeout(timer.current);
          }}
        >
          <FeatureVideo className="rv-rclip" src={it.src} poster={it.poster} label={it.alt} />
          <div className="rv-rtext">
            <h3>{it.title}</h3>
            <p>{it.desc}</p>
          </div>
        </article>
      ))}
      {host &&
        open &&
        item &&
        createPortal(
          <>
            <div ref={dim} className="rv-reel-dim" aria-hidden="true" />
            {/* a larger copy of a card that is already on the page, so screen readers skip it */}
            <div
              ref={pop}
              className="rv-reel-pop"
              aria-hidden="true"
              style={{ left: open.to.left, top: open.to.top, width: open.to.w, height: open.to.h }}
              onPointerLeave={close}
            >
              <video
                ref={popVideo}
                src={item.src}
                poster={item.poster}
                width={720}
                height={720}
                style={{ width: open.to.vid, height: open.to.vid }}
                muted
                loop
                playsInline
              />
              <div className="rv-reel-pop-text">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          </>,
          host,
        )}
    </>
  );
}
