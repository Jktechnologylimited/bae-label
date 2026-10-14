import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getImage } from "@/lib/db/images";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename: rawFilename } = await params;

  // This is user-controlled input in the URL. It's just a lookup key into
  // Postgres (not a filesystem path), but strip any path-like components
  // anyway so a request like "/uploads/../../whatever" can't be mistaken
  // for anything other than a plain, harmless lookup that 404s.
  const id = path.basename(rawFilename);

  const image = await getImage(id);
  if (!image) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      // Never let a browser second-guess the content type, and never render an
      // upload as a document — belt and braces on top of the upload route's
      // magic-byte check.
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      // Each upload gets a brand-new random id that's never reused, so a
      // given URL's content never changes — safe to cache aggressively.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
