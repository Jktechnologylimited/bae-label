"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/admin", "/login", "/signup", "/verify"];

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
