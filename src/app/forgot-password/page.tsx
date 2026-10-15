import { Suspense } from "react";
import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Your Password",
  // Private or credential-bearing page: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
