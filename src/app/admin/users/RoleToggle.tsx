"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function RoleToggle({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: "admin" | "customer";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (isSelf) return;
    setLoading(true);
    const nextRole = role === "admin" ? "customer" : "admin";
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={isSelf || loading}
      className={clsx(
        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] disabled:opacity-60",
        role === "admin" ? "bg-gold/20 text-gold" : "bg-line text-muted"
      )}
      title={isSelf ? "You can't change your own role" : `Make ${role === "admin" ? "customer" : "admin"}`}
    >
      {role}
    </button>
  );
}
