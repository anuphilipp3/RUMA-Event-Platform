"use server";

import { revalidatePath } from "next/cache";
import { requireCommittee } from "@/lib/auth";
import { saveSiteContent } from "@/lib/data/site-content";
import type { SiteContent } from "@/lib/domain/site-content";

export interface SaveContentResult {
  ok: boolean;
  error?: string;
}

export async function saveSiteContentAction(
  content: SiteContent,
): Promise<SaveContentResult> {
  await requireCommittee();
  try {
    await saveSiteContent(content);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save content.",
    };
  }
}
