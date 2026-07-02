import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  HeartHandshake,
  Ticket,
} from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { KasavuDivider } from "@/components/shared/kasavu-divider";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatINR } from "@/lib/utils";
import type { EventWithTicketTypes } from "@/lib/data/events";
import type { SiteContent } from "@/lib/domain/site-content";
import type { CommunityStats } from "@/lib/data/community-stats";

/**
 * RUMA association home. Copy comes from CMS content (dashboard); the featured
 * event and community statistics are pulled live from records (auto-generated).
 */
export function RumaHome({
  content,
  event,
  photos = [],
  stats,
}: {
  content: SiteContent;
  event: EventWithTicketTypes | null;
  photos?: string[];
  stats: CommunityStats;
}) {
  const statCards =
    content.statsMode === "auto"
      ? [
          { value: stats.families.toLocaleString("en-IN"), label: "Families" },
          { value: stats.members.toLocaleString("en-IN"), label: "Members" },
          { value: stats.events.toLocaleString("en-IN"), label: "Events hosted" },
          { value: stats.photos.toLocaleString("en-IN"), label: "Memories" },
        ]
      : content.stats.map((s) => ({ value: s.value, label: s.label }));
  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative mx-auto max-w-content px-4 pb-6 pt-16 text-center sm:pt-24">
          <p className="text-caption font-semibold uppercase tracking-[0.35em] text-gold-700">
            {content.hero.eyebrow}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-[13vw] font-semibold leading-[0.95] tracking-tightest text-kerala-800 sm:text-[5.5rem]">
            {content.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-body text-text-secondary sm:text-lg">
            {content.hero.subheadline}
          </p>

          <div className="mt-10">
            {event ? (
              <FeaturedEvent event={event} />
            ) : (
              <div className="mx-auto max-w-md rounded-lg border border-dashed border-gold/40 bg-white/60 px-6 py-8">
                <p className="text-body font-medium text-charcoal">
                  No celebration is open right now.
                </p>
                <p className="mt-1 text-small text-text-secondary">
                  Our next event will appear here — do check back soon.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Community stats */}
        <section className="mx-auto max-w-content px-4 py-12">
          <p className="text-center text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            Our Community
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl font-semibold text-kerala-700 sm:text-5xl tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-small text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-content px-4">
          <KasavuDivider className="my-8" />
        </div>

        {/* About */}
        <section className="mx-auto grid max-w-content gap-10 px-4 py-8 sm:grid-cols-[1.1fr_1fr] sm:items-center">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
              {content.about.label}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tightest text-charcoal">
              {content.about.title}
            </h2>
            {content.about.body.map((p, i) => (
              <p key={i} className="mt-4 text-body leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ValueCard
              icon={Users}
              title="Every family, welcome"
              body="Registration is built around households, so booking for the whole family takes a minute."
            />
            <ValueCard
              icon={HeartHandshake}
              title="Run by volunteers"
              body="Organised by residents, for residents — transparent, friendly and local."
            />
            <ValueCard
              icon={Sparkles}
              title="Festive, not fussy"
              body="A calm, clear experience for elders and first-timers alike."
            />
          </div>
        </section>

        {/* What we celebrate */}
        <section className="mx-auto max-w-content px-4 py-16">
          <div className="text-center">
            <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
              Through the year
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-charcoal">
              What we celebrate
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.festivals.map((f) => (
              <article
                key={f.name}
                className="group rounded-lg border border-gold/20 bg-white/70 p-6 transition-colors hover:border-kerala-600/40"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-charcoal">
                  {f.name}
                </h3>
                <p className="mt-1 text-small text-text-secondary">{f.blurb}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Our Memories — gallery preview (only when photos exist) */}
        {photos.length > 0 && (
          <section className="mx-auto max-w-content px-4 py-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
                  Our Memories
                </p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-charcoal">
                  Life at RUMA
                </h2>
              </div>
              <Link
                href="/gallery"
                className="text-small font-medium text-kerala-700 hover:underline"
              >
                View gallery →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.slice(0, 8).map((url, i) => (
                <Link
                  key={i}
                  href="/gallery"
                  className="aspect-square overflow-hidden rounded-lg border border-gold/15 bg-cream"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Community calendar */}
        <section className="mx-auto max-w-content px-4 py-8">
          <div className="rounded-lg border border-gold/20 bg-white/60 p-8">
            <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
              Community Calendar
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tightest text-charcoal">
              Celebrations across the year
            </h2>
            <ul className="mt-6 divide-y divide-gold/15">
              {content.calendar.map((c) => (
                <li
                  key={`${c.period}-${c.title}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-caption font-semibold uppercase tracking-wide text-gold-700">
                    {c.period}
                  </span>
                  <span className="text-body font-medium text-charcoal">
                    {c.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Impact */}
        <section className="mx-auto max-w-content px-4 py-14 text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            {content.impact.label}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tightest text-charcoal">
            {content.impact.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body leading-relaxed text-text-secondary">
            {content.impact.body}
          </p>
        </section>

        {/* Membership CTA */}
        <section className="mx-auto max-w-content px-4 pb-16">
          <div className="relative overflow-hidden rounded-lg bg-kerala-700 px-6 py-12 text-center text-white">
            <div className="pookalam-watermark pointer-events-none absolute inset-0 opacity-[0.12]" />
            <div className="kasavu-line absolute inset-x-0 top-0 h-1 opacity-80" />
            <h2 className="relative font-display text-3xl font-semibold tracking-tightest sm:text-4xl">
              {content.membership.title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-body text-white/85">
              {content.membership.body}
            </p>
            <Button asChild variant="accent" size="lg" className="relative mt-6">
              <Link href="/membership">{content.membership.ctaLabel}</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter tagline={content.footerTagline} />
    </div>
  );
}

function FeaturedEvent({ event }: { event: EventWithTicketTypes }) {
  const paid = event.ticket_types
    .map((t) => Number(t.price))
    .filter((p) => p > 0);
  const fromPrice = paid.length ? Math.min(...paid) : 0;

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-gold/40 bg-white text-left shadow-sm">
      <div className="kasavu-line h-1 w-full opacity-80" />
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kerala-50 px-2.5 py-1 text-caption font-semibold uppercase tracking-wide text-kerala-700">
            <span className="h-1.5 w-1.5 rounded-full bg-kerala-600" /> Upcoming
          </span>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tightest text-charcoal">
            {event.name}
          </h3>
          <dl className="mt-3 space-y-1.5 text-small text-text-secondary">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold-600" />
              <dd>{formatEventDate(event.start_date, event.end_date)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-600" />
              <dd>{event.venue}</dd>
            </div>
          </dl>
        </div>

        <div className="shrink-0 sm:text-right">
          {fromPrice > 0 && (
            <p className="mb-2 text-small text-text-secondary">
              From{" "}
              <span className="font-semibold text-kerala-700">
                {formatINR(fromPrice)}
              </span>
            </p>
          )}
          <Button asChild size="lg">
            <Link href={`/e/${event.slug}`}>
              <Ticket /> View &amp; Register <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-gold/20 bg-white/70 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-card-title font-semibold text-charcoal">{title}</h3>
        <p className="mt-0.5 text-small text-text-secondary">{body}</p>
      </div>
    </div>
  );
}
