import type { TicketCategory, TicketTypeRow } from "@/lib/supabase/database.types";

export interface SelectionItem {
  ticketTypeId: string;
  quantity: number;
}

export interface SummaryLine {
  ticketTypeId: string;
  name: string;
  category: TicketCategory;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isFree: boolean;
}

export interface OrderSummary {
  lines: SummaryLine[];
  totalPayable: number;
  totalTickets: number;
  paidTickets: number; // tickets with price > 0 → drive lucky draw coupons
  luckyDrawCoupons: number;
}

/**
 * Authoritative order math. Prices always come from the ticket_types rows
 * (the source of truth for "dynamic pricing"), never from the client.
 */
export function buildSummary(
  ticketTypes: Pick<
    TicketTypeRow,
    "id" | "name" | "category" | "price"
  >[],
  selection: SelectionItem[],
  couponsPerPaidTicket: number,
): OrderSummary {
  const byId = new Map(ticketTypes.map((t) => [t.id, t]));
  const lines: SummaryLine[] = [];

  for (const { ticketTypeId, quantity } of selection) {
    if (quantity <= 0) continue;
    const tt = byId.get(ticketTypeId);
    if (!tt) throw new Error(`Unknown ticket type: ${ticketTypeId}`);
    const unitPrice = Number(tt.price);
    lines.push({
      ticketTypeId: tt.id,
      name: tt.name,
      category: tt.category,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      isFree: unitPrice === 0,
    });
  }

  const totalPayable = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalTickets = lines.reduce((s, l) => s + l.quantity, 0);
  const paidTickets = lines
    .filter((l) => !l.isFree)
    .reduce((s, l) => s + l.quantity, 0);

  return {
    lines,
    totalPayable,
    totalTickets,
    paidTickets,
    luckyDrawCoupons: paidTickets * couponsPerPaidTicket,
  };
}

export interface MemberDiscount {
  percent: number; // e.g. 20 for 20% off
  eligibleUnits: number; // cap: how many paid tickets qualify (= family member count)
}

export interface DiscountResult {
  discountAmount: number; // whole rupees taken off the order
  discountedUnits: number; // how many ticket units were discounted
}

/**
 * RUMA-member discount. Applies `percent` off up to `eligibleUnits` paid ticket
 * units — the most expensive units first, so members get the best benefit.
 * Extra tickets beyond the cap pay full price. Free tickets are never counted.
 */
export function memberDiscount(
  summary: OrderSummary,
  discount: MemberDiscount | null,
): DiscountResult {
  if (!discount || discount.percent <= 0 || discount.eligibleUnits <= 0) {
    return { discountAmount: 0, discountedUnits: 0 };
  }

  const units: number[] = [];
  for (const line of summary.lines) {
    if (line.isFree) continue;
    for (let i = 0; i < line.quantity; i++) units.push(line.unitPrice);
  }
  units.sort((a, b) => b - a);

  const take = Math.min(discount.eligibleUnits, units.length);
  const base = units.slice(0, take).reduce((sum, price) => sum + price, 0);
  const discountAmount = Math.round((base * discount.percent) / 100);

  return { discountAmount, discountedUnits: take };
}
