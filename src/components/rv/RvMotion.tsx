"use client";

import { useEffect, useRef } from "react";

// Two page-wide touches for the dark pages, mounted once from the Dock:
// 1. Smooth wheel scrolling: mouse-wheel steps are eased into a glide. Keyboard, scrollbar, touch and nested
//    scroll areas stay native, and the whole thing is off when the reader asks for reduced motion.
// 2. A custom cursor for mouse and trackpad users: a dot that sits on the pointer and a ring that trails it.
//    The ring grows over links, wraps small buttons like a frame, shows arrows over things you can drag,
//    gets out of the way over text fields, and hides when the pointer leaves the window.

const LINKISH = 'a[href], button, summary, label, select, [role="button"], [role="radio"], [role="tab"], input[type="range"], input[type="checkbox"], input[type="radio"]';
const TEXTISH = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
const DRAGGY = '.rx-atom3d, [data-cursor="drag"]';

/** The nearest element that would scroll natively in this direction, if any. */
function nativeScroller(from: EventTarget | null, dy: number): boolean {
  let el = from instanceof Element ? from : null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.closest("[data-native-scroll]")) return true;
    const st = getComputedStyle(el);
    if ((st.overflowY === "auto" || st.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1) {
      const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      const canUp = el.scrollTop > 0;
      if ((dy > 0 && canDown) || (dy < 0 && canUp)) return true;
      if (st.overscrollBehaviorY === "contain" || st.overscrollBehaviorY === "none") return true;
    }
    el = el.parentElement;
  }
  return false;
}

