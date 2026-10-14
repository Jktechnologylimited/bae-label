import { query, newId } from "./pg";
import { User, Role } from "./schema";
import { hashPassword } from "@/lib/auth/password";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: Role;
  google_id: string | null;
  avatar_url: string | null;
  created_at: string;
  session_version: number | null;
  recovery_email: string | null;
}

function fromRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    googleId: row.google_id ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
    sessionVersion: typeof row.session_version === "number" ? row.session_version : 1,
    recoveryEmail: row.recovery_email ?? undefined,
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await query<UserRow>(`SELECT * FROM users ORDER BY created_at ASC`);
  return rows.map(fromRow);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await query<UserRow>(`SELECT * FROM users WHERE lower(email) = lower($1)`, [email]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const rows = await query<UserRow>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const rows = await query<UserRow>(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

/**
 * Finds an account by its password-reset recovery address, so someone who has
 * forgotten their password can enter either their sign-in email or the
 * alternate address they configured.
 */
export async function getUserByRecoveryEmail(email: string): Promise<User | undefined> {
  const rows = await query<UserRow>(`SELECT * FROM users WHERE lower(recovery_email) = lower($1)`, [email]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function createUser(input: {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  googleId?: string;
  avatarUrl?: string;
}): Promise<User> {
  const user: User = {
    id: newId("user"),
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.password ? hashPassword(input.password) : null,
    role: input.role ?? "customer",
    googleId: input.googleId,
    avatarUrl: input.avatarUrl,
    createdAt: new Date().toISOString(),
    sessionVersion: 1,
  };
  await query(
    `INSERT INTO users (id, name, email, password_hash, role, google_id, avatar_url, created_at, session_version, recovery_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.role,
      user.googleId ?? null,
      user.avatarUrl ?? null,
      user.createdAt,
      user.sessionVersion,
      user.recoveryEmail ?? null,
    ]
  );
  return user;
}

export async function updateUser(id: string, patch: Partial<Omit<User, "id">>): Promise<User | undefined> {
  const existing = await getUserById(id);
  if (!existing) return undefined;
  const next: User = { ...existing, ...patch };
  // Email is normalised here too: lookups are case-insensitive (`lower(email)`),
  // so a mixed-case write could otherwise create a second row for one address.
  await query(
    `UPDATE users SET name = $2, email = $3, password_hash = $4, role = $5, google_id = $6, avatar_url = $7, session_version = $8, recovery_email = $9
     WHERE id = $1`,
    [
      id,
      next.name,
      next.email.toLowerCase(),
      next.passwordHash,
      next.role,
      next.googleId ?? null,
      next.avatarUrl ?? null,
      next.sessionVersion,
      next.recoveryEmail ?? null,
    ]
  );
  return { ...next, email: next.email.toLowerCase() };
}

export async function setUserRole(id: string, role: Role): Promise<User | undefined> {
  return updateUser(id, { role });
}

export async function countUsers(): Promise<number> {
  const rows = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users`);
  return parseInt(rows[0]?.count ?? "0", 10);
}
