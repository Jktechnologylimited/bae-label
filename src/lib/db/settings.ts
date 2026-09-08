import { readJsonObject, writeJsonObject, dataFile } from "./client";

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

const FILE = dataFile("settings.json");

export async function getSettings(): Promise<SiteSettings> {
  return readJsonObject<SiteSettings>(FILE, DEFAULT_SETTINGS);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await writeJsonObject(FILE, next);
  return next;
}
