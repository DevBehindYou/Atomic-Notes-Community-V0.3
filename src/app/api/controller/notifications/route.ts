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

// Page through every status; only the public/App feeds filter to active notices.
export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const params = new URL(req.url).searchParams;
  const limit = params.get("limit") ?? "50";
  const cursor = params.get("cursor");
  if (!/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit)) {
    return NextResponse.json({ error: "invalid_notification_limit" }, { status: 400 });
  }
  if (cursor !== null && (cursor.length > 512 || !/^[A-Za-z0-9_-]+$/.test(cursor))) {
    return NextResponse.json({ error: "invalid_notification_cursor" }, { status: 400 });
  }
  try {
    const { rows, next_cursor } = await atomicAdmin.listNotifications(Number(limit), cursor ?? undefined);
    return NextResponse.json({ rows, next_cursor: next_cursor ?? null });
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
