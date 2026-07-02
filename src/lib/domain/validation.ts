import { z } from "zod";

/** Family registration — validated on both client and server (trust boundary). */
export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter the full name")
    .max(100, "Name is too long"),
  flatNumber: z
    .string()
    .trim()
    .min(1, "Flat number is required")
    .max(20, "Flat number is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(120)
    .optional()
    .or(z.literal("")),
});

export const selectionItemSchema = z.object({
  ticketTypeId: z.string().uuid(),
  quantity: z.number().int().min(0).max(50),
});

export const createRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  familyId: z.string().uuid().optional(),
  registrant: registrationSchema,
  selection: z.array(selectionItemSchema).min(1, "Select at least one ticket"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;

/** Accepted payment screenshot uploads. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
