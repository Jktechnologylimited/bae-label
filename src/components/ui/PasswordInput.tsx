"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

/**
 * Password field with a show/hide toggle.
 *
 * Typing a long password on a phone keyboard with no way to check it is the
 * most common reason people fail a login they'd otherwise pass, so every
 * password field in the app uses this.
 *
 * `tone` matches the surface it sits on: "dark" for the ink-coloured auth
 * pages, "light" for the white account forms.
 */
export default function PasswordInput({
  value,
  onChange,
  ariaLabel,
  placeholder,
  tone = "dark",
  required = false,
  minLength,
  autoComplete,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  tone?: "dark" | "light";
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={className}
        // Inline, not a Tailwind class: these inputs come with their own
        // `px-4`, and which of the two wins would depend on stylesheet order.
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className={clsx(
          "absolute right-0 top-0 flex h-full items-center px-3 transition-colors",
          tone === "dark" ? "text-muted hover:text-paper" : "text-muted-onlight hover:text-ink"
        )}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
