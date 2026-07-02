"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requireStaff, requireVolunteer, requireCommittee } from "@/lib/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function approveRegistrationAction(
  registrationId: string,
): Promise<ActionResult> {
  await requireVolunteer();
  const supabase = await createServerSupabase();
  // ponytail: `as never` sidesteps postgrest-js 2.110's rpc-arg overload
  // inference (args resolve to `undefined` with hand-written types); the arg
  // shape is authoritative in supabase/migrations/0003_approval.sql.
  const { error } = await supabase.rpc("approve_registration", {
    p_registration_id: registrationId,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/registrations");
  revalidatePath(`/admin/registrations/${registrationId}`);
  return { ok: true };
}

export async function rejectRegistrationAction(
  registrationId: string,
  reason: string,
): Promise<ActionResult> {
  await requireVolunteer();
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Please provide a reason." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("reject_registration", {
    p_registration_id: registrationId,
    p_reason: trimmed,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/registrations");
  revalidatePath(`/admin/registrations/${registrationId}`);
  return { ok: true };
}

export interface CheckInResult extends ActionResult {
  data?: {
    result: "valid" | "already_checked_in" | "invalid" | "no_coupons";
    ticket_number?: string;
    attendee?: string;
    flat?: string;
    ticket_type?: string;
  };
}

export async function checkInTicketAction(
  qrToken: string,
): Promise<CheckInResult> {
  await requireStaff(); // scanners allowed
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("check_in_ticket", {
    p_qr_token: qrToken,
  } as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true, data: data as CheckInResult["data"] };
}

export interface DrawResult extends ActionResult {
  data?: {
    result: "winner" | "no_coupons";
    coupon_number?: string;
    attendee?: string;
    flat?: string;
    phone?: string;
  };
}

export async function drawLuckyWinnerAction(
  eventId: string,
): Promise<DrawResult> {
  await requireCommittee();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("draw_lucky_winner", {
    p_event_id: eventId,
  } as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/lucky-draw");
  return { ok: true, data: data as DrawResult["data"] };
}

export async function setLuckyDrawEnabledAction(
  eventId: string,
  enabled: boolean,
): Promise<ActionResult> {
  await requireCommittee();
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("events")
    .update({ lucky_draw_enabled: enabled })
    .eq("id", eventId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/lucky-draw");
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
