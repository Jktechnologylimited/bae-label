import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listNews } from "@/lib/db/news";
import DeleteNewsButton from "./DeleteNewsButton";

export const metadata: Metadata = { title: "Admin — News" };

export default async function AdminNewsPage() {
  const posts = await listNews();
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">News</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} posts published.</p>
        </div>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-1.5 bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-ink hover:bg-white"
        >
          <Plus className="size-3.5" /> New Post
        </Link>
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {sorted.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-muted">
                {p.category} · {p.date} · {p.readTime}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/news/${p.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper"
              >
                <Pencil className="size-3.5" /> Edit
              </Link>
              <DeleteNewsButton id={p.id} title={p.title} />
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="py-8 text-sm text-muted">No posts yet.</p>}
      </div>
    </div>
  );
}
