import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./revamp.css";
import { Dock, RvFooter } from "@/components/rv/Chrome";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#15171B",
};

export default function NotFound() {
  return (
    <div className="rv">
      <Dock />
      <main className="rv-404">
        <div className="rv-stars" aria-hidden="true" />
        <div className="rv-wrap">
          <p className="rv-poster rv-404-code" aria-hidden="true">
            404
          </p>
          <h1 className="rv-h2">Page not found</h1>
          <div className="rv-btns" style={{ marginTop: 28, justifyContent: "center" }}>
            <Link href="/" className="rv-pill rv-pill-solid">
              Go home
            </Link>
            <Link href="/blog" className="rv-pill">
              Read the blog
            </Link>
          </div>
        </div>
      </main>
      <RvFooter />
    </div>
  );
}
