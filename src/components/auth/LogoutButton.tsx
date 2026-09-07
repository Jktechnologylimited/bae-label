"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function LogoutButton({ className, label = "Log Out" }: { className?: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={clsx("flex items-center gap-1.5 disabled:opacity-60", className)}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      {label}
    </button>
  );
}
