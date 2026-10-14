import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/session";
import { saveImage } from "@/lib/db/images";

/**
 * Image storage has two modes, chosen automatically by whether
 * BLOB_READ_WRITE_TOKEN is set:
 *
 * 1. Postgres (the default — works everywhere, including Vercel's free
 *    Hobby plan with a free Neon database, with zero extra services or
 *    signups). The image bytes are stored as a row in `uploaded_images`
 *    (see src/lib/db/images.ts) and served back at /uploads/<id> through
 *    a dynamic route handler (src/app/uploads/[filename]/route.ts) that
 *    reads the row per-request. This needs nothing beyond the
 *    DATABASE_URL the rest of the app already requires.
 *
 * 2. Vercel Blob (optional upgrade, anywhere BLOB_READ_WRITE_TOKEN is
 *    set — connect a Blob store in the Vercel dashboard: Storage →
 *    Create Database → Blob → Connect to Project, which adds this env
 *    var automatically). Files go to real object storage behind a CDN
 *    instead of a database row, and the response URL is the blob's own
 *    public URL. Worth it once you outgrow Neon's free storage tier or
 *    want images served from a CDN edge rather than a function; not
 *    required to go live.
 *
 * Either way the response shape is the same ({ url }), so ImageUpload.tsx
 * and every form using it don't need to know or care which mode is active.
 */

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// 4MB, deliberately below Vercel's 4.5MB serverless request-body limit: a
// larger cap never gets a chance to run, and the platform's own 413 is a
// worse error message than the one below.
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Identifies the image from its own bytes. The browser-declared `file.type` is
 * attacker-controlled, so the stored content type is taken from the file's
 * actual signature — an HTML or script file renamed to `.png` is rejected here
 * rather than being stored and later served as an image.
 */
function sniffImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "image/png";
  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString("ascii");
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  // Reject an oversized upload from its declared length before buffering the
  // whole body into memory (the size check after `formData()` is too late to
  // protect against that).
  const declaredLength = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_SIZE_BYTES + 512 * 1024) {
    return NextResponse.json({ error: "Image must be under 4MB." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Couldn't read that upload. Please try again." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 4MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF images are allowed." }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Couldn't read that upload. Please try again." }, { status: 400 });
  }

  const contentType = sniffImageType(buffer);
  if (!contentType) {
    return NextResponse.json({ error: "That file isn't a JPG, PNG, WebP or GIF image." }, { status: 400 });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${crypto.randomUUID()}`, buffer, {
        access: "public",
        contentType,
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

  try {
    const id = await saveImage(buffer, contentType);
    return NextResponse.json({ url: `/uploads/${id}` });
  } catch (err) {
    console.error("Image upload failed to save to the database:", err);
    return NextResponse.json(
      { error: "Couldn't save the image. Please try again in a moment." },
      { status: 500 }
    );
  }
}
