import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings, pickSettingsPatch, updateSettings } from "@/lib/db/settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
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

  // Validated field by field: these values render in the site-wide WhatsApp
  // widget, so one malformed value here used to break every page (M4).
  const picked = pickSettingsPatch(raw);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });

  const settings = await updateSettings(picked.patch);
  return NextResponse.json({ settings });
}
