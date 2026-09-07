import { readJson, writeJson, dataFile, newId } from "./client";
import { NewsPost } from "@/lib/types";
import { ensureSeeded } from "./seed";

const FILE = dataFile("news.json");

export async function listNews(): Promise<NewsPost[]> {
  await ensureSeeded();
  return readJson<NewsPost>(FILE);
}

export async function getNewsPost(id: string): Promise<NewsPost | undefined> {
  await ensureSeeded();
  const posts = await readJson<NewsPost>(FILE);
  return posts.find((p) => p.id === id);
}

export async function createNewsPost(input: Omit<NewsPost, "id">): Promise<NewsPost> {
  const posts = await readJson<NewsPost>(FILE);
  const post: NewsPost = { ...input, id: newId("news") };
  posts.push(post);
  await writeJson(FILE, posts);
  return post;
}

export async function updateNewsPost(id: string, patch: Partial<Omit<NewsPost, "id">>): Promise<NewsPost | undefined> {
  const posts = await readJson<NewsPost>(FILE);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  posts[idx] = { ...posts[idx], ...patch };
  await writeJson(FILE, posts);
  return posts[idx];
}

export async function deleteNewsPost(id: string): Promise<boolean> {
  const posts = await readJson<NewsPost>(FILE);
  const next = posts.filter((p) => p.id !== id);
  await writeJson(FILE, next);
  return next.length !== posts.length;
}
