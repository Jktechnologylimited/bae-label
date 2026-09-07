import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { finalizeOrder } from "@/lib/ticketing/finalize";
import { formatNaira } from "@/lib/data";
import { getEvent } from "@/lib/db/events";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Order Confirmation" };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; reference?: string; trxref?: string; dryRun?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order;

  if (!orderId) {
    return (
      <ErrorState message="No order was specified. If you just paid, check the email you used at checkout for your ticket links." />
    );
  }

  const result = await finalizeOrder(orderId, {
    reference: params.reference ?? params.trxref,
    dryRun: params.dryRun === "1",
  });

  if ("error" in result) {
    return <ErrorState message={result.error} />;
  }

  const { order, tickets } = result;
  const event = await getEvent(order.eventId);

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-2xl px-6 py-16 text-center lg:px-10">
        <CheckCircle2 className="mx-auto size-12 text-elmayana" />
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
          You&apos;re Going!
        </h1>
        <p className="mt-3 text-sm text-muted-onlight">
          Order <span className="font-semibold text-ink">{order.id}</span> is confirmed for{" "}
          <span className="font-semibold text-ink">{event?.name ?? "your event"}</span>. We&apos;ve emailed your
          digital tickets to <span className="font-semibold text-ink">{order.buyerEmail}</span>.
        </p>

        <div className="mt-10 divide-y divide-black/10 border-y border-black/10 text-left">
          {tickets.map((t, i) => (
            <div key={t.code} className="flex items-center gap-4 py-4">
              <Image
                src={t.qrDataUrl}
                alt={`QR code for ticket ${t.code}`}
                width={56}
                height={56}
                className="shrink-0 border border-black/10"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Ticket {i + 1} · {t.tierName}
                </p>
                <p className="truncate text-xs text-muted-onlight">{t.code}</p>
              </div>
              <Link
                href={`/ticket/${t.code}`}
                className="flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink hover:text-gold"
              >
                View <ArrowRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between text-sm text-muted-onlight">
          <span>Total Paid</span>
          <span className="font-bold text-ink">{formatNaira(order.total)}</span>
        </div>

        <Button href="/events" variant="dark" className="mt-10">
          Browse More Events
        </Button>
      </section>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-lg px-6 py-20 text-center lg:px-10">
        <XCircle className="mx-auto size-12 text-bigdrip" />
        <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight">Couldn&apos;t Confirm Order</h1>
        <p className="mt-3 text-sm text-muted-onlight">{message}</p>
        <Button href="/tickets" variant="dark" className="mt-8">
          Back to Tickets
        </Button>
      </section>
    </div>
  );
}
