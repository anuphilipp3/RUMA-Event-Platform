"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { galleryFormSchema, type GalleryFormInput } from "@/lib/domain/gallery-validation";
import { slugify } from "@/lib/domain/event-validation";
import {
  createGalleryAction,
  updateGalleryAction,
} from "@/app/admin/(protected)/gallery/actions";

export function GalleryForm({
  mode,
  galleryId,
  defaultValues,
  events,
}: {
  mode: "create" | "edit";
  galleryId?: string;
  defaultValues: GalleryFormInput;
  events: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormInput>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  async function onSubmit(values: GalleryFormInput) {
    setSaving(true);
    const res =
      mode === "create"
        ? await createGalleryAction(values)
        : await updateGalleryAction(galleryId!, values);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return;
    }
    toast.success(mode === "create" ? "Album created." : "Album saved.");
    router.push(res.id ? `/admin/gallery/${res.id}` : "/admin/gallery");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label required>Album title</Label>
          <Input
            {...register("title", {
              onBlur: (e) => {
                if (!slugEdited && e.target.value)
                  setValue("slug", slugify(e.target.value));
              },
            })}
            placeholder="Onam 2026"
          />
          {errors.title && (
            <p className="mt-1 text-small text-maroon">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label required>Album link (slug)</Label>
          <Input
            {...register("slug", { onChange: () => setSlugEdited(true) })}
            placeholder="onam-2026"
          />
          {errors.slug && (
            <p className="mt-1 text-small text-maroon">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="A short note about this album." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Linked event (optional)</Label>
            <select
              {...register("eventId")}
              className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal"
            >
              <option value="">— None —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label required>Status</Label>
            <select
              {...register("status")}
              className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal"
            >
              <option value="draft">Draft — hidden</option>
              <option value="published">Published — public</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {mode === "create" ? "Create album" : "Save album"}
        </Button>
      </form>
    </Card>
  );
}
