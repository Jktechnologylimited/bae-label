import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Image storage has two modes, chosen automatically by whether
 * BLOB_READ_WRITE_TOKEN is set:
 *
 * 1. Vercel Blob (production / anywhere BLOB_READ_WRITE_TOKEN is set).
 *    Vercel injects this env var automatically once a Blob store is
 *    connected to the project (Vercel dashboard → Storage → Blob →
 *    Connect to Project). Files go to real, persistent object storage and
 *    the response URL is the blob's own public CDN URL.
 *
 * 2. Local filesystem (local dev, or any host with no Blob token set).
 *    Saves to .data/uploads/ and serves it back via the dynamic route
 *    handler at src/app/uploads/[filename], NOT Next's static public/
 *    folder — `next start` snapshots public/ at boot and won't see files
 *    added after the process starts, confirmed by testing.
 *
 * IMPORTANT: mode 2 writes to the local filesystem, which is NOT
 * persistent on a serverless host with an ephemeral/read-only filesystem
 * (e.g. Vercel without a Blob store connected) — uploads will fail there.
 * If you're deploying to Vercel, connect a Blob store so
 * BLOB_READ_WRITE_TOKEN is set; mode 1 then takes over automatically and
 * nothing else needs to change (same { url } response shape either way,
 * so ImageUpload.tsx and every form using it are unaffected).
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

  const filename = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      console.error("Image upload to Vercel Blob failed:", err);
      return NextResponse.json(
        { error: "Couldn't upload the image to storage. Please try again in a moment." },
        { status: 500 }
      );
    }
  }

  // Local filesystem fallback (dev, or any non-serverless host).
  const dir = uploadsDir();
  try {
    await fs.mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
  } catch (err) {
    // Most likely cause: the host's filesystem is read-only or ephemeral
    // (e.g. deployed to Vercel without a Blob store connected, or any
    // serverless/container platform that doesn't give the app a
    // persistent, writable disk). Surface that clearly instead of letting
    // the request crash with an empty response body, which shows up
    // client-side as a confusing "Unexpected end of JSON input" error.
    console.error("Image upload failed to write to disk:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't save the image on the server. If this is deployed to Vercel, connect a Blob store " +
          "(Storage → Blob → Connect to Project) so BLOB_READ_WRITE_TOKEN is set — see the README's " +
          "Image Uploads section.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
