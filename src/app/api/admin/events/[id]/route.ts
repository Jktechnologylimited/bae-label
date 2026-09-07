import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateEvent, deleteEvent } from "@/lib/db/events";
import { BaeEvent } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<Omit<BaeEvent, "id">>;
  const event = await updateEvent(id, body);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteEvent(id);
  if (!ok) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
