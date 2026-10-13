import { query } from "./pg";

export interface SiteSettings {
  whatsappEnabled: boolean;
  whatsappNumber: string; // digits only, country code first, e.g. "2348012345678"
  whatsappGreeting: string;
  whatsappQuickReplies: string[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappEnabled: true,
  whatsappNumber: "2348001234567",
  whatsappGreeting: "Hey! 👋 Welcome to BAE. What can we help you with today?",
  whatsappQuickReplies: [
    "I need help with a ticket order",
    "I want to submit my music",
    "Booking / partnership inquiry",
    "Something else",
  ],
};

const SETTINGS_ID = "singleton";

interface Row {
  data: Partial<SiteSettings>;
}

export async function getSettings(): Promise<SiteSettings> {
  const rows = await query<Row>(`SELECT data FROM site_settings WHERE id = $1`, [SETTINGS_ID]);
  if (rows.length === 0) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...rows[0].data };
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await query(
    `INSERT INTO site_settings (id, data) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [SETTINGS_ID, JSON.stringify(next)]
  );
  return next;
}
