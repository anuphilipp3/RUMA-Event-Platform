import { z } from "zod";

export const galleryFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only",
    )
    .max(80),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  eventId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

export type GalleryFormInput = z.infer<typeof galleryFormSchema>;

// Photos can be a bit larger than payment screenshots.
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
