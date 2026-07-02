import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { committeeUserId } from "@/lib/auth";
import { bannerUrl } from "@/lib/data/events";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/domain/validation";

export const runtime = "nodejs";

// Logos may also be SVG.
const LOGO_TYPES = [...ACCEPTED_IMAGE_TYPES, "image/svg+xml"] as const;

/** Committee-only logo upload → public event-banners bucket at brand/. */
export async function POST(request: NextRequest) {
  const userId = await committeeUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (!LOGO_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Please upload a PNG, SVG, JPG, or WebP image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please keep it under 5 MB." },
      { status: 413 },
    );
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] ?? "png";
  const path = `brand/logo-${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const supabase = createAdminSupabase();
  const { error } = await supabase.storage
    .from("event-banners")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json(
      { error: "Could not upload the logo. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, url: bannerUrl(path) });
}
