import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const OUTER = 12;
const INNER = 8;

function petals(
  count: number,
  color: string,
  radius: number,
  h: string,
  w: string,
  ml: string,
  mt: string,
) {
  return Array.from({ length: count }).map((_, i) => (
    <span
      key={i}
      className={cn("absolute left-1/2 top-1/2 rounded-full", h, w, ml, mt)}
      style={{
        backgroundColor: color,
        transform: `rotate(${i * (360 / count)}deg) translateY(-${radius}px)`,
      }}
    />
  ));
}

/**
 * Branded loader: a layered pookalam — an outer gold ring and inner green ring
 * rotating in opposite directions, over a softly breathing core. Pure CSS
 * (transform/opacity), so it's smooth and compositor-friendly.
 */
export function BrandLoader({
  fullscreen = false,
  label = "Loading",
}: {
  fullscreen?: boolean;
  label?: string;
}) {
  const spin = (secs: number, reverse = false): CSSProperties => ({
    animation: `ruma-spin ${secs}s linear infinite${reverse ? " reverse" : ""}`,
    transformOrigin: "center",
  });

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullscreen ? "paper min-h-dvh" : "min-h-[60vh]",
      )}
    >
      <span
        className="relative block h-24 w-24"
        aria-hidden
        style={{ animation: "ruma-breathe 3.2s ease-in-out infinite" }}
      >
        {/* Outer gold ring */}
        <span className="absolute inset-0" style={spin(9)}>
          {petals(OUTER, "#D4A017", 40, "h-5", "w-1.5", "-ml-[3px]", "-mt-2.5")}
        </span>
        {/* Inner green ring, counter-rotating */}
        <span className="absolute inset-0" style={spin(6, true)}>
          {petals(INNER, "#0F6A4A", 22, "h-3.5", "w-1.5", "-ml-[3px]", "-mt-[7px]")}
        </span>
        {/* Core */}
        <span className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full bg-gold-600/90 shadow-sm" />
        <span className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-kerala-700" />
      </span>

      <div className="text-center">
        <p className="font-display text-lg font-semibold text-kerala-700">
          {label}
        </p>
        <div className="mx-auto mt-3 h-1 w-32 overflow-hidden rounded-full bg-cream">
          <div className="h-full w-1/3 rounded-full bg-gold-600 animate-[ruma-slide_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
