import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  financialYearEndISO,
  financialYearLabel,
  isActiveNow,
  membershipSchema,
  type MembershipInput,
} from "@/lib/domain/membership";
import type {
  FamilyRow,
  MemberRow,
  FamilyStatus,
  MembershipType,
} from "@/lib/supabase/database.types";

const SIGNED_URL_TTL = 60 * 10;

function annualExpiry(type: MembershipType): string | null {
  // Annual → end of the current financial year (31 Mar). Lifetime → never.
  return type === "annual" ? financialYearEndISO() : null;
}

export interface FamilyListRow {
  id: string;
  membership_reference: string;
  family_name: string;
  flat_number: string;
  phone: string;
  membership_type: MembershipType;
  membership_amount: number;
  status: FamilyStatus;
  expires_at: string | null;
  created_at: string;
  memberCount: number;
}

export async function listFamilies(
  filter: FamilyStatus | "all" = "pending",
): Promise<FamilyListRow[]> {
  const supabase = createAdminSupabase();
  let query = supabase
    .from("families")
    .select(
      "id, membership_reference, family_name, flat_number, phone, membership_type, membership_amount, status, expires_at, created_at, members(id)",
    )
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((f) => {
    const members = (f.members as unknown as { id: string }[]) ?? [];
    const { members: _m, ...rest } = f as typeof f & { members: unknown };
    void _m;
    return {
      ...(rest as Omit<FamilyListRow, "memberCount">),
      memberCount: members.length,
    };
  });
}

export interface FamilyDetail {
  family: FamilyRow & { screenshot_signed_url: string | null };
  members: MemberRow[];
}

export async function getFamilyDetail(id: string): Promise<FamilyDetail | null> {
  const supabase = createAdminSupabase();
  const { data: family, error } = await supabase
    .from("families")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!family) return null;

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("family_id", id)
    .order("created_at");

  let signed: string | null = null;
  if (family.membership_screenshot) {
    const { data } = await supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(family.membership_screenshot, SIGNED_URL_TTL);
    signed = data?.signedUrl ?? null;
  }

  return {
    family: { ...(family as FamilyRow), screenshot_signed_url: signed },
    members: (members as MemberRow[]) ?? [],
  };
}

export async function approveFamily(id: string, adminId: string): Promise<void> {
  const supabase = createAdminSupabase();
  const { data: fam } = await supabase
    .from("families")
    .select("membership_type, receipt_no")
    .eq("id", id)
    .maybeSingle();

  const now = new Date().toISOString();
  // Generate a sequential receipt number within the financial year (unless one
  // was already assigned, e.g. an imported record).
  let receiptNo = fam?.receipt_no ?? null;
  if (!receiptNo) {
    const fy = financialYearLabel();
    const { count } = await supabase
      .from("families")
      .select("id", { count: "exact", head: true })
      .ilike("receipt_no", `RUMA/PR ${fy}/%`);
    receiptNo = `RUMA/PR ${fy}/${String((count ?? 0) + 1).padStart(3, "0")}`;
  }

  const { error } = await supabase
    .from("families")
    .update({
      status: "active",
      approved_by: adminId,
      approved_at: now,
      joined_at: now,
      expires_at: annualExpiry((fam?.membership_type as MembershipType) ?? "annual"),
      receipt_no: receiptNo,
      payment_method: "UPI",
      rejection_reason: null,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

export async function rejectFamily(
  id: string,
  adminId: string,
  reason: string,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("families")
    .update({
      status: "rejected",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

/** Deactivate / reactivate. Reactivating an annual family renews its expiry. */
export async function setFamilyStatus(
  id: string,
  status: FamilyStatus,
): Promise<void> {
  const supabase = createAdminSupabase();
  const patch: {
    status: FamilyStatus;
    expires_at?: string | null;
    joined_at?: string;
  } = { status };
  if (status === "active") {
    const { data: fam } = await supabase
      .from("families")
      .select("membership_type")
      .eq("id", id)
      .maybeSingle();
    patch.expires_at = annualExpiry(
      (fam?.membership_type as MembershipType) ?? "annual",
    );
    patch.joined_at = new Date().toISOString();
  }
  const { error } = await supabase.from("families").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Edit family details + replace the member roster. */
export async function updateFamily(
  id: string,
  raw: MembershipInput,
): Promise<void> {
  const input = membershipSchema.parse(raw);
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from("families")
    .update({
      family_name: input.familyName,
      flat_number: input.flatNumber,
      primary_contact: input.primaryContact,
      phone: input.phone,
      email: input.email || null,
      membership_type: input.membershipType,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("members").delete().eq("family_id", id);
  const members = input.members.map((m) => ({
    family_id: id,
    full_name: m.fullName,
    relationship: m.relationship,
    age_group: m.ageGroup,
    blood_group: m.bloodGroup === "unknown" ? null : m.bloodGroup,
  }));
  const { error: memberError } = await supabase.from("members").insert(members);
  if (memberError) throw new Error(memberError.message);
}

export async function deleteFamily(id: string): Promise<void> {
  const supabase = createAdminSupabase();
  const { data: fam } = await supabase
    .from("families")
    .select("membership_screenshot")
    .eq("id", id)
    .maybeSingle();
  // Members cascade on family delete.
  const { error } = await supabase.from("families").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (fam?.membership_screenshot) {
    await supabase.storage
      .from("payment-screenshots")
      .remove([fam.membership_screenshot]);
  }
}

export async function getMembershipStats(): Promise<{
  active: number;
  pending: number;
  members: number;
}> {
  const supabase = createAdminSupabase();
  const [{ data: activeRows }, { count: pending }, { count: members }] =
    await Promise.all([
      supabase
        .from("families")
        .select("membership_type, expires_at, status")
        .eq("status", "active"),
      supabase
        .from("families")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("members").select("id", { count: "exact", head: true }),
    ]);

  const active = (activeRows ?? []).filter((f) =>
    isActiveNow({
      status: f.status,
      membership_type: f.membership_type,
      expires_at: f.expires_at,
    }),
  ).length;

  return { active, pending: pending ?? 0, members: members ?? 0 };
}
