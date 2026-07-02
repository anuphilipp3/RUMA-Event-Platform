import Link from "next/link";
import { Plus, Images, ImageIcon } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { listGalleriesAdmin, getGalleryStats } from "@/lib/data/gallery-admin";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { GalleryBrowser } from "@/components/admin/gallery-browser";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  await requireCommittee();
  const [albums, stats] = await Promise.all([
    listGalleriesAdmin(),
    getGalleryStats(),
  ]);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title font-bold text-charcoal">Gallery</h1>
          <p className="text-body text-text-secondary">
            Community memories, organised into albums.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">
            <Plus /> New album
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Albums" value={stats.albums} icon={Images} />
        <StatCard
          label="Photos"
          value={stats.photos}
          icon={ImageIcon}
          accent="gold"
        />
      </div>

      {albums.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No albums yet"
          description="Create an album and upload photos to share your event memories."
          action={
            <Button asChild>
              <Link href="/admin/gallery/new">
                <Plus /> New album
              </Link>
            </Button>
          }
        />
      ) : (
        <GalleryBrowser rows={albums} />
      )}
    </div>
  );
}
