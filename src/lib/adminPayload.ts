import {
  Artist,
  BaeEvent,
  LabelSlug,
  NewsPost,
  Release,
  ReleaseType,
  StreamingLink,
  Track,
} from "@/lib/types";

/**
 * Runtime validation for admin write payloads.
 *
 * The admin routes are authenticated with a valid admin session, but they used
 * to cast `await req.json()` straight to a TypeScript type and hand it to the
 * db layer, where `updateX` does `{ ...existing, ...patch }` and rewrites the
 * whole row. A cast is compile-time only, so an admin (or anything holding an
 * admin session) could:
 *   - rewrite the record's `id` inside its JSON blob while the primary key
 *     stayed put, silently desyncing the row from its own edit links;
 *   - store values of the wrong type, e.g. a string where the ticket UI calls
 *     `.some()` — which then 500s a public page for everyone.
 *
 * These functions only ever produce the fields listed for each type, with the
 * right shape, and reject unknown keys outright rather than storing them.
 */

type Check<T> = { ok: true; value: T } | { ok: false; error: string };

const LABELS: LabelSlug[] = ["bigdripuniverse", "ag20", "elmayanaconcept"];
const RELEASE_TYPES: ReleaseType[] = ["Album", "EP", "Single"];
const NEWS_CATEGORIES: NewsPost["category"][] = ["Announcement", "Music", "Events", "Culture", "Industry", "Press"];
const EVENT_STATUSES: BaeEvent["status"][] = ["upcoming", "past"];
const ARTIST_STATUSES: Artist["status"][] = ["active", "new"];
const STREAMING_PLATFORMS: StreamingLink["platform"][] = [
  "spotify",
  "appleMusic",
  "youtubeMusic",
  "audiomack",
  "boomplay",
  "soundcloud",
];

const MAX_TEXT = 20_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, field: string, max = MAX_TEXT): Check<string> {
  if (typeof value !== "string") return { ok: false, error: `${field} must be text.` };
  if (value.length > max) return { ok: false, error: `${field} is too long (max ${max} characters).` };
  return { ok: true, value };
}

function num(value: unknown, field: string, opts: { integer?: boolean; min?: number; max?: number } = {}): Check<number> {
  if (typeof value !== "number" || !Number.isFinite(value)) return { ok: false, error: `${field} must be a number.` };
  if (opts.integer && !Number.isInteger(value)) return { ok: false, error: `${field} must be a whole number.` };
  if (opts.min !== undefined && value < opts.min) return { ok: false, error: `${field} must be at least ${opts.min}.` };
  if (opts.max !== undefined && value > opts.max) return { ok: false, error: `${field} must be at most ${opts.max}.` };
  return { ok: true, value };
}

function oneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): Check<T> {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return { ok: false, error: `${field} must be one of: ${allowed.join(", ")}.` };
  }
  return { ok: true, value: value as T };
}

/** Only same-origin paths and http(s) URLs — never `javascript:` and friends. */
function imageUrl(value: unknown, field: string): Check<string | undefined> {
  if (value === undefined) return { ok: true, value: undefined };
  if (typeof value !== "string") return { ok: false, error: `${field} must be text.` };
  const trimmed = value.trim();
  if (trimmed === "") return { ok: true, value: undefined };
  if (trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    if (trimmed.length > 2_000) return { ok: false, error: `${field} is too long.` };
    return { ok: true, value: trimmed };
  }
  return { ok: false, error: `${field} must be a relative path or an http(s) URL.` };
}

function list<T>(value: unknown, field: string, max: number, item: (v: unknown, i: number) => Check<T>): Check<T[]> {
  if (!Array.isArray(value)) return { ok: false, error: `${field} must be a list.` };
  if (value.length > max) return { ok: false, error: `${field} can hold at most ${max} entries.` };
  const out: T[] = [];
  for (let i = 0; i < value.length; i++) {
    const result = item(value[i], i);
    if (!result.ok) return { ok: false, error: `${field}[${i}]: ${result.error}` };
    out.push(result.value);
  }
  return { ok: true, value: out };
}

function unknownKey(raw: Record<string, unknown>, allowed: readonly string[]): string | null {
  for (const key of Object.keys(raw)) {
    if (!allowed.includes(key)) return key;
  }
  return null;
}

/**
 * Walks the known fields of a record, validating each one that is present.
 * Rejects unknown keys and any attempt to set `id`.
 */
function pick<T>(
  raw: unknown,
  fields: { [K in keyof T]: (value: unknown) => Check<T[K]> },
  label: string
): { ok: true; patch: Partial<T> } | { ok: false; error: string } {
  if (!isPlainObject(raw)) return { ok: false, error: `Expected a JSON object for the ${label}.` };

  const allowed = [...Object.keys(fields), "id"];
  const bad = unknownKey(raw, allowed);
  if (bad) return { ok: false, error: `Unknown field: ${bad}.` };
  if ("id" in raw) return { ok: false, error: "The id of an existing record cannot be changed." };

  const patch: Partial<T> = {};
  for (const key of Object.keys(fields) as (keyof T)[]) {
    if (!(key in raw)) continue;
    const result = fields[key](raw[key as string]);
    if (!result.ok) return { ok: false, error: result.error };
    patch[key] = result.value;
  }
  return { ok: true, patch };
}

// ---- Artist ----

export function pickArtistPatch(raw: unknown) {
  return pick<Omit<Artist, "id">>(
    raw,
    {
      name: (v) => str(v, "name", 200),
      genre: (v) => str(v, "genre", 120),
      label: (v) => oneOf(v, "label", LABELS),
      bio: (v) => str(v, "bio"),
      status: (v) => oneOf(v, "status", ARTIST_STATUSES),
      imageUrl: (v) => imageUrl(v, "imageUrl"),
    },
    "artist"
  );
}

