import type { Metadata } from "next";
import ReleaseForm from "../ReleaseForm";

export const metadata: Metadata = { title: "Admin — New Release" };

export default function NewReleasePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">New Release</h1>
      <p className="mt-1 text-sm text-muted">This appears immediately on /releases once saved.</p>
      <div className="mt-6">
        <ReleaseForm />
      </div>
    </div>
  );
}
