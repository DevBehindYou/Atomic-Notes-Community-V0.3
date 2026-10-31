import { NextResponse } from "next/server";
import { ASK_LIMITS, OFF_TOPIC, REFUSAL, askSystemPrompt, screenQuestion, unsafeAnswer } from "@/lib/ask";

// "Ask me anything" on the home page. The browser calls this route; this route calls Ollama Cloud with a
// server-only key (OLLAMA_API_KEY), so the key never reaches the browser and the public CSP stays
// connect-src 'self'. The answer streams back as plain text while the model writes it.
//
// Keeping it to its job: only this site's pages may call it, each visitor gets a few questions a minute and
// a daily allowance, obvious jailbreaks, off-topic tasks and harmful requests are refused before any model
// call, the model is told to answer OFF_TOPIC for anything else outside Atomic Notes, and an answer that
// drifts into unsafe content is cut off. Questions are not logged or stored.

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const BASE = (process.env.OLLAMA_BASE_URL || "https://ollama.com").replace(/\/+$/, "");
const MODEL = process.env.OLLAMA_MODEL || "gemma4:31b";
const FIRST_BYTE_MS = 20_000; // the model must start answering within this
const TOTAL_MS = 40_000; // and finish within this
const MAX_CHARS = 2000;

// Limits. In memory, so on serverless they hold per instance: enough to blunt scripted abuse and cap
// spend; put a shared store in front if the box gets popular.
const PER_MINUTE = 6; // per visitor
const PER_DAY = 40; // per visitor
const ALL_PER_MINUTE = 120; // every visitor together, a ceiling on cost
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const hits = new Map<string, number[]>();
let everyone: number[] = [];

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "unknown").trim();
}

/** Why a question can't be asked right now, or null. Counts it when it can. */
function overLimit(key: string): string | null {
  const now = Date.now();
  everyone = everyone.filter((t) => now - t < MINUTE);
  if (everyone.length >= ALL_PER_MINUTE) return "A lot of people are asking right now. Try again in a minute.";
  const day = (hits.get(key) || []).filter((t) => now - t < DAY);
  if (day.length >= PER_DAY) return "That's today's limit for questions. The FAQ below covers the most common ones.";
  if (day.filter((t) => now - t < MINUTE).length >= PER_MINUTE) return "Too many questions. Try again in a minute.";
  day.push(now);
  hits.set(key, day);
  everyone.push(now);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < DAY)) hits.delete(k);
  }
  return null;
}

// Recent answers by normalized question, so repeats of popular questions don't cost a model call.
const CACHE_MAX = 200;
const CACHE_MS = 60 * MINUTE;
const cache = new Map<string, { text: string; at: number }>();
const norm = (q: string) => q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function remember(q: string, text: string) {
  cache.delete(q);
  cache.set(q, { text, at: Date.now() });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
}

/**
 * Only this site's own pages may call the route. A browser marks its request with Origin, or (Chrome on
 * some same-origin POSTs) only with Sec-Fetch-Site: same-origin. Requests carrying neither are refused.
 */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") === "same-origin";
  try {
    // Same rule as the Controller middleware: the Host header or the first forwarded host may match.
    const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const hosts = [req.headers.get("host"), forwarded].filter((h): h is string => Boolean(h)).map((h) => h.toLowerCase());
    return hosts.includes(new URL(origin).host.toLowerCase());
  } catch {
    return false;
  }
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });

const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

