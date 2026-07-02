import type { ScheduleItem } from "@/lib/supabase/database.types";

export function EventSchedule({ schedule }: { schedule: ScheduleItem[] }) {
  if (!schedule.length) return null;

  return (
    <section aria-labelledby="schedule-heading">
      <h2
        id="schedule-heading"
        className="text-section-title text-charcoal"
      >
        Schedule
      </h2>
      <ol className="mt-5 space-y-0">
        {schedule.map((item, i) => (
          <li key={i} className="flex gap-4">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3 w-3 rounded-full border-2 border-gold-600 bg-ivory" />
              {i < schedule.length - 1 && (
                <span className="w-px flex-1 bg-gold/30" />
              )}
            </div>
            <div className="pb-6">
              <p className="text-caption font-semibold uppercase tracking-wide text-gold-700">
                {item.time}
              </p>
              <p className="text-body font-medium text-charcoal">
                {item.title}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
