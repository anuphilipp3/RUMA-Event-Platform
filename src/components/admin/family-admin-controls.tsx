"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  setFamilyStatusAction,
  deleteFamilyAction,
} from "@/app/admin/(protected)/membership/actions";
import type { EffectiveStatus } from "@/lib/domain/membership";

export function FamilyAdminControls({
  familyId,
  effectiveStatus,
  canDelete,
}: {
  familyId: string;
  effectiveStatus: EffectiveStatus;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isActive = effectiveStatus === "active";
  const canToggle = effectiveStatus !== "pending";

  function toggle() {
    startTransition(async () => {
      const res = await setFamilyStatusAction(
        familyId,
        isActive ? "inactive" : "active",
      );
      if (!res.ok) {
        toast.error(res.error ?? "Could not update.");
        return;
      }
      toast.success(isActive ? "Membership deactivated." : "Membership reactivated.");
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteFamilyAction(familyId); // redirects to the list
    });
  }

  return (
    <div className="rounded-lg border border-gold/25 bg-cream/40 p-4">
      <p className="mb-3 text-small font-semibold uppercase tracking-wide text-text-muted">
        Manage family
      </p>
      <div className="flex flex-wrap gap-2">
        {canToggle && (
          <Button
            variant={isActive ? "danger" : "primary"}
            size="sm"
            onClick={toggle}
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Power />}
            {isActive ? "Deactivate" : "Reactivate"}
          </Button>
        )}
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/membership/${familyId}/edit`}>
            <Pencil /> Edit
          </Link>
        </Button>
        {canDelete &&
          (confirmingDelete ? (
            <span className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={remove} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Confirm delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
              <Trash2 /> Delete
            </Button>
          ))}
      </div>
    </div>
  );
}
