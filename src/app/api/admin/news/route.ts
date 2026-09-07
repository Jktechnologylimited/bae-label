import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createNewsPost } from "@/lib/db/news";
import { NewsPost } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await req.json()) as Omit<NewsPost, "id">;
  if (!body.title || !body.category || !body.excerpt) {
    return NextResponse.json({ error: "Title, category and excerpt are required." }, { status: 400 });
  }

  const post = await createNewsPost(body);
  return NextResponse.json({ post });
}
