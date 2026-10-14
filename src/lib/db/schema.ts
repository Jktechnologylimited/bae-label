import { BaeEvent } from "@/lib/types";

export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  /** Null for accounts created via Google sign-in that never set a local
   * password — login route treats this as "password sign-in unavailable". */
  passwordHash: string | null;
  role: Role;
  googleId?: string;
  avatarUrl?: string;
  createdAt: string;
  /** Bumped whenever the password changes; sessions carry the value they were
   * issued with, so changing a password invalidates older sessions. */
  sessionVersion: number;
  /** Optional alternate address for password-reset emails, when the primary
   * address can't receive mail. Set from /account. */
  recoveryEmail?: string;
}

// Public shape safe to send to the client / render in JSX (no password hash,
// no internal session bookkeeping, and no recovery address).
export type SafeUser = Omit<User, "passwordHash" | "sessionVersion" | "recoveryEmail">;

export function toSafeUser(user: User): SafeUser {
  const safe = { ...user } as Partial<User>;
  delete safe.passwordHash;
  delete safe.sessionVersion;
  delete safe.recoveryEmail;
  return safe as SafeUser;
}

// Admin-managed events reuse the existing BaeEvent shape from lib/types.ts
// so every component built against that type (EventCard, TicketsClient,
// etc.) keeps working unchanged — only *where the data comes from* changes.
export type DbEvent = BaeEvent;
