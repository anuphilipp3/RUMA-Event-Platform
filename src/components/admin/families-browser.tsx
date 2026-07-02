"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { ListToolbar, type ListView } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { effectiveFamilyStatus, type EffectiveStatus } from "@/lib/domain/membership";
import type { FamilyListRow } from "@/lib/data/membership-admin";

const BADGE: Record<EffectiveStatus, "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  active: "success",
  expired: "warning",
  rejected: "danger",
  inactive: "neutral",
  archived: "neutral",
};

function StatusChip({ row }: { row: FamilyListRow }) {
  const status = effectiveFamilyStatus(row);
  return (
    <Badge variant={BADGE[status]} className="capitalize">
      {status}
    </Badge>
  );
}

export function FamiliesBrowser({ rows }: { rows: FamilyListRow[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ListView>("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.family_name, r.flat_number, r.membership_reference, r.phone]
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
        placeholder="Search by family, flat, reference or phone"
        view={view}
        onView={setView}
        count={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={query ? "No matches" : "No memberships here"}
          description={
            query
              ? "Try a different family name, flat or reference."
              : "New family membership requests will appear here for review."
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Link key={f.id} href={`/admin/membership/${f.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-gold/50 hover:bg-cream">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-body font-semibold text-charcoal">
                    {f.family_name} Family
                  </p>
                  <StatusChip row={f} />
                </div>
                <p className="mt-0.5 text-small text-text-secondary">
                  Flat {f.flat_number} · {f.memberCount} member
                  {f.memberCount === 1 ? "" : "s"}
                </p>
                <p className="text-caption text-text-muted">{f.membership_reference}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="neutral" className="capitalize">
                    {f.membership_type}
                  </Badge>
                  <span className="text-body font-semibold text-kerala-700">
                    {formatINR(Number(f.membership_amount))}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((f) => (
            <li key={f.id}>
              <Link href={`/admin/membership/${f.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-gold/50 hover:bg-cream">
                  <div className="min-w-0">
                    <p className="truncate text-body font-semibold text-charcoal">
                      {f.family_name} Family
                    </p>
                    <p className="text-small text-text-secondary">
                      Flat {f.flat_number} · {f.memberCount} member
                      {f.memberCount === 1 ? "" : "s"} · {f.membership_reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant="neutral" className="capitalize">
                          {f.membership_type}
                        </Badge>
                        <span className="text-body font-semibold text-kerala-700">
                          {formatINR(Number(f.membership_amount))}
                        </span>
                      </div>
                      <div className="mt-1">
                        <StatusChip row={f} />
                      </div>
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
