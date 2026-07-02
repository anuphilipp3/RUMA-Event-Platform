import type { EventRow } from "@/lib/supabase/database.types";

/** Live = published and not past its end date. Drives public visibility. */
export function isEventLive(
  event: Pick<EventRow, "status" | "end_date">,
): boolean {
  if (event.status !== "published") return false;
  if (!event.end_date) return true;
  return new Date(event.end_date).getTime() >= Date.now();
}

/** True once an event's end date has passed. */
export function hasEnded(event: Pick<EventRow, "end_date">): boolean {
  return !!event.end_date && new Date(event.end_date).getTime() < Date.now();
}

/** Registration is open only within the (optional) registration window. */
export function isRegistrationOpen(
  event: Pick<
    EventRow,
    "status" | "end_date" | "registration_start" | "registration_end"
  >,
): boolean {
  if (!isEventLive(event)) return false;
  const now = Date.now();
  if (event.registration_start && new Date(event.registration_start).getTime() > now)
    return false;
  if (event.registration_end && new Date(event.registration_end).getTime() < now)
    return false;
  return true;
}

/** Why registration isn't open (for a friendly message). */
export function registrationClosedReason(
  event: Pick<EventRow, "registration_start">,
): "not_open_yet" | "closed" {
  if (event.registration_start && new Date(event.registration_start).getTime() > Date.now())
    return "not_open_yet";
  return "closed";
}
