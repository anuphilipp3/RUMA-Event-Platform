import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { getEventForEdit } from "@/lib/data/events-admin";
import { EditEventForm } from "@/components/admin/edit-event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCommittee();
  const { id } = await params;
  const event = await getEventForEdit(id);
  if (!event) notFound();

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
          Edit event
        </h1>
      </div>
      <EditEventForm event={event} />
    </div>
  );
}
