import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const REGISTER_STEPS = [
  "You",
  "Tickets",
  "Review",
  "Payment",
] as const;

export function StepperHeader({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Registration progress">
      {REGISTER_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-bold transition-colors",
                  done && "bg-kerala-600 text-white",
                  active && "bg-kerala-600 text-white ring-4 ring-kerala-50",
                  !done && !active && "bg-cream text-text-muted",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-small font-medium sm:inline",
                  active ? "text-charcoal" : "text-text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < REGISTER_STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  done ? "bg-kerala-600" : "bg-gold/25",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
