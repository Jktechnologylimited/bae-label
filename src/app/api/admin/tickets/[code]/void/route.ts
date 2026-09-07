import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { voidTicket } from "@/lib/ticketing/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { code } = await params;
  const ticket = await voidTicket(code);
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  return NextResponse.json({ ticket });
}
