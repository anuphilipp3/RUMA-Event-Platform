import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { EventForm } from "@/components/admin/event-form";
import { blankEventValues } from "@/lib/domain/event-validation";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireCommittee();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Events
        </Link>
        <h1 className="mt-2 text-page-title font-bold text-charcoal">
          New event
        </h1>
      </div>
      <EventForm mode="create" defaultValues={blankEventValues()} />
    </div>
  );
}
