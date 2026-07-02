"use server";

import { createRegistration } from "@/lib/data/registrations";
import { findFamilyByPhone, type FamilyMatch } from "@/lib/data/families-lookup";
import type { SelectionItem } from "@/lib/domain/pricing";
import type { RegistrationInput } from "@/lib/domain/validation";

export interface RegisterActionState {
  ok: boolean;
  error?: string;
  result?: Awaited<ReturnType<typeof createRegistration>>;
}

export async function submitRegistration(input: {
  eventId: string;
  familyId?: string;
  registrant: RegistrationInput;
  selection: SelectionItem[];
}): Promise<RegisterActionState> {
  try {
    const result = await createRegistration({
      eventId: input.eventId,
      familyId: input.familyId,
      registrant: {
        fullName: input.registrant.fullName,
        flatNumber: input.registrant.flatNumber,
        phone: input.registrant.phone,
        email: input.registrant.email || undefined,
      },
      selection: input.selection,
    });
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

export interface FamilyLookupState {
  found: boolean;
  family?: FamilyMatch;
}

/** Looks up a family by phone for registration auto-fill. */
export async function lookupFamily(phone: string): Promise<FamilyLookupState> {
  const family = await findFamilyByPhone(phone);
  return family ? { found: true, family } : { found: false };
}
