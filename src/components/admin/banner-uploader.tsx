"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/domain/validation";

function publicBannerUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/event-banners/${path}`;
}

export function BannerUploader({
  path,
  onUploaded,
}: {
  path: string;
  onUploaded: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    path ? publicBannerUrl(path) : null,
  );

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as never)) {
      toast.error("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Image is too large. Please keep it under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/events/banner", { method: "POST", body });
      const data = (await res.json()) as {
        ok?: boolean;
        path?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.path) {
        throw new Error(data.error ?? "Upload failed");
      }
      setPreview(data.url ?? publicBannerUrl(data.path));
      onUploaded(data.path);
      toast.success("Banner uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {preview ? (
        <div className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-lg border border-gold/30 bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Event banner" className="h-full w-full object-cover" />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            Change banner
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gold/40 bg-white text-center transition-colors hover:border-kerala-600 hover:bg-kerala-50"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-kerala-600" />
          ) : (
            <ImageIcon className="h-6 w-6 text-kerala-600" />
          )}
          <span className="text-body font-medium text-charcoal">
            {uploading ? "Uploading…" : "Upload event banner"}
          </span>
          <span className="text-small text-text-muted">
            Wide image · JPG, PNG, WebP · up to 5 MB
          </span>
        </button>
      )}
    </div>
  );
}
