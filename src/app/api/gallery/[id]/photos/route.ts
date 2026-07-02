import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { uploaderUserId } from "@/lib/auth";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
} from "@/lib/domain/gallery-validation";

export const runtime = "nodejs";

/** Organizer-only multi-file photo upload into a gallery album. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await uploaderUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id: galleryId } = await params;
  const supabase = createAdminSupabase();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id")
    .eq("id", galleryId)
    .maybeSingle();
  if (!gallery) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No photos provided." }, { status: 400 });
  }

  let uploaded = 0;
  const rows: { gallery_id: string; image_path: string; uploaded_by: string }[] = [];

  for (const file of files) {
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type as never)) continue;
    if (file.size > MAX_PHOTO_BYTES) continue;

    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `${galleryId}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("gallery-images")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (upErr) continue;

    rows.push({ gallery_id: galleryId, image_path: path, uploaded_by: userId });
    uploaded += 1;
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("photos").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (uploaded === 0) {
    return NextResponse.json(
      { error: "No valid images were uploaded (check type and size)." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, uploaded });
}
