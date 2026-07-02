import { cn } from "@/lib/utils";

/** A labelled progress bar for "event health" (e.g. approved / total). */
export function ProgressStat({
  label,
  value,
  total,
  tone = "green",
  hint,
}: {
  label: string;
  value: number;
  total: number;
  tone?: "green" | "gold";
  hint?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-small font-medium text-charcoal">{label}</p>
        <p className="text-small tabular-nums text-text-secondary">
          {value}
          <span className="text-text-muted"> / {total}</span>
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "gold" ? "bg-gold-600" : "bg-kerala-600",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-caption text-text-muted">
        {pct}%{hint ? ` · ${hint}` : ""}
      </p>
    </div>
  );
}
