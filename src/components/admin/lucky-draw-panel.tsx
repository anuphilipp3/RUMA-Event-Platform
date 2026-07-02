"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Gift, Sparkles, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { drawLuckyWinnerAction, type DrawResult } from "@/app/admin/actions";

type Winner = NonNullable<DrawResult["data"]>;

export function LuckyDrawPanel({
  eventId,
  activeCoupons,
}: {
  eventId: string;
  activeCoupons: number;
}) {
  const [pending, startTransition] = useTransition();
  const [winner, setWinner] = useState<Winner | null>(null);

  function draw() {
    setWinner(null);
    startTransition(async () => {
      const res = await drawLuckyWinnerAction(eventId);
      if (!res.ok) {
        toast.error(res.error ?? "Could not draw a winner.");
        return;
      }
      if (res.data?.result === "no_coupons") {
        toast.info("No active coupons left to draw.");
        return;
      }
      setWinner(res.data ?? null);
    });
  }

  return (
    <Card className="border-gold/40 bg-gradient-to-b from-cream/80 to-ivory p-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-700">
        <Gift className="h-7 w-7" />
      </span>

      {winner ? (
        <div className="mt-4">
          <p className="flex items-center justify-center gap-1.5 text-caption uppercase tracking-widest text-gold-700">
            <Trophy className="h-4 w-4" /> Winner
          </p>
          <p className="mt-2 font-mono text-section-title font-bold text-kerala-700">
            {winner.coupon_number}
          </p>
          <p className="mt-1 text-card-title font-semibold text-charcoal">
            {winner.attendee}
          </p>
          <p className="text-small text-text-secondary">
            Flat {winner.flat} · {winner.phone}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-body text-text-secondary">
          {activeCoupons} coupon{activeCoupons === 1 ? "" : "s"} in the draw.
        </p>
      )}

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={draw}
        disabled={pending || activeCoupons === 0}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> Drawing…
          </>
        ) : (
          <>
            <Sparkles /> {winner ? "Draw another" : "Draw a winner"}
          </>
        )}
      </Button>
    </Card>
  );
}
