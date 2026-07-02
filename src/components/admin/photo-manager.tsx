"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Star } from "lucide-react";
import {
  deletePhotoAction,
  setGalleryCoverAction,
} from "@/app/admin/(protected)/gallery/actions";

interface ManagedPhoto {
  id: string;
  url: string;
  path: string;
}

export function PhotoManager({
  galleryId,
  photos,
  coverPath,
}: {
  galleryId: string;
  photos: ManagedPhoto[];
  coverPath: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(photoId: string) {
    startTransition(async () => {
      const res = await deletePhotoAction(photoId, galleryId);
      if (!res.ok) {
        toast.error(res.error ?? "Could not delete.");
        return;
      }
      toast.success("Photo removed.");
      router.refresh();
    });
  }

  function makeCover(path: string) {
    startTransition(async () => {
      const res = await setGalleryCoverAction(galleryId, path);
      if (!res.ok) {
        toast.error(res.error ?? "Could not set cover.");
        return;
      }
      toast.success("Cover updated.");
      router.refresh();
    });
  }

  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((p) => {
        const isCover = coverPath === p.path;
        return (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gold/20 bg-cream"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {isCover && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-600 px-2 py-0.5 text-caption font-bold text-charcoal">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                disabled={pending || isCover}
                onClick={() => makeCover(p.path)}
                className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-caption font-medium text-charcoal disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" /> Cover
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(p.id)}
                className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-caption font-medium text-maroon disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
