"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Page = "home" | "story" | "blog" | "updates" | "support";

const LINKS: { href: string; label: string; page: Page }[] = [
  { href: "/", label: "Home", page: "home" },
  { href: "/story", label: "Story", page: "story" },
  { href: "/blog", label: "Blogs", page: "blog" },
  { href: "/updates", label: "Updates", page: "updates" },
  { href: "/support-atomic-notes", label: "Support", page: "support" },
];

/**
 * The phone menu: a button in the dock that opens a full-screen sheet. The sheet grows out of the button as
 * a circle, links rise in one after another, Escape or a link closes it, and focus stays inside while open.
 * It's portalled into the .rv page root because the dock is transformed, which would trap a fixed child.
 */
export function MobileMenu({ current, repoUrl }: { current?: Page; repoUrl: string }) {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRoot(button.current?.closest<HTMLElement>(".rv") ?? null);
  }, []);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";

    // the circle grows from the button's centre
    const b = button.current?.getBoundingClientRect();
    if (b && sheet.current) {
      sheet.current.style.setProperty("--mx", `${b.left + b.width / 2}px`);
      sheet.current.style.setProperty("--my", `${b.top + b.height / 2}px`);
    }
    const first = sheet.current?.querySelector<HTMLElement>("a");
    const focusTimer = window.setTimeout(() => first?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !sheet.current || !button.current) return;
      // keep Tab inside the sheet and the toggle
      const items = [button.current, ...sheet.current.querySelectorAll<HTMLElement>("a, button")];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    // a wider screen shows the full dock again
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && close(false);

    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      html.style.overflow = prev;
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="rv-menu-btn"
        aria-expanded={open}
        aria-controls="rv-menu-sheet"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="rv-menu-bars" aria-hidden="true">
          <span />
          <span />
        </span>
        {open ? "Close" : "Menu"}
      </button>
      {root
        ? createPortal(
            <div
              ref={sheet}
              id="rv-menu-sheet"
              className="rv-menu-sheet"
              data-open={open}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              aria-hidden={!open}
              inert={!open}
            >
              <nav aria-label="Pages">
                <ul className="rv-menu-links">
                  {LINKS.map((l, i) => (
                    <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                      <Link
                        href={l.href}
                        aria-current={current === l.page ? "page" : undefined}
                        onClick={() => close(false)}
                      >
                        <span>{l.label}</span>
                        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                          <path
                            d="M5 12h13M13 6l6 6-6 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="rv-menu-foot" style={{ "--i": LINKS.length } as React.CSSProperties}>
                <p className="rv-menu-small">
                  <Link href="/privacy" onClick={() => close(false)}>
                    Privacy
                  </Link>
                  <Link href="/terms" onClick={() => close(false)}>
                    Terms
                  </Link>
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    Source code
                  </a>
                  <a href="/feed.xml">RSS</a>
                </p>
              </div>
            </div>,
            root,
          )
        : null}
    </>
  );
}
