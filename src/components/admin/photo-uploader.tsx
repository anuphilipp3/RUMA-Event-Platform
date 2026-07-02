"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
} from "@/lib/domain/gallery-validation";

export function PhotoUploader({ galleryId }: { galleryId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const valid = Array.from(files).filter(
      (f) =>
        ACCEPTED_PHOTO_TYPES.includes(f.type as never) &&
        f.size <= MAX_PHOTO_BYTES,
    );
    if (valid.length === 0) {
      toast.error("Please choose JPG, PNG or WebP images under 10 MB.");
      return;
    }
    if (valid.length < files.length) {
      toast.warning("Some files were skipped (wrong type or too large).");
    }

    setUploading(true);
    try {
      const body = new FormData();
      valid.forEach((f) => body.append("files", f));
      const res = await fetch(`/api/gallery/${galleryId}/photos`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        uploaded?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Upload failed");
      toast.success(`${data.uploaded} photo${data.uploaded === 1 ? "" : "s"} uploaded.`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "We could not upload the photos.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => upload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gold/40 bg-white px-4 py-10 text-center transition-colors hover:border-kerala-600 hover:bg-kerala-50 disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-kerala-600" />
        ) : (
          <ImagePlus className="h-6 w-6 text-kerala-600" />
        )}
        <span className="text-body font-medium text-charcoal">
          {uploading ? "Uploading…" : "Upload photos"}
        </span>
        <span className="text-small text-text-muted">
          Select multiple · JPG, PNG, WebP · up to 10 MB each
        </span>
      </button>
    </>
  );
}
