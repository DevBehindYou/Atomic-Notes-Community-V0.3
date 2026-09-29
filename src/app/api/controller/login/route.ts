import { NextResponse } from "next/server";
import { atomicAdmin, AtomicServerError, isAtomicServerConfigured } from "@/lib/atomicServer";
import {
  adminLoginProblems,
  passwordMatches,
  password2Matches,
  makeToken,
  ADMIN_COOKIE,
  COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth";

/** The caller's address as Vercel reports it; the Server stores only a hash of it. */
function clientAddress(req: Request): string {
  return req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function tooMany(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return NextResponse.json(
    { error: `Too many wrong attempts. Try again in ${minutes} min.`, retry_after_seconds: seconds },
    { status: 429, headers: { "Retry-After": String(seconds) } },
  );
}

export async function POST(req: Request) {
  // Names only, so the operator can see which Vercel variable this deployment is missing.
  const problems = adminLoginProblems();
  if (problems.length) return NextResponse.json({ error: "Admin login is not configured", problems }, { status: 503 });
  // Five wrong attempts from one address lock it out for 15 minutes (counted on the Server, which every
  // instance of this app shares). Without the Server there is nothing to protect, and no throttle.
  const client = clientAddress(req);
  const throttled = isAtomicServerConfigured();
  if (throttled) {
    try {
      const gate = await atomicAdmin.loginAttempt(client, "check");
      if (!gate.allowed) return tooMany(gate.retry_after_seconds);
    } catch (e) {
      // No sign-in without the throttle. Say which part is wrong, so the operator can fix it.
      const refusedKey = e instanceof AtomicServerError && e.status === 401;
      return NextResponse.json(
        { error: refusedKey ? "The Atomic Notes Server refused this Controller's ADMIN_API_KEY." : "Could not reach the Atomic Notes Server. Try again." },
        { status: 503 },
      );
    }
  }
  const body = await req
    .json()
    .catch(() => ({}) as { password?: string; password2?: string });
  // Two-key login: BOTH passwords must match. One generic error either way, so
  // a wrong first vs second key is indistinguishable to an attacker.
  if (!passwordMatches(body?.password) || !password2Matches(body?.password2)) {
    if (throttled) {
      const gate = await atomicAdmin.loginAttempt(client, "failure").catch(() => null);
      if (gate && !gate.allowed) return tooMany(gate.retry_after_seconds);
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (throttled) await atomicAdmin.loginAttempt(client, "success").catch(() => undefined);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
