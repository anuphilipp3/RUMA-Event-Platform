import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import type { StaffRole, UserStatus } from "@/lib/supabase/database.types";

export interface StaffListItem {
  userId: string;
  email: string;
  fullName: string | null;
  role: StaffRole;
  status: UserStatus;
  createdAt: string;
  lastSignInAt: string | null;
}

export async function listStaff(): Promise<StaffListItem[]> {
  const supabase = createAdminSupabase();
  const { data: rows, error } = await supabase
    .from("admins")
    .select("user_id, email, full_name, role, status, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  // Last sign-in comes from the auth users list (small team → one page is fine).
  const lastSignIn = new Map<string, string | null>();
  const { data: authList } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  authList?.users.forEach((u) => lastSignIn.set(u.id, u.last_sign_in_at ?? null));

  return (rows ?? []).map((r) => ({
    userId: r.user_id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    status: r.status,
    createdAt: r.created_at,
    lastSignInAt: lastSignIn.get(r.user_id) ?? null,
  }));
}

/** Creates a Supabase auth user (email confirmed) and adds them as staff. */
export async function createStaffUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: StaffRole;
}): Promise<void> {
  const supabase = createAdminSupabase();

  const { data: created, error: authErr } = await supabase.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (authErr || !created.user) {
    const msg = authErr?.message ?? "Could not create the account.";
    if (msg.toLowerCase().includes("already"))
      throw new Error("A user with this email already exists.");
    throw new Error(msg);
  }

  const { error: adminErr } = await supabase.from("admins").insert({
    user_id: created.user.id,
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName,
    role: input.role,
    status: "active",
  });
  if (adminErr) {
    // Roll back the auth user so a retry is clean.
    await supabase.auth.admin.deleteUser(created.user.id);
    throw new Error(adminErr.message);
  }
}

export async function updateStaffRole(
  userId: string,
  role: StaffRole,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("admins")
    .update({ role })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/** Admin sets a new password for a staff member (no email involved). */
export async function setStaffPassword(
  userId: string,
  password: string,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) throw new Error(error.message);
}

export async function updateStaffStatus(
  userId: string,
  status: UserStatus,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("admins")
    .update({ status })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/** Guards against removing the last active administrator. */
export async function countActiveAdmins(): Promise<number> {
  const supabase = createAdminSupabase();
  const { count } = await supabase
    .from("admins")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active");
  return count ?? 0;
}
