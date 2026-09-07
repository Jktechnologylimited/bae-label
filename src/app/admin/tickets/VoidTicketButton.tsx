"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";

export default function VoidTicketButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVoid() {
    if (!confirm(`Void ticket ${code}? This can't be undone.`)) return;
    setLoading(true);
    await fetch(`/api/admin/tickets/${code}/void`, { method: "POST" });
    router.refresh();
  }

  return (
    <button
      onClick={handleVoid}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-bigdrip disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Ban className="size-3.5" />}
      Void
    </button>
  );
}
