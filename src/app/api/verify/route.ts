import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { claimTicketForEntry, getTicket } from "@/lib/ticketing/store";
import { getEvent } from "@/lib/db/events";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * Redeems a ticket at the door — admin-only.
 *
 * This handler previously had no authentication whatsoever (and the middleware
 * matcher only covers page paths, not `/api/verify`), so anyone could mark
 * tickets as used, read holder names for guessed codes, and forge the
 * `usedBy` audit field. The scanning identity now comes from the session, not
 * the request body.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const limited = enforceRateLimit(req, "verify", 120, 60 * 1000, user.id);
  if (limited) return limited;

  try {
    const body = (await req.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!code) return NextResponse.json({ error: "Missing ticket code." }, { status: 400 });

    const ticket = await getTicket(code.toUpperCase());
    if (!ticket) {
      return NextResponse.json({ result: "invalid", message: "Ticket not found." }, { status: 404 });
    }

    const event = await getEvent(ticket.eventId);

    // Single conditional UPDATE: exactly one of two simultaneous scans wins.
    // `usedBy` is the signed-in staff account, so the audit trail can't be
    // forged from the request.
    const claim = await claimTicketForEntry(ticket.code, new Date().toISOString(), user.email);

    if (claim.ok) {
      return NextResponse.json({ result: "ok", message: "Entry approved.", ticket: claim.ticket, event });
    }

    const current = (await getTicket(ticket.code)) ?? ticket;

    if (claim.reason === "already_used") {
      return NextResponse.json({
        result: "already_used",
        message: `Already scanned at ${current.usedAt ? new Date(current.usedAt).toLocaleString() : "an earlier time"}.`,
        ticket: current,
        event,
      });
    }

    if (claim.reason === "void") {
      return NextResponse.json({ result: "void", message: "This ticket has been voided.", ticket: current, event });
    }

    return NextResponse.json({ result: "invalid", message: "Ticket not found." }, { status: 404 });
  } catch (err) {
    console.error("[verify] error", err);
    return NextResponse.json({ error: "Something went wrong verifying the ticket." }, { status: 500 });
  }
}
