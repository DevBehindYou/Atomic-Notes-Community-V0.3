import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, AtomicServerError } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

// Adjust a user's Atomic Coins / Energy. All the actual mutation logic
// (clamping, ledger write) now lives once, on the Server (routes/admin.ts +
// lib/energy.ts) — this route is just the admin-gated pass-through.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const b = await req.json().catch(() => null);
  if (!b?.email && !b?.user_id) {
    return NextResponse.json({ error: "email or user_id is required" }, { status: 400 });
  }
  try {
    const result = await atomicAdmin.adjustEnergy({
      email: b.email,
      user_id: b.user_id,
      coins_delta: Number(b.coins_delta ?? 0),
      energy_delta: Number(b.energy_delta ?? 0),
      note: b.note,
    });
    return NextResponse.json(result);
  } catch (e) {
    const status = e instanceof AtomicServerError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Failed to adjust";
    return NextResponse.json({ error: message }, { status });
  }
}
