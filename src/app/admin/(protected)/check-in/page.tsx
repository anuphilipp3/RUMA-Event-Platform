import { CheckInScanner } from "@/components/admin/check-in-scanner";

export const dynamic = "force-dynamic";

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">Check-In</h1>
        <p className="text-body text-text-secondary">
          Scan a ticket QR to validate and mark entry.
        </p>
      </header>
      <CheckInScanner />
    </div>
  );
}
