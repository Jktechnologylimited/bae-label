"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import clsx from "clsx";
import { NewsPost } from "@/lib/types";

const inputClass =
  "w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold";

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <label className={clsx("block", span2 && "sm:col-span-2")}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const CATEGORIES: NewsPost["category"][] = ["Announcement", "Music", "Events", "Culture", "Industry", "Press"];

export default function NewsForm({ post }: { post?: NewsPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState<NewsPost["category"]>(post?.category ?? "Announcement");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [date, setDate] = useState(post?.date ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [readTime, setReadTime] = useState(post?.readTime ?? "3 min read");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || !excerpt) {
      setError("Title and excerpt are required.");
      return;
    }
    setLoading(true);
    const payload = { title, category, excerpt, date, readTime };
    try {
      const res = await fetch(isEdit ? `/api/admin/news/${post!.id}` : "/api/admin/news", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save post.");
      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" span2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="AG20 Drops New Single" />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value as NewsPost["category"])} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Read Time">
          <input value={readTime} onChange={(e) => setReadTime(e.target.value)} className={inputClass} placeholder="3 min read" />
        </Field>
        <Field label="Date" span2>
          <input value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} placeholder="May 20, 2026" />
        </Field>
        <Field label="Excerpt" span2>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={inputClass} placeholder="Short summary shown on the news cards…" />
        </Field>
      </div>

      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        {isEdit ? "Save Changes" : "Publish Post"}
      </button>
    </form>
  );
}
