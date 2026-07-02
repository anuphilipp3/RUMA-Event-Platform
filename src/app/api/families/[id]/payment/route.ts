import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/domain/validation";

export const runtime = "nodejs";

/** Attaches a membership payment screenshot to a pending family. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: familyId } = await params;
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No screenshot provided." }, { status: 400 });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, or WebP image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please keep it under 5 MB." },
      { status: 413 },
    );
  }

  const supabase = createAdminSupabase();
  const { data: family } = await supabase
    .from("families")
    .select("id, status")
    .eq("id", familyId)
    .maybeSingle();
  if (!family) {
    return NextResponse.json({ error: "Membership not found." }, { status: 404 });
  }
  if (family.status !== "pending") {
    return NextResponse.json(
      { error: "This membership has already been processed." },
      { status: 409 },
    );
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const path = `membership/${familyId}/screenshot.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("payment-screenshots")
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) {
    return NextResponse.json(
      { error: "We could not upload your screenshot. Please try again." },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("families")
    .update({ membership_screenshot: path })
    .eq("id", familyId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
