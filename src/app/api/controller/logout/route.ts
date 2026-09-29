import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdmin, rememberRevokedBefore } from "@/lib/auth";
import { atomicAdmin, isAtomicServerConfigured } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

// Log out ends every Controller session issued until now, not just this browser's cookie: a copied
// cookie stops working too. Only a signed-in operator can do that.
export async function POST() {
  let revoked = false;
  if (isAtomicServerConfigured() && (await isAdmin())) {
    try {
      rememberRevokedBefore((await atomicAdmin.revokeSessions(Date.now())).revoked_before);
      revoked = true;
    } catch {
      // The cookie is still cleared below; other copies stay valid until they expire.
    }
  }
  const res = NextResponse.json({ ok: true, revoked });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
