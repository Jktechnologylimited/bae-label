import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isDryRun, listBanks } from "@/lib/ticketing/paystack";

/** Bank list for the subaccount form's dropdown, so nobody types a code by hand. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (isDryRun()) {
    return NextResponse.json(
      { error: "Connect a Paystack secret key before setting up payouts — the bank list comes from Paystack." },
      { status: 400 }
    );
  }

  try {
    const banks = await listBanks();
    return NextResponse.json({ banks });
  } catch (err) {
    console.error("[paystack] could not list banks", err);
    return NextResponse.json(
      { error: "Couldn't load the bank list from Paystack. Check the secret key, then try again." },
      { status: 502 }
    );
  }
}
