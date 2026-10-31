"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { FAQ } from "@/lib/content";
import { Icon } from "./Chrome";

const STOP = new Set(["the", "and", "can", "does", "what", "how", "are", "you", "for", "with", "that", "this", "its", "any", "about", "your", "my", "is", "do", "if", "i"]);
const MAX = 300;

type Reply = { state: "idle" } | { state: "asking" } | { state: "answer"; text: string; q: string } | { state: "error"; msg: string };

/**
 * Ask box. While typing, the closest FAQ answers open by keyword. Submitting sends the question to
 * /api/ask (Ollama Cloud, grounded in the site's facts). If that service is off or fails, the keyword
 * match stays as the answer.
 */
export function AskFaq() {
  const [ask, setAsk] = useState("");
  const [openIx, setOpenIx] = useState(0);
  const [reply, setReply] = useState<Reply>({ state: "idle" });
  const abort = useRef<AbortController | null>(null);
  const base = useId();

  useEffect(() => () => abort.current?.abort(), []);

  const { shown, topIx } = useMemo(() => {
    const q = ask.trim().toLowerCase();
    const terms = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));
    const scored = FAQ.map((f, i) => {
      const question = f.q.toLowerCase();
      const hay = `${question} ${f.a.toLowerCase()}`;
      let score = 0;
      terms.forEach((t) => {
        if (hay.includes(t)) score += question.includes(t) ? 3 : 1;
      });
      return { f, i, score };
    });
    if (!q) return { shown: scored, topIx: -1 };
    const hits = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
    return { shown: hits, topIx: hits.length ? hits[0].i : -1 };
  }, [ask]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const q = ask.trim();
    if (q.length < 3 || reply.state === "asking") return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setReply({ state: "asking" });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (res.ok && data.answer) setReply({ state: "answer", text: data.answer, q });
      else setReply({ state: "error", msg: data.error || "No answer right now." });
    } catch (err) {
      if ((err as Error).name !== "AbortError") setReply({ state: "error", msg: "Couldn't reach the answer service." });
    }
  }

  const q = ask.trim();
  const note =
    reply.state === "asking"
      ? "Thinking…"
      : reply.state === "answer"
        ? "Answered below. The closest answer from this page is open too."
        : reply.state === "error"
        ? `${reply.msg} The closest answers from this page are below.`
        : !q
          ? "Press Enter to ask. Answers use only the facts on this site and never see your notes."
          : shown.length
            ? "Closest answer from this page opened. Press Enter for a written answer."
            : "Nothing matches on this page yet. Press Enter to ask anyway.";

  return (
    <>
      <form className="rv-ask" style={{ marginTop: 36 }} onSubmit={submit} role="search">
        <label htmlFor={`${base}-q`} className="rv-sr">
          Ask a question about Atomic Notes
        </label>
        <input
          id={`${base}-q`}
          type="search"
          placeholder="Can the developer read my notes?"
          value={ask}
          maxLength={MAX}
          autoComplete="off"
          onChange={(e) => {
            setAsk(e.target.value);
            if (reply.state !== "asking") setReply({ state: "idle" });
          }}
        />
        <button type="submit" className="rv-send rv-ask-send" aria-label="Ask" disabled={q.length < 3 || reply.state === "asking"}>
          <Icon name="up" color="#FFFFFF" size={18} />
        </button>
      </form>
      <p role="status" className="rv-muted" style={{ marginTop: 14, textAlign: "center", fontSize: 13 }}>
        {note}
      </p>

      {reply.state === "answer" && (
        <div className="rv-answer" aria-live="polite">
          <p className="rv-tag">Answer to: {reply.q}</p>
          <p className="rv-answer-text">{reply.text}</p>
          <p className="rv-muted" style={{ fontSize: 12 }}>
            Written by an AI model from this site&apos;s facts. It can be wrong: the FAQ below is the source.
          </p>
        </div>
      )}

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map((x) => {
          const isOpen = q ? x.i === topIx : openIx === x.i;
          const id = `${base}-a${x.i}`;
          return (
            <div className="rv-panel" style={{ padding: "0 20px" }} key={x.f.q}>
              <h3 style={{ fontSize: 17 }}>
                <button
                  type="button"
                  className="rv-faq-q"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => {
                    setAsk("");
                    setReply({ state: "idle" });
                    setOpenIx(isOpen ? -1 : x.i);
                  }}
                >
                  {x.f.q}
                  <span className="rv-faq-plus" aria-hidden="true">
                    +
                  </span>
                </button>
              </h3>
              <div id={id} hidden={!isOpen}>
                <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.65, color: "rgba(244,245,241,.78)", maxWidth: "68ch" }}>{x.f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
