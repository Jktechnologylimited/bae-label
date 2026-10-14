import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers, setUserRole } from "@/lib/db/users";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const role = (raw as { role?: unknown } | null)?.role;
  if (role !== "admin" && role !== "customer") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (id === user.id && role !== "admin") {
    return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
  }

  // Never let the last admin be demoted: with no admin left, nobody can manage
  // the site, and the bootstrap seed would have to create a fresh account.
  if (role !== "admin") {
    const target = (await listUsers()).find((u) => u.id === id);
    if (target?.role === "admin") {
      const admins = (await listUsers()).filter((u) => u.role === "admin");
      if (admins.length <= 1) {
        return NextResponse.json(
          { error: "This is the only admin account — promote someone else first." },
          { status: 400 }
        );
      }
    }
  }

  const updated = await setUserRole(id, role);
  if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
