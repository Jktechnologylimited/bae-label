import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Receipt, Ticket as TicketIcon, TrendingUp, ArrowRight } from "lucide-react";
import { listEvents } from "@/lib/db/events";
import { listOrders, listTickets } from "@/lib/ticketing/store";
import { formatNaira } from "@/lib/data";
import { isFirstAdminStillDefault } from "@/lib/db/seed";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminOverviewPage() {
  const [events, orders, tickets, defaultAdminStillActive] = await Promise.all([
    listEvents(),
    listOrders(),
    listTickets(),
    isFirstAdminStillDefault(),
  ]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const usedTickets = tickets.filter((t) => t.status === "used").length;
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;

  const stats = [
    { label: "Revenue", value: formatNaira(revenue), icon: TrendingUp, href: "/admin/orders" },
    { label: "Orders", value: String(orders.length), icon: Receipt, href: "/admin/orders" },
    { label: "Tickets Sold", value: `${tickets.length} (${usedTickets} scanned)`, icon: TicketIcon, href: "/admin/tickets" },
    { label: "Upcoming Events", value: String(upcomingCount), icon: CalendarDays, href: "/admin/events" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted">Welcome back — here&apos;s what&apos;s happening across BAE.</p>

      {defaultAdminStillActive && (
        <div className="mt-6 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-paper">
          You&apos;re still using the seeded default admin password. Head to{" "}
          <Link href="/account" className="font-semibold underline underline-offset-2">
            your account
          </Link>{" "}
          and change it before this goes live.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-line bg-ink-soft p-5 transition-colors hover:border-gold">
            <s.icon className="size-5 text-gold" />
            <p className="mt-3 font-display text-2xl font-black">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-line bg-ink-soft p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-tight">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper">
              View All <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line-soft">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{o.id}</p>
                  <p className="text-xs text-muted">{o.buyerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatNaira(o.total)}</p>
                  <p className="text-xs text-muted capitalize">{o.status}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="py-4 text-sm text-muted">No orders yet.</p>}
          </div>
        </div>

        <div className="border border-line bg-ink-soft p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-tight">Events</h2>
            <Link href="/admin/events" className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper">
              Manage <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line-soft">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-muted">{e.city} · {e.fullDate}</p>
                </div>
                <span className="text-xs capitalize text-muted">{e.status}</span>
              </div>
            ))}
            {events.length === 0 && <p className="py-4 text-sm text-muted">No events yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
