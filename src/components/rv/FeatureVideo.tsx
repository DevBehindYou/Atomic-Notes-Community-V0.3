"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping feature video. It loads and plays only while its card is on screen, pauses when
 * it scrolls away, and stays on its poster frame when the reader asks for reduced motion.
 */
export function FeatureVideo({
  src,
  poster,
  label,
  className = "rv-fvideo",
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !reduce.matches) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        sync();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    reduce.addEventListener("change", sync);
    return () => {
      io.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      width={720}
      height={720}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
