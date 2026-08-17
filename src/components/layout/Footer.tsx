import Link from "next/link";
import BaeMark from "@/components/brand/BaeMark";
import SocialIcon from "@/components/brand/SocialIcon";
import NewsletterForm from "./NewsletterForm";
import WorldDots from "./WorldDots";
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="border-t border-line-soft bg-ink text-paper">
      <div className="border-b border-line-soft">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Join the BAE Community
            </p>
            <h3 className="mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tightest sm:text-4xl">
              One Movement.
              <br />
              Endless Culture.
            </h3>
            <p className="mt-3 text-sm text-muted">
              Stay updated with new music, events, drops and exclusive experiences.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <BaeMark size={40} className="text-paper" />
              <span className="font-display text-xl font-black uppercase">BAE</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Three labels. One vision. Building the future of music and culture — BigDripUniverse, AG20 and
              ElmayanaConcept, together.
            </p>
            <div className="mt-5 flex items-center gap-4 text-muted">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="transition-colors hover:text-gold"
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-paper/85 transition-colors hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/85">
              <li>info@bae.band</li>
              <li>+1 (234) 567-8900</li>
              <li>Los Angeles, CA</li>
            </ul>
          </div>
        </div>

        <WorldDots className="pointer-events-none absolute bottom-6 right-6 hidden h-32 w-52 text-paper/10 lg:block" />
      </div>

      <div className="border-t border-line-soft">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-5 text-[11px] text-muted sm:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} BAE. All Rights Reserved.</p>
          <p>BigDripUniverse · AG20 · ElmayanaConcept</p>
        </div>
      </div>
    </footer>
  );
}
