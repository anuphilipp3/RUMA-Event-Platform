import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getBookingByReference } from "@/lib/data/registrations";
import { qrDataUrl, ticketUrl } from "@/lib/qr";
import { TicketPdf } from "@/components/ticket/ticket-pdf";

// PDF generation needs the Node runtime (@react-pdf uses Node APIs).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const booking = await getBookingByReference(decodeURIComponent(reference));

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.registration.status !== "approved" || booking.tickets.length === 0) {
    return NextResponse.json(
      { error: "Tickets are not available yet for this booking." },
      { status: 409 },
    );
  }

  const tickets = await Promise.all(
    booking.tickets.map(async (t) => ({
      ticketNumber: t.ticket_number,
      ticketTypeName: t.ticket_type.name,
      status: t.status,
      qrPngDataUrl: await qrDataUrl(ticketUrl(t.qr_token)),
    })),
  );

  const buffer = await renderToBuffer(
    TicketPdf({
      eventName: booking.event.name,
      venue: booking.event.venue,
      attendeeName: booking.registration.full_name,
      flatNumber: booking.registration.flat_number,
      bookingReference: booking.registration.booking_reference,
      tickets,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ruma-tickets-${booking.registration.booking_reference}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
