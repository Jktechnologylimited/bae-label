import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsPost } from "@/lib/db/news";
import NewsForm from "../NewsForm";

export const metadata: Metadata = { title: "Admin — Edit Post" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getNewsPost(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Edit Post</h1>
      <p className="mt-1 text-sm text-muted">{post.title}</p>
      <div className="mt-6">
        <NewsForm post={post} />
      </div>
    </div>
  );
}
