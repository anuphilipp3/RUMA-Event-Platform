import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { buildSummary, memberDiscount, type SelectionItem } from "@/lib/domain/pricing";
import { generateBookingReference } from "@/lib/domain/references";
import { createRegistrationSchema } from "@/lib/domain/validation";
import type {
  RegistrationRow,
  TicketRow,
  TicketTypeRow,
  PaymentRow,
  CouponRow,
} from "@/lib/supabase/database.types";

export interface CreateRegistrationResult {
  bookingReference: string;
  registrationId: string;
  totalPayable: number;
  discountAmount: number;
  requiresPayment: boolean;
  upiId: string | null;
  upiPayeeName: string | null;
}

/**
 * Creates a pending registration. Prices are recomputed from the DB
 * (source of truth) — the client-supplied selection only carries quantities.
 */
export async function createRegistration(input: {
  eventId: string;
  familyId?: string;
  registrant: {
    fullName: string;
    flatNumber: string;
    phone: string;
    email?: string;
  };
  selection: SelectionItem[];
}): Promise<CreateRegistrationResult> {
  const parsed = createRegistrationSchema.parse(input);
  const supabase = createAdminSupabase();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, status, end_date, registration_start, registration_end, upi_id, upi_payee_name, coupons_per_paid_ticket, lucky_draw_enabled, member_discount_enabled, member_discount_percent",
    )
    .eq("id", parsed.eventId)
    .maybeSingle();

  if (eventError) throw new Error(eventError.message);
  if (!event || event.status !== "published") {
    throw new Error("This event is not open for registration.");
  }
  const now = Date.now();
  if (event.end_date && new Date(event.end_date).getTime() < now) {
    throw new Error("Registration for this event has closed.");
  }
  if (
    event.registration_start &&
    new Date(event.registration_start).getTime() > now
  ) {
    throw new Error("Registration for this event has not opened yet.");
  }
  if (
    event.registration_end &&
    new Date(event.registration_end).getTime() < now
  ) {
    throw new Error("Registration for this event has closed.");
  }

  const { data: ticketTypes, error: ttError } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", parsed.eventId);
  if (ttError) throw new Error(ttError.message);

  const summary = buildSummary(
    ticketTypes ?? [],
    parsed.selection,
    event.lucky_draw_enabled ? event.coupons_per_paid_ticket : 0,
  );
  if (summary.totalTickets === 0) {
    throw new Error("Select at least one ticket to continue.");
  }

  // RUMA-member discount: only for events that enable it, and only when the
  // registrant is tied to an ACTIVE member family. Cap = that family's member
  // count (verified server-side, never trusted from the client).
  let discountAmount = 0;
  if (event.member_discount_enabled && parsed.familyId) {
    const { data: family } = await supabase
      .from("families")
      .select("status, members(id)")
      .eq("id", parsed.familyId)
      .maybeSingle();
    const memberCount =
      (family?.members as unknown as { id: string }[] | null)?.length ?? 0;
    if (family?.status === "active" && memberCount > 0) {
      discountAmount = memberDiscount(summary, {
        percent: event.member_discount_percent,
        eligibleUnits: memberCount,
      }).discountAmount;
    }
  }
  const netPayable = Math.max(0, summary.totalPayable - discountAmount);

  const bookingReference = generateBookingReference();

  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .insert({
      event_id: parsed.eventId,
      family_id: parsed.familyId ?? null,
      booking_reference: bookingReference,
      full_name: parsed.registrant.fullName,
      flat_number: parsed.registrant.flatNumber,
      phone: parsed.registrant.phone,
      email: parsed.registrant.email || null,
      status: "pending",
      total_amount: netPayable,
      discount_amount: discountAmount,
    })
    .select("id")
    .single();
  if (regError) throw new Error(regError.message);

  const items = summary.lines.map((l) => ({
    registration_id: registration.id,
    ticket_type_id: l.ticketTypeId,
    quantity: l.quantity,
    unit_price: l.unitPrice,
  }));
  const { error: itemsError } = await supabase
    .from("registration_items")
    .insert(items);
  if (itemsError) {
    // Roll back the orphaned registration so a retry can start clean.
    await supabase.from("registrations").delete().eq("id", registration.id);
    throw new Error(itemsError.message);
  }

  return {
    bookingReference,
    registrationId: registration.id,
    totalPayable: netPayable,
    discountAmount,
    requiresPayment: netPayable > 0,
    upiId: event.upi_id,
    upiPayeeName: event.upi_payee_name,
  };
}

