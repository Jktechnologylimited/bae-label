import type { Metadata } from "next";
import { listUsers } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/auth/session";
import RoleToggle from "./RoleToggle";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([listUsers(), getCurrentUser()]);
  const sorted = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-muted">
        {users.length} accounts · customer accounts are created automatically at checkout.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} className="border-b border-line-soft">
                <td className="py-3 pr-4">{u.name}</td>
                <td className="py-3 pr-4">{u.email}</td>
                <td className="py-3 pr-4">
                  <RoleToggle userId={u.id} role={u.role} isSelf={u.id === currentUser?.id} />
                </td>
                <td className="py-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
