import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { getOrgSettings } from "@/lib/data/org-settings";
import { membershipSchema, type MembershipInput } from "@/lib/domain/membership";
import { generateMembershipReference } from "@/lib/domain/references";
import type {
  FamilyRow,
  MemberRow,
} from "@/lib/supabase/database.types";

export interface CreateFamilyResult {
  membershipReference: string;
  familyId: string;
  amount: number;
  requiresPayment: boolean;
  upiId: string;
  upiPayeeName: string;
}

/** Creates a pending family membership. Plan price is authoritative from org settings. */
export async function createFamily(
  raw: MembershipInput,
): Promise<CreateFamilyResult> {
  const input = membershipSchema.parse(raw);
  const settings = await getOrgSettings();
  const plan = settings.plans.find((p) => p.key === input.membershipType);
  if (!plan) throw new Error("That membership plan is not available.");

  const supabase = createAdminSupabase();
  const membershipReference = generateMembershipReference();

  const { data: family, error } = await supabase
    .from("families")
    .insert({
      membership_reference: membershipReference,
      family_name: input.familyName,
      flat_number: input.flatNumber,
      primary_contact: input.primaryContact,
      phone: input.phone,
      email: input.email || null,
      membership_type: input.membershipType,
      membership_amount: plan.price,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    if (error.message.includes("duplicate"))
      throw new Error("A membership with this reference already exists. Please retry.");
    throw new Error(error.message);
  }

  const members = input.members.map((m) => ({
    family_id: family.id,
    full_name: m.fullName,
    relationship: m.relationship,
    age_group: m.ageGroup,
  }));
  const { error: memberError } = await supabase.from("members").insert(members);
  if (memberError) {
    await supabase.from("families").delete().eq("id", family.id);
    throw new Error(memberError.message);
  }

  return {
    membershipReference,
    familyId: family.id,
    amount: plan.price,
    requiresPayment: plan.price > 0,
    upiId: settings.upiId,
    upiPayeeName: settings.upiPayeeName,
  };
}

export interface FamilyEventHistory {
  bookingReference: string;
  eventName: string;
  eventSlug: string;
  status: string;
  createdAt: string;
}

export interface FamilyProfile {
  family: FamilyRow;
  members: MemberRow[];
  eventHistory: FamilyEventHistory[];
}

/** Public family profile by reference. Event history is matched on phone
 *  until event registrations carry a family_id. */
export async function getFamilyByReference(
  reference: string,
): Promise<FamilyProfile | null> {
  const supabase = createAdminSupabase();
  const { data: family, error } = await supabase
    .from("families")
    .select("*")
    .eq("membership_reference", reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!family) return null;

  const [{ data: members }, { data: regs }] = await Promise.all([
    supabase
      .from("members")
      .select("*")
      .eq("family_id", family.id)
      .order("created_at"),
    supabase
      .from("registrations")
      .select("booking_reference, status, created_at, events(name, slug)")
      .or(`family_id.eq.${family.id},phone.eq.${family.phone}`)
      .order("created_at", { ascending: false }),
  ]);

  const eventHistory: FamilyEventHistory[] = (regs ?? []).map((r) => {
    const ev = r.events as unknown as { name: string; slug: string };
    return {
      bookingReference: r.booking_reference,
      eventName: ev?.name ?? "Event",
      eventSlug: ev?.slug ?? "",
      status: r.status,
      createdAt: r.created_at,
    };
  });

  return {
    family: family as FamilyRow,
    members: (members as MemberRow[]) ?? [],
    eventHistory,
  };
}
