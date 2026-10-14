import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createNewsPost } from "@/lib/db/news";
import { missingFields, pickNewsPatch } from "@/lib/adminPayload";

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

  const picked = pickNewsPatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  const missing = missingFields(picked.patch, ["title", "category", "excerpt"]);
  if (missing) return NextResponse.json({ error: `${missing} is required.` }, { status: 400 });

  const post = await createNewsPost(picked.patch as Parameters<typeof createNewsPost>[0]);
  return NextResponse.json({ post }, { status: 201 });
}
