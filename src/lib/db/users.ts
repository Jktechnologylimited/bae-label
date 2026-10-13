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
  };
  await query(
    `INSERT INTO users (id, name, email, password_hash, role, google_id, avatar_url, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.role,
      user.googleId ?? null,
      user.avatarUrl ?? null,
      user.createdAt,
    ]
  );
  return user;
}

export async function updateUser(id: string, patch: Partial<Omit<User, "id">>): Promise<User | undefined> {
  const existing = await getUserById(id);
  if (!existing) return undefined;
  const next: User = { ...existing, ...patch };
  await query(
    `UPDATE users SET name = $2, email = $3, password_hash = $4, role = $5, google_id = $6, avatar_url = $7
     WHERE id = $1`,
    [id, next.name, next.email, next.passwordHash, next.role, next.googleId ?? null, next.avatarUrl ?? null]
  );
  return next;
}

export async function setUserRole(id: string, role: Role): Promise<User | undefined> {
  return updateUser(id, { role });
}

export async function countUsers(): Promise<number> {
  const rows = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users`);
  return parseInt(rows[0]?.count ?? "0", 10);
}
