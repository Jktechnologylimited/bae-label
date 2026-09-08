import { readJson, writeJson, dataFile, newId } from "./client";
import { User, Role } from "./schema";
import { hashPassword } from "@/lib/auth/password";

const FILE = dataFile("users.json");

export async function listUsers(): Promise<User[]> {
  return readJson<User>(FILE);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await readJson<User>(FILE);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await readJson<User>(FILE);
  return users.find((u) => u.id === id);
}

export async function createUser(input: {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  googleId?: string;
  avatarUrl?: string;
}): Promise<User> {
  const users = await readJson<User>(FILE);
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
  users.push(user);
  await writeJson(FILE, users);
  return user;
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const users = await readJson<User>(FILE);
  return users.find((u) => u.googleId === googleId);
}

export async function updateUser(id: string, patch: Partial<Omit<User, "id">>): Promise<User | undefined> {
  const users = await readJson<User>(FILE);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...patch };
  await writeJson(FILE, users);
  return users[idx];
}

export async function setUserRole(id: string, role: Role): Promise<User | undefined> {
  return updateUser(id, { role });
}

export async function countUsers(): Promise<number> {
  return (await readJson<User>(FILE)).length;
}
