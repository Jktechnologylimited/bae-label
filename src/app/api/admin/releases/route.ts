import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createRelease } from "@/lib/db/releases";
import { missingFields, missingKeys, pickReleasePatch } from "@/lib/adminPayload";

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

  const picked = pickReleasePatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  // `tracks` must be present (the releases page maps over it) but may be empty.
  const missing =
    missingFields(picked.patch, ["title", "artist", "label", "type"]) ?? missingKeys(picked.patch, ["tracks"]);
  if (missing) return NextResponse.json({ error: `${missing} is required.` }, { status: 400 });

  const release = await createRelease(picked.patch as Parameters<typeof createRelease>[0]);
  return NextResponse.json({ release }, { status: 201 });
}
