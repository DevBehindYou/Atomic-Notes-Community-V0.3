"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APK_URL } from "@/lib/site";

// Sections of the home page. The links start with "/" so they work from the blog and updates pages too.
const LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "energy", label: "Energy" },
  { id: "faq", label: "FAQ" },
];

export function SiteNav({ current }: { current?: "blog" | "updates" | "support" }) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand" aria-label="Atomic Notes home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" width={28} height={28} className="brand-icon" />
          ATOMIC NOTES
        </Link>
        <nav className={`nav-links ${open ? "open" : ""}`} onClick={() => setOpen(false)} aria-label="Main">
          {LINKS.map((x) => (
            <a key={x.id} href={`/#${x.id}`} className={active === x.id ? "active" : ""}>
              {x.label}
            </a>
          ))}
          <Link href="/blog" className={current === "blog" ? "active" : ""}>
            Blog
          </Link>
          <Link href="/updates" className={current === "updates" ? "active" : ""}>
            Updates
          </Link>
          <Link href="/support-atomic-notes" className={current === "support" ? "active" : ""}>
            Support
          </Link>
          <a href={APK_URL} className="btn-signal nav-cta">
            Download
          </a>
        </nav>
        <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          ☰
        </button>
      </div>
    </header>
  );
}
