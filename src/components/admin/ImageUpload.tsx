"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Only JPG, PNG, WebP or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });

      // The server is expected to always return JSON, but a crashed function,
      // a host's reverse proxy, or a request-size limit can return an empty
      // body or an HTML error page instead. Guard against that so the person
      // sees a real, readable error instead of a raw JSON-parse exception.
      const raw = await res.text();
      let json: { url?: string; error?: string } = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          throw new Error(
            `Upload failed (server returned ${res.status} ${res.statusText || ""}, not JSON). ` +
              "This usually means the image storage isn't set up for how this site is hosted " +
              "— see the README's Image Uploads section."
          );
        }
      }
      if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status}).`);
      if (!json.url) throw new Error("Upload succeeded but the server didn't return an image URL.");
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="mt-1.5">
        {value ? (
          <div className="relative aspect-video w-full max-w-xs overflow-hidden border border-line">
            <Image src={value} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex size-7 items-center justify-center bg-black/70 text-white hover:bg-bigdrip"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-video w-full max-w-xs flex-col items-center justify-center gap-2 border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                <ImageIcon className="size-6" />
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em]">
                  <Upload className="size-3.5" /> Upload Image
                </span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper disabled:opacity-60"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            Replace Image
          </button>
        )}
        {error && <p className="mt-2 text-xs font-medium text-bigdrip">{error}</p>}
      </div>
    </div>
  );
}
