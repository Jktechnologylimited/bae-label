import { LucideIcon } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";

export default function LegalHero({
  icon: Icon,
  title,
  description,
  lastUpdated,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  lastUpdated: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
      <div>
        <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tightest text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-onlight">{description}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-onlight">
          Last updated: {lastUpdated}
        </p>
      </div>
      <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 overflow-hidden bg-ink lg:aspect-[4/3]">
        <div className="bg-grain absolute inset-0 opacity-40" />
        <Icon className="relative size-10 text-paper" strokeWidth={1.5} />
        <BaeMark size={44} className="relative text-paper" />
      </div>
    </div>
  );
}
