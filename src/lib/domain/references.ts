import { randomBytes, randomInt } from "crypto";

// Unambiguous alphabet (no 0/O/1/I) for human-readable codes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Booking reference doubles as the public capability token for the receipt link. */
export function generateBookingReference(): string {
  return `RUMA-${randomCode(4)}-${randomCode(4)}`;
}

/** Per-ticket serial within a booking, e.g. RUMA-AB12-CD34-01. */
export function generateTicketNumber(
  bookingReference: string,
  index: number,
): string {
  return `${bookingReference}-${String(index + 1).padStart(2, "0")}`;
}

/** Lucky draw coupon, e.g. LD-8F3K9Q. */
export function generateCouponNumber(): string {
  return `LD-${randomCode(6)}`;
}

/** Family membership reference, e.g. RUMA-FAM-AB12. */
export function generateMembershipReference(): string {
  return `RUMA-FAM-${randomCode(4)}`;
}

/** Uniform random winner index for the lucky draw. */
export function pickWinnerIndex(count: number): number {
  if (count <= 0) throw new Error("No coupons to draw from");
  return randomInt(count);
}
