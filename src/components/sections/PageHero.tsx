import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import Placeholder from "@/components/ui/Placeholder";
import { Tone } from "@/components/ui/Placeholder";
import clsx from "clsx";

export default function PageHero({
  crumb,
  title,
  description,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  tone = "ink",
  extra,
}: {
  crumb: string;
  title: string;
  description: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  tone?: Tone;
  extra?: React.ReactNode;
}) {
  return (
    <section className="border-b border-black/10">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-8 lg:px-10 lg:pt-10">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: crumb }]} />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div>
            <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tightest text-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-onlight">{description}</p>
            {(primaryCta || secondaryCta) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {primaryCta && primaryHref && (
                  <Button href={primaryHref} variant="dark">
                    {primaryCta}
                  </Button>
                )}
                {secondaryCta && secondaryHref && (
                  <Button href={secondaryHref} variant="outline-light" icon="ticket">
                    {secondaryCta}
                  </Button>
                )}
              </div>
            )}
            {extra}
          </div>
          <div className={clsx("relative aspect-[16/10] w-full overflow-hidden lg:aspect-[4/3]")}>
            <Placeholder tone={tone} aspect="aspect-auto h-full" pattern="grid" />
          </div>
        </div>
      </div>
    </section>
  );
}
