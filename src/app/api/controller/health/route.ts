import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, isAtomicServerConfigured } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

// Config + DB health. Reports only booleans for secrets — never their values.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const env = {
    atomic_server_url: Boolean(process.env.ATOMIC_SERVER_URL),
    admin_api_key: Boolean(process.env.ADMIN_API_KEY),
    admin_password: Boolean(process.env.ADMIN_PASSWORD),
    admin_password_2: Boolean(process.env.ADMIN_PASSWORD_2),
    session_secret: Boolean(process.env.SESSION_SECRET),
    apk_url: Boolean(process.env.NEXT_PUBLIC_APK_URL),
  };

  let db = false;
  let dbError: string | null = null;
  if (isAtomicServerConfigured()) {
    try {
      const health = await atomicAdmin.health();
      db = health.db;
      dbError = health.dbError;
    } catch (e) {
      dbError = e instanceof Error ? e.message : "DB error";
    }
  }

  return NextResponse.json({ env, db, dbError, time: new Date().toISOString() });
}
