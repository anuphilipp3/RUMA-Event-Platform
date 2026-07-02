"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { saveOrgSettings } from "@/lib/data/org-settings";
import type { OrgSettings } from "@/lib/domain/membership";

export interface SettingsResult {
  ok: boolean;
  error?: string;
}

export async function saveOrgSettingsAction(
  settings: OrgSettings,
): Promise<SettingsResult> {
  await requireAdmin();
  try {
    await saveOrgSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/membership");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save settings.",
    };
  }
}
