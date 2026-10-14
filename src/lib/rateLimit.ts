import { NextRequest, NextResponse } from "next/server";

/**
 * Small in-process fixed-window rate limiter.
 *
 * This is deliberately dependency-free: the app has no Redis/KV configured,
 * and adding one just for this would be a bigger decision than a bug fix.
 * The honest tradeoff is that counters live in the memory of a single
 * serverless instance, so a distributed attacker spread across many
 * concurrent instances gets a higher effective limit than the numbers below.
 * It still stops the realistic cases — a script hammering one endpoint from
 * one host — and it is a strict improvement over having no limit at all.
 * Swap the Map for Redis/Upstash when traffic justifies it.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Keep the map from growing without bound if someone sprays unique keys.
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)), remaining: 0 };
  }
  return { ok: true, retryAfterSeconds: 0, remaining: limit - bucket.count };
}

/** Best-effort client identity for rate-limit keys. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: `Too many attempts. Please try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

/**
 * Convenience guard: returns a 429 response when the caller is over the
 * limit, or null when the request may proceed.
 */
export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
  extraKey?: string
): NextResponse | null {
  const key = `${scope}:${clientIp(req)}${extraKey ? `:${extraKey}` : ""}`;
  const result = rateLimit(key, limit, windowMs);
  return result.ok ? null : tooManyRequests(result.retryAfterSeconds);
}
