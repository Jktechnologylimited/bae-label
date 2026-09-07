import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEvent } from "@/lib/db/events";
import { getUserByEmail } from "@/lib/db/users";
import { issueManualTicket } from "@/lib/ticketing/store";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { eventId, tierName, holderName, buyerEmail } = await req.json();
  if (!eventId || !tierName || !holderName || !buyerEmail) {
    return NextResponse.json({ error: "Event, tier, holder name and email are required." }, { status: 400 });
  }

  const event = await getEvent(eventId);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!event.tiers.some((t) => t.name === tierName)) {
    return NextResponse.json({ error: "Unknown ticket tier for this event." }, { status: 400 });
  }

  // Link to an existing account by email if one exists, so the ticket shows
  // up on that customer's dashboard — but don't auto-create an account for a
  // manually-issued ticket the way checkout does.
  const existingUser = await getUserByEmail(buyerEmail);

  const { ticket } = await issueManualTicket({
    eventId,
    tierName,
    holderName,
    buyerEmail,
    userId: existingUser?.id,
  });

  return NextResponse.json({ ticket });
}
