"use client";

import { EventForm } from "./event-form";
import { eventToFormValues } from "@/lib/domain/event-validation";
import type { EventForEdit } from "@/lib/data/events-admin";

/** Client boundary so datetime-local values render in the organizer's timezone. */
export function EditEventForm({ event }: { event: EventForEdit }) {
  return (
    <EventForm
      mode="edit"
      eventId={event.id}
      defaultValues={eventToFormValues(event)}
    />
  );
}
