import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, AtomicServerError } from "@/lib/atomicServer";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(req.url).searchParams;
  const userId = query.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  try { return NextResponse.json(await atomicAdmin.coinBatches(userId, query.get("cursor") ?? undefined)); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Could not load batches" },
    { status: e instanceof AtomicServerError ? e.status : 500 }); }
}
