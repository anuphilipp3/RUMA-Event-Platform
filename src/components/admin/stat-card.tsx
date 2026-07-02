import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "green" | "gold" | "maroon";
  hint?: string;
}) {
  const accentCls =
    accent === "gold"
      ? "bg-gold/15 text-gold-700"
      : accent === "maroon"
        ? "bg-red-50 text-maroon"
        : "bg-kerala-50 text-kerala-600";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-small font-medium text-text-secondary">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            accentCls,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-page-title font-bold text-charcoal tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-caption text-text-muted">{hint}</p>}
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="h-4 w-24 animate-pulse rounded bg-cream" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-cream" />
    </Card>
  );
}
