import { Gift, Trophy, CalendarX } from "lucide-react";
import { getPrimaryEvent, getLuckyDrawSummary } from "@/lib/data/admin";
import { requireCommittee } from "@/lib/auth";
import { LuckyDrawPanel } from "@/components/admin/lucky-draw-panel";
import { LuckyDrawToggle } from "@/components/admin/lucky-draw-toggle";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LuckyDrawPage() {
  await requireCommittee();
  const event = await getPrimaryEvent();
  if (!event) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No event yet"
        description="Publish an event and approve registrations to issue coupons."
      />
    );
  }

  if (!event.lucky_draw_enabled) {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <header>
          <h1 className="text-page-title font-bold text-charcoal">Lucky Draw</h1>
          <p className="text-body text-text-secondary">{event.name}</p>
        </header>
        <EmptyState
          icon={Gift}
          title="Lucky draw is switched off"
          description="This event is not running a lucky draw right now. Switch it on and coupons will be issued automatically on every approval."
        />
        <LuckyDrawToggle eventId={event.id} enabled={false} />
      </div>
    );
  }

  const summary = await getLuckyDrawSummary(event.id);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title font-bold text-charcoal">Lucky Draw</h1>
          <p className="text-body text-text-secondary">{event.name}</p>
        </div>
        <LuckyDrawToggle eventId={event.id} enabled={true} />
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="In the draw"
          value={summary.activeCoupons}
          icon={Gift}
          accent="gold"
        />
        <StatCard
          label="Winners drawn"
          value={summary.wonCoupons}
          icon={Trophy}
          accent="green"
        />
      </div>

      {summary.totalCoupons === 0 ? (
        <EmptyState
          icon={Gift}
          title="No coupons yet"
          description="Coupons are issued automatically when paid registrations are approved."
        />
      ) : (
        <LuckyDrawPanel
          eventId={event.id}
          activeCoupons={summary.activeCoupons}
        />
      )}

      {summary.winners.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-card-title text-charcoal">
            <Trophy className="h-5 w-5 text-gold-700" /> Past winners
          </h2>
          <ul className="divide-y divide-gold/15">
            {summary.winners.map((w) => (
              <li
                key={w.coupon_number}
                className="flex items-center justify-between py-2 text-body"
              >
                <div>
                  <p className="font-medium text-charcoal">{w.full_name}</p>
                  <p className="text-small text-text-secondary">
                    Flat {w.flat_number}
                  </p>
                </div>
                <span className="font-mono text-small font-semibold text-gold-700">
                  {w.coupon_number}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
