import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

/** Shared frame for the privacy policy and the terms: site chrome, a title block and readable prose. */
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
    <>
      <SiteNav />
      <main>
        <article className="wrap legal">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="mono-label legal-updated">Last updated: {updated}</p>
          <div className="prose">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
