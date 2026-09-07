import { promises as fs } from "fs";
import path from "path";
import { Order, Ticket } from "./types";

/**
 * MVP data layer — reads/writes JSON files on disk.
 *
 * This is intentionally simple so the full purchase → ticket → verification
 * flow works end-to-end locally without needing a database connection.
 *
 * IMPORTANT: this will NOT work on serverless hosts with an ephemeral or
 * read-only filesystem (e.g. Vercel). Before going live, swap this module
 * for a real database (Postgres via Prisma/Drizzle, Supabase, etc.) — this
 * is exactly what the "Database" line item in the infrastructure proposal
 * covers. Every function below is async already so the call sites won't
 * need to change when you do that swap.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");

async function ensureFile(file: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]", "utf-8");
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  const raw = await fs.readFile(file, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]) {
  await ensureFile(file);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

// ---- Orders ----

export async function createOrder(order: Order): Promise<Order> {
  const orders = await readJson<Order>(ORDERS_FILE);
  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  return order;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const orders = await readJson<Order>(ORDERS_FILE);
  return orders.find((o) => o.id === id);
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  const orders = await readJson<Order>(ORDERS_FILE);
  return orders.find((o) => o.paystackReference === reference);
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | undefined> {
  const orders = await readJson<Order>(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  orders[idx] = { ...orders[idx], ...patch };
  await writeJson(ORDERS_FILE, orders);
  return orders[idx];
}

export async function listOrders(): Promise<Order[]> {
  return readJson<Order>(ORDERS_FILE);
}

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const orders = await readJson<Order>(ORDERS_FILE);
  return orders.filter((o) => o.userId === userId);
}

// ---- Tickets ----

export async function createTickets(tickets: Ticket[]): Promise<Ticket[]> {
  const all = await readJson<Ticket>(TICKETS_FILE);
  all.push(...tickets);
  await writeJson(TICKETS_FILE, all);
  return tickets;
}

export async function getTicket(code: string): Promise<Ticket | undefined> {
  const tickets = await readJson<Ticket>(TICKETS_FILE);
  return tickets.find((t) => t.code === code);
}

export async function getTicketsByOrder(orderId: string): Promise<Ticket[]> {
  const tickets = await readJson<Ticket>(TICKETS_FILE);
  return tickets.filter((t) => t.orderId === orderId);
}

export async function updateTicket(code: string, patch: Partial<Ticket>): Promise<Ticket | undefined> {
  const tickets = await readJson<Ticket>(TICKETS_FILE);
  const idx = tickets.findIndex((t) => t.code === code);
  if (idx === -1) return undefined;
  tickets[idx] = { ...tickets[idx], ...patch };
  await writeJson(TICKETS_FILE, tickets);
  return tickets[idx];
}

export async function voidTicket(code: string): Promise<Ticket | undefined> {
  return updateTicket(code, { status: "void" });
}

export async function deleteTicket(code: string): Promise<boolean> {
  const tickets = await readJson<Ticket>(TICKETS_FILE);
  const next = tickets.filter((t) => t.code !== code);
  await writeJson(TICKETS_FILE, next);
  return next.length !== tickets.length;
}

export async function listTickets(): Promise<Ticket[]> {
  return readJson<Ticket>(TICKETS_FILE);
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
