import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateNewsPost, deleteNewsPost } from "@/lib/db/news";
import { NewsPost } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<Omit<NewsPost, "id">>;
  const post = await updateNewsPost(id, body);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteNewsPost(id);
  if (!ok) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
