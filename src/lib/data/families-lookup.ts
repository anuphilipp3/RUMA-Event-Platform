import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";

export interface FamilyMatch {
  id: string;
  familyName: string;
  primaryContact: string;
  flatNumber: string;
  phone: string;
  email: string | null;
  memberCount: number;
  isActiveMember: boolean;
}

/**
 * Find a family by its registered phone number, for event-registration auto-fill.
 * Returns basic contact info only (the caller supplies the phone they own).
 */
export async function findFamilyByPhone(
  phone: string,
): Promise<FamilyMatch | null> {
  const clean = phone.trim();
  if (!/^[6-9]\d{9}$/.test(clean)) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("families")
    .select("id, family_name, primary_contact, flat_number, phone, email, status, members(id)")
    .eq("phone", clean)
    .not("status", "in", "(rejected,archived)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;

  const members = (data.members as unknown as { id: string }[]) ?? [];
  return {
    id: data.id,
    familyName: data.family_name,
    primaryContact: data.primary_contact,
    flatNumber: data.flat_number,
    phone: data.phone,
    email: data.email,
    memberCount: members.length,
    isActiveMember: data.status === "active",
  };
}
