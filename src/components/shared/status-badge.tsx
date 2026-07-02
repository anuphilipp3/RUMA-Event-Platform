import { Badge } from "@/components/ui/badge";
import type {
  RegistrationStatus,
  PaymentStatus,
  TicketStatus,
} from "@/lib/supabase/database.types";

type AnyStatus = RegistrationStatus | PaymentStatus | TicketStatus;

const LABELS: Record<AnyStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  active: "Active",
  checked_in: "Checked In",
};

const VARIANTS: Record<
  AnyStatus,
  "neutral" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "danger",
  active: "success",
  checked_in: "neutral",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
