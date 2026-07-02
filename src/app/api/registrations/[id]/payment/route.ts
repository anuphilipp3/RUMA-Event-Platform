import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/domain/validation";

/**
 * Attaches a UPI payment screenshot to a pending registration.
 * Server-validated (type + size), stored in the private bucket, and recorded
 * as a pending payment. Idempotency is guaranteed by the payments unique
 * constraint on registration_id.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: registrationId } = await params;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No screenshot was provided." },
      { status: 400 },
    );
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

  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .select("id, status, total_amount")
    .eq("id", registrationId)
    .maybeSingle();
  if (regError) {
    return NextResponse.json({ error: regError.message }, { status: 500 });
  }
  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found." },
      { status: 404 },
    );
  }
  if (registration.status !== "pending") {
    return NextResponse.json(
      { error: "This registration has already been processed." },
      { status: 409 },
    );
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const objectPath = `${registrationId}/screenshot.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("payment-screenshots")
    .upload(objectPath, bytes, { contentType: file.type, upsert: true });
  if (uploadError) {
    return NextResponse.json(
      { error: "We could not upload your screenshot. Please try again." },
      { status: 500 },
    );
  }

  const { error: paymentError } = await supabase.from("payments").upsert(
    {
      registration_id: registrationId,
      amount: registration.total_amount,
      screenshot_url: objectPath,
      payment_status: "pending",
    },
    { onConflict: "registration_id" },
  );
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
