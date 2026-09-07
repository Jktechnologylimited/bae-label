import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createRelease } from "@/lib/db/releases";
import { Release } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await req.json()) as Omit<Release, "id">;
  if (!body.title || !body.artist || !body.label) {
    return NextResponse.json({ error: "Title, artist and label are required." }, { status: 400 });
  }

  const release = await createRelease(body);
  return NextResponse.json({ release });
}
