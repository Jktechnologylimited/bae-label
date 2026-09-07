import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createArtist } from "@/lib/db/artists";
import { Artist } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await req.json()) as Omit<Artist, "id">;
  if (!body.name || !body.genre || !body.label) {
    return NextResponse.json({ error: "Name, genre and label are required." }, { status: 400 });
  }

  const artist = await createArtist(body);
  return NextResponse.json({ artist });
}
