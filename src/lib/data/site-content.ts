import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  withDefaults,
  type SiteContent,
} from "@/lib/domain/site-content";
import type { Json } from "@/lib/supabase/database.types";

/** Public read of homepage CMS content (falls back to defaults). */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = await createServerSupabase();
  const res = await supabase
    .from("site_content")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  const stored = (res.data as { data: unknown } | null)?.data ?? null;
  return withDefaults(stored as Partial<SiteContent> | null);
}

/** Organizer write (called from a server action after auth check). */
export async function saveSiteContent(content: SiteContent): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("site_content").upsert({
    id: 1,
    data: content as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
