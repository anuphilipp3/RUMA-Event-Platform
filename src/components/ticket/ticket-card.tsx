import { Download } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { TicketStatus } from "@/lib/supabase/database.types";

export interface TicketCardData {
  eventName: string;
  ticketNumber: string;
  bookingReference: string;
  ticketTypeName: string;
  attendeeName: string;
  flatNumber: string;
  status: TicketStatus;
  qrPngDataUrl: string;
}

/**
 * Vertical digital pass. Green header band (with a faint pookalam only on the
 * dark band, never behind text), a perforated tear line, then a CLEAN white
 * body for maximum QR + detail readability.
 */
export function TicketCard({ ticket }: { ticket: TicketCardData }) {
  return (
    <article className="w-full max-w-[21rem] overflow-hidden rounded-ticket border border-gold/30 bg-white shadow-lg">
      {/* Header band */}
      <div className="relative overflow-hidden bg-kerala-700 px-6 pb-8 pt-6 text-white">
        <div className="pookalam-watermark pointer-events-none absolute inset-0 opacity-[0.10]" />
        <div className="kasavu-line absolute inset-x-0 top-0 h-1 opacity-90" />
        <p className="relative text-caption font-semibold uppercase tracking-[0.3em] text-gold-600">
          RUMA Onam
        </p>
        <h3 className="relative mt-1 font-display text-2xl font-semibold leading-tight tracking-tightest">
          {ticket.eventName}
        </h3>
        <span className="relative mt-3 inline-flex rounded-full bg-gold-600 px-3 py-1 text-caption font-bold uppercase tracking-wide text-charcoal">
          {ticket.ticketTypeName}
        </span>
      </div>

      {/* Perforated tear line with punched side notches */}
      <div className="relative h-0">
        <span className="absolute -left-2.5 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-ivory" />
        <span className="absolute -right-2.5 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-ivory" />
        <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-gold/40" />
      </div>

      {/* Clean white body */}
      <div className="px-6 pb-6 pt-7 text-center">
        <p className="text-caption uppercase tracking-widest text-text-muted">
          Attendee
        </p>
        <p className="font-display text-xl font-semibold text-charcoal">
          {ticket.attendeeName}
        </p>
        <p className="mt-0.5 text-small text-text-secondary">
          Flat {ticket.flatNumber}
        </p>

        <div className="my-5 flex justify-center">
          <img
            src={ticket.qrPngDataUrl}
            alt={`QR code for ticket ${ticket.ticketNumber}`}
            width={168}
            height={168}
            className="rounded-xl border border-gold/20 p-2 shadow-sm"
          />
        </div>
        <p className="text-caption uppercase tracking-[0.2em] text-text-muted">
          Scan at entry
        </p>

        <dl className="mt-5 space-y-2 border-t border-dashed border-gold/30 pt-4 text-left">
          <Field label="Ticket No." value={ticket.ticketNumber} />
          <Field label="Booking" value={ticket.bookingReference} />
        </dl>

        <div className="mt-4 flex justify-center">
          <StatusBadge status={ticket.status} />
        </div>

        <a
          href={`/api/bookings/${ticket.bookingReference}/pdf?ticket=${encodeURIComponent(ticket.ticketNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-kerala-600/40 px-3 py-2 text-small font-semibold text-kerala-700 transition-colors hover:bg-kerala-600 hover:text-white"
        >
          <Download className="h-4 w-4" /> Download this ticket
        </a>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-caption uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="font-mono text-small font-semibold tracking-tight text-charcoal">
        {value}
      </dd>
    </div>
  );
}
