import Link from "next/link";
import SocialIcon from "@/components/brand/SocialIcon";
import { SOCIAL_LINKS } from "@/lib/nav";

export default function AnnouncementBar() {
  return (
    <div className="hidden border-b border-line-soft bg-black text-paper md:block">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] lg:px-10">
        <p className="text-muted">Three Labels. One Movement.</p>
        <div className="flex items-center gap-5">
          <Link href="/contact" className="text-paper transition-colors hover:text-gold">
            Join the Movement
          </Link>
          <div className="flex items-center gap-3 text-muted">
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
      </div>
    </div>
  );
}
