import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin, CalendarX, ImageIcon } from "lucide-react";
import { listPublicEvents, type PublicEventCard } from "@/lib/data/events";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { EmptyState } from "@/components/shared/empty-state";
import { formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events · RUMA",
  description: "Upcoming and past RUMA community celebrations.",
};

function isPast(e: PublicEventCard): boolean {
  const now = Date.now();
  if (e.end_date) return new Date(e.end_date).getTime() < now;
  return new Date(e.start_date).getTime() < now;
}

export default async function EventsPage() {
  const events = await listPublicEvents();
  const upcoming = events.filter((e) => !isPast(e)).reverse(); // soonest first
  const past = events.filter(isPast);

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-12">
        <div className="text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            Celebrations
          </p>
          <h1 className="mt-3 font-display text-page-title font-semibold tracking-tightest text-charcoal sm:text-5xl">
            Events
          </h1>
        </div>

        {events.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={CalendarX}
            title="No events yet"
            description="Upcoming celebrations will appear here."
          />
        ) : (
          <div className="mt-10 space-y-12">
            {upcoming.length > 0 && (
              <Group title="Upcoming" events={upcoming} />
            )}
            {past.length > 0 && <Group title="Past" events={past} muted />}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Group({
  title,
  events,
  muted,
}: {
  title: string;
  events: PublicEventCard[];
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-4 text-section-title text-charcoal">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Link key={e.id} href={`/e/${e.slug}`} className="group">
            <div
              className={`overflow-hidden rounded-lg border border-gold/20 bg-white shadow-sm ${muted ? "opacity-80" : ""}`}
            >
              <div className="aspect-video bg-cream">
                {e.banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.banner}
                    alt={e.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl font-semibold text-charcoal">
                  {e.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-small text-text-secondary">
                  <CalendarDays className="h-4 w-4 text-gold-600" />
                  {formatEventDate(e.start_date, e.end_date)}
                </p>
                <p className="flex items-center gap-1.5 text-small text-text-secondary">
                  <MapPin className="h-4 w-4 text-gold-600" /> {e.venue}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
