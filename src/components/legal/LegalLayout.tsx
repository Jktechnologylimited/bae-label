import { LucideIcon, Mail, Phone } from "lucide-react";
import LegalHero from "./LegalHero";
import Breadcrumb from "@/components/ui/Breadcrumb";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export default function LegalLayout({
  crumb,
  icon,
  title,
  description,
  lastUpdated,
  sections,
  contactEmail = "privacy@bae.band",
  contactPhone = "+1 (234) 567-8900",
}: {
  crumb: string;
  icon: LucideIcon;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  contactEmail?: string;
  contactPhone?: string;
}) {
  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-8 lg:px-10 lg:pt-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: crumb }]} />
          <div className="mt-6">
            <LegalHero icon={icon} title={title} description={description} lastUpdated={lastUpdated} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="border border-black/10 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">On This Page</p>
              <nav className="mt-3 space-y-2">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-muted-onlight transition-colors hover:text-ink"
                  >
                    {i + 1}. {s.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="border border-black/10 bg-paper-soft p-5">
              <span className="flex size-9 items-center justify-center border border-black/15 bg-white">
                <Mail className="size-4" />
              </span>
              <p className="mt-3 text-sm font-bold text-ink">Questions?</p>
              <p className="mt-1 text-xs text-muted-onlight">
                If you have any questions, please contact us.
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Mail className="size-3.5" /> {contactEmail}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Phone className="size-3.5" /> {contactPhone}
              </p>
            </div>
          </aside>

          <div className="min-w-0 divide-y divide-black/10">
            {sections.map((s, i) => (
              <div key={s.id} id={s.id} className="scroll-mt-28 py-6 first:pt-0">
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-onlight">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
