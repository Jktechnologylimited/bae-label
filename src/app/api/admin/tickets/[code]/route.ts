import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateTicket, deleteTicket } from "@/lib/ticketing/store";
import { Ticket } from "@/lib/ticketing/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { code } = await params;
  const body = (await req.json()) as Partial<Pick<Ticket, "holderName" | "tierName" | "status">>;

  const allowed: Partial<Ticket> = {};
  if (body.holderName !== undefined) allowed.holderName = body.holderName;
  if (body.tierName !== undefined) allowed.tierName = body.tierName;
  if (body.status !== undefined) {
    if (!["valid", "used", "void"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    allowed.status = body.status;
  }

  const ticket = await updateTicket(code, allowed);
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  return NextResponse.json({ ticket });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { code } = await params;
  const ok = await deleteTicket(code);
  if (!ok) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
