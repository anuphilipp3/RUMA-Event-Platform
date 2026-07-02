"use server";

import { revalidatePath } from "next/cache";
import { requireCommittee } from "@/lib/auth";
import { createEvent, updateEvent } from "@/lib/data/events-admin";
import type { EventFormInput } from "@/lib/domain/event-validation";

export interface EventActionResult {
  ok: boolean;
  error?: string;
  slug?: string;
}

export async function createEventAction(
  input: EventFormInput,
): Promise<EventActionResult> {
  await requireCommittee();
  try {
    const event = await createEvent(input);
    revalidatePath("/admin/events");
    revalidatePath("/");
    return { ok: true, slug: event.slug };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create the event.",
    };
  }
}

export async function updateEventAction(
  id: string,
  input: EventFormInput,
): Promise<EventActionResult> {
  await requireCommittee();
  try {
    const event = await updateEvent(id, input);
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath("/");
    revalidatePath(`/e/${event.slug}`);
    return { ok: true, slug: event.slug };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update the event.",
    };
  }
}
