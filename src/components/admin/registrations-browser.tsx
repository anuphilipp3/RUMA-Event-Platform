"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { ListToolbar, type ListView } from "@/components/admin/list-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { RegistrationListRow } from "@/lib/data/admin";

export function RegistrationsBrowser({ rows }: { rows: RegistrationListRow[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ListView>("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.full_name, r.flat_number, r.booking_reference, r.phone]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by name, flat, booking ref or phone"
        view={view}
        onView={setView}
        count={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={query ? "No matches" : "No registrations yet"}
          description={
            query
              ? "Try a different name, flat or booking reference."
              : "Once residents start registering, submissions will appear here."
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/admin/registrations/${r.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-gold/50 hover:bg-cream">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-body font-semibold text-charcoal">
                    {r.full_name}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-0.5 text-small text-text-secondary">
                  Flat {r.flat_number}
                </p>
                <p className="text-caption text-text-muted">{r.booking_reference}</p>
                <p className="mt-3 text-card-title font-bold text-kerala-700">
                  {formatINR(Number(r.total_amount))}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/registrations/${r.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-gold/50 hover:bg-cream">
                  <div className="min-w-0">
                    <p className="truncate text-body font-semibold text-charcoal">
                      {r.full_name}
                    </p>
                    <p className="text-small text-text-secondary">
                      Flat {r.flat_number} · {r.booking_reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-body font-semibold text-kerala-700">
                        {formatINR(Number(r.total_amount))}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
