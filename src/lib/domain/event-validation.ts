import { z } from "zod";
import type {
  EventRow,
  TicketTypeRow,
  ScheduleItem,
} from "@/lib/supabase/database.types";

const HEX = /^#[0-9a-fA-F]{6}$/;

export const ticketTypeInputSchema = z.object({
  name: z.string().trim().min(1, "Ticket name is required").max(60),
  category: z.enum(["adult", "child_5_12", "child_below_5"]),
  ageRule: z.string().trim().max(60).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price cannot be negative").max(1_000_000),
});

export const scheduleItemInputSchema = z.object({
  time: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
});

export const eventFormSchema = z
  .object({
    name: z.string().trim().min(2, "Event name is required").max(120),
    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens only",
      )
      .max(60),
    venue: z.string().trim().min(2, "Venue is required").max(160),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    eventType: z.enum([
      "festival",
      "sports",
      "community",
      "charity",
      "cultural",
      "workshop",
      "meeting",
    ]),
    bannerImage: z.string().optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    registrationStart: z.string().optional().or(z.literal("")),
    registrationEnd: z.string().optional().or(z.literal("")),
    capacity: z
      .string()
      .regex(/^\d*$/, "Enter a whole number")
      .optional()
      .or(z.literal("")),
    featured: z.boolean(),
    status: z.enum(["draft", "published", "closed"]),
    upiId: z.string().trim().max(120).optional().or(z.literal("")),
    upiPayeeName: z.string().trim().max(120).optional().or(z.literal("")),
    primaryColor: z.string().regex(HEX, "Invalid colour"),
    accentColor: z.string().regex(HEX, "Invalid colour"),
    backgroundColor: z.string().regex(HEX, "Invalid colour"),
    luckyDrawEnabled: z.boolean(),
    couponsPerPaidTicket: z.coerce.number().int().min(0).max(100),
    memberDiscountEnabled: z.boolean(),
    memberDiscountPercent: z.coerce.number().int().min(0).max(100),
    schedule: z.array(scheduleItemInputSchema).max(30),
    ticketTypes: z
      .array(ticketTypeInputSchema)
      .min(1, "Add at least one ticket type"),
  })
  .refine(
    (v) => {
      if (!v.endDate) return true;
      return new Date(v.endDate).getTime() >= new Date(v.startDate).getTime();
    },
    { message: "End date must be after the start date", path: ["endDate"] },
  )
  .refine(
    (v) => new Set(v.ticketTypes.map((t) => t.category)).size === v.ticketTypes.length,
    { message: "Each ticket category can be used once", path: ["ticketTypes"] },
  );

export type EventFormInput = z.infer<typeof eventFormSchema>;

/** Turn a name into a URL slug, e.g. "RUMA Onam 2026" → "ruma-onam-2026". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** ISO timestamp → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">.
 *  Uses local getters, so call this on the client for the organizer's timezone. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Defaults for a brand-new event (RUMA-style three ticket categories). */
export function blankEventValues(): EventFormInput {
  return {
    name: "",
    slug: "",
    venue: "",
    description: "",
    eventType: "festival",
    bannerImage: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    capacity: "",
    featured: false,
    status: "draft",
    upiId: "",
    upiPayeeName: "RUMA Residents Association",
    primaryColor: "#0F6A4A",
    accentColor: "#D4A017",
    backgroundColor: "#FFFDF8",
    luckyDrawEnabled: false,
    couponsPerPaidTicket: 1,
    memberDiscountEnabled: false,
    memberDiscountPercent: 20,
    schedule: [],
    ticketTypes: [
      { name: "Adult", category: "adult", ageRule: "Ages 13 and above", price: 500 },
      { name: "Child (5–12)", category: "child_5_12", ageRule: "Ages 5 to 12", price: 250 },
      { name: "Child (Below 5)", category: "child_below_5", ageRule: "Under 5 — free", price: 0 },
    ],
  };
}

/** Map an existing event (+ its ticket types) to editable form values. */
export function eventToFormValues(
  event: EventRow & { ticket_types: TicketTypeRow[] },
): EventFormInput {
  return {
    name: event.name,
    slug: event.slug,
    venue: event.venue,
    description: event.description ?? "",
    eventType: event.event_type,
    bannerImage: event.banner_image ?? "",
    startDate: isoToLocalInput(event.start_date),
    endDate: event.end_date ? isoToLocalInput(event.end_date) : "",
    registrationStart: event.registration_start
      ? isoToLocalInput(event.registration_start)
      : "",
    registrationEnd: event.registration_end
      ? isoToLocalInput(event.registration_end)
      : "",
    capacity: event.capacity != null ? String(event.capacity) : "",
    featured: event.featured,
    status: event.status,
    upiId: event.upi_id ?? "",
    upiPayeeName: event.upi_payee_name ?? "",
    primaryColor: event.primary_color,
    accentColor: event.accent_color,
    backgroundColor: event.background_color,
    luckyDrawEnabled: event.lucky_draw_enabled,
    couponsPerPaidTicket: event.coupons_per_paid_ticket,
    memberDiscountEnabled: event.member_discount_enabled,
    memberDiscountPercent: event.member_discount_percent,
    schedule: (event.schedule as ScheduleItem[]) ?? [],
    ticketTypes: event.ticket_types.map((t) => ({
      name: t.name,
      category: t.category,
      ageRule: t.age_rule ?? "",
      price: Number(t.price),
    })),
  };
}
