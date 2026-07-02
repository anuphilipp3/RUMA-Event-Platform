import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Find my ticket · RUMA Events" };

async function lookup(formData: FormData) {
  "use server";
  const ref = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
  if (ref) redirect(`/booking/${encodeURIComponent(ref)}`);
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
            <Input
              id="reference"
              name="reference"
              required
              autoCapitalize="characters"
              placeholder="RUMA-XXXX-XXXX"
              className="uppercase"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            View Booking
          </Button>
        </form>
      </main>
    </div>
  );
}
