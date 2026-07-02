"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  createStaffUser,
  updateStaffRole,
  updateStaffStatus,
  setStaffPassword,
} from "@/lib/data/users";
import type { StaffRole, UserStatus } from "@/lib/supabase/database.types";

export interface UserActionResult {
  ok: boolean;
  error?: string;
}

const ROLE = z.enum(["admin", "committee", "volunteer", "scanner"]);

const createSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: ROLE,
});

export async function createUserAction(input: {
  fullName: string;
  email: string;
  password: string;
  role: StaffRole;
}): Promise<UserActionResult> {
  await requireAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await createStaffUser(parsed.data);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not add user.",
    };
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: StaffRole,
): Promise<UserActionResult> {
  const me = await requireAdmin();
  if (userId === me.id) {
    return { ok: false, error: "You cannot change your own role." };
  }
  if (!ROLE.safeParse(role).success) {
    return { ok: false, error: "Invalid role." };
  }
  try {
    await updateStaffRole(userId, role);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update role.",
    };
  }
}

export async function setUserPasswordAction(
  userId: string,
  password: string,
): Promise<UserActionResult> {
  await requireAdmin();
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  try {
    await setStaffPassword(userId, password);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not set password.",
    };
  }
}

export async function setUserStatusAction(
  userId: string,
  status: UserStatus,
): Promise<UserActionResult> {
  const me = await requireAdmin();
  if (userId === me.id) {
    return { ok: false, error: "You cannot change your own status." };
  }
  // The acting admin is always an active admin who can't change themselves,
  // so the platform can never be left without an active administrator.
  try {
    await updateStaffStatus(userId, status);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update status.",
    };
  }
}
