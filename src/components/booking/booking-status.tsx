import Link from "next/link";
import { Download, Gift, BadgePercent, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "./status-banner";
import { TicketCard } from "@/components/ticket/ticket-card";
import { KasavuDivider } from "@/components/shared/kasavu-divider";
import { formatINR } from "@/lib/utils";
import { qrDataUrl, ticketUrl } from "@/lib/qr";
import type { BookingBundle } from "@/lib/data/registrations";

export async function BookingStatus({ booking }: { booking: BookingBundle }) {
  const { registration, event, items, tickets, coupons } = booking;

  // Pre-render QR PNGs for each issued ticket (server-side).
  const ticketCards = await Promise.all(
    tickets.map(async (t) => ({
      id: t.id,
      qr: await qrDataUrl(ticketUrl(t.qr_token)),
      row: t,
    })),
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-caption uppercase tracking-wide text-text-muted">
          {event.name}
        </p>
        <h1 className="font-display text-page-title font-semibold tracking-tightest text-charcoal">
          Booking {registration.booking_reference}
        </h1>
      </div>

      <StatusBanner
        status={registration.status}
        reason={
          booking.payment?.payment_status === "rejected"
            ? booking.payment.rejection_reason
            : null
        }
      />

      {/* Registrant + order summary */}
      <Card className="p-5">
        <dl className="space-y-1.5 text-body">
          <SummaryRow label="Name" value={registration.full_name} />
          <SummaryRow label="Flat" value={registration.flat_number} />
          <SummaryRow label="Phone" value={registration.phone} />
        </dl>
        <KasavuDivider className="my-4" />
        <ul className="space-y-1.5 text-body">
          {items.map((i) => (
            <li
              key={i.ticket_type.id}
              className="flex justify-between text-text-secondary"
            >
              <span>
                {i.ticket_type.name} × {i.quantity}
              </span>
              <span className="font-medium text-charcoal">
                {Number(i.unit_price) === 0
                  ? "Free"
                  : formatINR(Number(i.unit_price) * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        {Number(registration.discount_amount) > 0 && (
          <div className="mt-2 flex justify-between text-small">
            <span className="flex items-center gap-1.5 font-medium text-kerala-700">
              <BadgePercent className="h-4 w-4" /> RUMA member discount
            </span>
            <span className="font-semibold text-kerala-700">
              −{formatINR(Number(registration.discount_amount))}
            </span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-gold/20 pt-3">
          <span className="font-medium text-charcoal">Total</span>
          <span className="text-card-title font-bold text-kerala-700">
            {formatINR(Number(registration.total_amount))}
          </span>
        </div>
      </Card>

      {/* Lucky draw coupons */}
      {coupons.length > 0 && (
        <Card className="border-gold/40 p-5">
          <div className="mb-3 flex items-center gap-2 text-gold-700">
            <Gift className="h-5 w-5" />
            <h2 className="text-card-title font-semibold">Lucky Draw Coupons</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {coupons.map((c) => (
              <span
                key={c.id}
                className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-small font-semibold text-gold-700"
              >
                {c.coupon_number}
              </span>
            ))}
          </div>
        </Card>
      )}

      </div>
      {/* Issued tickets — flow into a centered grid so many tickets wrap */}
      {ticketCards.length > 0 && (
        <section className="space-y-5">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between">
            <h2 className="flex items-center gap-2 text-section-title text-charcoal">
              <TicketIcon className="h-5 w-5 text-kerala-600" /> Your Tickets
              <span className="text-small font-normal text-text-muted">
                ({ticketCards.length})
              </span>
            </h2>
            <Button asChild size="sm">
              <a
                href={`/api/bookings/${registration.booking_reference}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download /> Download all
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {ticketCards.map((tc) => (
              <TicketCard
                key={tc.id}
                ticket={{
                  eventName: event.name,
                  ticketNumber: tc.row.ticket_number,
                  bookingReference: registration.booking_reference,
                  ticketTypeName: tc.row.ticket_type.name,
                  attendeeName: registration.full_name,
                  flatNumber: registration.flat_number,
                  status: tc.row.status,
                  qrPngDataUrl: tc.qr,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-small text-text-secondary">
        <Link href={`/e/${event.slug}`} className="text-kerala-700 hover:underline">
          Back to event
        </Link>
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-charcoal">{value}</dd>
    </div>
  );
}
