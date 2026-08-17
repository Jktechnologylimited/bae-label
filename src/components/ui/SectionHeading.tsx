import clsx from "clsx";
import Eyebrow from "./Eyebrow";
import Button from "./Button";

export default function SectionHeading({
  eyebrow,
  title,
  action,
  actionHref,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  actionHref?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:justify-center sm:text-center",
        className
      )}
    >
      <div className={clsx(align === "center" && "sm:mx-auto")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          className={clsx(
            "mt-3 font-display text-3xl font-black uppercase tracking-tightest sm:text-4xl",
            light ? "text-ink" : "text-paper"
          )}
        >
          {title}
        </h2>
      </div>
      {action && actionHref && (
        <Button href={actionHref} variant={light ? "outline-light" : "outline-dark"} className="shrink-0">
          {action}
        </Button>
      )}
    </div>
  );
}