// ---- Release ----

const trackItem = (v: unknown): Check<Track> => {
  if (!isPlainObject(v)) return { ok: false, error: "must be an object." };
  const bad = unknownKey(v, ["title", "duration"]);
  if (bad) return { ok: false, error: `unknown field: ${bad}.` };
  const title = str(v.title, "title", 300);
  if (!title.ok) return title;
  const duration = str(v.duration, "duration", 40);
  if (!duration.ok) return duration;
  return { ok: true, value: { title: title.value, duration: duration.value } };
};

const streamingLinkItem = (v: unknown): Check<StreamingLink> => {
  if (!isPlainObject(v)) return { ok: false, error: "must be an object." };
  const bad = unknownKey(v, ["platform", "url"]);
  if (bad) return { ok: false, error: `unknown field: ${bad}.` };
  const platform = oneOf(v.platform, "platform", STREAMING_PLATFORMS);
  if (!platform.ok) return platform;
  const rawUrl = str(v.url, "url", 2_000);
  if (!rawUrl.ok) return rawUrl;
  // Be forgiving about a missing scheme (admins often paste "open.spotify.com/…")
  // but never store a non-http(s) link.
  let url = rawUrl.value.trim();
  if (url === "") return { ok: false, error: "url is required." };
  if (!/^https?:\/\//i.test(url)) url = `https://${url.replace(/^\/+/, "")}`;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "url must be an http(s) link." };
    }
  } catch {
    return { ok: false, error: "url is not a valid link." };
  }
  return { ok: true, value: { platform: platform.value, url } };
};

export function pickReleasePatch(raw: unknown) {
  return pick<Omit<Release, "id">>(
    raw,
    {
      title: (v) => str(v, "title", 300),
      artist: (v) => str(v, "artist", 200),
      label: (v) => oneOf(v, "label", LABELS),
      type: (v) => oneOf(v, "type", RELEASE_TYPES),
      trackCount: (v) => num(v, "trackCount", { integer: true, min: 0, max: 500 }),
      year: (v) => num(v, "year", { integer: true, min: 1900, max: 2100 }),
      blurb: (v) => str(v, "blurb"),
      tracks: (v) => list(v, "tracks", 200, trackItem),
      imageUrl: (v) => imageUrl(v, "imageUrl"),
      streamingLinks: (v) => list(v, "streamingLinks", 20, streamingLinkItem),
    },
    "release"
  );
}

// ---- News ----

export function pickNewsPatch(raw: unknown) {
  return pick<Omit<NewsPost, "id">>(
    raw,
    {
      category: (v) => oneOf(v, "category", NEWS_CATEGORIES),
      title: (v) => str(v, "title", 300),
      excerpt: (v) => str(v, "excerpt"),
      date: (v) => str(v, "date", 120),
      readTime: (v) => str(v, "readTime", 60),
      imageUrl: (v) => imageUrl(v, "imageUrl"),
    },
    "news post"
  );
}

// ---- Event ----

const tierItem = (v: unknown): Check<BaeEvent["tiers"][number]> => {
  if (!isPlainObject(v)) return { ok: false, error: "must be an object." };
  const bad = unknownKey(v, ["name", "price", "fee", "note"]);
  if (bad) return { ok: false, error: `unknown field: ${bad}.` };
  const name = str(v.name, "name", 120);
  if (!name.ok) return name;
  if (name.value.trim() === "") return { ok: false, error: "name is required." };
  const price = num(v.price, "price", { min: 0, max: 100_000_000 });
  if (!price.ok) return price;
  const fee = num(v.fee, "fee", { min: 0, max: 100_000_000 });
  if (!fee.ok) return fee;
  const note = str(v.note, "note", 300);
  if (!note.ok) return note;
  return { ok: true, value: { name: name.value, price: price.value, fee: fee.value, note: note.value } };
};

export function pickEventPatch(raw: unknown) {
  return pick<Omit<BaeEvent, "id">>(
    raw,
    {
      name: (v) => str(v, "name", 300),
      day: (v) => str(v, "day", 20),
      month: (v) => str(v, "month", 20),
      fullDate: (v) => str(v, "fullDate", 120),
      time: (v) => str(v, "time", 60),
      city: (v) => str(v, "city", 120),
      venue: (v) => str(v, "venue", 200),
      labels: (v) => {
        const result = list(v, "labels", LABELS.length, (item) => oneOf(item, "label", LABELS));
        if (!result.ok) return result;
        if (result.value.length === 0) return { ok: false, error: "labels must name at least one label." };
        return result;
      },
      status: (v) => oneOf(v, "status", EVENT_STATUSES),
      description: (v) => str(v, "description"),
      tiers: (v) => list(v, "tiers", 20, tierItem),
      imageUrl: (v) => imageUrl(v, "imageUrl"),
    },
    "event"
  );
}

/** Returns the first required field that is absent or an empty string. */
export function missingFields(patch: Record<string, unknown>, required: string[]): string | null {
  for (const field of required) {
    const value = patch[field];
    if (value === undefined || value === null) return field;
    if (typeof value === "string" && value.trim() === "") return field;
  }
  return null;
}

/** Like `missingFields`, but for lists that are legitimately allowed to be
 * empty (an event with no tiers yet, a release with no tracklist yet) — those
 * still must be *present*, because the public pages call `.map`/`.find` on
 * them. */
export function missingKeys(patch: Record<string, unknown>, required: string[]): string | null {
  for (const field of required) {
    const value = patch[field];
    if (value === undefined || value === null) return field;
  }
  return null;
}
