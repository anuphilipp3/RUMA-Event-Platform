"use client";

import { useEffect, useState } from "react";
import { BrandLoader } from "@/components/shared/brand-loader";
import { cn } from "@/lib/utils";

/**
 * Shows the branded loader for a minimum time on a full page load / refresh, so
 * it's always visible even on fast connections, then fades out. Mounts once per
 * hard load (lives in the root layout), so in-app navigations aren't affected.
 */
export function SplashScreen({
  minMs = 1800,
  label = "Loading RUMA",
}: {
  minMs?: number;
  label?: string;
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeAt = setTimeout(() => setFading(true), minMs);
    const removeAt = setTimeout(() => setVisible(false), minMs + 450);
    return () => {
      clearTimeout(fadeAt);
      clearTimeout(removeAt);
    };
  }, [minMs]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-500",
        fading && "pointer-events-none opacity-0",
      )}
    >
      <BrandLoader fullscreen label={label} />
    </div>
  );
}
