import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookingByReference } from "@/lib/data/registrations";
import { SiteHeader } from "@/components/public/site-header";
import { BookingStatus } from "@/components/booking/booking-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Booking · RUMA Events" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await getBookingByReference(decodeURIComponent(reference));
  if (!booking) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader />
      <main className="flex-1 px-4 py-8">
        <BookingStatus booking={booking} />
      </main>
    </div>
  );
}
