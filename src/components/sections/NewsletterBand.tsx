import { LucideIcon, Calendar } from "lucide-react";
import NewsletterForm from "@/components/layout/NewsletterForm";

export default function NewsletterBand({
  icon: Icon = Calendar,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-ink py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center border border-line text-paper">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-paper">{title}</h3>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          </div>
        </div>
        <NewsletterForm ctaLabel="Join BAE" />
      </div>
    </section>
  );
}
