import Link from "next/link";
import { LucideIcon, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import clsx from "clsx";

export function DocSection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-line py-10 first:pt-0 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center border border-line bg-ink-elevated">
          <Icon className="size-4 text-gold" />
        </span>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-paper">{title}</h2>
      </div>
      <div className="mt-5 space-y-4 pl-12 text-sm leading-relaxed text-paper/85">{children}</div>
    </section>
  );
}

export function DocSteps({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-4">
      {items.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-gold-ink">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-paper">{step.title}</p>
            <div className="mt-0.5 text-paper/70">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DocTip({ children, variant = "tip" }: { children: React.ReactNode; variant?: "tip" | "warning" }) {
  const Icon = variant === "warning" ? AlertTriangle : Lightbulb;
  return (
    <div
      className={clsx(
        "flex gap-2.5 border px-4 py-3 text-sm",
        variant === "warning" ? "border-bigdrip/40 bg-bigdrip/10 text-paper/90" : "border-gold/40 bg-gold/10 text-paper/90"
      )}
    >
      <Icon className={clsx("size-4 shrink-0", variant === "warning" ? "text-bigdrip" : "text-gold")} />
      <div>{children}</div>
    </div>
  );
}

export function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 font-semibold text-gold underline underline-offset-2 hover:text-white">
      {children}
      <ArrowRight className="size-3" />
    </Link>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <code className="border border-line bg-ink-elevated px-1.5 py-0.5 font-mono text-[12px] text-paper/90">{children}</code>;
}
