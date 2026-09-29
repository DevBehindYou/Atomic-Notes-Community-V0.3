import Link from "next/link";
import { APK_URL } from "@/lib/site";
import { RELEASE, REPO_URL } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <p className="foot-brand">ATOMIC NOTES</p>
          <p className="foot-tag">Your Notes, Your Drive, Local First.</p>
          <p className="foot-small">
            Version {RELEASE.version} · All rights reserved · Built by{" "}
            <a href="https://devbehindyou.vercel.app" target="_blank" rel="noreferrer">
              DevBehindYou
            </a>
          </p>
        </div>
        <nav aria-label="Product">
          <p className="foot-head">Product</p>
          <a href={APK_URL}>Download the APK</a>
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#faq">FAQ</a>
          <Link href="/support-atomic-notes">Support on Patreon</Link>
        </nav>
        <nav aria-label="Project">
          <p className="foot-head">Project</p>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Source code
          </a>
          <a href={`${REPO_URL}/blob/main/TRANSPARENCY.md`} target="_blank" rel="noreferrer">
            Transparency
          </a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/updates">Updates</Link>
          <a href="/feed.xml">RSS</a>
        </nav>
        <nav aria-label="Elsewhere">
          <p className="foot-head">Elsewhere</p>
          <a href="https://github.com/DevBehindYou" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://medium.com/@devbehindyou" target="_blank" rel="noreferrer">
            Medium
          </a>
          <a href="https://x.com/devbehindyou" target="_blank" rel="noreferrer">
            X
          </a>
        </nav>
      </div>
    </footer>
  );
}
