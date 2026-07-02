"use client";

import { Minus, Plus } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { TicketTypeRow } from "@/lib/supabase/database.types";

const MAX_PER_TYPE = 20;

interface TicketSelectorProps {
  ticketTypes: TicketTypeRow[];
  quantities: Record<string, number>;
  onChange: (ticketTypeId: string, quantity: number) => void;
}

export function TicketSelector({
  ticketTypes,
  quantities,
  onChange,
}: TicketSelectorProps) {
  return (
    <ul className="space-y-3">
      {ticketTypes.map((t) => {
        const qty = quantities[t.id] ?? 0;
        const price = Number(t.price);
        return (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-md border border-gold/20 bg-white p-4"
          >
            <div className="min-w-0">
              <p className="text-card-title text-charcoal">{t.name}</p>
              {t.age_rule && (
                <p className="text-small text-text-secondary">{t.age_rule}</p>
              )}
              <p className="mt-0.5 text-small font-semibold text-kerala-700">
                {price === 0 ? "Free" : formatINR(price)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StepperButton
                label={`Remove one ${t.name}`}
                disabled={qty <= 0}
                onClick={() => onChange(t.id, Math.max(0, qty - 1))}
              >
                <Minus className="h-4 w-4" />
              </StepperButton>
              <span
                className="w-6 text-center text-card-title font-semibold tabular-nums text-charcoal"
                aria-live="polite"
              >
                {qty}
              </span>
              <StepperButton
                label={`Add one ${t.name}`}
                disabled={qty >= MAX_PER_TYPE}
                onClick={() => onChange(t.id, Math.min(MAX_PER_TYPE, qty + 1))}
              >
                <Plus className="h-4 w-4" />
              </StepperButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StepperButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-kerala-600 text-kerala-700 transition-colors hover:bg-kerala-50 disabled:cursor-not-allowed disabled:border-field disabled:text-text-muted"
    >
      {children}
    </button>
  );
}
