import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import clsx from "clsx";

type Variant = "gold" | "outline-dark" | "outline-light" | "dark" | "ghost";
type IconType = "arrow" | "ticket" | "none";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  icon?: IconType;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantClasses: Record<Variant, string> = {
  gold: "bg-gold text-gold-ink hover:bg-white",
  dark: "bg-paper text-ink hover:bg-gold",
  "outline-dark": "border border-line text-paper hover:border-gold hover:text-gold",
  "outline-light": "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-paper hover:text-gold",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "gold",
  icon = "arrow",
  className,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = clsx(
    "group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200",
    variantClasses[variant],
    disabled && "pointer-events-none opacity-40",
    className
  );

  const content = (
    <>
      {children}
      {icon === "arrow" && (
        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      )}
      {icon === "ticket" && <Ticket className="size-3.5" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {content}
    </button>
  );
}
