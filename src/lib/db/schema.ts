import { BaeEvent } from "@/lib/types";

export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

// Public shape safe to send to the client / render in JSX (no password hash).
export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  const safe = { ...user } as Partial<User>;
  delete safe.passwordHash;
  return safe as SafeUser;
}

// Admin-managed events reuse the existing BaeEvent shape from lib/types.ts
// so every component built against that type (EventCard, TicketsClient,
// etc.) keeps working unchanged — only *where the data comes from* changes.
export type DbEvent = BaeEvent;
