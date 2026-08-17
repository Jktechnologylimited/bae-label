import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { LABELS } from "@/lib/data";
import { LABEL_CLASSES } from "@/lib/labelStyle";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default function LabelStrip({ title = "Three Identities. One Family." }: { title?: string }) {
  return (
    <section className="border-t border-black/10 bg-paper-soft py-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>The Three Labels</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
              {title}
            </h2>
          </div>
          <Button href="/about" variant="outline-light">
            Explore Our Labels
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LABELS.map((label) => {
            const cls = LABEL_CLASSES[label.slug];
            return (
              <Link
                key={label.slug}
                href={`/artists?label=${label.slug}`}
                className="group flex items-center justify-between gap-3 border border-black/10 bg-white px-5 py-5 transition-colors hover:border-ink"
              >
                <div>
                  <p className={clsx("font-display text-lg font-black uppercase tracking-tight", cls.text)}>
                    {label.wordmark}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-onlight">{label.name}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