/** A reply that isn't a model answer (refusals, cached answers), sent the same way as a streamed one. */
const plainReply = (text: string, kind: "refused" | "cached") =>
  new Response(text, { headers: { ...TEXT_HEADERS, "X-Ask": kind } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Not allowed." }, 403);

  const key = process.env.OLLAMA_API_KEY;
  if (!key) return json({ error: "Answers are not switched on yet.", fallback: true }, 503);

  let question = "";
  try {
    const body = (await req.json()) as { question?: unknown };
    if (typeof body.question === "string") question = body.question.replace(/\s+/g, " ").trim();
  } catch {
    return json({ error: "Send a JSON body with a question." }, 400);
  }
  if (question.length < ASK_LIMITS.minChars || question.length > ASK_LIMITS.maxChars) {
    return json({ error: `Ask a question of ${ASK_LIMITS.minChars} to ${ASK_LIMITS.maxChars} characters.` }, 400);
  }

  const busy = overLimit(clientKey(req));
  if (busy) return json({ error: busy, fallback: true }, 429, { "Retry-After": "60" });

  const screen = screenQuestion(question);
  if (!screen.ok) return plainReply(screen.reply, "refused");

  const id = norm(question);
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return plainReply(hit.text, "cached");

  const controller = new AbortController();
  const firstByte = setTimeout(() => controller.abort(), FIRST_BYTE_MS);
  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        options: { temperature: 0.2, num_predict: 400 },
        messages: [
          { role: "system", content: askSystemPrompt() },
          { role: "user", content: question },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    clearTimeout(firstByte);
    return json({ error: "The answer service took too long. Try again.", fallback: true }, 504);
  }
  if (!upstream.ok || !upstream.body) {
    clearTimeout(firstByte);
    // The status only, never the question: 401/403 means the key is wrong, 404 the model name.
    console.error(`[ask] Ollama answered ${upstream.status} for model ${MODEL}`);
    return json({ error: "The answer service is unavailable right now.", fallback: true }, 502);
  }

  // Ollama streams NDJSON: one {"message":{"content":"…"},"done":false} per line. Only the answer text is
  // passed on; thinking models also send message.thinking, which stays here.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  let ended = false;
  const total = setTimeout(() => controller.abort(), TOTAL_MS);
  const stop = () => {
    ended = true;
    clearTimeout(firstByte);
    clearTimeout(total);
    controller.abort();
  };
  /** The next piece of answer text: "" once the answer is over (done, error, timeout or a bad line). */
  async function nextText(): Promise<string> {
    while (!ended) {
      let read: ReadableStreamReadResult<Uint8Array>;
      try {
        read = await reader.read();
      } catch {
        stop();
        return "";
      }
      if (read.done) {
        stop();
        return "";
      }
      buffered += decoder.decode(read.value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";
      let text = "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let chunk: { message?: { content?: unknown }; done?: boolean; error?: unknown };
        try {
          chunk = JSON.parse(line);
        } catch {
          stop();
          break;
        }
        if (chunk.error) {
          stop();
          break;
        }
        if (typeof chunk.message?.content === "string") text += chunk.message.content;
        if (chunk.done) ended = true;
      }
      if (text) return text;
    }
    return "";
  }

  // Hold the start of the answer until it is clear it isn't the OFF_TOPIC signal, which becomes REFUSAL.
  let head = "";
  while (head.trimStart().length < OFF_TOPIC.length + 2) {
    const piece = await nextText();
    if (!piece) break;
    head += piece;
  }
  clearTimeout(firstByte);
  if (head.trim().startsWith(OFF_TOPIC) || head.trim().startsWith(OFF_TOPIC.toLowerCase())) {
    stop();
    return plainReply(REFUSAL, "refused");
  }
  if (!head.trim()) {
    stop();
    return json({ error: "No answer came back. Try rephrasing.", fallback: true }, 502);
  }
  if (unsafeAnswer(head)) {
    stop();
    return plainReply(REFUSAL, "refused");
  }

  const encoder = new TextEncoder();
  let answer = "";
  const stream = new ReadableStream<Uint8Array>({
    start(out) {
      answer = head.slice(0, MAX_CHARS);
      out.enqueue(encoder.encode(answer));
    },
    async pull(out) {
      const piece = answer.length < MAX_CHARS ? await nextText() : "";
      if (!piece) {
        stop();
        if (answer.trim() && !unsafeAnswer(answer)) remember(id, answer);
        out.close();
        return;
      }
      const next = (answer + piece).slice(0, MAX_CHARS);
      if (unsafeAnswer(next)) {
        // cut it off where it is; the browser shows what came before and the FAQ
        stop();
        out.close();
        return;
      }
      out.enqueue(encoder.encode(next.slice(answer.length)));
      answer = next;
    },
    cancel() {
      stop();
    },
  });

  return new Response(stream, { headers: { ...TEXT_HEADERS, "X-Ask": "model" } });
}