function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = window.scrollY;
    let current = window.scrollY;
    let written = window.scrollY;
    let running = false;
    let raf = 0;
    let last = 0;

    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const tick = (now: number) => {
      // someone else moved the page (scrollbar drag, find-in-page): hand over
      if (Math.abs(window.scrollY - written) > 2) {
        target = current = written = window.scrollY;
        stop();
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - current) < 0.4) current = target;
      window.scrollTo({ top: current, behavior: "instant" });
      written = window.scrollY;
      if (current === target) stop();
      else raf = requestAnimationFrame(tick);
    };
    const glideTo = (y: number) => {
      target = Math.max(0, Math.min(maxY(), y));
      if (!running) {
        current = written = window.scrollY;
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (reduce.matches || e.ctrlKey || e.defaultPrevented) return;
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      if (Math.abs(e.deltaX) > Math.abs(dy) || dy === 0) return;
      if (nativeScroller(e.target, dy)) return;
      e.preventDefault();
      glideTo((running ? target : window.scrollY) + dy);
    };
    const onScroll = () => {
      if (!running) target = current = written = window.scrollY;
    };
    // in-page links glide too, and still land on the hash
    const onClick = (e: MouseEvent) => {
      if (reduce.matches || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href*="#"]') : null;
      if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
      const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      const margin =
        (parseFloat(getComputedStyle(el).scrollMarginTop) || 0) +
        (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
      glideTo(el.getBoundingClientRect().top + window.scrollY - margin);
      history.pushState(null, "", a.hash);
    };
    const onKey = () => running && stop();

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

function useCursor(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el) return;
    const dot = el.querySelector<HTMLElement>(".rv-cursor-dot")!;
    const ring = el.querySelector<HTMLElement>(".rv-cursor-ring")!;

    const p = { x: -100, y: -100 };
    const r = { x: -100, y: -100, w: 34, h: 34 };
    let frame: Element | null = null; // a small button the ring wraps
    let target: Element | null = null; // what is under the pointer right now
    let dirty = false; // the state needs working out again for the current target
    let raf = 0;
    let last = 0;
    let shown = false;

    const html = document.documentElement;
    const enable = () => html.classList.toggle("rv-cursor-on", fine.matches);
    enable();

    const classify = (node: Element | null) => {
      frame = null;
      if (!node) return "idle";
      if (node.closest(TEXTISH)) return "text";
      if (node.closest(DRAGGY)) return "drag";
      const link = node.closest(LINKISH);
      if (link) {
        const b = link.getBoundingClientRect();
        // small controls get framed; big cards and long links get the grown ring
        if (b.width <= 260 && b.height <= 72 && link.tagName !== "LABEL") frame = link;
        return "link";
      }
      return "idle";
    };
    // canvas pieces (the hero atom's electrons) can't be found by element, so they tell the cursor directly
    let forced: string | null = null;
    const pick = (node: Element | null) => {
      const state = classify(node);
      if (!forced) return state;
      frame = null;
      return forced;
    };

    const loop = (now: number) => {
      // work the state out here, from the live pointer position, so it can never lag behind an event
      if (dirty) {
        el.dataset.state = pick(target);
        dirty = false;
      }
      let tx = p.x, ty = p.y, tw = 34, th = 34, radius = "999px";
      const state = el.dataset.state;
      if (state === "link") tw = th = 58;
      if (state === "drag") tw = th = 64;
      if (state === "text") tw = th = 6;
      if (frame) {
        const b = frame.getBoundingClientRect();
        // safety net: if the pointer has left the framed control, let it go
        if (!frame.isConnected || p.x < b.left - 16 || p.x > b.right + 16 || p.y < b.top - 16 || p.y > b.bottom + 16) {
          target = document.elementFromPoint(p.x, p.y);
          el.dataset.state = pick(target);
        }
      }
      if (frame) {
        const b = frame.getBoundingClientRect();
        tx = b.left + b.width / 2 + (p.x - (b.left + b.width / 2)) * 0.12;
        ty = b.top + b.height / 2 + (p.y - (b.top + b.height / 2)) * 0.12;
        tw = b.width + 12;
        th = b.height + 12;
        const br = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;
        radius = `${Math.min(br + 6, th / 2)}px`;
      }
      // the ring trails the dot only slightly: about 37% of the gap closes every 60 Hz frame, at any refresh rate
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = reduce.matches ? 1 : 1 - Math.exp(-dt * 28);
      r.x += (tx - r.x) * k;
      r.y += (ty - r.y) * k;
      r.w += (tw - r.w) * k;
      r.h += (th - r.h) * k;
      dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      ring.style.transform = `translate3d(${r.x - r.w / 2}px, ${r.y - r.h / 2}px, 0)`;
      ring.style.width = `${r.w}px`;
      ring.style.height = `${r.h}px`;
      ring.style.borderRadius = radius;
      const settled =
        Math.abs(tx - r.x) < 0.2 && Math.abs(ty - r.y) < 0.2 && Math.abs(tw - r.w) < 0.2 && Math.abs(th - r.h) < 0.2;
      if (settled && !frame) {
        raf = 0;
        last = 0;
      } else raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const recheck = () => {
      target = document.elementFromPoint(p.x, p.y);
      dirty = true;
      wake();
    };
    const onForce = (e: Event) => {
      forced = (e as CustomEvent<string | null>).detail ?? null;
      recheck();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      p.x = e.clientX;
      p.y = e.clientY;
      target = e.target instanceof Element ? e.target : null;
      dirty = true;
      if (!shown) {
        shown = true;
        r.x = p.x;
        r.y = p.y;
        el.dataset.shown = "true";
      }
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        shown = false;
        el.dataset.shown = "false";
      }
    };
    const onDown = () => (el.dataset.down = "true");
    const onUp = () => (el.dataset.down = "false");
    const onScroll = () => {
      // the element under a still pointer changes as the page moves
      if (shown) recheck();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("rv-cursor", onForce);
    fine.addEventListener("change", enable);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("rv-cursor-on");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("rv-cursor", onForce);
      fine.removeEventListener("change", enable);
    };
  }, [root]);
}

export function RvMotion() {
  const root = useRef<HTMLDivElement>(null);
  useSmoothScroll();
  useCursor(root);
  return (
    <div ref={root} className="rv-cursor" data-state="idle" data-shown="false" aria-hidden="true">
      {/* outer spans are positioned from JS; the inner shapes take the scale and colour changes */}
      <span className="rv-cursor-ring">
        <span className="rv-cursor-ring-shape">
          <svg className="rv-cursor-drag" viewBox="0 0 24 24" width="22" height="22">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="rv-cursor-dot">
        <span className="rv-cursor-dot-shape" />
      </span>
    </div>
  );
}
