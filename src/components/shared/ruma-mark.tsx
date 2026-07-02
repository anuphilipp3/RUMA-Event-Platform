import { cn } from "@/lib/utils";

/**
 * Platform wordmark. Shows an uploaded logo image when one is set (Settings),
 * otherwise a clean text wordmark (name + optional tagline).
 */
export function RumaMark({
  name = "RUMA",
  tagline = "Events",
  logoUrl = "",
  className,
}: {
  name?: string;
  tagline?: string;
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={cn("h-8 w-auto object-contain", className)}
      />
    );
  }
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="font-display text-xl font-semibold tracking-tight">
        {name}
      </span>
      {tagline && (
        <span className="text-small font-medium uppercase tracking-wide opacity-70">
          {tagline}
        </span>
      )}
    </span>
  );
}
