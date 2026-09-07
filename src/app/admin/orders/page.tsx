import type { Metadata } from "next";
import { listOrders } from "@/lib/ticketing/store";
import { listEvents } from "@/lib/db/events";
import { formatNaira } from "@/lib/data";

export const metadata: Metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage() {
  const [orders, events] = await Promise.all([listOrders(), listEvents()]);
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? id;

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} total.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Event</th>
              <th className="py-2 pr-4">Buyer</th>
              <th className="py-2 pr-4">Tickets</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => (
              <tr key={o.id} className="border-b border-line-soft">
                <td className="py-3 pr-4 font-medium">{o.id}</td>
                <td className="py-3 pr-4">{eventName(o.eventId)}</td>
                <td className="py-3 pr-4">
                  {o.buyerName}
                  <br />
                  <span className="text-xs text-muted">{o.buyerEmail}</span>
                </td>
                <td className="py-3 pr-4">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="py-3 pr-4 font-semibold">{formatNaira(o.total)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      o.status === "paid"
                        ? "text-elmayana"
                        : o.status === "pending"
                        ? "text-gold"
                        : "text-bigdrip"
                    }
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="py-8 text-sm text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
