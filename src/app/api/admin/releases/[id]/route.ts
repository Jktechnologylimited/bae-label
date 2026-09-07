import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateRelease, deleteRelease } from "@/lib/db/releases";
import { Release } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<Omit<Release, "id">>;
  const release = await updateRelease(id, body);
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
