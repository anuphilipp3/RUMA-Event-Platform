import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { eventFormSchema, type EventFormInput } from "@/lib/domain/event-validation";
import type { EventRow, TicketTypeRow } from "@/lib/supabase/database.types";

function toIso(local: string): string {
  // datetime-local ("YYYY-MM-DDTHH:mm") → ISO timestamptz
  return new Date(local).toISOString();
}

function eventColumns(input: EventFormInput) {
  return {
    name: input.name,
    slug: input.slug,
    venue: input.venue,
    description: input.description || null,
    event_type: input.eventType,
    banner_image: input.bannerImage || null,
    start_date: toIso(input.startDate),
    end_date: input.endDate ? toIso(input.endDate) : null,
    registration_start: input.registrationStart
      ? toIso(input.registrationStart)
      : null,
    registration_end: input.registrationEnd
      ? toIso(input.registrationEnd)
      : null,
    capacity: input.capacity ? parseInt(input.capacity, 10) : null,
    featured: input.featured,
    status: input.status,
    upi_id: input.upiId || null,
    upi_payee_name: input.upiPayeeName || null,
    primary_color: input.primaryColor,
    accent_color: input.accentColor,
    background_color: input.backgroundColor,
    lucky_draw_enabled: input.luckyDrawEnabled,
    coupons_per_paid_ticket: input.couponsPerPaidTicket,
    schedule: input.schedule,
  };
}

function ticketRows(eventId: string, input: EventFormInput) {
  return input.ticketTypes.map((t, i) => ({
    event_id: eventId,
    name: t.name,
    category: t.category,
    age_rule: t.ageRule || null,
    price: t.price,
    sort_order: i,
  }));
}

function friendlyError(message: string): string {
  if (message.includes("events_slug_key") || message.includes("duplicate key"))
    return "That URL slug is already used by another event. Choose a different one.";
  return message;
}

export async function createEvent(
  raw: EventFormInput,
): Promise<{ id: string; slug: string }> {
  const input = eventFormSchema.parse(raw);
  const supabase = createAdminSupabase();

  const { data: event, error } = await supabase
    .from("events")
    .insert(eventColumns(input))
    .select("id, slug")
    .single();
  if (error) throw new Error(friendlyError(error.message));

  const { error: ttError } = await supabase
    .from("ticket_types")
    .insert(ticketRows(event.id, input));
  if (ttError) {
    await supabase.from("events").delete().eq("id", event.id);
    throw new Error(friendlyError(ttError.message));
  }

  return event;
}

export async function updateEvent(
  id: string,
  raw: EventFormInput,
): Promise<{ id: string; slug: string }> {
  const input = eventFormSchema.parse(raw);
  const supabase = createAdminSupabase();

  const { data: event, error } = await supabase
    .from("events")
    .update(eventColumns(input))
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) throw new Error(friendlyError(error.message));

  // Upsert ticket types by (event_id, category): updates existing, adds new.
  // Removed categories are left intact to protect issued tickets.
  const { error: ttError } = await supabase
    .from("ticket_types")
    .upsert(ticketRows(id, input), { onConflict: "event_id,category" });
  if (ttError) throw new Error(friendlyError(ttError.message));

  return event;
}

export interface EventForEdit extends EventRow {
  ticket_types: TicketTypeRow[];
}

export async function getEventForEdit(id: string): Promise<EventForEdit | null> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const event = data as unknown as EventForEdit;
  return {
    ...event,
    ticket_types: [...event.ticket_types].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

export interface AdminEventListRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

export async function listAllEventsDetailed(): Promise<AdminEventListRow[]> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, slug, status, start_date, end_date")
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
