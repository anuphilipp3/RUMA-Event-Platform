import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessStepProps {
  bookingReference: string;
  requiresPayment: boolean;
}

export function SuccessStep({
  bookingReference,
  requiresPayment,
}: SuccessStepProps) {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kerala-50 text-kerala-600">
        <CheckCircle2 className="h-9 w-9" />
      </span>

      <h2 className="mt-5 text-page-title font-bold text-charcoal">
        Registration submitted!
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-body text-text-secondary">
        {requiresPayment
          ? "Thank you. An organizer will verify your payment and issue your tickets shortly."
          : "Thank you. An organizer will confirm your registration and issue your tickets shortly."}
      </p>

      <div className="mx-auto mt-6 max-w-xs rounded-lg border border-gold/30 bg-cream/60 p-4">
        <p className="text-caption uppercase tracking-wide text-text-muted">
          Booking Reference
        </p>
        <p className="text-section-title font-bold tracking-wide text-kerala-700">
          {bookingReference}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-small text-gold-700">
          <Clock className="h-4 w-4" /> Pending approval
        </p>
      </div>

      <p className="mt-4 text-small text-text-secondary">
        Save this reference. Use it to check your status and download tickets.
      </p>

      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={`/booking/${bookingReference}`}>
          Track my booking <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
