import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { getServerEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Service-role client — bypasses RLS. NEVER import into a client component.
 * Used by the public write path (register / upload) and privileged admin ops,
 * always after server-side validation. The key stays server-only.
 */
export function createAdminSupabase() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
