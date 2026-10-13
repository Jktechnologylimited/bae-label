import { query } from "@/lib/db/pg";
import { Order, Ticket } from "./types";

/**
 * Real Postgres storage — see src/lib/db/pg.ts for the connection and
 * schema setup. This used to be its own flat-JSON-file layer (same
 * ephemeral-filesystem problem as everything else pre-migration); orders
 * and tickets now live in real, persistent rows instead.
 */

interface OrderRow {
  data: Order;
}
interface TicketRow {
  data: Ticket;
}

// ---- Orders ----

export async function createOrder(order: Order): Promise<Order> {
  await query(`INSERT INTO orders (id, user_id, paystack_reference, data) VALUES ($1, $2, $3, $4)`, [
    order.id,
    order.userId ?? null,
    order.paystackReference ?? null,
    JSON.stringify(order),
  ]);
  return order;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const rows = await query<OrderRow>(`SELECT data FROM orders WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  const rows = await query<OrderRow>(`SELECT data FROM orders WHERE paystack_reference = $1`, [reference]);
  return rows[0]?.data;
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | undefined> {
  const existing = await getOrder(id);
  if (!existing) return undefined;
  const next: Order = { ...existing, ...patch };
  await query(`UPDATE orders SET user_id = $2, paystack_reference = $3, data = $4 WHERE id = $1`, [
    id,
    next.userId ?? null,
    next.paystackReference ?? null,
    JSON.stringify(next),
  ]);
  return next;
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

export async function createTickets(tickets: Ticket[]): Promise<Ticket[]> {
  for (const ticket of tickets) {
    await query(`INSERT INTO tickets (code, order_id, data) VALUES ($1, $2, $3)`, [
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

export async function getTicketsByOrder(orderId: string): Promise<Ticket[]> {
  const rows = await query<TicketRow>(`SELECT data FROM tickets WHERE order_id = $1`, [orderId]);
  return rows.map((r) => r.data);
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

/**
 * Issues a single ticket outside the normal checkout flow — for comps,
 * manual/offline sales, or fixing a buyer's order by hand. Creates a
 * zero-cost, already-paid order behind the scenes so every ticket still has
 * a parent order to belong to (keeps /admin/orders and /account consistent).
 */
export async function issueManualTicket(input: {
  eventId: string;
  tierName: string;
  holderName: string;
  buyerEmail: string;
  userId?: string;
}): Promise<{ order: Order; ticket: Ticket }> {
  const orderId = generateOrderId();
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
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  };
  await createOrder(order);

  const ticket: Ticket = {
    code: `${orderId}-01`,
    orderId,
    eventId: input.eventId,
    tierName: input.tierName,
    holderName: input.holderName,
    status: "valid",
    issuedAt: new Date().toISOString(),
  };
  await createTickets([ticket]);

  return { order, ticket };
}

export function generateOrderId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BAE-${n}`;
}
