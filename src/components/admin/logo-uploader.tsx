"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoUploader({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/brand/logo", { method: "POST", body });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Logo uploaded. Save settings to apply.");
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
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {url ? (
        <div className="flex items-center gap-4">
          <div className="flex h-16 items-center rounded-md border border-gold/25 bg-white px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Logo preview" className="h-9 w-auto object-contain" />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Change
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <X /> Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-3 rounded-md border-2 border-dashed border-gold/40 bg-white px-4 py-4 transition-colors hover:border-kerala-600 hover:bg-kerala-50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-kerala-600" /> : <ImagePlus className="h-5 w-5 text-kerala-600" />}
          <span className="text-body font-medium text-charcoal">Upload logo</span>
          <span className="text-small text-text-muted">PNG, SVG, JPG · up to 5 MB</span>
        </button>
      )}
    </div>
  );
}
