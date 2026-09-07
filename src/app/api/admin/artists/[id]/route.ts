import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateArtist, deleteArtist } from "@/lib/db/artists";
import { Artist } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<Omit<Artist, "id">>;
  const artist = await updateArtist(id, body);
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
