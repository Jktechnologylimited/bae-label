import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Saves uploaded images to .data/uploads/ and serves them back at
 * /uploads/<file> via a dynamic route handler (src/app/uploads/[filename]),
 * NOT via Next's static public/ folder.
 *
 * This matters: Next's production server (`next start`) builds its list of
 * servable public/ files at boot and does not pick up files written there
 * after the process has started — confirmed by testing during development,
 * a newly-uploaded file 404'd until the server restarted. Routing uploads
 * through a normal route handler that reads from disk per-request sidesteps
 * that entirely, since it's just a dynamic request rather than a static
 * asset lookup.
 *
 * IMPORTANT: this still writes to the local filesystem, same caveat as the
 * .data/*.json store — it will NOT persist on a serverless host with an
 * ephemeral filesystem (e.g. Vercel). Before going live, swap this for a
 * real object storage provider (S3, Cloudinary, Vercel Blob, etc.) — the
 * upload response shape ({ url }) stays the same either way, so
 * ImageUpload.tsx and every form using it won't need to change.
 */

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function uploadsDir() {
  return path.join(process.cwd(), ".data", "uploads");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
