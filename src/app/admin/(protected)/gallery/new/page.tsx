import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { listAdminEvents } from "@/lib/data/admin";
import { GalleryForm } from "@/components/admin/gallery-form";

export const dynamic = "force-dynamic";

export default async function NewGalleryPage() {
  await requireCommittee();
  const events = await listAdminEvents();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Gallery
        </Link>
        <h1 className="mt-2 text-page-title font-bold text-charcoal">
          New album
        </h1>
      </div>
      <GalleryForm
        mode="create"
        events={events.map((e) => ({ id: e.id, name: e.name }))}
        defaultValues={{
          title: "",
          slug: "",
          description: "",
          eventId: "",
          status: "draft",
        }}
      />
    </div>
  );
}
