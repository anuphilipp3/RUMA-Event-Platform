"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveRegistrationAction,
  rejectRegistrationAction,
} from "@/app/admin/actions";

export function ApprovalControls({
  registrationId,
  hasPayment,
}: {
  registrationId: string;
  hasPayment: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    startTransition(async () => {
      const res = await approveRegistrationAction(registrationId);
      if (!res.ok) {
        toast.error(res.error ?? "Could not approve.");
        return;
      }
      toast.success("Approved — tickets issued.");
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const res = await rejectRegistrationAction(registrationId, reason);
      if (!res.ok) {
        toast.error(res.error ?? "Could not reject.");
        return;
      }
      toast.success("Registration rejected.");
      setRejecting(false);
      router.refresh();
    });
  }

  if (rejecting) {
    return (
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/60 p-4">
        <p className="text-body font-medium text-charcoal">
          Reject this registration?
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. payment amount does not match)"
          aria-label="Rejection reason"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setRejecting(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={reject}
            disabled={pending || !reason.trim()}
          >
            {pending ? <Loader2 className="animate-spin" /> : <X />}
            Confirm Reject
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="flex-1"
        onClick={approve}
        disabled={pending}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Check />}
        {hasPayment ? "Approve Payment" : "Approve Registration"}
      </Button>
      <Button
        size="lg"
        variant="danger"
        onClick={() => setRejecting(true)}
        disabled={pending}
      >
        <X /> Reject
      </Button>
    </div>
  );
}
