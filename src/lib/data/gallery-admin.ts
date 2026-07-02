import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { galleryFormSchema, type GalleryFormInput } from "@/lib/domain/gallery-validation";
import { photoUrl } from "@/lib/data/gallery";
import type {
  GalleryRow,
  PhotoRow,
  GalleryStatus,
} from "@/lib/supabase/database.types";

const BUCKET = "gallery-images";

function friendlyError(message: string): string {
  if (message.includes("galleries_slug_key") || message.includes("duplicate key"))
    return "That album link (slug) is already used. Choose a different one.";
  return message;
}

function cols(input: GalleryFormInput) {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description || null,
    event_id: input.eventId || null,
    status: input.status,
  };
}

export async function createGallery(
  raw: GalleryFormInput,
): Promise<{ id: string }> {
  const input = galleryFormSchema.parse(raw);
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("galleries")
    .insert(cols(input))
    .select("id")
    .single();
  if (error) throw new Error(friendlyError(error.message));
  return data;
}

export async function updateGallery(
  id: string,
  raw: GalleryFormInput,
): Promise<void> {
  const input = galleryFormSchema.parse(raw);
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("galleries").update(cols(input)).eq("id", id);
  if (error) throw new Error(friendlyError(error.message));
}

export async function setGalleryStatus(
  id: string,
  status: GalleryStatus,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("galleries")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setGalleryCover(
  id: string,
  imagePath: string,
): Promise<void> {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("galleries")
    .update({ cover_image: imagePath })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = createAdminSupabase();
  const { data: photo } = await supabase
    .from("photos")
    .select("image_path")
    .eq("id", photoId)
    .maybeSingle();
  await supabase.from("photos").delete().eq("id", photoId);
  if (photo?.image_path) {
    await supabase.storage.from(BUCKET).remove([photo.image_path]);
  }
}

export interface AdminGalleryListItem {
  id: string;
  title: string;
  slug: string;
  status: GalleryStatus;
  photoCount: number;
  coverUrl: string | null;
}

export async function listGalleriesAdmin(): Promise<AdminGalleryListItem[]> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("galleries")
    .select("id, title, slug, status, cover_image, photos(image_path)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((g) => {
    const row = g as unknown as GalleryRow & { photos: { image_path: string }[] };
    const coverPath = row.cover_image ?? row.photos[0]?.image_path ?? null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      photoCount: row.photos.length,
      coverUrl: coverPath ? photoUrl(coverPath) : null,
    };
  });
}

export interface AdminGalleryDetail {
  gallery: GalleryRow;
  photos: { id: string; url: string; path: string; caption: string | null }[];
}

export async function getGalleryAdmin(
  id: string,
): Promise<AdminGalleryDetail | null> {
  const supabase = createAdminSupabase();
  const { data: gallery, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!gallery) return null;

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("gallery_id", id)
    .order("sort_order")
    .order("uploaded_at");

  return {
    gallery: gallery as GalleryRow,
    photos: ((photos as PhotoRow[]) ?? []).map((p) => ({
      id: p.id,
      url: photoUrl(p.image_path),
      path: p.image_path,
      caption: p.caption,
    })),
  };
}

export async function getGalleryStats(): Promise<{
  albums: number;
  photos: number;
}> {
  const supabase = createAdminSupabase();
  const [{ count: albums }, { count: photos }] = await Promise.all([
    supabase.from("galleries").select("id", { count: "exact", head: true }),
    supabase.from("photos").select("id", { count: "exact", head: true }),
  ]);
  return { albums: albums ?? 0, photos: photos ?? 0 };
}
