import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import type {
  RegistrationRow,
  RegistrationStatus,
  PaymentRow,
  TicketRow,
  TicketTypeRow,
  CouponRow,
} from "@/lib/supabase/database.types";

const SIGNED_URL_TTL = 60 * 10; // 10 minutes

export interface DashboardStats {
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingApprovals: number;
  totalRevenue: number; // collected (approved)
  expectedRevenue: number; // pending + approved
  pendingRevenue: number; // pending only
  adults: number;
  children: number;
  checkedIn: number;
  totalTickets: number;
  couponsIssued: number;
}

/** Aggregated dashboard metrics for one event. */
export async function getDashboardStats(
  eventId: string,
): Promise<DashboardStats> {
  const supabase = createAdminSupabase();

  const [regs, items, tickets, coupons] = await Promise.all([
    supabase
      .from("registrations")
      .select("id, status, total_amount")
      .eq("event_id", eventId),
    supabase
      .from("registration_items")
      .select("quantity, ticket_types(category), registrations!inner(event_id, status)")
      .eq("registrations.event_id", eventId)
      .eq("registrations.status", "approved"),
    supabase
      .from("tickets")
      .select("status, registrations!inner(event_id)")
      .eq("registrations.event_id", eventId),
    supabase.from("lucky_draw_coupons").select("id").eq("event_id", eventId),
  ]);

  const registrations = regs.data ?? [];
  const approved = registrations.filter((r) => r.status === "approved");
  const pending = registrations.filter((r) => r.status === "pending");
  const sum = (rows: { total_amount: number }[]) =>
    rows.reduce((s, r) => s + Number(r.total_amount), 0);

  let adults = 0;
  let children = 0;
  for (const row of items.data ?? []) {
    const category = (row.ticket_types as unknown as { category: string })
      ?.category;
    if (category === "adult") adults += row.quantity;
    else children += row.quantity;
  }

  const ticketRows = tickets.data ?? [];

  return {
    totalRegistrations: registrations.length,
    approvedRegistrations: approved.length,
    pendingApprovals: pending.length,
    totalRevenue: sum(approved),
    expectedRevenue: sum(approved) + sum(pending),
    pendingRevenue: sum(pending),
    adults,
    children,
    checkedIn: ticketRows.filter((t) => t.status === "checked_in").length,
    totalTickets: ticketRows.length,
    couponsIssued: (coupons.data ?? []).length,
  };
}

export interface RegistrationListRow {
  id: string;
  booking_reference: string;
  full_name: string;
  flat_number: string;
  phone: string;
  status: RegistrationStatus;
  total_amount: number;
  created_at: string;
  payment_status: string | null;
}

/** Registration list, optionally filtered by status. */
export async function listRegistrations(
  eventId: string,
  filter: RegistrationStatus | "all" = "all",
): Promise<RegistrationListRow[]> {
  const supabase = createAdminSupabase();
  let query = supabase
    .from("registrations")
    .select(
      "id, booking_reference, full_name, flat_number, phone, status, total_amount, created_at, payments(payment_status)",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => {
    const payment = r.payments as unknown as
      | { payment_status: string }
      | { payment_status: string }[]
      | null;
    const payment_status = Array.isArray(payment)
      ? (payment[0]?.payment_status ?? null)
      : (payment?.payment_status ?? null);
    const { payments, ...rest } = r as typeof r & { payments: unknown };
    void payments;
    return { ...rest, payment_status } as RegistrationListRow;
  });
}

export interface RegistrationDetail {
  registration: RegistrationRow;
  items: {
    quantity: number;
    unit_price: number;
    ticket_type: Pick<TicketTypeRow, "id" | "name" | "category">;
  }[];
  payment: (PaymentRow & { screenshot_signed_url: string | null }) | null;
  tickets: (TicketRow & { ticket_type_name: string })[];
  coupons: CouponRow[];
}

