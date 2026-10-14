"use client";

import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export default function Tabs({
  items,
  active,
  onChange,
  label,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  /** Accessible name for the tab list, e.g. "News categories". */
  label?: string;
}) {
  // Left/right arrows move between tabs, as expected of a tablist.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const currentIndex = items.findIndex((item) => item.key === active);
    if (currentIndex === -1 || items.length === 0) return;
    event.preventDefault();
    const nextIndex =
      event.key === "ArrowRight"
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    onChange(items[nextIndex]!.key);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex flex-wrap items-center gap-1 overflow-x-auto border-y border-black/10 py-1"
    >
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
              isActive ? "bg-ink text-paper" : "text-muted-onlight hover:text-ink"
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {item.label}
            {typeof item.count === "number" && (
              <span className={clsx("text-[10px]", isActive ? "text-paper/60" : "text-muted-onlight/70")}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
