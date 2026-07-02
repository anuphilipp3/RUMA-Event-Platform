import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { getTicketByQrToken } from "@/lib/data/registrations";
import { TicketCard } from "@/components/ticket/ticket-card";
import { SiteHeader } from "@/components/public/site-header";
import { qrDataUrl, ticketUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await params;
  const ticket = await getTicketByQrToken(qrToken);
  if (!ticket) notFound();

  const qr = await qrDataUrl(ticketUrl(ticket.qrToken));
  const checkedIn = ticket.status === "checked_in";

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-8">
        <div
          className={`flex items-center gap-2 rounded-md border p-3 text-small ${
            checkedIn
              ? "border-gold/40 bg-gold/10 text-gold-700"
              : "border-kerala-600/30 bg-kerala-50 text-kerala-700"
          }`}
        >
          {checkedIn ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          <span className="font-medium">
            {checkedIn ? "This ticket has been checked in." : "Valid ticket."}
          </span>
        </div>

        <TicketCard
          ticket={{
            eventName: ticket.eventName,
            ticketNumber: ticket.ticketNumber,
            bookingReference: ticket.bookingReference,
            ticketTypeName: ticket.ticketTypeName,
            attendeeName: ticket.attendeeName,
            flatNumber: ticket.flatNumber,
            status: ticket.status,
            qrPngDataUrl: qr,
          }}
        />

        <p className="text-center text-small text-text-secondary">
          <Link
            href={`/booking/${ticket.bookingReference}`}
            className="text-kerala-700 hover:underline"
          >
            View full booking
          </Link>
        </p>
      </main>
    </div>
  );
}
