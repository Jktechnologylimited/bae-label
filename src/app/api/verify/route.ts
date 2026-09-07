import { NextRequest, NextResponse } from "next/server";
import { getTicket, updateTicket } from "@/lib/ticketing/store";
import { getEvent } from "@/lib/db/events";

export async function POST(req: NextRequest) {
  try {
    const { code, staff } = (await req.json()) as { code: string; staff?: string };
    if (!code) return NextResponse.json({ error: "Missing ticket code." }, { status: 400 });

    const ticket = await getTicket(code.trim().toUpperCase());
    if (!ticket) {
      return NextResponse.json({ result: "invalid", message: "Ticket not found." }, { status: 404 });
    }

    const event = await getEvent(ticket.eventId);

    if (ticket.status === "used") {
      return NextResponse.json({
        result: "already_used",
        message: `Already scanned at ${ticket.usedAt ? new Date(ticket.usedAt).toLocaleString() : "an earlier time"}.`,
        ticket,
        event,
      });
    }

    if (ticket.status === "void") {
      return NextResponse.json({ result: "void", message: "This ticket has been voided.", ticket, event });
    }

    const updated = await updateTicket(ticket.code, {
      status: "used",
      usedAt: new Date().toISOString(),
      usedBy: staff,
    });

    return NextResponse.json({ result: "ok", message: "Entry approved.", ticket: updated, event });
  } catch (err) {
    console.error("[verify] error", err);
    return NextResponse.json({ error: "Something went wrong verifying the ticket." }, { status: 500 });
  }
}
