import type { Metadata } from "next";
import { Compass } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-lg px-6 py-24 text-center">
        <Compass className="mx-auto size-10 text-muted-onlight" />
        <p className="mt-4 font-display text-5xl font-black tracking-tight">404</p>
        <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-sm text-muted-onlight">
          The link may be out of date, or the page may have moved. Try the events, releases or news pages instead.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" variant="dark">
            Back to Home
          </Button>
          <Button href="/events" variant="outline-light" icon="none">
            Browse Events
          </Button>
        </div>
      </section>
    </div>
  );
}
