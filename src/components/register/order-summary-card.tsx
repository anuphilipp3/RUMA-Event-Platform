import { Gift } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { OrderSummary } from "@/lib/domain/pricing";

export function OrderSummaryCard({ summary }: { summary: OrderSummary }) {
  const paidLines = summary.lines.filter((l) => !l.isFree);
  const freeLines = summary.lines.filter((l) => l.isFree);

  return (
    <Card className="overflow-hidden border-gold/30">
      <div className="border-b border-gold/20 bg-cream/70 px-5 py-3">
        <h3 className="text-card-title text-charcoal">Payment Summary</h3>
      </div>
      <div className="space-y-3 p-5">
        {paidLines.map((l) => (
          <Row
            key={l.ticketTypeId}
            label={`${l.name} × ${l.quantity}`}
            value={formatINR(l.lineTotal)}
          />
        ))}

        {freeLines.map((l) => (
          <Row
            key={l.ticketTypeId}
            label={`${l.name} × ${l.quantity}`}
            value="Free"
            muted
          />
        ))}

        {summary.luckyDrawCoupons > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2 text-small text-gold-700">
            <Gift className="h-4 w-4" />
            <span>
              {summary.luckyDrawCoupons} lucky draw{" "}
              {summary.luckyDrawCoupons === 1 ? "coupon" : "coupons"} included
            </span>
          </div>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-gold/20 pt-3">
          <span className="text-body font-medium text-charcoal">
            Total Payable
          </span>
          <span className="text-page-title font-bold text-kerala-700">
            {formatINR(summary.totalPayable)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-body">
      <span className="text-text-secondary">{label}</span>
      <span className={muted ? "text-text-muted" : "font-medium text-charcoal"}>
        {value}
      </span>
    </div>
  );
}
