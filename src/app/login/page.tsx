import { Suspense } from "react";
import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LoginClient />
    </Suspense>
  );
}
