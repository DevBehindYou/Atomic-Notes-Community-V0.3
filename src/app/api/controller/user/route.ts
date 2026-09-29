import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, AtomicServerError } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

// Look up a user by email and return their current wallet + last login, so the
// admin can see the real state before adjusting anything.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = new URL(req.url).searchParams.get("email")?.trim();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  try {
    const user = await atomicAdmin.user(email);
    return NextResponse.json(user);
  } catch (e) {
    const status = e instanceof AtomicServerError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status });
  }
}
