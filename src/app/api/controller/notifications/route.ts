import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { atomicAdmin, AtomicServerError } from "@/lib/atomicServer";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function errorResponse(e: unknown, fallback: string) {
  const status = e instanceof AtomicServerError ? e.status : 500;
  const message = e instanceof Error ? e.message : fallback;
  return NextResponse.json({ error: message }, { status });
}

// List every notification (admin sees all statuses, not just active).
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { rows } = await atomicAdmin.listNotifications();
    return NextResponse.json({ rows });
  } catch (e) {
    return errorResponse(e, "Failed to list notifications");
  }
}

// Create a notification. Body shape (including target_user_id/target_email
// resolution) is unchanged — the Server's /api/admin/notifications route
// accepts exactly what supabaseAdmin() used to.
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const b = await req.json().catch(() => null);
  if (!b?.type || !b?.subject || !b?.description) {
    return NextResponse.json(
      { error: "type, subject and description are required" },
      { status: 400 }
    );
  }
  try {
    // audience_size is how many users it reached, which the form reports after publishing.
    const { row, audience_size } = await atomicAdmin.createNotification(b);
    return NextResponse.json({ row, audience_size: audience_size ?? null });
  } catch (e) {
    return errorResponse(e, "Failed to create notification");
  }
}

// Update fields on a notification (e.g. flip status to resolved/expired).
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const b = await req.json().catch(() => null);
  if (!b?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  try {
    const { row } = await atomicAdmin.updateNotification(b);
    return NextResponse.json({ row });
  } catch (e) {
    return errorResponse(e, "Failed to update notification");
  }
}

// Delete a notification.
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  try {
    await atomicAdmin.deleteNotification(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete notification");
  }
}
