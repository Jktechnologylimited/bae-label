"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Route-level error boundary. Every page in this app queries Postgres during
 * render, so without this a database hiccup showed the framework's bare error
 * page on every route with no way back.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] unhandled error while rendering", error);
  }, [error]);

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertTriangle className="mx-auto size-10 text-bigdrip" />
        <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-onlight">
          We hit a problem loading this page. It&apos;s usually temporary — try again, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="dark" icon="none">
            Try again
          </Button>
          <Button href="/" variant="outline-light">
            Back to Home
          </Button>
        </div>
      </section>
    </div>
  );
}