export async function getRegistrationDetail(
  registrationId: string,
): Promise<RegistrationDetail | null> {
  const supabase = createAdminSupabase();

  const { data: registration, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!registration) return null;

  const [{ data: items }, { data: payment }, { data: tickets }, { data: coupons }] =
    await Promise.all([
      supabase
        .from("registration_items")
        .select("quantity, unit_price, ticket_types(id, name, category)")
        .eq("registration_id", registrationId),
      supabase
        .from("payments")
        .select("*")
        .eq("registration_id", registrationId)
        .maybeSingle(),
      supabase
        .from("tickets")
        .select("*, ticket_types(name)")
        .eq("registration_id", registrationId)
        .order("ticket_number"),
      supabase
        .from("lucky_draw_coupons")
        .select("*")
        .eq("registration_id", registrationId),
    ]);

  let paymentWithUrl: RegistrationDetail["payment"] = null;
  if (payment) {
    const { data: signed } = await supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(payment.screenshot_url, SIGNED_URL_TTL);
    paymentWithUrl = {
      ...payment,
      screenshot_signed_url: signed?.signedUrl ?? null,
    };
  }

  return {
    registration,
    items: (items ?? []).map((i) => ({
      quantity: i.quantity,
      unit_price: i.unit_price,
      ticket_type: i.ticket_types as unknown as Pick<
        TicketTypeRow,
        "id" | "name" | "category"
      >,
    })),
    payment: paymentWithUrl,
    tickets: (tickets ?? []).map((t) => {
      const tt = (t.ticket_types as unknown as { name: string })?.name ?? "";
      const { ticket_types, ...rest } = t as typeof t & { ticket_types: unknown };
      void ticket_types;
      return { ...(rest as TicketRow), ticket_type_name: tt };
    }),
    coupons: coupons ?? [],
  };
}

export interface LuckyDrawSummary {
  totalCoupons: number;
  activeCoupons: number;
  wonCoupons: number;
  winners: {
    coupon_number: string;
    full_name: string;
    flat_number: string;
  }[];
}

/** Lucky draw counts + list of past winners for an event. */
export async function getLuckyDrawSummary(
  eventId: string,
): Promise<LuckyDrawSummary> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("lucky_draw_coupons")
    .select("coupon_number, status, registrations(full_name, flat_number)")
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const winners = rows
    .filter((r) => r.status === "won")
    .map((r) => {
      const reg = r.registrations as unknown as {
        full_name: string;
        flat_number: string;
      };
      return {
        coupon_number: r.coupon_number,
        full_name: reg?.full_name ?? "",
        flat_number: reg?.flat_number ?? "",
      };
    });

  return {
    totalCoupons: rows.length,
    activeCoupons: rows.filter((r) => r.status === "active").length,
    wonCoupons: winners.length,
    winners,
  };
}

export type ActivityKind = "registered" | "approved" | "checked_in";
export interface ActivityItem {
  kind: ActivityKind;
  who: string;
  detail: string;
  at: string; // ISO
}

/** Merged, most-recent-first activity feed for the operations dashboard. */
export async function getRecentActivity(
  eventId: string,
  limit = 8,
): Promise<ActivityItem[]> {
  const supabase = createAdminSupabase();

  const [newRegs, approvals, checkins] = await Promise.all([
    supabase
      .from("registrations")
      .select("full_name, flat_number, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("payments")
      .select("approved_at, registrations!inner(full_name, flat_number, event_id)")
      .eq("registrations.event_id", eventId)
      .eq("payment_status", "approved")
      .not("approved_at", "is", null)
      .order("approved_at", { ascending: false })
      .limit(limit),
    supabase
      .from("attendance_logs")
      .select("scanned_at, tickets!inner(registrations!inner(full_name, flat_number, event_id))")
      .eq("tickets.registrations.event_id", eventId)
      .order("scanned_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  for (const r of newRegs.data ?? []) {
    items.push({
      kind: "registered",
      who: r.full_name,
      detail: `Flat ${r.flat_number} · registered`,
      at: r.created_at,
    });
  }
  for (const p of approvals.data ?? []) {
    const reg = p.registrations as unknown as {
      full_name: string;
      flat_number: string;
    };
    if (!p.approved_at) continue;
    items.push({
      kind: "approved",
      who: reg?.full_name ?? "A family",
      detail: `Flat ${reg?.flat_number ?? "—"} · payment approved`,
      at: p.approved_at,
    });
  }
  for (const c of checkins.data ?? []) {
    const reg = (
      c.tickets as unknown as {
        registrations: { full_name: string; flat_number: string };
      }
    )?.registrations;
    items.push({
      kind: "checked_in",
      who: reg?.full_name ?? "A guest",
      detail: `Flat ${reg?.flat_number ?? "—"} · checked in`,
      at: c.scanned_at,
    });
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/** V1 operates on a single primary event: the soonest upcoming one. */
export async function getPrimaryEvent() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, slug, status, start_date, end_date, venue, lucky_draw_enabled")
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Distinct list of events for the admin scope switcher (defaults handled by caller). */
export async function listAdminEvents() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, slug, status")
    .order("start_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
