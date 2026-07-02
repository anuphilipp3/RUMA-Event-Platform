import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { StaffRole, UserStatus } from "@/lib/supabase/database.types";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
  status: UserStatus;
}

const VOLUNTEER_PLUS: StaffRole[] = ["admin", "committee", "volunteer"];
const COMMITTEE_PLUS: StaffRole[] = ["admin", "committee"];

/** Returns the signed-in staff member, or null if not signed in / not staff / inactive. */
export async function getStaff(): Promise<StaffUser | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminSupabase();
  const { data: row } = await admin
    .from("admins")
    .select("email, full_name, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row || row.status !== "active") return null;
  return {
    id: user.id,
    email: row.email ?? user.email ?? "",
    fullName: row.full_name,
    role: row.role,
    status: row.status,
  };
}

/**
 * Where to send a signed-in staff member who lacks the required tier:
 * scanners can only use check-in; everyone else lands on the dashboard home.
 */
function bounce(role: StaffRole): never {
  redirect(role === "scanner" ? "/admin/check-in" : "/admin");
}

/** Any active dashboard user (incl. scanner). */
export async function requireStaff(): Promise<StaffUser> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const staff = await getStaff();
  if (!staff) redirect("/admin/forbidden");
  return staff;
}

/** Volunteer and above — operational access (registrations, payments, reports). */
export async function requireVolunteer(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (!VOLUNTEER_PLUS.includes(staff.role)) bounce(staff.role);
  return staff;
}

/** Committee and above — content + event management. */
export async function requireCommittee(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (!COMMITTEE_PLUS.includes(staff.role)) bounce(staff.role);
  return staff;
}

/** Administrators only — users + settings. */
export async function requireAdmin(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (staff.role !== "admin") bounce(staff.role);
  return staff;
}

/** Non-redirecting check for API routes: user id if volunteer+, else null. */
export async function uploaderUserId(): Promise<string | null> {
  const staff = await getStaff();
  return staff && VOLUNTEER_PLUS.includes(staff.role) ? staff.id : null;
}

/** Non-redirecting check for API routes: user id if committee+, else null. */
export async function committeeUserId(): Promise<string | null> {
  const staff = await getStaff();
  return staff && COMMITTEE_PLUS.includes(staff.role) ? staff.id : null;
}
