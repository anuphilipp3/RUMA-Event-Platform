"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCommittee, requireAdmin } from "@/lib/auth";
import {
  approveFamily,
  rejectFamily,
  setFamilyStatus,
  updateFamily,
  deleteFamily,
} from "@/lib/data/membership-admin";
import type { FamilyStatus } from "@/lib/supabase/database.types";
import type { MembershipInput } from "@/lib/domain/membership";

export interface MembershipDecisionResult {
  ok: boolean;
  error?: string;
}

function revalidateFamily(id?: string) {
  revalidatePath("/admin/membership");
  if (id) revalidatePath(`/admin/membership/${id}`);
}

export async function approveFamilyAction(
  familyId: string,
): Promise<MembershipDecisionResult> {
  const me = await requireCommittee();
  try {
    await approveFamily(familyId, me.id);
    revalidatePath("/admin/membership");
    revalidatePath(`/admin/membership/${familyId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not approve.",
    };
  }
}

export async function rejectFamilyAction(
  familyId: string,
  reason: string,
): Promise<MembershipDecisionResult> {
  const me = await requireCommittee();
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Please provide a reason." };
  try {
    await rejectFamily(familyId, me.id, trimmed);
    revalidateFamily(familyId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reject.",
    };
  }
}

export async function setFamilyStatusAction(
  familyId: string,
  status: FamilyStatus,
): Promise<MembershipDecisionResult> {
  await requireCommittee();
  try {
    await setFamilyStatus(familyId, status);
    revalidateFamily(familyId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update status.",
    };
  }
}

export async function updateFamilyAction(
  familyId: string,
  input: MembershipInput,
): Promise<MembershipDecisionResult> {
  await requireCommittee();
  try {
    await updateFamily(familyId, input);
    revalidateFamily(familyId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save family.",
    };
  }
}

/** Delete is destructive → Admin only. Redirects to the list on success. */
export async function deleteFamilyAction(familyId: string): Promise<void> {
  await requireAdmin();
  await deleteFamily(familyId);
  revalidatePath("/admin/membership");
  redirect("/admin/membership");
}
