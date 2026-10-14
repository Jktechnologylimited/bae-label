import { query } from "./pg";
import crypto from "crypto";

/**
 * Admin-uploaded images, stored as real rows in Postgres rather than files
 * on disk — see the big comment in src/app/api/admin/upload/route.ts for
 * why. This is the default/free path: it needs nothing beyond the
 * DATABASE_URL the rest of the app already requires, so it works on
 * Vercel's free Hobby plan with a free Neon database and zero extra
 * services or signups. Vercel Blob (see BLOB_READ_WRITE_TOKEN) is an
 * optional upgrade for real CDN-backed storage later, not a requirement.
 *
 * Images are looked up by id only, so a plain `data BYTEA` row (via `pg`,
 * which hands back BYTEA columns as a Buffer with zero extra parsing) is
 * enough — no JSONB wrapper needed here, unlike the content tables.
 */

export interface StoredImage {
  contentType: string;
  data: Buffer;
}

interface Row {
  content_type: string;
  data: Buffer;
}

export async function saveImage(data: Buffer, contentType: string): Promise<string> {
  const id = crypto.randomUUID();
  await query(`INSERT INTO uploaded_images (id, content_type, data) VALUES ($1, $2, $3)`, [
    id,
    contentType,
    data,
  ]);
  return id;
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  const rows = await query<Row>(`SELECT content_type, data FROM uploaded_images WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row) return undefined;
  return { contentType: row.content_type, data: row.data };
}
