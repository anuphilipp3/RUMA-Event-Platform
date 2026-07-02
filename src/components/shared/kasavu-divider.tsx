import { cn } from "@/lib/utils";

/** Kerala kasavu-inspired gold hairline divider. */
export function KasavuDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 kasavu-line opacity-60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-600" />
      <span className="h-px flex-1 kasavu-line opacity-60" />
    </div>
  );
}
