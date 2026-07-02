import type { CSSProperties } from "react";
import type { EventRow } from "@/lib/supabase/database.types";

/**
 * Applies an event's theme colors as CSS variables to its subtree, enabling
 * per-event theming (Onam / Vishu / Christmas ...) with zero code changes.
 */
export function ThemeScope({
  event,
  children,
  className,
}: {
  event: Pick<EventRow, "primary_color" | "accent_color" | "background_color">;
  children: React.ReactNode;
  className?: string;
}) {
  const style = {
    "--brand-primary": event.primary_color,
    "--brand-accent": event.accent_color,
    "--brand-background": event.background_color,
  } as CSSProperties;

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
