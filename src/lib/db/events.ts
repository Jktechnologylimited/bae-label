import { readJson, writeJson, dataFile, newId } from "./client";
import { DbEvent } from "./schema";
import { BaeEvent } from "@/lib/types";
import { ensureSeeded } from "./seed";

const FILE = dataFile("events.json");

export async function listEvents(): Promise<DbEvent[]> {
  await ensureSeeded();
  return readJson<DbEvent>(FILE);
}

export async function getEvent(id: string): Promise<DbEvent | undefined> {
  await ensureSeeded();
  const events = await readJson<DbEvent>(FILE);
  return events.find((e) => e.id === id);
}

export async function createEvent(input: Omit<BaeEvent, "id">): Promise<DbEvent> {
  const events = await readJson<DbEvent>(FILE);
  const event: DbEvent = { ...input, id: newId("evt") };
  events.push(event);
  await writeJson(FILE, events);
  return event;
}

export async function updateEvent(id: string, patch: Partial<Omit<BaeEvent, "id">>): Promise<DbEvent | undefined> {
  const events = await readJson<DbEvent>(FILE);
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...patch };
  await writeJson(FILE, events);
  return events[idx];
}

export async function deleteEvent(id: string): Promise<boolean> {
  const events = await readJson<DbEvent>(FILE);
  const next = events.filter((e) => e.id !== id);
  await writeJson(FILE, next);
  return next.length !== events.length;
}
