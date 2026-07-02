import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import type { EventRow, TicketTypeRow } from "@/lib/supabase/database.types";

export interface EventWithTicketTypes extends EventRow {
  ticket_types: TicketTypeRow[];
}

/** Public URL for an event banner (stored in the public event-banners bucket). */
export function bannerUrl(path: string | null): string | null {
  if (!path) return null;
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/event-banners/${path}`;
}

/** Featured event = soonest published event that hasn't ended yet. */
export async function getFeaturedEvent(): Promise<EventWithTicketTypes | null> {
  const supabase = await createServerSupabase();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(*)")
    .eq("status", "published")
    .or(`end_date.is.null,end_date.gte.${nowIso}`)
    .order("featured", { ascending: false })
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load event: ${error.message}`);
  return normalize(data);
}

export interface PublicEventCard {
  id: string;
  slug: string;
  name: string;
  venue: string;
  start_date: string;
  end_date: string | null;
  banner: string | null;
}

/** All published events for the public /events listing. */
export async function listPublicEvents(): Promise<PublicEventCard[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, venue, start_date, end_date, banner_image")
    .eq("status", "published")
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Array<
    Pick<
      EventRow,
      "id" | "slug" | "name" | "venue" | "start_date" | "end_date" | "banner_image"
    >
  >;
  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    name: e.name,
    venue: e.venue,
    start_date: e.start_date,
    end_date: e.end_date,
    banner: bannerUrl(e.banner_image),
  }));
}

export async function getEventBySlug(
  slug: string,
): Promise<EventWithTicketTypes | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Failed to load event: ${error.message}`);
  return normalize(data);
}

function normalize(
  data: (EventRow & { ticket_types: TicketTypeRow[] }) | null,
): EventWithTicketTypes | null {
  if (!data) return null;
  return {
    ...data,
    ticket_types: [...data.ticket_types].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}
