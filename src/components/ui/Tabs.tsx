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
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-y border-black/10 py-1">
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
              isActive ? "bg-ink text-paper" : "text-muted-onlight hover:text-ink"
            )}
          >
            {Icon && <Icon className="size-3.5" />}
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
