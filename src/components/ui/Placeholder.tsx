import clsx from "clsx";
import Image from "next/image";
import { LucideIcon, Music2 } from "lucide-react";

const TONES = {
  ink: { from: "#1b1b1e", to: "#0a0a0b", ring: "rgba(255,255,255,0.08)" },
  gold: { from: "#5a4200", to: "#0a0a0b", ring: "rgba(244,180,0,0.35)" },
  bigdripuniverse: { from: "#4a0f0d", to: "#0a0a0b", ring: "rgba(228,52,47,0.4)" },
  ag20: { from: "#0f2452", to: "#0a0a0b", ring: "rgba(47,111,239,0.4)" },
  elmayanaconcept: { from: "#0d3a1f", to: "#0a0a0b", ring: "rgba(31,181,88,0.4)" },
} as const;

export type Tone = keyof typeof TONES;

export default function Placeholder({
  tone = "ink",
  icon: Icon = Music2,
  label,
  className,
  aspect = "aspect-[4/5]",
  pattern = "diagonal",
  imageUrl,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  label?: string;
  className?: string;
  aspect?: string;
  pattern?: "diagonal" | "grid" | "none";
  /** When provided (e.g. from an admin-uploaded photo), renders the real
   * image instead of the decorative gradient/pattern art below. */
  imageUrl?: string;
}) {
  const c = TONES[tone];

  if (imageUrl) {
    return (
      <div className={clsx("relative overflow-hidden bg-ink-elevated", aspect, className)}>
        <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
        {label && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/80">{label}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx("relative overflow-hidden bg-ink-elevated", aspect, className)}
      style={{
        backgroundImage: `radial-gradient(120% 120% at 15% 10%, ${c.from} 0%, ${c.to} 60%)`,
      }}
    >
      {pattern === "diagonal" && (
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `repeating-linear-gradient(115deg, transparent 0 18px, ${c.ring} 18px 19px)`,
          }}
        />
      )}
      {pattern === "grid" && (
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(${c.ring} 1px, transparent 1px), linear-gradient(90deg, ${c.ring} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}
      <div className="absolute inset-0 bg-grain" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="size-8 text-paper/25" strokeWidth={1.25} />
      </div>
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/80">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
