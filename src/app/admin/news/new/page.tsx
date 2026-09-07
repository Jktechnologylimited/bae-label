import type { Metadata } from "next";
import NewsForm from "../NewsForm";

export const metadata: Metadata = { title: "Admin — New Post" };

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">New Post</h1>
      <p className="mt-1 text-sm text-muted">This appears immediately on /news once saved.</p>
      <div className="mt-6">
        <NewsForm />
      </div>
    </div>
  );
}
