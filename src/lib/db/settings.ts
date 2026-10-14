import { query } from "./pg";

export interface SiteSettings {
  whatsappEnabled: boolean;
  whatsappNumber: string; // digits only, country code first, e.g. "2348012345678"
  whatsappGreeting: string;
  whatsappQuickReplies: string[];

  /**
   * Paystack split-payment configuration. Set by the "Create subaccount" flow
   * in /admin/settings, not typed in by hand — the code only exists after
   * Paystack has accepted the bank account, and it is environment-specific
   * (a subaccount created with a test key will NOT work with a live key).
   *
   * When `paystackSubaccountCode` is set, every ticket payment is split: the
   * subaccount's share settles straight to its bank account.
   */
  paystackSubaccountCode?: string;
  /** Account name the bank returned, for display/confirmation. */
  paystackSubaccountName?: string;
  /** Last 4 digits only — never store the full account number. */
  paystackSubaccountAccountLast4?: string;
  paystackSubaccountBankName?: string;
  /** Share the MAIN Paystack account keeps. 0 = everything settles to the subaccount. */
  paystackSubaccountPercentage?: number;
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

const MAX_GREETING = 300;
const MAX_REPLY = 120;
const MAX_REPLIES = 8;

interface Row {
  data: unknown;
}

/**
 * Coerces whatever is stored (which is untyped JSON) into a well-formed
 * `SiteSettings`, falling back to the default for any field that is missing or
 * the wrong shape.
 *
 * This matters because the root layout renders the WhatsApp widget on every
 * page: a single malformed value — `whatsappQuickReplies` stored as a string,
 * say — used to make `settings.whatsappQuickReplies.map(...)` throw and take
 * down every route on the site, not just the admin page that wrote it.
 */
export function normalizeSettings(stored: unknown): SiteSettings {
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return DEFAULT_SETTINGS;
  const raw = stored as Record<string, unknown>;

  const settings: SiteSettings = {
    whatsappEnabled: typeof raw.whatsappEnabled === "boolean" ? raw.whatsappEnabled : DEFAULT_SETTINGS.whatsappEnabled,
    whatsappNumber:
      typeof raw.whatsappNumber === "string" && /^\d{8,15}$/.test(raw.whatsappNumber)
        ? raw.whatsappNumber
        : DEFAULT_SETTINGS.whatsappNumber,
    whatsappGreeting:
      typeof raw.whatsappGreeting === "string" && raw.whatsappGreeting.trim() !== ""
        ? raw.whatsappGreeting.slice(0, MAX_GREETING)
        : DEFAULT_SETTINGS.whatsappGreeting,
    whatsappQuickReplies:
      Array.isArray(raw.whatsappQuickReplies) && raw.whatsappQuickReplies.every((r) => typeof r === "string")
        ? (raw.whatsappQuickReplies as string[]).slice(0, MAX_REPLIES).map((r) => r.slice(0, MAX_REPLY))
        : DEFAULT_SETTINGS.whatsappQuickReplies,
  };

  // Carry the Paystack split configuration through every read. Without this,
  // saving the WhatsApp settings would re-normalise from the defaults and
  // silently drop the subaccount — which would quietly stop splitting payments.
  if (typeof raw.paystackSubaccountCode === "string" && raw.paystackSubaccountCode.trim() !== "") {
    settings.paystackSubaccountCode = raw.paystackSubaccountCode.trim();
    if (typeof raw.paystackSubaccountName === "string") settings.paystackSubaccountName = raw.paystackSubaccountName;
    if (typeof raw.paystackSubaccountBankName === "string") {
      settings.paystackSubaccountBankName = raw.paystackSubaccountBankName;
    }
    if (typeof raw.paystackSubaccountAccountLast4 === "string") {
      settings.paystackSubaccountAccountLast4 = raw.paystackSubaccountAccountLast4;
    }
    if (typeof raw.paystackSubaccountPercentage === "number" && Number.isFinite(raw.paystackSubaccountPercentage)) {
      settings.paystackSubaccountPercentage = raw.paystackSubaccountPercentage;
    }
  }

  return settings;
}

/**
 * Validates an admin settings PATCH. Only known fields are accepted, each with
 * the right type, and unknown keys are rejected rather than stored.
 */
export function pickSettingsPatch(raw: unknown): { ok: true; patch: Partial<SiteSettings> } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Expected a JSON object." };
  }
  const input = raw as Record<string, unknown>;
  const known = ["whatsappEnabled", "whatsappNumber", "whatsappGreeting", "whatsappQuickReplies"];
  for (const key of Object.keys(input)) {
    if (!known.includes(key)) return { ok: false, error: `Unknown setting: ${key}.` };
  }

  const patch: Partial<SiteSettings> = {};

  if ("whatsappEnabled" in input) {
    if (typeof input.whatsappEnabled !== "boolean") {
      return { ok: false, error: "whatsappEnabled must be true or false." };
    }
    patch.whatsappEnabled = input.whatsappEnabled;
  }

  if ("whatsappNumber" in input) {
    if (typeof input.whatsappNumber !== "string") return { ok: false, error: "whatsappNumber must be text." };
    const digits = input.whatsappNumber.replace(/[^\d]/g, "");
    if (!/^\d{8,15}$/.test(digits)) {
      return {
        ok: false,
        error: "whatsappNumber must be 8–15 digits including the country code, e.g. 2348012345678.",
      };
    }
    patch.whatsappNumber = digits;
  }

  if ("whatsappGreeting" in input) {
    if (typeof input.whatsappGreeting !== "string") return { ok: false, error: "whatsappGreeting must be text." };
    const greeting = input.whatsappGreeting.trim();
    if (greeting === "") return { ok: false, error: "whatsappGreeting cannot be empty." };
    if (greeting.length > MAX_GREETING) {
      return { ok: false, error: `whatsappGreeting must be ${MAX_GREETING} characters or fewer.` };
    }
    patch.whatsappGreeting = greeting;
  }

  if ("whatsappQuickReplies" in input) {
    const value = input.whatsappQuickReplies;
    if (!Array.isArray(value)) return { ok: false, error: "whatsappQuickReplies must be a list of phrases." };
    if (value.length > MAX_REPLIES) {
      return { ok: false, error: `whatsappQuickReplies can hold at most ${MAX_REPLIES} phrases.` };
    }
    const replies: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") return { ok: false, error: "whatsappQuickReplies must contain only text." };
      const trimmed = item.trim();
      if (trimmed === "") continue;
      if (trimmed.length > MAX_REPLY) {
        return { ok: false, error: `Each quick reply must be ${MAX_REPLY} characters or fewer.` };
      }
      replies.push(trimmed);
    }
    patch.whatsappQuickReplies = replies;
  }

  return { ok: true, patch };
}

export async function getSettings(): Promise<SiteSettings> {
  const rows = await query<Row>(`SELECT data FROM site_settings WHERE id = $1`, [SETTINGS_ID]);
  if (rows.length === 0) return DEFAULT_SETTINGS;
  return normalizeSettings(rows[0].data);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const next = normalizeSettings({ ...current, ...patch });
  await query(
    `INSERT INTO site_settings (id, data) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [SETTINGS_ID, JSON.stringify(next)]
  );
  return next;
}
