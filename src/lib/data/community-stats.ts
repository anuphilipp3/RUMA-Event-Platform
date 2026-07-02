import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { isActiveNow } from "@/lib/domain/membership";

export interface CommunityStats {
  families: number; // active member families
  members: number; // total members across families
  events: number; // events hosted (published or closed)
  photos: number; // published gallery photos (memories)
  volunteers: number; // active dashboard staff
}

/**
 * System-generated community statistics (Doc 11, Rule 4). Everything is a live
 * count — no hardcoded numbers.
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const supabase = createAdminSupabase();

  const [
    activeFamilies,
    membersCount,
    eventsCount,
    photosCount,
    volunteersCount,
  ] = await Promise.all([
    supabase
      .from("families")
      .select("membership_type, expires_at, status")
      .eq("status", "active"),
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("status", ["published", "closed"]),
    supabase
      .from("photos")
      .select("id, galleries!inner(status)", { count: "exact", head: true })
      .eq("galleries.status", "published"),
    supabase
      .from("admins")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const families = (activeFamilies.data ?? []).filter((f) =>
    isActiveNow({
      status: f.status,
      membership_type: f.membership_type,
      expires_at: f.expires_at,
    }),
  ).length;

  return {
    families,
    members: membersCount.count ?? 0,
    events: eventsCount.count ?? 0,
    photos: photosCount.count ?? 0,
    volunteers: volunteersCount.count ?? 0,
  };
}
