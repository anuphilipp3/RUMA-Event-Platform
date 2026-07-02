"use server";

import { createFamily, type CreateFamilyResult } from "@/lib/data/membership";
import type { MembershipInput } from "@/lib/domain/membership";

export interface MembershipActionState {
  ok: boolean;
  error?: string;
  result?: CreateFamilyResult;
}

export async function submitMembership(
  input: MembershipInput,
): Promise<MembershipActionState> {
  try {
    const result = await createFamily(input);
    return { ok: true, result };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
    };
  }
}
