import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, AtomicServerError } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { stats } = await atomicAdmin.stats();
    return NextResponse.json({ stats });
  } catch (e) {
    const status = e instanceof AtomicServerError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load stats" },
      { status }
    );
  }
}
