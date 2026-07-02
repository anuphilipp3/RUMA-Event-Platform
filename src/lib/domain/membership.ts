import { z } from "zod";
import type {
  MembershipType,
  MemberRelationship,
  AgeGroup,
  FamilyStatus,
} from "@/lib/supabase/database.types";

/** Annual memberships last one year from approval. */
export const ANNUAL_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Membership year is the financial year (Apr 1 → Mar 31). Whenever a family
 * pays, an annual membership is valid until the March 31 that ends the current
 * financial year — NOT payment-date + 365 days. Pay in Dec 2026 → expires
 * 31 Mar 2027; pay in Feb 2027 → also expires 31 Mar 2027.
 */
export function financialYearEndISO(from: Date = new Date()): string {
  const year = from.getFullYear();
  const month = from.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr
  const endYear = month >= 3 ? year + 1 : year;
  return new Date(endYear, 2, 31, 23, 59, 59).toISOString();
}

/** Financial-year label, e.g. "26-27" for Apr 2026 – Mar 2027 (used in receipt no). */
export function financialYearLabel(from: Date = new Date()): string {
  const year = from.getFullYear();
  const month = from.getMonth();
  const startY = month >= 3 ? year : year - 1;
  const two = (y: number) => String(y % 100).padStart(2, "0");
  return `${two(startY)}-${two(startY + 1)}`;
}

/**
 * Display status. An approved ANNUAL family whose expiry has passed reads as
 * "expired" everywhere (soft auto-deactivation — no scheduler needed).
 */
export type EffectiveStatus = FamilyStatus | "expired";

export function effectiveFamilyStatus(f: {
  status: FamilyStatus;
  membership_type: MembershipType;
  expires_at: string | null;
}): EffectiveStatus {
  // Any active family past its expiry reads as expired. A null expiry (true
  // lifetime) never expires; annual/long-term carry a real expiry date.
  if (
    f.status === "active" &&
    f.expires_at &&
    new Date(f.expires_at).getTime() < Date.now()
  ) {
    return "expired";
  }
  return f.status;
}

export function isActiveNow(f: {
  status: FamilyStatus;
  membership_type: MembershipType;
  expires_at: string | null;
}): boolean {
  return effectiveFamilyStatus(f) === "active";
}

// ── Org settings (membership plans + association UPI) ────────────────────────

export interface MembershipPlan {
  key: MembershipType;
  name: string;
  price: number;
  benefits: string[];
}

export interface OrgBrand {
  name: string;
  tagline: string;
  logoUrl: string;
}

export interface OrgContact {
  email: string;
  phone: string;
  whatsapp: string;
}

export interface OrgSettings {
  brand: OrgBrand;
  contact: OrgContact;
  associationName: string;
  associationAddress: string;
  signatoryName: string;
  upiId: string;
  upiPayeeName: string;
  plans: MembershipPlan[];
}

export const DEFAULT_ORG_SETTINGS: OrgSettings = {
  brand: { name: "RUMA", tagline: "Events", logoUrl: "" },
  contact: { email: "", phone: "", whatsapp: "" },
  associationName: "Rohan Upavan Malayali Association",
  associationAddress:
    "Association Room, Rohan Upavan, Bileshivale Main Rd, Kyalasanahalli, Bengaluru 560077",
  signatoryName: "Anu Philip",
  upiId: "ruma@upi",
  upiPayeeName: "Rohan Upavan Malayali Association",
  plans: [
    {
      key: "annual",
      name: "Annual Membership",
      price: 1000,
      benefits: [
        "Priority event registration",
        "Member pricing on tickets",
        "Voting in association matters",
      ],
    },
    {
      key: "lifetime",
      name: "Long-term Membership",
      price: 5000,
      benefits: [
        "Everything in Annual, forever",
        "Founding-member recognition",
        "No yearly renewals",
      ],
    },
  ],
};

export function withOrgDefaults(data: Partial<OrgSettings> | null): OrgSettings {
  if (!data) return DEFAULT_ORG_SETTINGS;
  return {
    brand: {
      name: data.brand?.name || DEFAULT_ORG_SETTINGS.brand.name,
      tagline: data.brand?.tagline ?? DEFAULT_ORG_SETTINGS.brand.tagline,
      logoUrl: data.brand?.logoUrl ?? "",
    },
    contact: {
      email: data.contact?.email ?? "",
      phone: data.contact?.phone ?? "",
      whatsapp: data.contact?.whatsapp ?? "",
    },
    associationName: data.associationName || DEFAULT_ORG_SETTINGS.associationName,
    associationAddress:
      data.associationAddress || DEFAULT_ORG_SETTINGS.associationAddress,
    signatoryName: data.signatoryName || DEFAULT_ORG_SETTINGS.signatoryName,
    upiId: data.upiId || DEFAULT_ORG_SETTINGS.upiId,
    upiPayeeName: data.upiPayeeName || DEFAULT_ORG_SETTINGS.upiPayeeName,
    plans: data.plans?.length ? data.plans : DEFAULT_ORG_SETTINGS.plans,
  };
}

// ── Display labels ───────────────────────────────────────────────────────────

export const RELATIONSHIP_LABEL: Record<MemberRelationship, string> = {
  head: "Head of family",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  other: "Other",
};

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  under_5: "Under 5",
  "5_12": "5–12",
  "13_plus": "13 and above",
};

// ── Blood group ─────────────────────────────────────────────────────────────

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
  "unknown",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const BLOOD_GROUP_LABEL: Record<BloodGroup, string> = {
  "A+": "A+",
  "A-": "A−",
  "B+": "B+",
  "B-": "B−",
  "O+": "O+",
  "O-": "O−",
  "AB+": "AB+",
  "AB-": "AB−",
  unknown: "Not known",
};

// ── Membership registration validation ──────────────────────────────────────

export const memberSchema = z.object({
  fullName: z.string().trim().min(2, "Member name is required").max(80),
  relationship: z.enum(["head", "spouse", "child", "parent", "other"]),
  ageGroup: z.enum(["under_5", "5_12", "13_plus"]),
  bloodGroup: z.enum(BLOOD_GROUPS).default("unknown"),
});

export const membershipSchema = z.object({
  primaryContact: z
    .string()
    .trim()
    .min(2, "Please enter the contact name")
    .max(100),
  familyName: z.string().trim().min(2, "Please enter the family name").max(100),
  flatNumber: z.string().trim().min(1, "Flat number is required").max(20),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  membershipType: z.enum(["annual", "lifetime"]),
  members: z.array(memberSchema).min(1, "Add at least one family member"),
});

export type MembershipInput = z.infer<typeof membershipSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