// ── Booking lookup (public receipt, keyed by unguessable booking_reference) ──

export interface BookingBundle {
  registration: RegistrationRow;
  event: { id: string; name: string; slug: string; venue: string };
  items: {
    quantity: number;
    unit_price: number;
    ticket_type: Pick<TicketTypeRow, "id" | "name" | "category">;
  }[];
  payment: PaymentRow | null;
  tickets: (TicketRow & {
    ticket_type: Pick<TicketTypeRow, "name" | "category">;
  })[];
  coupons: CouponRow[];
}

export interface PublicTicket {
  ticketNumber: string;
  bookingReference: string;
  status: TicketRow["status"];
  ticketTypeName: string;
  attendeeName: string;
  flatNumber: string;
  eventName: string;
  qrToken: string;
}

/** Single ticket lookup for the public QR landing page (read-only). */
export async function getTicketByQrToken(
  qrToken: string,
): Promise<PublicTicket | null> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "ticket_number, status, qr_token, ticket_types(name), registrations(full_name, flat_number, booking_reference, events(name))",
    )
    .eq("qr_token", qrToken)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as {
    ticket_number: string;
    status: TicketRow["status"];
    qr_token: string;
    ticket_types: { name: string };
    registrations: {
      full_name: string;
      flat_number: string;
      booking_reference: string;
      events: { name: string };
    };
  };

  return {
    ticketNumber: row.ticket_number,
    bookingReference: row.registrations.booking_reference,
    status: row.status,
    ticketTypeName: row.ticket_types?.name ?? "",
    attendeeName: row.registrations.full_name,
    flatNumber: row.registrations.flat_number,
    eventName: row.registrations.events?.name ?? "",
    qrToken: row.qr_token,
  };
}

export async function getBookingByReference(
  reference: string,
): Promise<BookingBundle | null> {
  const supabase = createAdminSupabase();

  const { data: registration, error } = await supabase
    .from("registrations")
    .select("*, events(id, name, slug, venue)")
    .eq("booking_reference", reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!registration) return null;

  const { events: event, ...reg } = registration as unknown as RegistrationRow & {
    events: { id: string; name: string; slug: string; venue: string };
  };

  const [{ data: items }, { data: payment }, { data: tickets }, { data: coupons }] =
    await Promise.all([
      supabase
        .from("registration_items")
        .select("quantity, unit_price, ticket_types(id, name, category)")
        .eq("registration_id", reg.id),
      supabase
        .from("payments")
        .select("*")
        .eq("registration_id", reg.id)
        .maybeSingle(),
      supabase
        .from("tickets")
        .select("*, ticket_types(name, category)")
        .eq("registration_id", reg.id)
        .order("ticket_number", { ascending: true }),
      supabase
        .from("lucky_draw_coupons")
        .select("*")
        .eq("registration_id", reg.id),
    ]);

  return {
    registration: reg,
    event,
    items: (items ?? []).map((i) => {
      const tt = i.ticket_types as unknown as Pick<
        TicketTypeRow,
        "id" | "name" | "category"
      >;
      return { quantity: i.quantity, unit_price: i.unit_price, ticket_type: tt };
    }),
    payment: payment ?? null,
    tickets: (tickets ?? []).map((t) => {
      const { ticket_types, ...rest } = t as unknown as TicketRow & {
        ticket_types: Pick<TicketTypeRow, "name" | "category">;
      };
      return { ...rest, ticket_type: ticket_types };
    }),
    coupons: coupons ?? [],
  };
}
