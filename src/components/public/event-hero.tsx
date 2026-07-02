import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";
import { bannerUrl, type EventWithTicketTypes } from "@/lib/data/events";

export function EventHero({ event }: { event: EventWithTicketTypes }) {
  const fromPrice = Math.min(
    ...event.ticket_types.map((t) => Number(t.price)).filter((p) => p > 0),
  );
  const banner = bannerUrl(event.banner_image);

  return (
    <section
      aria-labelledby="event-heading"
      className="relative overflow-hidden bg-kerala-600 text-white"
    >
      {/* Banner photo (if set), darkened for text legibility */}
      {banner && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kerala-800/90 via-kerala-700/70 to-kerala-700/50" />
        </>
      )}
      {/* Subtle pookalam atmosphere, low opacity so it never reads as clutter */}
      <div className="pookalam-watermark pointer-events-none absolute inset-0 opacity-[0.14]" />
      {/* Gold kasavu top edge */}
      <div className="kasavu-line absolute inset-x-0 top-0 h-1 opacity-80" />

      <div className="relative mx-auto max-w-content px-4 py-14 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-caption font-semibold uppercase tracking-wider text-gold-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-600" />
          Community Celebration
        </span>

        <h1
          id="event-heading"
          className="mt-4 max-w-2xl font-display text-[44px] font-semibold leading-[1.02] tracking-tightest sm:text-[5rem]"
        >
          {event.name}
        </h1>

        {event.description && (
          <p className="mt-5 max-w-xl text-body leading-relaxed text-white/85">
            {event.description}
          </p>
        )}

        <dl className="mt-7 flex flex-col gap-3 text-body sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 text-gold-600" />
            <dd>{formatEventDate(event.start_date, event.end_date)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-gold-600" />
            <dd>{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" variant="accent">
            <Link href={`/e/${event.slug}/register`}>
              <Ticket /> Register Now
            </Link>
          </Button>
          {Number.isFinite(fromPrice) && (
            <p className="text-small text-white/85">
              Tickets from{" "}
              <span className="font-semibold text-gold-600">₹{fromPrice}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
