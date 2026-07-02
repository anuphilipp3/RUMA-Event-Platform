import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { listAllEventsDetailed } from "@/lib/data/events-admin";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EventsBrowser } from "@/components/admin/events-browser";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireCommittee();
  const events = await listAllEventsDetailed();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title font-bold text-charcoal">Events</h1>
          <p className="text-body text-text-secondary">
            Create and manage community events.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus /> New event
          </Link>
        </Button>
      </header>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Create your first event to open registrations."
          action={
            <Button asChild>
              <Link href="/admin/events/new">
                <Plus /> New event
              </Link>
            </Button>
          }
        />
      ) : (
        <EventsBrowser rows={events} />
      )}
    </div>
  );
}
