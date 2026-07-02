import { formatINR } from "@/lib/utils";
import type { TicketTypeRow } from "@/lib/supabase/database.types";

export function TicketPreview({
  ticketTypes,
}: {
  ticketTypes: TicketTypeRow[];
}) {
  return (
    <section aria-labelledby="tickets-heading">
      <h2 id="tickets-heading" className="text-section-title text-charcoal">
        Tickets
      </h2>
      <ul className="mt-5 divide-y divide-gold/15 overflow-hidden rounded-lg border border-gold/20 bg-cream/50">
        {ticketTypes.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <div>
              <p className="text-card-title text-charcoal">{t.name}</p>
              {t.age_rule && (
                <p className="text-small text-text-secondary">{t.age_rule}</p>
              )}
            </div>
            <p className="shrink-0 text-card-title font-semibold text-kerala-700">
              {Number(t.price) === 0 ? "Free" : formatINR(Number(t.price))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
