import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createEvent } from "@/lib/db/events";
import { missingFields, missingKeys, pickEventPatch } from "@/lib/adminPayload";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const picked = pickEventPatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  // `labels` and `tiers` must be *present* because the public pages index into
  // them (`LABEL_CLASSES[event.labels[0]]`, `event.tiers.find(...)`) — an event
  // stored without them crashes those pages for every visitor. `tiers` may be
  // an empty list (past events have none); `labels` may not (the validator
  // rejects an empty list).
  const missing = missingFields(picked.patch, ["name", "fullDate", "city", "venue"]) ?? missingKeys(picked.patch, ["labels", "tiers"]);
  if (missing) return NextResponse.json({ error: `${missing} is required.` }, { status: 400 });

  const event = await createEvent(picked.patch as Parameters<typeof createEvent>[0]);
  return NextResponse.json({ event }, { status: 201 });
}
