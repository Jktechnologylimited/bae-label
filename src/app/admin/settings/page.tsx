import type { Metadata } from "next";
import { getSettings } from "@/lib/db/settings";
import SettingsForm from "./SettingsForm";
import SubaccountForm from "./SubaccountForm";
import { paystackMode } from "@/lib/ticketing/paystack";

export const metadata: Metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted">Site-wide configuration — the WhatsApp widget and where ticket money goes.</p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>

      <div className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg font-black uppercase tracking-tight">Ticket payouts</h2>
        <p className="mt-1 text-sm text-muted">
          Where ticket revenue settles. Without this, payments settle entirely to the main Paystack account.
        </p>
        <div className="mt-5">
          <SubaccountForm
            mode={paystackMode()}
            current={{
              code: settings.paystackSubaccountCode,
              name: settings.paystackSubaccountName,
              bankName: settings.paystackSubaccountBankName,
              accountLast4: settings.paystackSubaccountAccountLast4,
              percentage: settings.paystackSubaccountPercentage,
            }}
          />
        </div>
      </div>
    </div>
  );
}
