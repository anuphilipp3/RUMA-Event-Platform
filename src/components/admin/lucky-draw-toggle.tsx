"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLuckyDrawEnabledAction } from "@/app/admin/actions";

export function LuckyDrawToggle({
  eventId,
  enabled,
}: {
  eventId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await setLuckyDrawEnabledAction(eventId, !enabled);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update the setting.");
        return;
      }
      toast.success(enabled ? "Lucky draw switched off." : "Lucky draw switched on.");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={enabled ? "danger" : "primary"}
      size={enabled ? "sm" : "lg"}
      className={enabled ? "" : "w-full"}
      onClick={toggle}
      disabled={pending}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Power />}
      {enabled ? "Switch off lucky draw" : "Switch on lucky draw"}
    </Button>
  );
}
