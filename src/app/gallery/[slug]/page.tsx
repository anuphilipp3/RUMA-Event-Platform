import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getPublishedGalleryBySlug } from "@/lib/data/gallery";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublishedGalleryBySlug(slug);
  return { title: album ? `${album.title} · RUMA Gallery` : "Album · RUMA" };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getPublishedGalleryBySlug(slug);
  if (!album) notFound();

  return (
    <div className="paper flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All albums
        </Link>

        <header className="mt-4">
          <h1 className="font-display text-page-title font-semibold tracking-tightest text-charcoal sm:text-5xl">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-2 max-w-2xl text-body text-text-secondary">
              {album.description}
            </p>
          )}
        </header>

        {album.photos.length === 0 ? (
          <p className="mt-10 text-body text-text-secondary">
            Photos coming soon.
          </p>
        ) : (
          <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            {album.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.url}
                alt={p.caption ?? album.title}
                className="w-full break-inside-avoid rounded-lg border border-gold/15"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
