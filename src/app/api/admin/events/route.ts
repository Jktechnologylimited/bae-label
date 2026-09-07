import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createEvent } from "@/lib/db/events";
import { BaeEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await req.json()) as Omit<BaeEvent, "id">;
  if (!body.name || !body.city || !body.venue) {
    return NextResponse.json({ error: "Name, city and venue are required." }, { status: 400 });
  }

  const event = await createEvent(body);
  return NextResponse.json({ event });
}
