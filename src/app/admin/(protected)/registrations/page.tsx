import Link from "next/link";
import { Inbox } from "lucide-react";
import { getPrimaryEvent, listRegistrations } from "@/lib/data/admin";
import { EmptyState } from "@/components/shared/empty-state";
import { RegistrationsBrowser } from "@/components/admin/registrations-browser";
import { requireVolunteer } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { RegistrationStatus } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const FILTERS: { key: RegistrationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireVolunteer();
  const { status } = await searchParams;
  const filter = (FILTERS.find((f) => f.key === status)?.key ??
    "all") as RegistrationStatus | "all";

  const event = await getPrimaryEvent();
  if (!event) {
    return (
      <EmptyState
        icon={Inbox}
        title="No event yet"
        description="Publish an event to receive registrations."
      />
    );
  }

  const rows = await listRegistrations(event.id, filter);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">
          Registrations
        </h1>
        <p className="text-body text-text-secondary">{event.name}</p>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/registrations?status=${f.key}`}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-small font-medium transition-colors",
              filter === f.key
                ? "bg-kerala-600 text-white"
                : "bg-cream text-text-secondary hover:bg-gold/10",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <RegistrationsBrowser rows={rows} />
    </div>
  );
}
