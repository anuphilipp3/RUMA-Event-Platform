import { ThemeScope } from "@/components/shared/theme-scope";
import { KasavuDivider } from "@/components/shared/kasavu-divider";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { EventHero } from "./event-hero";
import { EventSchedule } from "./event-schedule";
import { TicketPreview } from "./ticket-preview";
import { StickyCta } from "./sticky-cta";
import type { EventWithTicketTypes } from "@/lib/data/events";

export function EventLanding({ event }: { event: EventWithTicketTypes }) {
  return (
    <ThemeScope event={event} className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <EventHero event={event} />
        <div className="mx-auto max-w-content space-y-12 px-4 py-12">
          <TicketPreview ticketTypes={event.ticket_types} />
          <KasavuDivider />
          <EventSchedule schedule={event.schedule} />
        </div>
      </main>
      <SiteFooter />
      <StickyCta slug={event.slug} />
    </ThemeScope>
  );
}
