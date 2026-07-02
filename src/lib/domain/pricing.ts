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
