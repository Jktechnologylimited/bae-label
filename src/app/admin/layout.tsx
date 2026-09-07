import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, Receipt, Ticket as TicketIcon, Users, ExternalLink, Mic2, Disc3, Newspaper } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import BaeMark from "@/components/brand/BaeMark";
import LogoutButton from "@/components/auth/LogoutButton";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/artists", label: "Artists", icon: Mic2 },
  { href: "/admin/releases", label: "Releases", icon: Disc3 },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/tickets", label: "Tickets", icon: TicketIcon },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/account");

  return (
    <div className="flex min-h-[calc(100vh-1px)] bg-ink text-paper">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-ink-soft sm:flex">
        <div className="flex items-center gap-2 border-b border-line px-5 py-5">
          <BaeMark size={30} className="text-paper" />
          <div>
            <p className="font-display text-sm font-black uppercase leading-none">BAE Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-paper/85 transition-colors hover:bg-ink-elevated"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line px-3 py-4">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper">
            <ExternalLink className="size-3.5" /> View Site
          </Link>
          <div className="mt-1 px-3 py-2.5">
            <p className="truncate text-xs text-muted">{user.email}</p>
            <LogoutButton className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper" />
          </div>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-line bg-ink-soft px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <BaeMark size={26} className="text-paper" />
            <p className="font-display text-sm font-black uppercase">BAE Admin</p>
          </div>
          <LogoutButton className="text-xs font-semibold uppercase tracking-[0.08em] text-muted" label="Out" />
        </div>
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-ink-soft px-3 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-paper/85"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
