import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { setUserRole } from "@/lib/db/users";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { role } = (await req.json()) as { role: "admin" | "customer" };
  if (role !== "admin" && role !== "customer") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (id === user.id && role !== "admin") {
    return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
  }

  const updated = await setUserRole(id, role);
  if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
