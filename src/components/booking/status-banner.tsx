import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import type { RegistrationStatus } from "@/lib/supabase/database.types";

const CONFIG: Record<
  RegistrationStatus,
  { icon: typeof Clock; title: string; body: string; cls: string }
> = {
  pending: {
    icon: Clock,
    title: "Awaiting approval",
    body: "An organizer is verifying your payment. Your tickets will appear here once approved.",
    cls: "border-gold/40 bg-gold/10 text-gold-700",
  },
  approved: {
    icon: CheckCircle2,
    title: "Approved — tickets ready",
    body: "Your payment is verified. Download your tickets below and show the QR at entry.",
    cls: "border-kerala-600/30 bg-kerala-50 text-kerala-700",
  },
  rejected: {
    icon: XCircle,
    title: "Payment not approved",
    body: "We could not verify this payment. Please contact an organizer or register again.",
    cls: "border-red-200 bg-red-50 text-maroon",
  },
  cancelled: {
    icon: Ban,
    title: "Registration cancelled",
    body: "This registration has been cancelled.",
    cls: "border-red-200 bg-red-50 text-maroon",
  },
};

export function StatusBanner({
  status,
  reason,
}: {
  status: RegistrationStatus;
  reason?: string | null;
}) {
  const { icon: Icon, title, body, cls } = CONFIG[status];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${cls}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-body font-semibold">{title}</p>
        <p className="text-small opacity-90">{body}</p>
        {status === "rejected" && reason && (
          <p className="mt-1 text-small font-medium">Reason: {reason}</p>
        )}
      </div>
    </div>
  );
}
