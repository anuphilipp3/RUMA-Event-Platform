"use server";

import { revalidatePath } from "next/cache";
import { requireCommittee } from "@/lib/auth";
import {
  createGallery,
  updateGallery,
  setGalleryStatus,
  setGalleryCover,
  deletePhoto,
} from "@/lib/data/gallery-admin";
import type { GalleryFormInput } from "@/lib/domain/gallery-validation";
import type { GalleryStatus } from "@/lib/supabase/database.types";

export interface GalleryActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function revalidateGallery(id?: string) {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  if (id) revalidatePath(`/admin/gallery/${id}`);
}

export async function createGalleryAction(
  input: GalleryFormInput,
): Promise<GalleryActionResult> {
  await requireCommittee();
  try {
    const { id } = await createGallery(input);
    revalidateGallery(id);
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create album.",
    };
  }
}

export async function updateGalleryAction(
  id: string,
  input: GalleryFormInput,
): Promise<GalleryActionResult> {
  await requireCommittee();
  try {
    await updateGallery(id, input);
    revalidateGallery(id);
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save album.",
    };
  }
}

export async function setGalleryStatusAction(
  id: string,
  status: GalleryStatus,
): Promise<GalleryActionResult> {
  await requireCommittee();
  try {
    await setGalleryStatus(id, status);
    revalidateGallery(id);
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update status.",
    };
  }
}

export async function setGalleryCoverAction(
  id: string,
  path: string,
): Promise<GalleryActionResult> {
  await requireCommittee();
  try {
    await setGalleryCover(id, path);
    revalidateGallery(id);
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not set cover.",
    };
  }
}

export async function deletePhotoAction(
  photoId: string,
  galleryId: string,
): Promise<GalleryActionResult> {
  await requireCommittee();
  try {
    await deletePhoto(photoId);
    revalidateGallery(galleryId);
    return { ok: true, id: galleryId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete photo.",
    };
  }
}
