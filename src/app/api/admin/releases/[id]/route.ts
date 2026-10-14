import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateRelease, deleteRelease } from "@/lib/db/releases";
import { pickReleasePatch } from "@/lib/adminPayload";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const picked = pickReleasePatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  const release = await updateRelease(id, picked.patch);
  if (!release) return NextResponse.json({ error: "Release not found." }, { status: 404 });

  return NextResponse.json({ release });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteRelease(id);
  if (!ok) return NextResponse.json({ error: "Release not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
