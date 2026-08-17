import clsx from "clsx";

export default function Eyebrow({
  children,
  className,
  dot = true,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold",
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-gold" />}
      {children}
    </div>
  );
}
