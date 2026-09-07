import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRelease } from "@/lib/db/releases";
import ReleaseForm from "../ReleaseForm";

export const metadata: Metadata = { title: "Admin — Edit Release" };

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = await getRelease(id);
  if (!release) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Edit Release</h1>
      <p className="mt-1 text-sm text-muted">{release.title}</p>
      <div className="mt-6">
        <ReleaseForm release={release} />
      </div>
    </div>
  );
}
