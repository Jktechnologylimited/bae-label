import type { Metadata } from "next";
import { getSettings } from "@/lib/db/settings";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted">Site-wide configuration, starting with the WhatsApp chat widget.</p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
