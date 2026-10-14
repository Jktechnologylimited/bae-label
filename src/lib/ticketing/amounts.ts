import { OrderItem } from "./types";

/**
 * Money helpers.
 *
 * Prices are entered and stored in naira, but every amount that crosses the
 * payment boundary is computed in kobo (integer minor units) so rounding
 * happens exactly once, in one place, and the amount we ask Paystack for is
 * the same amount we later verify against the paid transaction.
 */

/** Purchase limits. Tiers have no capacity model yet (flagged separately in
 * the review), but an order can never be arbitrarily large. */
export const MAX_PER_TIER = 10;
export const MAX_TICKETS_PER_ORDER = 20;
export const MAX_TIER_LINES = 12;

/** One unit of a tier, in kobo: price + booking fee, rounded once. */
export function unitAmountKobo(price: number, fee: number): number {
  return Math.round((price + fee) * 100);
}

/** Total an order should be charged, in kobo. This is the single source of
 * truth for both `initializeTransaction` and payment verification. */
export function itemsAmountKobo(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + unitAmountKobo(item.unitPrice, item.unitFee) * item.quantity, 0);
}

/** How many tickets an order should produce. */
export function itemCount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
