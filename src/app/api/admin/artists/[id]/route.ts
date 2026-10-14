import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateArtist, deleteArtist } from "@/lib/db/artists";
import { pickArtistPatch } from "@/lib/adminPayload";

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

  // Only known, correctly-typed fields are written — the raw body is never
  // spread into the stored record (review finding M3).
  const picked = pickArtistPatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  const artist = await updateArtist(id, picked.patch);
  if (!artist) return NextResponse.json({ error: "Artist not found." }, { status: 404 });

  return NextResponse.json({ artist });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteArtist(id);
  if (!ok) return NextResponse.json({ error: "Artist not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
