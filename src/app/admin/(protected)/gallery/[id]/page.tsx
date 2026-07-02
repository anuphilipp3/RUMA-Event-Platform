import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { getGalleryAdmin } from "@/lib/data/gallery-admin";
import { listAdminEvents } from "@/lib/data/admin";
import { GalleryForm } from "@/components/admin/gallery-form";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { PhotoManager } from "@/components/admin/photo-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Images } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCommittee();
  const { id } = await params;
  const [detail, events] = await Promise.all([
    getGalleryAdmin(id),
    listAdminEvents(),
  ]);
  if (!detail) notFound();

  const { gallery, photos } = detail;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Gallery
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-page-title font-bold text-charcoal">
              {gallery.title}
            </h1>
            <Badge
              variant={
                gallery.status === "published"
                  ? "success"
                  : gallery.status === "archived"
                    ? "neutral"
                    : "warning"
              }
            >
              {gallery.status}
            </Badge>
          </div>
          {gallery.status === "published" && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/gallery/${gallery.slug}`} target="_blank">
                <ExternalLink /> View
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Album settings */}
      <GalleryForm
        mode="edit"
        galleryId={gallery.id}
        events={events.map((e) => ({ id: e.id, name: e.name }))}
        defaultValues={{
          title: gallery.title,
          slug: gallery.slug,
          description: gallery.description ?? "",
          eventId: gallery.event_id ?? "",
          status: gallery.status,
        }}
      />

      {/* Photos */}
      <section className="space-y-4">
        <h2 className="text-section-title text-charcoal">
          Photos{" "}
          <span className="text-small font-normal text-text-muted">
            ({photos.length})
          </span>
        </h2>
        <PhotoUploader galleryId={gallery.id} />
        {photos.length > 0 ? (
          <PhotoManager
            galleryId={gallery.id}
            photos={photos}
            coverPath={gallery.cover_image}
          />
        ) : (
          <EmptyState
            icon={Images}
            title="No photos yet"
            description="Upload photos above. Hover a photo to set it as the album cover or remove it."
          />
        )}
      </section>
    </div>
  );
}
