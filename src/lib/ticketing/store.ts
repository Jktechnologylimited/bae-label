import crypto from "crypto";
import { query, withTransaction, QueryFn } from "@/lib/db/pg";
import { Order, Ticket } from "./types";

/**
 * Real Postgres storage — see src/lib/db/pg.ts for the connection and
 * schema setup.
 *
 * Multi-statement writes (order → tickets) go through `withTransaction` via
 * the optional `q` runner so they either all land or none do. Read-modify-write
 * updates remain for admin edits, but the money/entry-critical paths
 * (`markOrderPaidIfPending`, `claimTicketForEntry`) are single conditional
 * statements so two concurrent callers cannot both win.
 */

interface OrderRow {
  data: Order;
}
interface TicketRow {
  data: Ticket;
}

// ---- Orders ----

export async function createOrder(order: Order, q: QueryFn = query): Promise<Order> {
  await q(`INSERT INTO orders (id, user_id, paystack_reference, data) VALUES ($1, $2, $3, $4)`, [
    order.id,
    order.userId ?? null,
    order.paystackReference ?? null,
    JSON.stringify(order),
  ]);
  return order;
}

export async function getOrder(id: string, q: QueryFn = query): Promise<Order | undefined> {
  const rows = await q<OrderRow>(`SELECT data FROM orders WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  const rows = await query<OrderRow>(`SELECT data FROM orders WHERE paystack_reference = $1`, [reference]);
  return rows[0]?.data;
}

export async function updateOrder(id: string, patch: Partial<Order>, q: QueryFn = query): Promise<Order | undefined> {
  const existing = await getOrder(id, q);
  if (!existing) return undefined;
  const next: Order = { ...existing, ...patch };
  await q(`UPDATE orders SET user_id = $2, paystack_reference = $3, data = $4 WHERE id = $1`, [
    id,
    next.userId ?? null,
    next.paystackReference ?? null,
    JSON.stringify(next),
  ]);
  return next;
}

/**
 * Atomically moves an order to "paid", but only if it is not already paid.
 * Returns the updated order, or undefined when another caller won the race —
 * which is what makes webhook + browser-redirect double delivery safe.
 */
export async function markOrderPaidIfPending(
  id: string,
  patch: Partial<Order>,
  q: QueryFn = query
): Promise<Order | undefined> {
  const existing = await getOrder(id, q);
  if (!existing) return undefined;
  if (existing.status === "paid") return undefined;

  const next: Order = { ...existing, ...patch };
  const rows = await q<OrderRow>(
    `UPDATE orders
        SET user_id = $2, paystack_reference = $3, data = $4
      WHERE id = $1 AND (data->>'status') <> 'paid'
      RETURNING data`,
    [id, next.userId ?? null, next.paystackReference ?? null, JSON.stringify(next)]
  );
  return rows[0]?.data;
}

export async function listOrders(): Promise<Order[]> {
  const rows = await query<OrderRow>(`SELECT data FROM orders ORDER BY id`);
  return rows.map((r) => r.data);
}

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const rows = await query<OrderRow>(`SELECT data FROM orders WHERE user_id = $1 ORDER BY id`, [userId]);
  return rows.map((r) => r.data);
}

// ---- Tickets ----

export async function createTickets(tickets: Ticket[], q: QueryFn = query): Promise<Ticket[]> {
  for (const ticket of tickets) {
    // ON CONFLICT DO NOTHING: a replayed webhook or a retry that races a
    // successful first attempt must not turn into a 500.
    await q(`INSERT INTO tickets (code, order_id, data) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`, [
      ticket.code,
      ticket.orderId,
      JSON.stringify(ticket),
    ]);
  }
  return tickets;
}

export async function getTicket(code: string): Promise<Ticket | undefined> {
  const rows = await query<TicketRow>(`SELECT data FROM tickets WHERE code = $1`, [code]);
  return rows[0]?.data;
}

export async function getTicketsByOrder(orderId: string, q: QueryFn = query): Promise<Ticket[]> {
  const rows = await q<TicketRow>(`SELECT data FROM tickets WHERE order_id = $1 ORDER BY code`, [orderId]);
  return rows.map((r) => r.data);
}

interface TicketRowWithOrder {
  order_id: string;
  data: Ticket;
}

/**
 * Tickets for many orders in one query, grouped by order. Used by the account
 * page so it doesn't issue a separate query per order.
 */
export async function getTicketsByOrderIds(orderIds: string[]): Promise<Map<string, Ticket[]>> {
  const grouped = new Map<string, Ticket[]>();
  if (orderIds.length === 0) return grouped;

  const rows = await query<TicketRowWithOrder>(
    `SELECT order_id, data FROM tickets WHERE order_id = ANY($1) ORDER BY code`,
    [orderIds]
  );
  for (const row of rows) {
    const existing = grouped.get(row.order_id);
    if (existing) existing.push(row.data);
    else grouped.set(row.order_id, [row.data]);
  }
  return grouped;
}

export async function updateTicket(code: string, patch: Partial<Ticket>): Promise<Ticket | undefined> {
  const existing = await getTicket(code);
  if (!existing) return undefined;
  const next: Ticket = { ...existing, ...patch };
  await query(`UPDATE tickets SET order_id = $2, data = $3 WHERE code = $1`, [
    code,
    next.orderId,
    JSON.stringify(next),
  ]);
  return next;
}

export async function voidTicket(code: string): Promise<Ticket | undefined> {
  return updateTicket(code, { status: "void" });
}

export async function deleteTicket(code: string): Promise<boolean> {
  const rows = await query(`DELETE FROM tickets WHERE code = $1 RETURNING code`, [code]);
  return rows.length > 0;
}

export async function listTickets(): Promise<Ticket[]> {
  const rows = await query<TicketRow>(`SELECT data FROM tickets ORDER BY code`);
  return rows.map((r) => r.data);
}

export type ClaimResult =
  | { ok: true; ticket: Ticket }
  | { ok: false; reason: "not_found" | "already_used" | "void" };

/**
 * Redeems a ticket exactly once. The `status = 'valid'` predicate lives in
 * the UPDATE itself, so two simultaneous scans of one QR code cannot both
 * succeed (previously this was a read-then-write and both callers won).
 */
export async function claimTicketForEntry(code: string, usedAt: string, usedBy?: string): Promise<ClaimResult> {
  const patch: Record<string, string> = { status: "used", usedAt };
  if (usedBy) patch.usedBy = usedBy;

  const rows = await query<TicketRow>(
    `UPDATE tickets
        SET data = data || $2::jsonb
      WHERE code = $1 AND (data->>'status') = 'valid'
      RETURNING data`,
    [code, JSON.stringify(patch)]
  );
  if (rows[0]) return { ok: true, ticket: rows[0].data };

  const existing = await getTicket(code);
  if (!existing) return { ok: false, reason: "not_found" };
  return { ok: false, reason: existing.status === "used" ? "already_used" : "void" };
}

/**
 * Issues a single ticket outside the normal checkout flow — for comps,
 * manual/offline sales, or fixing a buyer's order by hand. Creates a
 * zero-cost, already-paid order behind the scenes so every ticket still has a
 * parent order to belong to (keeps /admin/orders and /account consistent).
 * Order and ticket are written in one transaction.
 */
export async function issueManualTicket(input: {
  eventId: string;
  tierName: string;
  holderName: string;
  buyerEmail: string;
  userId?: string;
}): Promise<{ order: Order; ticket: Ticket }> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();
  const order: Order = {
    id: orderId,
    eventId: input.eventId,
    userId: input.userId,
    buyerName: input.holderName,
    buyerEmail: input.buyerEmail,
    items: [{ tierName: input.tierName, quantity: 1, unitPrice: 0, unitFee: 0 }],
    subtotal: 0,
    fees: 0,
    total: 0,
    status: "paid",
    createdAt: now,
    paidAt: now,
  };

  const ticket: Ticket = {
    code: `${orderId}-01`,
    orderId,
    eventId: input.eventId,
    tierName: input.tierName,
    holderName: input.holderName,
    status: "valid",
    issuedAt: now,
  };

  await withTransaction(async (q) => {
    await createOrder(order, q);
    await createTickets([ticket], q);
  });

  return { order, ticket };
}

/**
 * Opaque order id. 64 bits of CSPRNG output, uppercase hex so it survives the
 * `code.toUpperCase()` normalisation every lookup path applies. Previously
 * this was `BAE-` + 4 digits from Math.random(): ~9,000 guessable values with
 * a birthday-collision rate of ~40% by 100 orders, which turned into 500s
 * because orders.id is the primary key.
 */
export function generateOrderId(): string {
  return `BAE-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}
