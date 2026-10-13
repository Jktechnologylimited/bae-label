import { query, newId } from "./pg";
import { NewsPost } from "@/lib/types";
import { ensureSeeded } from "./seed";

interface Row {
  data: NewsPost;
}

export async function listNews(): Promise<NewsPost[]> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM news ORDER BY id`);
  return rows.map((r) => r.data);
}

export async function getNewsPost(id: string): Promise<NewsPost | undefined> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM news WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function createNewsPost(input: Omit<NewsPost, "id">): Promise<NewsPost> {
  const post: NewsPost = { ...input, id: newId("news") };
  await query(`INSERT INTO news (id, data) VALUES ($1, $2)`, [post.id, JSON.stringify(post)]);
  return post;
}

export async function updateNewsPost(id: string, patch: Partial<Omit<NewsPost, "id">>): Promise<NewsPost | undefined> {
  const existing = await getNewsPost(id);
  if (!existing) return undefined;
  const next: NewsPost = { ...existing, ...patch };
  await query(`UPDATE news SET data = $2 WHERE id = $1`, [id, JSON.stringify(next)]);
  return next;
}

export async function deleteNewsPost(id: string): Promise<boolean> {
  const rows = await query(`DELETE FROM news WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
