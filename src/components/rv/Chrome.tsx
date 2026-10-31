import Link from "next/link";
import { RELEASE, REPO_URL } from "@/lib/content";
import { RvMotion } from "./RvMotion";
import { MobileMenu } from "./MobileMenu";
import { BackToTop } from "./BackToTop";

/** The atom mark from the app icon, drawn for the dark dock. */
export function AtomMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-384 -384 768 768" aria-hidden="true">
      <g fill="none" strokeWidth={36}>
        <ellipse rx="336" ry="124" stroke="#8F88FF" transform="rotate(30)" />
        <ellipse rx="336" ry="124" stroke="#8F88FF" transform="rotate(-30)" />
        <ellipse rx="336" ry="124" stroke="#F4F5F1" transform="rotate(90)" />
      </g>
      <circle cx="-290.98" cy="-168" r="44" fill="#8F88FF" />
      <circle cx="290.98" cy="-168" r="44" fill="#F4F5F1" />
      <circle cx="0" cy="336" r="44" fill="#8F88FF" />
      <circle r="84" fill="#F4F5F1" />
      <circle r="32" fill="#15171B" />
    </svg>
  );
}

/** The app's on-dark icon (assets/new-atomic-icons/svg/atomic-icon-on-dark.svg) on an ink disc, strokes thickened for 30px. */
function AtomDarkIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-460 -460 920 920" aria-hidden="true" className="rv-dock-icon">
      <circle r="460" fill="#15171B" />
      <g fill="none" strokeWidth={34}>
        <ellipse rx="336" ry="124" stroke="#3A2FF0" transform="rotate(30)" />
        <ellipse rx="336" ry="124" stroke="#3A2FF0" transform="rotate(-30)" />
        <ellipse rx="336" ry="124" stroke="#F4F5F1" transform="rotate(90)" />
      </g>
      <circle cx="-290.98" cy="-168" r="44" fill="#3A2FF0" />
      <circle cx="290.98" cy="-168" r="44" fill="#F4F5F1" />
      <circle cx="0" cy="336" r="44" fill="#3A2FF0" />
      <circle r="84" fill="#F4F5F1" />
      <circle r="32" fill="#15171B" />
    </svg>
  );
}

/** Floating top navigation shared by the dark pages. */
export function Dock({ current }: { current?: "home" | "story" | "blog" | "updates" | "support" }) {
  const download = current === "home" ? "#get" : "/#get";
  return (
    <>
      <nav className="rv-dock" aria-label="Main">
        <Link href="/" aria-label="Atomic Notes home" aria-current={current === "home" ? "page" : undefined}>
          <AtomMark />
        </Link>
        <span className="rv-dock-sep rv-hide-sm" aria-hidden="true" />
        <Link href="/story" className="rv-hide-sm" aria-current={current === "story" ? "page" : undefined}>
          Story
        </Link>
        <Link href="/blog" className="rv-hide-sm" aria-current={current === "blog" ? "page" : undefined}>
          Blogs
        </Link>
        <Link href="/updates" className="rv-hide-sm" aria-current={current === "updates" ? "page" : undefined}>
          Updates
        </Link>
        <Link
          href="/support-atomic-notes"
          className="rv-hide-sm"
          aria-current={current === "support" ? "page" : undefined}
        >
          Support
        </Link>
        <MobileMenu current={current} repoUrl={REPO_URL} />
        <span className="rv-dock-sep" aria-hidden="true" />
        <a href={download} className="rv-dock-cta">
          <AtomDarkIcon />
          Open
        </a>
      </nav>
      <RvMotion />
    </>
  );
}

export type Tick = {
  href: string;
  label: string;
  t: string;
  sideways?: boolean;
};

/** Section ticks on the left edge. Each one grows while its section is on screen. */
export function Ticks({ items, label }: { items: Tick[]; label: string }) {
  return (
    <nav className="rv-map" aria-label={label}>
      {items.map((m) => (
        <a
          key={m.t}
          href={m.href}
          data-t={m.t}
          className={m.sideways ? "rv-tick rv-tick-h" : "rv-tick"}
          aria-label={m.label}
          title={m.label}
        />
      ))}
    </nav>
  );
}

export function RvFooter() {
  return (
    <footer className="rv-footer">
      <div className="rv-wrap rv-foot">
        <p className="rv-poster rv-foot-mark">Atomic Notes</p>
        <nav className="rv-foot-nav" aria-label="Footer">
          <ul>
            <li>
              <Link href="/story">Story</Link>
            </li>
            <li>
              <Link href="/blog">Blogs</Link>
            </li>
            <li>
              <Link href="/updates">Updates</Link>
            </li>
            <li>
              <Link href="/support-atomic-notes">Support</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                Source code
              </a>
            </li>
            <li>
              <a href="/feed.xml">RSS</a>
            </li>
          </ul>
        </nav>
        <div className="rv-foot-meta">
          <p className="rv-muted">Version {RELEASE.version}. Source-available. © 2026 DevBehindYou.</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

/** Stroke icons used across the dark pages. */
export const ICON_PATHS = {
  pen: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  list: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  bin: "M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  plane: "M2 13l20-8-8 16-3-7z",
  file: "M6 3h8l4 4v14H6zM14 3v4h4",
  key: "M14 7a4 4 0 1 0-3.5 6.5L4 20h4v-2h2v-2h2l1.5-1.5A4 4 0 0 0 14 7z",
  copy: "M8 8h11v11H8zM5 16V5h11",
  retry: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  finger:
    "M12 4a7 7 0 0 1 7 7v3M5 14v-3a7 7 0 0 1 3-5.7M9 20c1-2 1.5-4.5 1.5-7a1.5 1.5 0 0 1 3 0c0 3-.5 5.5-2 8M16 19c.6-1.5 1-3.5 1-6",
  ban: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM4 20L20 4",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  cap: "M4 18h16M6 18V9M18 18V9M12 18V5",
  notes: "M5 4h14v16H5zM9 8h6M9 12h6M9 16h4",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9 9.5h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15",
  phone: "M7 2.5h10v19H7zM10.5 18.5h3",
  drive: "M8.5 3.5h7l6 10.5-3.5 6H6l-3.5-6zM2.5 14h19",
  server: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  close: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h13M13 6l6 6-6 6",
  up: "M12 19V5M6 11l6-6 6 6",
  // built-on tiles
  app: "M7 2.5h10v19H7zM9.5 6h5v4h-5zM9.5 13h5M9.5 15.5h3M11 19h2",
  hive: "M12 4.8l3.64 2.1v4.2L12 13.2l-3.64-2.1V6.9zM8.36 11.1L12 13.2v4.2l-3.64 2.1-3.64-2.1v-4.2zM15.64 11.1l3.64 2.1v4.2l-3.64 2.1L12 17.4",
  cloudUp: "M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.5 4.5 0 0 0 7 18zM12 15.5v-5M9.8 12.6l2.2-2.2 2.2 2.2",
  wordsKey:
    "M4 4h3M10.5 4h3M17 4h3M4 7.5h3M10.5 7.5h3M17 7.5h3M7 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM10 15.5h10M17 15.5v3M20 15.5v2.5",
  sealNote: "M12 21H5V3h9l4 4v5M14 3v4h4M8 9h4M8 12.5h3M14 15.5h7v5.5h-7zM15.5 15.5V14a2 2 0 0 1 4 0v1.5",
  chip: "M7 7h10v10H7zM10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3M12 9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 12.2v2.3",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, size = 20, color = "#8F88FF" }: { name: IconName; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={ICON_PATHS[name]}
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
