import Link from "next/link";
import type { Metadata } from "next";
import { Images, ImageIcon } from "lucide-react";
import { listPublishedGalleries } from "@/lib/data/gallery";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery · RUMA",
  description: "Moments and memories from RUMA community celebrations.",
};

export default async function GalleryPage() {
  const albums = await listPublishedGalleries();

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-12">
        <div className="text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] text-gold-700">
            Our Memories
          </p>
          <h1 className="mt-3 font-display text-page-title font-semibold tracking-tightest text-charcoal sm:text-5xl">
            Moments that bring us together
          </h1>
        </div>

        {albums.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Images}
            title="No albums yet"
            description="Our event photo albums will appear here soon."
          />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <Link key={a.id} href={`/gallery/${a.slug}`} className="group">
                <div className="overflow-hidden rounded-lg border border-gold/20 bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-cream">
                    {a.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverUrl}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-display text-xl font-semibold text-charcoal">
                      {a.title}
                    </h2>
                    <p className="mt-0.5 text-small text-text-secondary">
                      {a.photoCount} photo{a.photoCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
