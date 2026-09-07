import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyClient from "./VerifyClient";

export const metadata: Metadata = {
  title: "Ticket Verification",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <div className="bg-ink">
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <VerifyClient />
      </Suspense>
    </div>
  );
}
