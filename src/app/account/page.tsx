import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, MapPin, Ticket as TicketIcon, User as UserIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listOrdersByUser, getTicketsByOrder } from "@/lib/ticketing/store";
import { getEvent } from "@/lib/db/events";
import { generateTicketQr } from "@/lib/ticketing/qr";
import { formatNaira } from "@/lib/data";
import LogoutButton from "@/components/auth/LogoutButton";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = (await listOrdersByUser(user.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const ordersWithDetails = await Promise.all(
    orders.map(async (order) => {
      const [tickets, event] = await Promise.all([getTicketsByOrder(order.id), getEvent(order.eventId)]);
      const ticketsWithQr = await Promise.all(
        tickets.map(async (t) => ({
          ...t,
          qrDataUrl: await generateTicketQr(t.code, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
        }))
      );
      return { order, tickets: ticketsWithQr, event };
    })
  );

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center border border-black/15 bg-white">
                <UserIcon className="size-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-black uppercase tracking-tight">{user.name}</h1>
                <p className="text-sm text-muted-onlight">{user.email}</p>
              </div>
            </div>
            <LogoutButton className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-onlight hover:text-ink" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
        <h2 className="font-display text-lg font-black uppercase tracking-tight">My Tickets</h2>

        {ordersWithDetails.length === 0 && (
          <div className="mt-4 border border-dashed border-black/15 px-6 py-16 text-center">
            <TicketIcon className="mx-auto size-8 text-muted-onlight" />
            <p className="mt-3 text-sm text-muted-onlight">You haven&apos;t bought any tickets yet.</p>
            <Link
              href="/tickets"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink hover:text-gold"
            >
              Browse Events <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-8">
          {ordersWithDetails.map(({ order, tickets, event }) => (
            <div key={order.id} className="border border-black/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-paper-soft px-5 py-4">
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-tight">{event?.name ?? "Event"}</p>
                  {event && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-onlight">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {event.fullDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {event.venue}, {event.city}
                      </span>
                    </p>
                  )}
                </div>
                <span
                  className={
                    order.status === "paid"
                      ? "bg-elmayana/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-elmayana"
                      : order.status === "pending"
                      ? "bg-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gold-ink"
                      : "bg-bigdrip/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-bigdrip"
                  }
                >
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-black/10">
                {tickets.length === 0 && (
                  <p className="px-5 py-4 text-sm text-muted-onlight">
                    {order.status === "pending" ? "Payment pending — tickets will appear here once confirmed." : "No tickets on this order."}
                  </p>
                )}
                {tickets.map((t) => (
                  <Link
                    key={t.code}
                    href={`/ticket/${t.code}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper-soft"
                  >
                    <Image
                      src={t.qrDataUrl}
                      alt={`QR code for ${t.code}`}
                      width={48}
                      height={48}
                      unoptimized
                      className="shrink-0 border border-black/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.tierName}</p>
                      <p className="truncate text-xs text-muted-onlight">{t.code}</p>
                    </div>
                    <span
                      className={
                        t.status === "valid"
                          ? "shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-elmayana"
                          : t.status === "used"
                          ? "shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-onlight"
                          : "shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-bigdrip"
                      }
                    >
                      {t.status}
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-onlight" />
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-black/10 px-5 py-3 text-sm">
                <span className="text-muted-onlight">Order {order.id}</span>
                <span className="font-bold">{formatNaira(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16 lg:px-10">
        <h2 className="font-display text-lg font-black uppercase tracking-tight">Change Password</h2>
        <div className="mt-4 max-w-sm">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
