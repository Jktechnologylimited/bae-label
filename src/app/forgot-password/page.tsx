import { Suspense } from "react";
import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = { title: "Reset Your Password" };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
