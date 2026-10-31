"use client";

import { useEffect, useRef, useState } from "react";

/** A value in a code box with a Copy button that confirms for two seconds. */
export function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="rv-muted" style={{ fontSize: 13 }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <code className="rv-code">{value}</code>
        <button type="button" className="rv-pill" onClick={copy} aria-label={`Copy ${label}`} style={{ flex: "0 0 auto", minWidth: 84 }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
