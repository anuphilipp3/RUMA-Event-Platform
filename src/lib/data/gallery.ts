import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import type { GalleryRow, PhotoRow } from "@/lib/supabase/database.types";

const BUCKET = "gallery-images";

/** Public URL for an object in the public gallery bucket. */
export function photoUrl(path: string): string {
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export interface GalleryListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  photoCount: number;
}

export async function listPublishedGalleries(): Promise<GalleryListItem[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("galleries")
    .select("id, slug, title, description, cover_image, photos(image_path)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((g) => {
    const row = g as unknown as GalleryRow & {
      photos: { image_path: string }[];
    };
    const coverPath = row.cover_image ?? row.photos[0]?.image_path ?? null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      coverUrl: coverPath ? photoUrl(coverPath) : null,
      photoCount: row.photos.length,
    };
  });
}

export interface GalleryWithPhotos {
  title: string;
  description: string | null;
  photos: { id: string; url: string; caption: string | null }[];
}

export async function getPublishedGalleryBySlug(
  slug: string,
): Promise<GalleryWithPhotos | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("galleries")
    .select("title, description, photos(id, image_path, caption, sort_order, uploaded_at)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as Pick<GalleryRow, "title" | "description"> & {
    photos: PhotoRow[];
  };
  const photos = [...row.photos]
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        a.uploaded_at.localeCompare(b.uploaded_at),
    )
    .map((p) => ({ id: p.id, url: photoUrl(p.image_path), caption: p.caption }));

  return { title: row.title, description: row.description, photos };
}

/** Recent published photos for the homepage "Life at RUMA" preview. */
export async function getRecentPhotos(limit = 8): Promise<string[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("image_path, galleries!inner(status)")
    .eq("galleries.status", "published")
    .order("uploaded_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((p) => photoUrl((p as { image_path: string }).image_path));
}
