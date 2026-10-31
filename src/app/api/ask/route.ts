import { NextResponse } from "next/server";
import { ASK_LIMITS, askSystemPrompt } from "@/lib/ask";

// "Ask me anything" on the home page. The browser calls this route; this route calls Ollama Cloud with a
// server-only key (OLLAMA_API_KEY), so the key never reaches the browser and the public CSP stays
// connect-src 'self'. Questions are not logged or stored.

export const dynamic = "force-dynamic";

const BASE = (process.env.OLLAMA_BASE_URL || "https://ollama.com").replace(/\/+$/, "");
const MODEL = process.env.OLLAMA_MODEL || "gemma4:31b";
const TIMEOUT_MS = 20_000;

// Best-effort limit per client: 6 questions a minute. On serverless this is per instance, which still
// blunts scripted abuse; put a shared store in front if the box gets popular.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "unknown").trim();
}

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
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

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Not allowed." }, 403);

  const key = process.env.OLLAMA_API_KEY;
  if (!key) return json({ error: "Answers are not switched on yet.", fallback: true }, 503);

  if (limited(clientKey(req))) {
    return json({ error: "Too many questions. Try again in a minute.", fallback: true }, 429, { "Retry-After": "60" });
  }

  let question = "";
  try {
    const body = (await req.json()) as { question?: unknown };
    if (typeof body.question === "string") question = body.question.trim();
  } catch {
    return json({ error: "Send a JSON body with a question." }, 400);
  }
  if (question.length < ASK_LIMITS.minChars || question.length > ASK_LIMITS.maxChars) {
    return json({ error: `Ask a question of ${ASK_LIMITS.minChars} to ${ASK_LIMITS.maxChars} characters.` }, 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        options: { temperature: 0.2, num_predict: 400 },
        messages: [
          { role: "system", content: askSystemPrompt() },
          { role: "user", content: question },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return json({ error: "The answer service is unavailable right now.", fallback: true }, 502);
    const data = (await res.json()) as { message?: { content?: unknown } };
    const answer = typeof data.message?.content === "string" ? data.message.content.trim() : "";
    if (!answer) return json({ error: "No answer came back. Try rephrasing.", fallback: true }, 502);
    return json({ answer: answer.slice(0, 2000) });
  } catch {
    return json({ error: "The answer service took too long. Try again.", fallback: true }, 504);
  } finally {
    clearTimeout(timer);
  }
}
