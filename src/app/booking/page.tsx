import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { PrefixedReferenceInput } from "@/components/public/prefixed-reference-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Find my ticket · RUMA Events" };

const PREFIX = "RUMA-";

async function lookup(formData: FormData) {
  "use server";
  // Accept the unique part ("ABCD-EF12" or "ABCDEF12") or a full pasted code.
  const raw = String(formData.get("reference") ?? "").trim().toUpperCase();
  let code = raw.replace(/^RUMA-/, "").replace(/[^A-Z0-9]/g, "");
  if (code.length === 8) code = `${code.slice(0, 4)}-${code.slice(4)}`;
  if (code) redirect(`/booking/${encodeURIComponent(PREFIX + code)}`);
}

export default function BookingLookupPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
          <Search className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-center text-section-title text-charcoal">
          Find my ticket
        </h1>
        <p className="mt-1 text-center text-small text-text-secondary">
          Enter the booking reference from your registration.
        </p>

        <form action={lookup} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="reference" required>
              Booking Reference
            </Label>
            <PrefixedReferenceInput
              id="reference"
              name="reference"
              prefix={PREFIX}
              placeholder="ABCD-EF12"
              maxLength={14}
            />
            <p className="mt-1.5 text-caption text-text-muted">
              The part after RUMA- from your registration — e.g. ABCD-EF12.
            </p>
          </div>
          <Button type="submit" size="lg" className="w-full">
            View Booking
          </Button>
        </form>
      </main>
    </div>
  );
}
