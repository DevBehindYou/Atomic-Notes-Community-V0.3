import "@/app/revamp.css";
import { Dock, RvFooter } from "@/components/rv/Chrome";

/** Shared frame for the privacy policy and the terms: the dark site chrome, a title block and readable prose. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rv">
      <Dock />
      <main className="rv-legal">
        <div className="rv-wrap">
          <article className="rv-article rv-legal-article">
            <p className="rv-num">{eyebrow}</p>
            <h1 className="rv-poster rv-legal-title">{title}</h1>
            <p className="rv-legal-updated">Last updated: {updated}</p>
            <div className="prose">{children}</div>
          </article>
        </div>
      </main>
      <RvFooter />
    </div>
  );
}
