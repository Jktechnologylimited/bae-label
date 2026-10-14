import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createArtist } from "@/lib/db/artists";
import { missingFields, pickArtistPatch } from "@/lib/adminPayload";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const picked = pickArtistPatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  const missing = missingFields(picked.patch, ["name", "genre", "label"]);
  if (missing) return NextResponse.json({ error: `${missing} is required.` }, { status: 400 });

  const artist = await createArtist(picked.patch as Parameters<typeof createArtist>[0]);
  return NextResponse.json({ artist }, { status: 201 });
}
