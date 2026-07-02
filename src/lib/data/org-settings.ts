import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { withOrgDefaults, type OrgSettings } from "@/lib/domain/membership";
import type { Json } from "@/lib/supabase/database.types";

/** Public read of org settings (membership plans + association UPI). */
export async function getOrgSettings(): Promise<OrgSettings> {
  const supabase = await createServerSupabase();
  const res = await supabase
    .from("org_settings")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  const stored = (res.data as { data: unknown } | null)?.data ?? null;
  return withOrgDefaults(stored as Partial<OrgSettings> | null);
}

/** Admin write (called from a server action after auth check). */
export async function saveOrgSettings(settings: OrgSettings): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("org_settings").upsert({
    id: 1,
    data: settings as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
