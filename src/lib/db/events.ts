import { query, newId } from "./pg";
import { DbEvent } from "./schema";
import { BaeEvent } from "@/lib/types";
import { ensureSeeded } from "./seed";

interface Row {
  data: DbEvent;
}

export async function listEvents(): Promise<DbEvent[]> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM events ORDER BY id`);
  return rows.map((r) => r.data);
}

export async function getEvent(id: string): Promise<DbEvent | undefined> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM events WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function createEvent(input: Omit<BaeEvent, "id">): Promise<DbEvent> {
  const event: DbEvent = { ...input, id: newId("evt") };
  await query(`INSERT INTO events (id, data) VALUES ($1, $2)`, [event.id, JSON.stringify(event)]);
  return event;
}

export async function updateEvent(id: string, patch: Partial<Omit<BaeEvent, "id">>): Promise<DbEvent | undefined> {
  const existing = await getEvent(id);
  if (!existing) return undefined;
  const next: DbEvent = { ...existing, ...patch };
  await query(`UPDATE events SET data = $2 WHERE id = $1`, [id, JSON.stringify(next)]);
  return next;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const rows = await query(`DELETE FROM events WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
